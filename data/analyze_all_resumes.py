import os

resumes_dir = 'resumes_anon/'
resumes = os.listdir(resumes_dir)

categorized = {
    'frontend': [],
    'backend': [],
    'devops': [],
    'qa': [],
    'ml': [],
    'data': [],
    'pm_ba': [],
    'unknown': []
}

def guess_role(content):
    c = content.lower()
    # Check PM/BA first as they often have keywords from other roles
    if 'project manager' in c or 'business analyst' in c or 'scrum master' in c or 'pmp' in c or 'agile' in c:
         if 'developer' not in c and 'engineer' not in c:
            return 'pm_ba'
    
    if 'react' in c or 'angular' in c or 'frontend' in c or 'css' in c:
        return 'frontend'
    if 'java' in c or 'spring' in c or 'backend' in c or 'microservices' in c:
        return 'backend'
    if 'devops' in c or 'aws' in c or 'cloud' in c or 'kubernetes' in c or 'docker' in c:
        return 'devops'
    if 'qa' in c or 'selenium' in c or 'automation' in c or 'test engineer' in c:
        return 'qa'
    if 'machine learning' in c or 'ai' in c or 'tensorflow' in c or 'pytorch' in c or 'data scientist' in c:
        return 'ml'
    if 'data engineer' in c or 'spark' in c or 'hadoop' in c or 'etl' in c:
        return 'data'
    return 'unknown'

for r in resumes:
    try:
        with open(os.path.join(resumes_dir, r), 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(5000) # Read first 5000 chars
            role = guess_role(content)
            categorized[role].append(r)
    except:
        pass

for role, res in categorized.items():
    print(f"{role}: {len(res)}")

# Output lists to files for easier access
import json
with open('categorized_resumes.json', 'w') as f:
    json.dump(categorized, f)
