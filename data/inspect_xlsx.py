import pandas as pd
import sys

try:
    df = pd.read_excel('ground_truth_labels.xlsx')
    print("Columns in ground_truth_labels.xlsx:")
    print(df.columns.tolist())
    print("\nFirst 5 rows:")
    print(df.head())
except Exception as e:
    print(f"Error: {e}")
