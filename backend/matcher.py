import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel

# Initialize the model once
MODEL_NAME = 'all-MiniLM-L6-v2'
try:
    model = SentenceTransformer(MODEL_NAME)
except Exception as e:
    print(f"Warning: Could not load {MODEL_NAME}. Error: {e}")
    model = None

class MatchResult(BaseModel):
    resume_id: str
    jd_id: str
    overall_score: int
    skill_match_score: int
    experience_score: int
    similarity_score: int

def calculate_skill_match(resume_skills, jd_must_have, jd_good_to_have):
    # Base heuristic skill match
    if not jd_must_have and not jd_good_to_have:
        return 100
        
    resume_skills_set = set([s.lower() for s in resume_skills])
    must_have_set = set([s.lower() for s in jd_must_have])
    good_to_have_set = set([s.lower() for s in jd_good_to_have])
    
    must_have_matched = len(must_have_set.intersection(resume_skills_set))
    good_to_have_matched = len(good_to_have_set.intersection(resume_skills_set))
    
    # Weight must-have more
    score = 0
    if must_have_set:
        score += (must_have_matched / len(must_have_set)) * 70
    if good_to_have_set:
        score += (good_to_have_matched / len(good_to_have_set)) * 30
        
    return int(min(100, score))

def calculate_experience_score(resume_exp, jd_exp_range):
    # A simple mapping for experience
    # If JD asks for 3-5, and resume has 4 -> 100
    try:
        if isinstance(jd_exp_range, str):
            if "not specified" in jd_exp_range.lower():
                return 100
            elif "+" in jd_exp_range:
                min_exp = int(jd_exp_range.split('+')[0])
                if resume_exp >= min_exp:
                    return 100
                else:
                    return int(max(0, 100 - (min_exp - resume_exp)*20))
            elif "-" in jd_exp_range:
                parts = jd_exp_range.replace(" years", "").split('-')
                min_exp, max_exp = int(parts[0]), int(parts[1])
                if min_exp <= resume_exp:
                    # Give bonus if within or slightly above
                    return 100
                else:
                    return int(max(0, 100 - (min_exp - resume_exp)*20))
    except:
        pass
    
    # default fallback
    if resume_exp > 0:
        return 80
    return 50

def get_text_similarity(resume_text, jd_text):
    if not model:
        return 50 # fallback
        
    try:
        embeddings = model.encode([resume_text, jd_text])
        score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        return int(score * 100)
    except Exception as e:
        print(f"Embedding error: {e}")
        return 50

def match_resume_to_jd(resume_data, jd_data, resume_raw_text="", jd_raw_text=""):
    """
    resume_data: dict from parsed resume
    jd_data: dict from parsed jd
    """
    skill_score = calculate_skill_match(
        resume_data.get('skills', []), 
        jd_data.get('must_have_skills', []), 
        jd_data.get('good_to_have', [])
    )
    
    experience_score = calculate_experience_score(
        resume_data.get('experience_years', 0),
        jd_data.get('experience_range', '')
    )
    
    # Text similarity (if texts provided)
    similarity_score = 50
    if resume_raw_text and jd_raw_text:
        similarity_score = get_text_similarity(resume_raw_text, jd_raw_text)
        
    # Weighted overall score
    # Skills = 50%, Experience = 20%, Similarity = 30%
    overall = (skill_score * 0.5) + (experience_score * 0.2) + (similarity_score * 0.3)
    
    return MatchResult(
        resume_id=resume_data.get('resume_id', 'unknown'),
        jd_id=jd_data.get('jd_id', 'unknown'),
        overall_score=int(overall),
        skill_match_score=skill_score,
        experience_score=experience_score,
        similarity_score=similarity_score
    ).model_dump()
