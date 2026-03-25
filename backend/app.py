from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
import datetime
import io
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from fastapi.responses import StreamingResponse

from resume_parser import parse_resume
from jd_parser import parse_jd
from matcher import match_resume_to_jd
from llm_generator import generate_insights

app = FastAPI(title="Resume Scanner API V2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── GLOBAL IN-MEMORY STATE ───────────────────────────────────────────────────
GLOBAL_STATE = {
    "current_jd": None,          # Dict: raw parsed JD
    "candidates": {},            # Dict: id -> Candidate Dict
    "activities": [],            # List: Activity Dict
    "settings": {
        "fullName": "HR Manager",
        "email": "hr@company.com",
        "emailNotifications": True,
        "darkMode": False,
        "apiEndpoint": "http://localhost:8000/api",
        "weights": {
            "experience": 30,
            "skills": 50,
            "education": 20
        }
    }
}

def add_activity(type_str: str, message: str):
    GLOBAL_STATE["activities"].insert(0, {
        "id": str(uuid.uuid4()),
        "type": type_str,
        "message": message,
        "timestamp": datetime.datetime.now().isoformat()
    })

def format_candidate(resume_data, jd_data, match_result, insights):
    """ Converts the backend match result into V2 schema format """
    cid = resume_data.get("resume_id", str(uuid.uuid4()))
    
    match_score = match_result.get("overall_score", 0)
    if match_score >= 80:
        recommendation = "Strong"
    elif match_score >= 60:
        recommendation = "Medium"
    elif match_score >= 40:
        recommendation = "Weak"
    else:
        recommendation = "Reject"

    resume_skills = set([s.lower() for s in resume_data.get("skills", [])])
    jd_skills = set([s.lower() for s in jd_data.get("must_have_skills", [])])
    
    matched_skills = list(jd_skills.intersection(resume_skills))
    missing_skills = list(jd_skills - resume_skills)

    skill_comparison = []
    for s in jd_skills:
        has_skill = s in resume_skills
        skill_comparison.append({
            "skill": s,
            "candidateHas": has_skill,
            "matchScore": 100 if has_skill else 0
        })

    return {
        "id": cid,
        "name": cid.replace("_anon", "").replace("_", " ")[:20] or "Anonymous Candidate",
        "email": f"{cid.lower()}@example.com",
        "matchScore": match_score,
        "experience": resume_data.get("experience_years", 0),
        "topMatchedSkills": matched_skills[:5],
        "missingSkills": missing_skills[:5],
        "recommendation": recommendation,
        "shortlisted": False,
        "strengths": insights.get("strengths", []),
        "skillGaps": insights.get("gaps", []),
        "summary": insights.get("summary", ""),
        "interviewQuestions": insights.get("interview_questions", []),
        "experienceMatch": match_result.get("experience_score", 0),
        "skillMatch": match_result.get("skill_match_score", 0),
        "educationMatch": 80, # Hardcoded fallback
        "skillComparison": skill_comparison
    }

# ── ENDPOINTS ────────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"status": "Resume Scanner V2 API is running."}

# Analytics & Dashboard
@app.get("/api/dashboard/stats")
async def get_stats():
    candidates = list(GLOBAL_STATE["candidates"].values())
    total = len(candidates)
    if total == 0:
        return {
            "totalCandidates": 0, "strongFit": 0, "mediumFit": 0,
            "weakFit": 0, "averageMatchScore": 0
        }
    
    strong = sum(1 for c in candidates if c["recommendation"] == "Strong")
    medium = sum(1 for c in candidates if c["recommendation"] == "Medium")
    weak = total - strong - medium # Weak + Reject
    avg_score = sum(c["matchScore"] for c in candidates) // total
    
    return {
        "totalCandidates": total,
        "strongFit": strong,
        "mediumFit": medium,
        "weakFit": weak,
        "averageMatchScore": avg_score
    }

@app.get("/api/activities")
async def get_activities():
    return GLOBAL_STATE["activities"][:20]

# Uploads
@app.post("/api/upload_jd")
async def upload_jd(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    jd_data = parse_jd(file_path)
    GLOBAL_STATE["current_jd"] = jd_data
    
    # Re-evaluate all existing candidates against new JD
    for cid, c_data in list(GLOBAL_STATE["candidates"].items()):
        # Ideally we'd keep raw resume data, but for now we'll flush them or assume they stay.
        # We will just clear candidates for simplicity when a new JD is uploaded.
        pass
        
    GLOBAL_STATE["candidates"] = {}
    add_activity("jd_processed", f"Job Description processed: {file.filename}")
    return {"success": True, "message": "Job Description uploaded and processed successfully"}

@app.post("/api/upload_resumes")
async def upload_resumes(files: list[UploadFile] = File(...)):
    if not GLOBAL_STATE["current_jd"]:
        raise HTTPException(status_code=400, detail="Please upload a Job Description first.")
        
    jd_data = GLOBAL_STATE["current_jd"]
    count = 0
    
    for file in files:
        if not file.filename.endswith(('.txt', '.pdf')):
            continue
            
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        resume_data = parse_resume(file_path)
        match_result = match_resume_to_jd(resume_data, jd_data)
        insights = generate_insights(resume_data, jd_data, match_result['overall_score'])
        
        cand_obj = format_candidate(resume_data, jd_data, match_result, insights)
        GLOBAL_STATE["candidates"][cand_obj["id"]] = cand_obj
        add_activity("resume_uploaded", f"Resume processed: {cand_obj['name']}")
        count += 1
        
    return {"success": True, "message": "Resumes uploaded successfully", "count": count}

# Candidates
@app.get("/api/candidates")
async def get_candidates(filter: str = None):
    all_c = list(GLOBAL_STATE["candidates"].values())
    if filter and filter.lower() != "all":
        all_c = [c for c in all_c if c["recommendation"].lower() == filter.lower()]
    return all_c

@app.get("/api/candidates/{id}")
async def get_candidate(id: str):
    c = GLOBAL_STATE["candidates"].get(id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return c

# Shortlist
@app.post("/api/candidates/{id}/shortlist")
async def add_to_shortlist(id: str):
    c = GLOBAL_STATE["candidates"].get(id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    c["shortlisted"] = True
    add_activity("candidate_shortlisted", f"{c['name']} added to shortlist")
    return {"success": True}

@app.delete("/api/candidates/{id}/shortlist")
async def remove_from_shortlist(id: str):
    c = GLOBAL_STATE["candidates"].get(id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    c["shortlisted"] = False
    add_activity("candidate_removed", f"{c['name']} removed from shortlist")
    return {"success": True}

@app.post("/api/candidates/{id}/reject")
async def reject_candidate(id: str):
    c = GLOBAL_STATE["candidates"].get(id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    c["recommendation"] = "Reject"
    add_activity("candidate_rejected", f"{c['name']} marked as Reject")
    return {"success": True}

@app.get("/api/shortlist")
async def get_shortlisted():
    return [c for c in GLOBAL_STATE["candidates"].values() if c["shortlisted"]]

# Reports & Metrics (Static for V2 dashboard demo purposes)
@app.get("/api/reports")
async def get_reports():
    return [
      { "id": '1', "name": 'Shortlist Summary Report', "type": 'shortlist_summary', "dateGenerated": datetime.datetime.now().isoformat() },
      { "id": '2', "name": 'Full Ranking Report', "type": 'full_ranking', "dateGenerated": datetime.datetime.now().isoformat() }
    ]

@app.get("/api/export")
async def export_report(type: str = "full_ranking", format: str = "pdf"):
    candidates = list(GLOBAL_STATE["candidates"].values())
    if not candidates:
        # Provide some mock data if empty for demo
        candidates = [
            {"name": "John Doe", "matchScore": 85, "experience": 5, "recommendation": "Strong"},
            {"name": "Jane Smith", "matchScore": 72, "experience": 3, "recommendation": "Medium"}
        ]

    df = pd.DataFrame(candidates)
    # Filter columns for report
    cols = ["name", "matchScore", "experience", "recommendation"]
    df = df[cols]

    if format == "excel":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Candidates')
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=report_{type}.xlsx"}
        )
    else: # Default PDF
        output = io.BytesIO()
        p = canvas.Canvas(output, pagesize=letter)
        p.drawString(100, 750, f"Recruitment Report: {type.replace('_', ' ').title()}")
        p.drawString(100, 730, f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")
        
        y = 700
        p.drawString(100, y, "Candidate Name | Score | Exp | Rec")
        y -= 20
        p.line(100, y+15, 500, y+15)
        
        for c in candidates:
            p.drawString(100, y, f"{c['name'][:20]} | {c['matchScore']}% | {c['experience']}y | {c['recommendation']}")
            y -= 20
            if y < 50:
                p.showPage()
                y = 750
        
        p.save()
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=report_{type}.pdf"}
        )

# Settings
@app.get("/api/settings")
async def get_settings():
    return GLOBAL_STATE["settings"]

@app.post("/api/settings")
async def update_settings(settings: dict):
    GLOBAL_STATE["settings"].update(settings)
    add_activity("settings_updated", "System settings updated")
    return {"success": True, "settings": GLOBAL_STATE["settings"]}

@app.get("/api/metrics")
async def get_metrics():
    return {
      "precision": 0.87,
      "recall": 0.82,
      "top5Accuracy": 0.91,
      "confusionMatrix": [[45, 3, 1, 0],[5, 38, 4, 1],[2, 6, 28, 3],[0, 1, 4, 12]],
      "fairnessScore": 0.94,
      "scoreDifference": 2.3
    }
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
