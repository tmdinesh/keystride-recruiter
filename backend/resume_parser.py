"""
Resume Parser
=============
Parses anonymized .txt resumes into structured JSON.

Output per resume:
  {
    "resume_id": "resume_012_anon",
    "skills": [...],
    "education": { "degree": "...", "year": "..." },
    "experience_years": 2,
    "projects": [...],
    "certifications": [...]
  }

Usage:
  pip install spacy pydantic
  python -m spacy download en_core_web_sm
  python backend/resume_parser.py
"""

import os
import re
import json
from typing import List
from pydantic import BaseModel

# ── Schema ────────────────────────────────────────────────────────────────────

class ResumeSchema(BaseModel):
    resume_id:        str
    skills:           List[str]
    education:        dict
    experience_years: int
    projects:         List[str]
    certifications:   List[str]

# ── Constants ─────────────────────────────────────────────────────────────────

SKILL_VOCAB = [
    # Languages
    "python", "java", "javascript", "typescript", "golang", "rust",
    "c++", "c#", "php", "ruby", "kotlin", "swift", "scala", "r",
    # Frontend
    "react", "vue", "angular", "next.js", "nuxt", "svelte",
    "html", "css", "sass", "tailwind", "bootstrap", "jquery",
    # Backend
    "node", "fastapi", "django", "flask", "spring", "express",
    "laravel", "rails", "asp.net", "graphql", "rest", "soap",
    # Databases
    "sql", "postgresql", "mysql", "mongodb", "redis", "sqlite",
    "oracle", "cassandra", "dynamodb", "firebase", "elasticsearch",
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes",
    "terraform", "ansible", "jenkins", "github actions", "ci/cd",
    "linux", "nginx", "apache",
    # Data / ML
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas",
    "numpy", "matplotlib", "spark", "hadoop", "airflow", "dbt",
    "tableau", "power bi", "looker",
    # Tools
    "git", "jira", "confluence", "figma", "postman", "swagger",
]

DEGREE_KEYWORDS = [
    "b.tech", "b.e", "btech", "b.eng", "bachelor",
    "b.sc", "bsc", "b.s",
    "m.tech", "mtech", "m.eng", "master", "m.sc", "msc", "m.s",
    "mba", "pgdm", "pgd",
    "phd", "ph.d", "doctorate",
    "diploma", "associate",
]

INSTITUTION_KEYWORDS = [
    "university", "college", "institute", "school",
    "academy", "polytechnic", "iit", "nit", "bits",
    "deemed", "faculty", "department",
]

CERT_PATTERNS = [
    r'aws\s+certified',
    r'google\s+(cloud|associate|professional)',
    r'microsoft\s+certified',
    r'azure\s+(fundamentals|associate|expert)',
    r'comptia',
    r'cisco\s*(ccna|ccnp|ccie)',
    r'certified\s+(developer|engineer|architect|professional|scrum|data)',
    r'pmp\b',
    r'oracle\s+certified',
    r'scrum\s+master',
    r'certification\s+in',
    r'certificate\s+(of|in)',
]

# Lines to skip in project extraction
PROJECT_SKIP_PATTERNS = [
    r'^environment\s*[:\-]',
    r'^tools\s*[:\-]',
    r'^technologies\s*[:\-]',
    r'^tech\s+stack',
    r'^skills?\s*[:\-]',
    r'MASKED_LOCATION',
    r'MASKED_NAME',
    r'software\s+engineer',
    r'senior\s+engineer',
    r'junior\s+engineer',
    r'developer\b',
    r'intern\b',
    r'^\w+,\s+(MASKED|PA|NY|CA|TX|remote)',  # "Company, Location" lines
]

# ── Step 1: Read File ─────────────────────────────────────────────────────────

def read_resume(filepath):
    with open(filepath, encoding="utf-8", errors="replace") as f:
        return f.read()

# ── Step 2: Split into Sections ───────────────────────────────────────────────

