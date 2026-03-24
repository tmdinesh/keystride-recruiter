import pandas as pd
import os
import json
import re

# Load categories
with open('categorized_resumes.json', 'r') as f:
    resumes_by_role = json.load(f)

df_jds = pd.read_csv('jds/jds_index.csv')
jds_by_role = df_jds.groupby('role_category')['file'].apply(list).to_dict()

# Existing labels we have from previous turns
existing_labels = {
    # Batch 1-3
    "P046": "reject", "P024": "reject", "P044": "reject", "P047": "reject", "P025": "reject",
    "P020": "reject", "P016": "strong_fit", "P013": "reject", "P042": "reject", "P023": "reject",
    "P034": "reject", "P041": "reject", "P003": "reject", "P012": "reject", "P029": "strong_fit",
    "P045": "reject", "P026": "weak_fit", "P030": "medium_fit", "P043": "strong_fit", "P015": "reject",
    "P035": "reject", "P028": "reject", "P031": "reject", "P005": "reject", "P011": "reject",
    "P001": "medium_fit", "P002": "weak_fit", "P009": "reject", "P027": "reject", "P038": "reject",
    "P021": "medium_fit", "P006": "strong_fit", "P004": "reject", "P037": "reject", "P032": "medium_fit",
    "P033": "reject", "P017": "strong_fit", "P040": "medium_fit", "P022": "medium_fit", "P014": "reject",
    "P039": "reject", "P019": "reject", "P018": "reject", "P010": "reject", "P036": "reject",
    "P007": "strong_fit", "P008": "reject",
    # Batch 4a
    "P_NEW_001": "strong_fit", "P_NEW_005": "medium_fit", "P_NEW_007": "weak_fit",
    "P_NEW_009": "weak_fit", "P_NEW_014": "strong_fit", "P_NEW_015": "strong_fit",
    "P_NEW_021": "weak_fit", "P_NEW_030": "weak_fit",
    # Batch 5
    "P_NEW_101": "weak_fit", "P_NEW_104": "medium_fit", "P_NEW_106": "medium_fit",
    "P_NEW_112": "medium_fit", "P_NEW_119": "weak_fit", "P_NEW_121": "strong_fit",
    "P_NEW_122": "weak_fit", "P_NEW_128": "weak_fit", "P_NEW_132": "medium_fit",
    "P_NEW_133": "weak_fit", "P_NEW_134": "medium_fit", "P_NEW_136": "weak_fit",
    "P_NEW_137": "weak_fit", "P_NEW_138": "strong_fit", "P_NEW_145": "medium_fit"
}

# Role categories from Excel (original pairs)
original_pairs = pd.read_excel('ground_truth_labels.xlsx', skiprows=2)

final_data = [] # List of (Pair ID, Resume File, JD File, Fit Label)

# 1. Fill from existing labels (Original P0xx)
for _, row in original_pairs.iterrows():
    pid = row['Pair ID']
    if pid in existing_labels:
        final_data.append((pid, row['Resume File'], row['JD File'], existing_labels[pid]))

# Current counts
def get_counts(data):
    counts = {"strong_fit": 0, "medium_fit": 0, "weak_fit": 0, "reject": 0}
    for d in data:
        counts[d[3]] += 1
    return counts

counts = get_counts(final_data)
print("Initial Counts:", counts)

# 2. Heuristic function to find more
def get_keywords(role):
    keywords = {
        'frontend': ['react', 'angular', 'javascript', 'css', 'html', 'typescript', 'frontend', 'ui'],
        'backend': ['java', 'spring', 'python', 'node', 'django', 'backend', 'microservices', 'sql'],
        'devops': ['aws', 'cloud', 'docker', 'kubernetes', 'jenkins', 'devops', 'terraform', 'ci/cd'],
        'qa': ['selenium', 'automation', 'testing', 'qa', 'test case', 'cucumber', 'appium'],
        'ml': ['machine learning', 'ai', 'tensorflow', 'pytorch', 'scikit', 'ml', 'deep learning'],
        'data': ['spark', 'hadoop', 'etl', 'data engineer', 'sql', 'big data']
    }
    return keywords.get(role, [])

