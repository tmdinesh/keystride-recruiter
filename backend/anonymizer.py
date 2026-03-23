"""
Resume Anonymizer
=================
Masks PII from PDF and DOCX resumes before feeding them into the AI pipeline.

What gets masked:
  - Email addresses        → MASKED_EMAIL
  - Phone numbers          → MASKED_PHONE
  - Dates of birth         → MASKED_DOB
  - Physical addresses     → MASKED_ADDRESS
  - Names (via spaCy NER)  → MASKED_NAME
  - LinkedIn / GitHub URLs → MASKED_URL

Output:
  data/resumes_anon/   → anonymized .txt files (one per resume)
  data/anon_report.csv → summary of what was masked per file

Usage:
  pip install PyMuPDF python-docx spacy pandas
  python -m spacy download en_core_web_sm
  python backend/anonymizer.py
"""

import os
import re
import fitz          # PyMuPDF
import pandas as pd
import spacy
from docx import Document

# ── Config ────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_DIR  = os.path.join(BASE_DIR, "data", "resumes")
OUTPUT_DIR = os.path.join(BASE_DIR, "data", "resumes_anon")
REPORT     = os.path.join(BASE_DIR, "data", "anon_report.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load spaCy model for name/location detection
try:
    nlp = spacy.load("en_core_web_sm")
    USE_SPACY = True
except OSError:
    print("⚠️  spaCy model not found. Run: python -m spacy download en_core_web_sm")
    print("   Continuing without NER-based name masking...\n")
    USE_SPACY = False

# ── PII Patterns ──────────────────────────────────────────────────────────────

PII_PATTERNS = [
    # Email
    (r'[\w\.\+\-]+@[\w\.\-]+\.\w{2,}',                          "MASKED_EMAIL"),
    # Phone — handles +91, 0, country codes, spaces, dashes
    (r'(\+?\d{1,3}[\s\-]?)?(\(?\d{3}\)?[\s\-]?)(\d{3}[\s\-]?\d{4})', "MASKED_PHONE"),
    # Indian mobile numbers
    (r'\b[6-9]\d{9}\b',                                           "MASKED_PHONE"),
    # Date of birth patterns
    (r'\b(D\.?O\.?B|Date\s+of\s+Birth)\s*[:\-]?\s*[\w\s,\/\-]+', "MASKED_DOB"),
    (r'\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b',                  "MASKED_DOB"),
    # LinkedIn / GitHub URLs
    (r'https?://(www\.)?(linkedin|github)\.com/[\w\-/]+',         "MASKED_URL"),
    # Generic URLs with personal handles
    (r'https?://\S+',                                              "MASKED_URL"),
    # Address keywords
    (r'\b(Address|Location|City|State|Zip|PIN)\s*[:\-]\s*[^\n]+', "MASKED_ADDRESS"),
    # Common address patterns (street numbers)
    (r'\b\d+[,\s]+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Nagar|Colony)\b',
                                                                   "MASKED_ADDRESS"),
]


def mask_pii_regex(text):
    """Apply all regex-based PII masking. Returns (masked_text, count_dict)."""
    counts = {}
    for pattern, label in PII_PATTERNS:
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        if matches:
            counts[label] = counts.get(label, 0) + len(matches)
        text = re.sub(pattern, label, text, flags=re.IGNORECASE)
    return text, counts


def mask_pii_spacy(text):
    """Use spaCy NER to mask PERSON and GPE (location) entities."""
    if not USE_SPACY:
        return text, {}
    doc = nlp(text[:100000])  # spaCy limit guard
    counts = {}
    # Replace entities in reverse order to preserve indices
    replacements = []
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            replacements.append((ent.start_char, ent.end_char, "MASKED_NAME"))
            counts["MASKED_NAME"] = counts.get("MASKED_NAME", 0) + 1
        elif ent.label_ in ("GPE", "LOC"):
            replacements.append((ent.start_char, ent.end_char, "MASKED_LOCATION"))
            counts["MASKED_LOCATION"] = counts.get("MASKED_LOCATION", 0) + 1
    for start, end, label in sorted(replacements, reverse=True):
        text = text[:start] + label + text[end:]
    return text, counts


def anonymize_text(raw_text):
    """Full anonymization pipeline on raw text."""
    text, regex_counts = mask_pii_regex(raw_text)
    text, ner_counts   = mask_pii_spacy(text)
    all_counts = {**regex_counts, **ner_counts}
    return text, all_counts


# ── File Readers ──────────────────────────────────────────────────────────────

def read_pdf(filepath):
    """Extract text from PDF using PyMuPDF."""
    doc = fitz.open(filepath)
    pages = [page.get_text() for page in doc]
    return "\n".join(pages)


def read_docx(filepath):
    """Extract text from DOCX."""
    doc = Document(filepath)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


# ── Main Pipeline ─────────────────────────────────────────────────────────────

def process_file(fname):
    fpath = os.path.join(INPUT_DIR, fname)
    ext   = fname.lower().split(".")[-1]

    # Read
    try:
        if ext == "pdf":
            raw = read_pdf(fpath)
        elif ext == "docx":
            raw = read_docx(fpath)
        else:
            return None  # skip unsupported formats
    except Exception as e:
        print(f"  ❌ Could not read {fname}: {e}")
        return None

    if len(raw.strip()) < 100:
        print(f"  ⚠️  Skipping {fname} — too little text extracted")
        return None

    # Anonymize
    anon_text, counts = anonymize_text(raw)

    # Save output as .txt
    out_name = fname.rsplit(".", 1)[0] + "_anon.txt"
    out_path = os.path.join(OUTPUT_DIR, out_name)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(anon_text)

    total_masked = sum(counts.values())
    print(f"  ✅ {fname} → {out_name}  ({total_masked} items masked)")

    return {
        "original_file": fname,
        "anon_file":     out_name,
        "char_count":    len(anon_text),
        **counts,
    }


def run():
    print("=" * 60)
    print("  Resume Anonymizer")
    print("=" * 60)

    files = [
        f for f in os.listdir(INPUT_DIR)
        if f.lower().endswith((".pdf", ".docx"))
    ]

    if not files:
        print(f"\n❌ No PDF or DOCX files found in '{INPUT_DIR}'")
        return

    print(f"\nFound {len(files)} resume(s) in '{INPUT_DIR}'\n")

    results = []
    for fname in sorted(files):
        record = process_file(fname)
        if record:
            results.append(record)

    # Save report
    if results:
        df = pd.DataFrame(results).fillna(0)
        df.to_csv(REPORT, index=False)

        print(f"\n{'='*60}")
        print(f"  ✅ Anonymized: {len(results)} / {len(files)} resumes")
        print(f"  📁 Output:     {OUTPUT_DIR}/")
        print(f"  📊 Report:     {REPORT}")
        print(f"\n  PII Summary:")
        mask_cols = [c for c in df.columns if c.startswith("MASKED_")]
        for col in mask_cols:
            print(f"    {col:<25} {int(df[col].sum())} instances removed")
        print("=" * 60)

        # Verification check
        print("\n🔍 Spot-check (first 3 files):")
        for _, row in df.head(3).iterrows():
            path = os.path.join(OUTPUT_DIR, row["anon_file"])
            with open(path, encoding="utf-8") as f:
                snippet = f.read(300).replace("\n", " ")
            print(f"\n  [{row['anon_file']}]")
            print(f"  {snippet}...")
    else:
        print("\n❌ No resumes were successfully anonymized.")


if __name__ == "__main__":
    run()
