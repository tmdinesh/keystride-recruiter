import os
import json
import logging
import requests
from pydantic import BaseModel
from typing import List

class CandidateReportContext(BaseModel):
    summary: str
    strengths: List[str]
    gaps: List[str]
    interview_questions: List[str]

# Allow Docker to override host to 'host.docker.internal'
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "localhost")
OLLAMA_API_URL = f"http://{OLLAMA_HOST}:11434/api/generate"
OLLAMA_MODEL = "resume_scanner"

def generate_insights(resume_data, jd_data, match_score):
    """
    Generate insights using a custom local LLM via Ollama.
    Falls back to heuristics if Ollama is down or fails.
    """
    resume_skills = resume_data.get('skills', [])
    jd_skills = jd_data.get('must_have_skills', []) + jd_data.get('good_to_have', [])
    experience = resume_data.get('experience_years', 0)
    
    prompt = f"""
Candidate Info:
- Experience: {experience} years
- Extracted Skills: {', '.join(resume_skills)}

Job Requirements:
- Extracted Requirements: {', '.join(jd_skills)}

Match Score: {match_score}/100

Generate the Candidate Report Context JSON as instructed in your SYSTEM prompt.
"""
    
    try:
        response = requests.post(OLLAMA_API_URL, json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "format": "json",
            "stream": False
        }, timeout=30)
        
        response.raise_for_status()
        result = response.json()
        raw_json = result.get('response', '{}')
        try:
            parsed = json.loads(raw_json)
        except json.JSONDecodeError:
            # Sometime LLMs output markdown wraps like ```json ... ```
            clean_str = raw_json.strip()
            if clean_str.startswith("```json"):
                clean_str = clean_str[7:]
            if clean_str.endswith("```"):
                clean_str = clean_str[:-3]
            parsed = json.loads(clean_str.strip())

        # Validate structure roughly
        summary = parsed.get("summary", f"Candidate scored {match_score}/100.")
        strengths = parsed.get("strengths") or ["Matches standard requirements."]
        gaps = parsed.get("gaps") or ["No specific gaps identified."]
        questions = parsed.get("interview_questions") or ["Could you walk me through your experience?"]

        return CandidateReportContext(
            summary=summary,
            strengths=strengths,
            gaps=gaps,
            interview_questions=questions
        ).model_dump()
        
    except Exception as e:
        logging.warning(f"Ollama generation failed or timed out: {e}. Falling back to heuristics.")
        return _heuristic_fallback(resume_data, jd_data, match_score)

def _heuristic_fallback(resume_data, jd_data, match_score):
    # Strict deterministic fallback to ensure UI never breaks if Ollama goes offline
    strengths = []
    gaps = []
    
    resume_skills = set([s.lower() for s in resume_data.get('skills', [])])
    jd_skills = set([s.lower() for s in jd_data.get('must_have_skills', [])])
    
    matches = list(resume_skills.intersection(jd_skills))
    if len(matches) > 0:
        strengths.append(f"Strong match in core skills: {', '.join(matches[:3])}")
    
    missing = list(jd_skills - resume_skills)
    if len(missing) > 0:
        gaps.append(f"Missing required skills: {', '.join(missing[:3])}")
    else:
        gaps.append("No major skill gaps identified.")
        
    summary = f"Candidate scored {match_score}/100. "
    if match_score > 75: summary += "Strong fit for the role."
    elif match_score > 50: summary += "Moderate fit."
    else: summary += "Weak fit."
    
    questions = []
    if missing:
        questions.append(f"How would you approach learning or working with {missing[0]}?")
    questions.append("Can you walk me through your most complex recent project?")
    
    return CandidateReportContext(
        summary=summary,
        strengths=strengths if strengths else ["Basic foundational skills."],
        gaps=gaps,
        interview_questions=questions
    ).model_dump()