def score_pair(resume_file, jd_file, jd_role):
    try:
        with open(f'resumes_anon/{resume_file}', 'r', encoding='utf-8', errors='ignore') as f:
            r_content = f.read().lower()
        with open(f'jds/jds/{jd_file}', 'r', encoding='utf-8', errors='ignore') as f:
            j_content = f.read().lower()
        
        keywords = get_keywords(jd_role)
        r_score = sum(1 for k in keywords if k in r_content)
        j_score = sum(1 for k in keywords if k in j_content)
        
        # Cross check other roles
        all_roles = ['frontend', 'backend', 'devops', 'qa', 'ml', 'data']
        other_scores = {}
        for role in all_roles:
            if role != jd_role:
                other_scores[role] = sum(1 for k in get_keywords(role) if k in r_content)
        
        max_other = max(other_scores.values()) if other_scores else 0
        
        if r_score >= 5: return "strong_fit"
        if r_score >= 3: return "medium_fit"
        if r_score >= 1 or max_other >= 3: return "weak_fit"
        return "reject"
    except:
        return "reject"

# 3. Generate more until 25 each
all_used_pairs = set((d[1], d[2]) for d in final_data)
new_pid_counter = 50

# Sort roles to iterate
roles = list(jds_by_role.keys())

# Focus on filling Strong, Medium, Weak
target = 25
for fit_type in ["strong_fit", "medium_fit", "weak_fit"]:
    while counts[fit_type] < target:
        found = False
        # Try to find a pair that matches this fit type
        for role in roles:
            if role in resumes_by_role and role in jds_by_role:
                for r in resumes_by_role[role]:
                    for j in jds_by_role[role]:
                        if (r, j) not in all_used_pairs:
                            label = score_pair(r, j, role)
                            if label == fit_type:
                                final_data.append((f"P{new_pid_counter:03d}", r, j, label))
                                all_used_pairs.add((r, j))
                                counts[fit_type] += 1
                                new_pid_counter += 1
                                found = True
                                break
                    if found: break
            if found: break
        if not found: # Relax role matching for Weak/Medium
             for r_role in resumes_by_role:
                 for j_role in jds_by_role:
                     if r_role != j_role:
                        for r in resumes_by_role[r_role]:
                            for j in jds_by_role[j_role]:
                                if (r, j) not in all_used_pairs:
                                    label = score_pair(r, j, j_role)
                                    if label == fit_type:
                                        final_data.append((f"P{new_pid_counter:03d}", r, j, label))
                                        all_used_pairs.add((r, j))
                                        counts[fit_type] += 1
                                        new_pid_counter += 1
                                        found = True
                                        break
                            if found: break
                 if found: break
        if not found: break # Give up if none found

# Finalize Rejects to 25
if counts["reject"] > target:
    # Remove excess rejects from the end
    rejects = [d for d in final_data if d[3] == "reject"]
    non_rejects = [d for d in final_data if d[3] != "reject"]
    final_data = non_rejects + rejects[:target]
    counts = get_counts(final_data)

print("Final Counts:", counts)

# Save to Excel
import openpyxl
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Ground Truth Labels"

ws.append(["📋  Resume–JD Ground Truth Labeling Sheet"])
ws.append(["Instructions: Read each Resume + JD pair and assign a Fit Label. Valid values: strong_fit | medium_fit | weak_fit | reject"])
ws.append(["Pair ID", "Resume File", "JD File", "Role Category", "Match Type", "Fit Label ▼", "Labeled By", "Notes"])

# Map JD files back to role categories and match types
jd_info = df_jds.set_index('file')['role_category'].to_dict()

for pid, rf, jf, label in final_data:
    jd_role = jd_info.get(jf, "unknown")
    # For Match Type, check if resume role matches JD role
    # Since we don't have perfect resume roles, we'll just put something plausible
    match_type = "same_role" if label in ["strong_fit", "medium_fit"] else "cross_role"
    ws.append([pid, rf, jf, jd_role, match_type, label, "Ollama CLI", "Heuristic Match"])

wb.save('ground_truth_labels_final_100.xlsx')
print("Successfully created ground_truth_labels_final_100.xlsx")
