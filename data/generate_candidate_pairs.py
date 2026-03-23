import json
import pandas as pd
import random

with open('categorized_resumes.json', 'r') as f:
    resumes_by_role = json.load(f)

df_jds = pd.read_csv('jds/jds_index.csv')
jds_by_role = df_jds.groupby('role_category')['file'].apply(list).to_dict()

# We need about 25 of each.
# Current (approx):
# Strong: 6 -> need 19
# Medium: 6 -> need 19
# Weak: 2 -> need 23
# Reject: 33 -> need -8 (keep 25)

# To be safe, let's generate 20 more for each category and let the LLM label them.

new_pairs = []

roles = ['frontend', 'backend', 'devops', 'qa', 'ml']

# Potential Strong (Same role)
for role in roles:
    if role in resumes_by_role and role in jds_by_role:
        r_list = resumes_by_role[role]
        j_list = jds_by_role[role]
        # Pick 5 from each role
        for i in range(min(5, len(r_list), len(j_list))):
            new_pairs.append((r_list[i+5] if len(r_list) > i+5 else r_list[i], j_list[i]))

# Potential Medium (Similar roles or partial match)
# e.g. Frontend resume vs Backend JD (sometimes fullstack)
# or QA resume vs Dev JD
for i in range(20):
    role1 = roles[i % len(roles)]
    role2 = roles[(i + 1) % len(roles)]
    if resumes_by_role[role1] and jds_by_role[role2]:
        new_pairs.append((random.choice(resumes_by_role[role1]), random.choice(jds_by_role[role2])))

# Potential Weak (Very different but maybe same industry)
for i in range(20):
    role1 = roles[i % len(roles)]
    role2 = roles[(i + 2) % len(roles)]
    if resumes_by_role[role1] and jds_by_role[role2]:
        new_pairs.append((random.choice(resumes_by_role[role1]), random.choice(jds_by_role[role2])))

# Rejects are easy, we have enough already, but let's add some more cross-domain
pm_ba_resumes = resumes_by_role['pm_ba']
if pm_ba_resumes:
    for i in range(10):
        new_pairs.append((random.choice(pm_ba_resumes), random.choice(df_jds['file'].tolist())))

# Remove duplicates
unique_pairs = list(set(new_pairs))

# Limit to 60 for this batch
random.shuffle(unique_pairs)
batch = unique_pairs[:60]

for i, (r, j) in enumerate(batch):
    print(f"P_NEW_{i+1:03d},{r},{j}")