SECTION_HEADERS = {
    "skill":           r'\bskills?\b',
    "education":       r'\beducation\b|\bacademic\b|\bqualification\b',
    "experience":      r'\bexperience\b|\bemployment\b|\bwork\s+history\b',
    "project":         r'\bprojects?\b|\bportfolio\b',
    "certification":   r'\bcertifications?\b|\bcertificates?\b|\bcredentials?\b',
    "summary":         r'\bsummary\b|\bobjective\b|\bprofile\b|\babout\b',
}

def split_sections(text):
    lines      = text.split("\n")
    sections   = {}
    current    = "header"
    buffer     = []

    for line in lines:
        matched_section = None
        for section, pattern in SECTION_HEADERS.items():
            # A section header is a short line (< 60 chars) matching the pattern
            if re.search(pattern, line, re.IGNORECASE) and len(line.strip()) < 60:
                matched_section = section
                break

        if matched_section:
            # Save previous buffer
            if buffer:
                sections[current] = "\n".join(buffer)
            current = matched_section
            buffer  = []
        else:
            buffer.append(line)

    # Save last section
    if buffer:
        sections[current] = "\n".join(buffer)

    return sections

# ── Step 3: Extract Skills ────────────────────────────────────────────────────

def extract_skills(text):
    text_lower = text.lower()
    found = []
    for skill in SKILL_VOCAB:
        # Use word boundary to avoid partial matches (e.g. "r" inside "error")
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found

# ── Step 4: Extract Experience Years ─────────────────────────────────────────

def extract_experience_years(text):
    text_lower = text.lower()

    # Pattern: "5 years", "3+ years", "2-4 years" — avoid matching "2018"
    matches = re.findall(r'\b(\d{1,2})\+?\s*years?\s+of\s+experience', text_lower)
    if matches:
        return max(int(m) for m in matches)

    # Fallback: any "X years" not preceded by 19xx/20xx
    matches = re.findall(r'(?<!\d{4}\s)\b([1-9]|1[0-9]|20)\+?\s*years?\b', text_lower)
    if matches:
        return max(int(m) for m in matches)

    # Fallback: count distinct employment years from date ranges
    years = re.findall(r'\b(20\d{2})\b', text)
    years = sorted(set(int(y) for y in years))
    if len(years) >= 2:
        span = years[-1] - years[0]
        return min(span, 20)  # cap at 20

    return 0

# ── Step 5: Extract Education ─────────────────────────────────────────────────

def extract_education(text):
    lines = text.split("\n")
    for line in lines:
        line_lower  = line.lower()
        has_degree  = any(re.search(r'\b' + re.escape(d) + r'\b', line_lower) for d in DEGREE_KEYWORDS)
        has_inst    = any(kw in line_lower for kw in INSTITUTION_KEYWORDS)
        has_year    = bool(re.search(r'\b(19|20)\d{2}\b', line))

        # Must have a degree keyword AND either institution or year
        if has_degree and (has_inst or has_year):
            year_match = re.search(r'\b(19|20)\d{2}\b', line)
            return {
                "degree":  line.strip(),
                "year":    year_match.group() if year_match else "Unknown",
            }

    # Second pass — just degree keyword alone if nothing better found
    for line in lines:
        line_lower = line.lower()
        if any(re.search(r'\b' + re.escape(d) + r'\b', line_lower) for d in DEGREE_KEYWORDS):
            if 15 < len(line.strip()) < 120:
                year_match = re.search(r'\b(19|20)\d{2}\b', line)
                return {
                    "degree": line.strip(),
                    "year":   year_match.group() if year_match else "Unknown",
                }

    return {"degree": "Unknown", "year": "Unknown"}

# ── Step 6: Extract Projects ──────────────────────────────────────────────────

