import pandas as pd
import os

# Categorize JDs
df_jds = pd.read_csv('jds/jds_index.csv')
jds_by_role = df_jds.groupby('role_category')['file'].apply(list).to_dict()

# Simple categorization for resumes based on filename
resumes = os.listdir('resumes_anon/')
resumes_by_role = {
    'frontend': [],
    'backend': [],
    'devops': [],
    'qa': [],
    'ml': [],
    'data': [],
    'pm_ba': []
}

for r in resumes:
    rl = r.lower()
    if 'frontend' in rl or 'ui' in rl or 'javascript' in rl or 'angular' in rl or 'react' in rl:
        resumes_by_role['frontend'].append(r)
    if 'backend' in rl or 'java' in rl or 'python' in rl or 'node' in rl or 'spring' in rl:
        resumes_by_role['backend'].append(r)
    if 'devops' in rl or 'aws' in rl or 'cloud' in rl:
        resumes_by_role['devops'].append(r)
    if 'qa' in rl or 'test' in rl or 'selenium' in rl or 'automation' in rl:
        resumes_by_role['qa'].append(r)
    if 'ml' in rl or 'machine learning' in rl or 'ai' in rl or 'data scientist' in rl:
        resumes_by_role['ml'].append(r)
    if 'data' in rl and 'scientist' not in rl and 'engineer' in rl:
        resumes_by_role['data'].append(r)
    if 'pm' in rl or 'project manager' in rl or 'ba' in rl or 'business analyst' in rl or 'bsa' in rl:
        resumes_by_role['pm_ba'].append(r)

# Print counts
for role, res in resumes_by_role.items():
    print(f"Resumes for {role}: {len(res)}")

# Try to find potential strong fits (same role)
potential_strong = []
for role in ['frontend', 'backend', 'devops', 'qa', 'ml', 'data']:
    if role in jds_by_role and resumes_by_role[role]:
        for i in range(min(10, len(resumes_by_role[role]), len(jds_by_role[role]))):
             potential_strong.append((resumes_by_role[role][i], jds_by_role[role][i], role))

# Try to find potential rejects (cross role)
potential_rejects = []
roles = ['frontend', 'backend', 'devops', 'qa', 'ml']
for i in range(20):
    r_role = roles[i % len(roles)]
    j_role = roles[(i + 1) % len(roles)]
    if resumes_by_role[r_role] and jds_by_role[j_role]:
        potential_rejects.append((resumes_by_role[r_role][0], jds_by_role[j_role][0], f"{r_role}->{j_role}"))

print(f"\nPotential strong fits count: {len(potential_strong)}")
print(f"Potential rejects count: {len(potential_rejects)}")
