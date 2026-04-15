"""Zero-shot classify extracted PPDT images into 6 SSB categories using CLIP.

Usage (from project root, after extract.py):
    python scripts/classify.py

Requires: pip install open-clip-torch torch torchvision pillow
First run downloads ~350 MB of CLIP weights (cached afterwards).
"""
import json
import os
import sys

from PIL import Image
import torch
import open_clip

OUT_DIR = os.path.join("public", "ppdt")
MANIFEST = os.path.join("src", "data", "scenes.json")

# Zero-shot prompts. Multiple prompts per category are averaged for robustness.
CATEGORIES = {
    "rural": [
        "a black and white photo of an Indian village with huts and farms",
        "rural life, farmers in fields, bullock cart, village well",
        "a woman carrying water in a village, thatched roof houses",
    ],
    "urban": [
        "a black and white photo of a busy city street with buildings and crowds",
        "urban traffic, shops, pedestrians on a road, city market",
        "an office or workplace scene in a city",
    ],
    "military": [
        "soldiers in uniform, army camp, military parade",
        "a cadet or officer in military fatigues",
        "armed forces personnel at a border post or training",
    ],
    "nature": [
        "mountains, rivers, forest, outdoor trekking or climbing",
        "adventure sports, hiking in the wilderness",
        "a waterfall, beach, or natural landscape with people",
    ],
    "group": [
        "a group of people meeting or discussing together",
        "a family gathering, friends sitting and talking",
        "students or colleagues in a classroom or conference",
    ],
    "solo": [
        "a single person alone, in deep thought or distress",
        "a lone figure silhouette, walking or standing",
        "a person in a crisis, accident, fire, or rescue situation",
    ],
}

def main():
    if not os.path.exists(MANIFEST):
        print(f"{MANIFEST} not found. Run scripts/extract.py first.", file=sys.stderr)
        sys.exit(1)

    with open(MANIFEST, "r", encoding="utf-8") as f:
        records = json.load(f)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading CLIP (ViT-B-32) on {device}…")
    model, _, preprocess = open_clip.create_model_and_transforms("ViT-B-32", pretrained="openai")
    tokenizer = open_clip.get_tokenizer("ViT-B-32")
    model = model.to(device).eval()

    cat_ids = list(CATEGORIES.keys())
    all_prompts = []
    prompt_to_cat = []
    for cid in cat_ids:
        for p in CATEGORIES[cid]:
            all_prompts.append(p)
            prompt_to_cat.append(cid)

    with torch.no_grad():
        tokens = tokenizer(all_prompts).to(device)
        text_feats = model.encode_text(tokens)
        text_feats = text_feats / text_feats.norm(dim=-1, keepdim=True)

    print(f"Classifying {len(records)} images…")
    for i, rec in enumerate(records, start=1):
        img_path = os.path.join(OUT_DIR, rec["file"])
        try:
            pil = Image.open(img_path).convert("RGB")
        except Exception as e:
            print(f"  skipped {rec['file']}: {e}")
            continue

        with torch.no_grad():
            img_t = preprocess(pil).unsqueeze(0).to(device)
            img_f = model.encode_image(img_t)
            img_f = img_f / img_f.norm(dim=-1, keepdim=True)
            sims = (img_f @ text_feats.T).squeeze(0).tolist()

        # Average similarity per category, pick max.
        cat_scores = {cid: 0.0 for cid in cat_ids}
        cat_counts = {cid: 0 for cid in cat_ids}
        for s, cid in zip(sims, prompt_to_cat):
            cat_scores[cid] += s
            cat_counts[cid] += 1
        cat_scores = {cid: cat_scores[cid] / cat_counts[cid] for cid in cat_ids}

        best = max(cat_scores, key=cat_scores.get)
        rec["category"] = best
        rec["scores"] = {cid: round(cat_scores[cid], 4) for cid in cat_ids}

        if i % 25 == 0:
            print(f"  classified {i}/{len(records)}")

    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    # Summary
    counts = {}
    for r in records:
        counts[r["category"]] = counts.get(r["category"], 0) + 1
    print("\nCategory distribution:")
    for cid in cat_ids:
        print(f"  {cid:10s} {counts.get(cid, 0)}")
    print(f"\nWrote categories into {MANIFEST}")

if __name__ == "__main__":
    main()
