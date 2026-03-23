import json
import pandas as pd
import random

with open('categorized_resumes.json', 'r') as f:
    resumes_by_role = json.load(f)

df_jds = pd.read_csv('jds/jds_index.csv')
jds_by_role = df_jds.groupby('role_category')['file'].apply(list).to_dict()

# We need to fill:
# strong_fit: 14 more
# medium_fit: 16 more
# weak_fit: 18 more

new_pairs = []

# Target Roles
roles = ['frontend', 'backend', 'devops', 'qa', 'ml', 'data']
adjacent = [('frontend', 'backend'), ('backend', 'devops'), ('qa', 'backend'), ('ml', 'data'), ('data', 'backend')]

# 1. Generate many Same-Role pairs (High potential for Strong/Medium)
for role in roles:
    if role in resumes_by_role and role in jds_by_role and resumes_by_role[role] and jds_by_role[role]:
        r_list = resumes_by_role[role]
        j_list = jds_by_role[role]
        for i in range(15):
             new_pairs.append((random.choice(r_list), random.choice(j_list)))

# 2. Generate many Adjacent-Role pairs (High potential for Medium/Weak)
for r_role, j_role in adjacent:
    if r_role in resumes_by_role and j_role in jds_by_role and resumes_by_role[r_role] and jds_by_role[j_role]:
        r_list = resumes_by_role[r_role]
        j_list = jds_by_role[j_role]
        for i in range(10):
            new_pairs.append((random.choice(r_list), random.choice(j_list)))

# 3. Generate some specialized combinations for "Weak"
# PM/BA resumes vs Technical JDs often result in weak or reject, but if they have tech background, maybe weak.
pm_ba_resumes = resumes_by_role['pm_ba']
if pm_ba_resumes:
    for i in range(30):
        new_pairs.append((random.choice(pm_ba_resumes), random.choice(df_jds['file'].tolist())))

# Remove duplicates
unique_pairs = list(set(new_pairs))

# Let's pick 100 new pairs
random.shuffle(unique_pairs)
batch = unique_pairs[:100]

# Output with higher starting index to avoid collision
for i, (r, j) in enumerate(batch):
    print(f"P_NEW_{i+101:03d},{r},{j}")
