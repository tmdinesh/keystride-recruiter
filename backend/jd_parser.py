import os
import re
import json
from typing import List
from pydantic import BaseModel
import sys
from docx import Document as DocxDocument
from PyPDF2 import PdfReader

# Append path to import SKILL_VOCAB from resume_parser
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from resume_parser import SKILL_VOCAB

# ── Schema ────────────────────────────────────────────────────────────────────

class JDSchema(BaseModel):
    jd_id:             str
    must_have_skills:  List[str]
    good_to_have:      List[str]
    experience_range:  str  # e.g., "3-5 years"

# ── Step 1: Read File ─────────────────────────────────────────────────────────

def read_jd(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext == '.docx':
        doc = DocxDocument(filepath)
        return '\n'.join([p.text for p in doc.paragraphs])
    elif ext == '.pdf':
        reader = PdfReader(filepath)
        return '\n'.join([page.extract_text() or '' for page in reader.pages])
    else:
        with open(filepath, encoding="utf-8", errors="replace") as f:
            return f.read()

# ── Step 2: Extract Skills ────────────────────────────────────────────────────

def extract_skills(text):
    text_lower = text.lower()
    found = []
    # Identify skills present in text
    for skill in SKILL_VOCAB:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found

def classify_skills(text, extracted_skills):
    # Differentiate between must-have and good-to-have based on proximity to keywords
    must_have = set()
    good_to_have = set()
    
    lines = text.split('\n')
    current_context = "must_have"  # default
    
    for line in lines:
        line_lower = line.lower()
        if re.search(r'(bonus|plus|good to have|preferred|optional)', line_lower):
            current_context = "good_to_have"
        elif re.search(r'(must have|required|requirements|essential)', line_lower):
            current_context = "must_have"
            
        for skill in extracted_skills:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, line_lower):
                if current_context == "good_to_have":
                    good_to_have.add(skill)
                else:
                    must_have.add(skill)
                    
    # Ensure they don't overlap, prioritize must_have
    good_to_have -= must_have
    
    # If heuristic failed, just put all in must_have
    if not must_have and not good_to_have:
        must_have = set(extracted_skills)
        
    return list(must_have), list(good_to_have)

# ── Step 3: Extract Experience ────────────────────────────────────────────────

def extract_experience(text):
    text_lower = text.lower()
    # Looking for formats like "3-5 years", "3+ years", "at least 5 years"
    match = re.search(r'(\d+)\s*(to|-)\s*(\d+)\s*years?', text_lower)
    if match:
        return f"{match.group(1)}-{match.group(3)} years"
        
    match = re.search(r'(\d+)\+?\s*years?', text_lower)
    if match:
        return f"{match.group(1)}+ years"
        
    return "Not specified"

# ── Main Parse Function ───────────────────────────────────────────────────────

def parse_jd(filepath):
    jd_id = os.path.basename(filepath).split('.')[0]
    text  = read_jd(filepath)
    
    all_skills = extract_skills(text)
    must_have, good_to_have = classify_skills(text, all_skills)
    
    # ensure we have some skills just in case
    if len(must_have) == 0:
        must_have = all_skills[:5] # Fallback to top 5
        good_to_have = all_skills[5:]

    data = JDSchema(
        jd_id            = jd_id,
        must_have_skills = must_have,
        good_to_have     = good_to_have,
        experience_range = extract_experience(text),
    )
    return data.model_dump()

if __name__ == "__main__":
    INPUT_DIR  = "data/jds"
    OUTPUT_DIR = "data/parsed_jds"
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if not os.path.exists(INPUT_DIR):
        print(f"Directory {INPUT_DIR} does not exist.")
        exit()

    files = sorted([f for f in os.listdir(INPUT_DIR) if f.endswith(".txt") or f.endswith(".json")])

    print("=" * 60)
    print(f"  JD Parser — {len(files)} JDs found")
    print("=" * 60)

    for fname in files:
        fpath  = os.path.join(INPUT_DIR, fname)
        if fpath.endswith('.txt'):
            result = parse_jd(fpath)
            
            # Save JSON
            out_name = fname.replace(".txt", ".json")
            out_path = os.path.join(OUTPUT_DIR, out_name)
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2)
            print(f"  ✅ {fname:<45} must_have={len(result['must_have_skills'])}")
    
