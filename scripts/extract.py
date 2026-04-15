"""Extract unique images from the PPDT PDF into public/ppdt/.

Usage (from project root):
    python scripts/extract.py

Requires: pip install pymupdf pillow
"""
import hashlib
import io
import json
import os
import sys

import fitz  # PyMuPDF
from PIL import Image

PDF = "400+ ppdt.pdf"
OUT_DIR = os.path.join("public", "ppdt")
MANIFEST = os.path.join("src", "data", "scenes.json")
MIN_W, MIN_H = 250, 250  # drop logos/decorations

def main():
    if not os.path.exists(PDF):
        print(f"PDF not found at {PDF}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)

    doc = fitz.open(PDF)
    seen = set()
    records = []

    for page_num, page in enumerate(doc, start=1):
        for img_info in page.get_images(full=True):
            xref = img_info[0]
            try:
                base = doc.extract_image(xref)
            except Exception:
                continue
            data = base["image"]
            h = hashlib.md5(data).hexdigest()[:12]
            if h in seen:
                continue
            seen.add(h)

            try:
                pil = Image.open(io.BytesIO(data))
            except Exception:
                continue
            if pil.width < MIN_W or pil.height < MIN_H:
                continue

            idx = len(records) + 1
            filename = f"ppdt_{idx:04d}.jpg"
            out_path = os.path.join(OUT_DIR, filename)
            if pil.mode != "RGB":
                pil = pil.convert("RGB")
            pil.save(out_path, "JPEG", quality=85)
            records.append({
                "id": idx,
                "file": filename,
                "page": page_num,
                "width": pil.width,
                "height": pil.height,
                "category": None,
            })

            if idx % 25 == 0:
                print(f"  extracted {idx} images…")

    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    print(f"\nDone. Extracted {len(records)} unique images into {OUT_DIR}")
    print(f"Manifest written to {MANIFEST} (category: null — run classify.py next)")

if __name__ == "__main__":
    main()
