import pandas as pd

# Let's read it properly, skipping headers if needed
df = pd.read_excel('ground_truth_labels.xlsx', skiprows=2)
print("Columns after skipping 2 rows:")
print(df.columns.tolist())
print("\nFirst 5 rows:")
print(df.head())

# Check anon_report.csv
try:
    df_anon = pd.read_csv('anon_report.csv')
    print("\nColumns in anon_report.csv:")
    print(df_anon.columns.tolist())
    print("\nFirst 5 rows:")
    print(df_anon.head())
except:
    pass