def extract_projects(sections):
    project_text = sections.get("project", "")
    if not project_text:
        return []

    projects = []
    lines    = project_text.split("\n")

    for line in lines:
        line = line.strip()

        # Skip empty or very short lines
        if len(line) < 20:
            continue

        # Skip section header itself
        if re.match(r'^projects?\s*$', line, re.IGNORECASE):
            continue

        # Skip environment / tool / location lines
        if any(re.search(p, line, re.IGNORECASE) for p in PROJECT_SKIP_PATTERNS):
            continue

        # Skip lines that are mostly comma-separated tech lists (5+ commas)
        if line.count(",") >= 5:
            continue

        # Skip lines starting with "Used X for Y" pattern (task descriptions)
        if re.match(r'^(used|utilized|responsible|worked|developed|implemented)\b',
                    line, re.IGNORECASE):
            continue

        # Clean bullet / numbering characters
        line = re.sub(r'^[\u2022\u25CB\u25A0\-\*\>\·\•]\s*', '', line).strip()
        line = re.sub(r'^\d+[\.\)]\s*', '', line).strip()

        if line and len(line) > 15:
            projects.append(line)

    return projects[:5]

# ── Step 7: Extract Certifications ───────────────────────────────────────────

def extract_certifications(sections, text):
    # Prefer certification section, fallback to full text
    cert_text = sections.get("certification", "")
    search_text = cert_text if cert_text else text

    certs = []
    for line in search_text.split("\n"):
        line = line.strip()

        if len(line) < 10:
            continue

        # Must match a real certification pattern
        if not any(re.search(p, line, re.IGNORECASE) for p in CERT_PATTERNS):
            continue

        # Skip lines that are tool lists (too many commas)
        if line.count(",") > 3:
            continue

        # Skip MASKED lines
        if "MASKED_NAME" in line or "MASKED_LOCATION" in line:
            continue

        line = re.sub(r'^[\u2022\-\*]\s*', '', line).strip()
        if line:
            certs.append(line)

    return certs[:3]

# ── Main Parse Function ───────────────────────────────────────────────────────

def parse_resume(filepath):
    resume_id = os.path.basename(filepath).replace(".txt", "")
    text      = read_resume(filepath)
    sections  = split_sections(text)

    data = ResumeSchema(
        resume_id        = resume_id,
        skills           = extract_skills(text),
        education        = extract_education(text),
        experience_years = extract_experience_years(text),
        projects         = extract_projects(sections),
        certifications   = extract_certifications(sections, text),
    )
    return data.model_dump()

# ── Run on All Resumes ────────────────────────────────────────────────────────

if __name__ == "__main__":
    INPUT_DIR  = "data/resumes_anon"
    OUTPUT_DIR = "data/parsed_resumes"
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    files = sorted([f for f in os.listdir(INPUT_DIR) if f.endswith(".txt")])

    if not files:
        print(f"❌ No .txt files found in {INPUT_DIR}/")
        print("   Make sure you ran the anonymizer first.")
        exit(1)

    print("=" * 60)
    print(f"  Resume Parser — {len(files)} resumes found")
    print("=" * 60)

    success = 0
    issues  = []

    for fname in files:
        fpath  = os.path.join(INPUT_DIR, fname)
        result = parse_resume(fpath)

        # Save JSON
        out_name = fname.replace(".txt", ".json")
        out_path = os.path.join(OUTPUT_DIR, out_name)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)

        # Flag potential issues
        flags = []
        if len(result["skills"]) == 0:
            flags.append("no skills")
        if result["education"]["degree"] == "Unknown":
            flags.append("no education")
        if result["experience_years"] == 0:
            flags.append("0 yrs exp")
        if len(result["projects"]) == 0:
            flags.append("no projects")

        flag_str = f"  ⚠️  [{', '.join(flags)}]" if flags else ""
        print(f"  ✅ {fname[:45]:<45} "
              f"skills={len(result['skills']):>2}  "
              f"exp={result['experience_years']}yrs  "
              f"proj={len(result['projects'])}"
              f"{flag_str}")

        if flags:
            issues.append((fname, flags))
        success += 1

    print("=" * 60)
    print(f"  Parsed:  {success} / {len(files)} resumes")
    print(f"  Output:  {OUTPUT_DIR}/")
    if issues:
        print(f"\n  ⚠️  {len(issues)} resumes with missing fields:")
        for fname, flags in issues:
            print(f"     {fname} → {', '.join(flags)}")
        print("\n  Tip: Open those files and check if sections are")
        print("  named differently (e.g. 'WORK HISTORY' vs 'EXPERIENCE')")
    print("=" * 60)
