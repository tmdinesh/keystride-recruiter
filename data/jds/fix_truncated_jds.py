"""
JD Fix Tool — Re-fetch only incomplete/truncated JDs
=====================================================
Reads existing JDs from data/jds/, checks which ones are too short,
and re-fetches ONLY those from their original URLs.

Your existing JD filenames and IDs stay the same — Excel labels stay valid.

Usage:
  python backend/fix_truncated_jds.py

Config:
  MIN_CHARS = minimum character count to consider a JD "complete"
"""

import os
import re
import time
import requests
from bs4 import BeautifulSoup

MIN_CHARS   = 1500   # JDs under this are considered incomplete
JDS_DIR     = r"C:\Users\Dinesh.LAPTOP-OO5HEB93\Downloads\resume_scanner\data\jds\jds"
HEADERS     = {"User-Agent": "Mozilla/5.0 (compatible; JD-Fixer/1.0)"}


def clean_html(raw):
    soup = BeautifulSoup(raw or "", "html.parser")
    text = soup.get_text(separator="\n")
    text = text.encode("ascii", errors="ignore").decode("ascii")
    # Remove RemoteOK spam lines
    text = re.sub(r'Please mention the word.*?(\n|$)', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'tag RMT[A-Za-z0-9=]+.*?(\n|$)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'#RMT[A-Za-z0-9=]+', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def fetch_full_description(url):
    """Try to scrape full job description from the posting URL."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=12)
        soup = BeautifulSoup(resp.text, "html.parser")

        # Try multiple common selectors across job sites
        selectors = [
            {"class": re.compile(r"description|job-description|adp-body|content|details|posting", re.I)},
            {"id":    re.compile(r"job|description|content|details", re.I)},
            {"itemprop": "description"},
        ]
        for attrs in selectors:
            div = soup.find(["div", "section", "article"], attrs)
            if div and len(div.get_text()) > 300:
                return clean_html(str(div))

        # Fallback: grab the largest text block on the page
        candidates = soup.find_all(["div", "section"], recursive=True)
        best = max(candidates, key=lambda t: len(t.get_text()), default=None)
        if best and len(best.get_text()) > 300:
            return clean_html(str(best))

    except Exception as e:
        print(f"    ⚠️  Fetch failed: {e}")
    return None


def parse_jd_file(filepath):
    """Read a JD file and extract role, source, url, and body."""
    with open(filepath, encoding="utf-8") as f:
        content = f.read()

    role   = re.search(r'^ROLE:\s*(.+)$',   content, re.MULTILINE)
    source = re.search(r'^SOURCE:\s*(.+)$', content, re.MULTILINE)
    url    = re.search(r'^URL:\s*(.+)$',    content, re.MULTILINE)

    return {
        "role":    role.group(1).strip()   if role   else "Unknown",
        "source":  source.group(1).strip() if source else "Unknown",
        "url":     url.group(1).strip()    if url    else "",
        "content": content,
        "body_len": len(content),
    }


def fix_jds():
    print("=" * 60)
    print("  JD Fix Tool — Re-fetching Incomplete Descriptions")
    print("=" * 60)

    files = sorted([
        f for f in os.listdir(JDS_DIR)
        if f.endswith(".txt")
    ])

    if not files:
        print(f"\n❌ No JD files found in '{JDS_DIR}'")
        return

    # Identify truncated JDs
    truncated = []
    for fname in files:
        fpath = os.path.join(JDS_DIR, fname)
        info  = parse_jd_file(fpath)
        if info["body_len"] < MIN_CHARS:
            truncated.append((fname, fpath, info))

    print(f"\n📋 Total JDs:      {len(files)}")
    print(f"✂️  Truncated (<{MIN_CHARS} chars): {len(truncated)}")

    if not truncated:
        print("\n✅ All JDs look complete! Nothing to fix.")
        return

    print(f"\nFixing {len(truncated)} JD(s)...\n")
    fixed   = 0
    skipped = 0

    for fname, fpath, info in truncated:
        print(f"  [{fname}] {info['role'][:50]}")
        print(f"    Source: {info['source']}  |  Current length: {info['body_len']} chars")

        if not info["url"]:
            print("    ⚠️  No URL found — skipping\n")
            skipped += 1
            continue

        new_desc = fetch_full_description(info["url"])

        if new_desc and len(new_desc) > info["body_len"]:
            # Overwrite the file, keeping the same header
            header   = f"ROLE: {info['role']}\nSOURCE: {info['source']}\nURL: {info['url']}\n\n"
            new_content = header + new_desc
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"    ✅ Fixed! {info['body_len']} → {len(new_content)} chars\n")
            fixed += 1
        else:
            print(f"    ⚠️  Could not get longer description — keeping original\n")
            skipped += 1

        time.sleep(1.5)  # polite delay between requests

    print("=" * 60)
    print(f"  ✅ Fixed:   {fixed} JDs")
    print(f"  ⏭️  Skipped: {skipped} JDs (no URL or couldn't fetch)")
    print(f"\n  Your filenames and Excel labels are unchanged.")
    print("=" * 60)


if __name__ == "__main__":
    fix_jds()
