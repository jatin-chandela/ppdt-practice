# PPDT Practice — SSB Screening Simulator

A free web app that simulates the SSB screening **Picture Perception & Discussion Test** with exact timings, a library of 400+ practice pictures auto-classified by category, and optional AI feedback on your handwritten story.

Write on paper, let the app run the timers, then optionally upload a photo of your story to get instant AI feedback on SSB Officer Like Qualities (OLQs).

## Features

- **Strict SSB timings**: 30s picture → 1min character notes → 4min story
- **410 practice images** classified into Rural / Urban / Military / Nature / Group / Solo
- **Category filter + random + browse modes**
- **Paper-first workflow**: no typing required — you write on paper, app handles timers
- **Photo upload**: snap your handwritten story; stored locally via IndexedDB
- **AI review** (optional): browser-side OCR via Tesseract.js → Gemini 2.5 Flash for OLQ scoring, strengths/weaknesses, and a suggested rewrite
- **100% local data**: photos and attempts never leave your browser; only the extracted story text is sent to the LLM

## Stack

- React 18 + Vite + Tailwind CSS
- Tesseract.js (in-browser OCR)
- Netlify Functions (Gemini API proxy, keeps the key server-side)
- IndexedDB for user attempts

## Local development

```bash
npm install
npm run dev            # http://localhost:5173 (no AI review)
# or with functions:
netlify dev            # http://localhost:8888 (full stack, needs GEMINI_API_KEY)
```

Set `GEMINI_API_KEY` in `.env` (see `.env.example`). Get a free key at https://aistudio.google.com/apikey.

## Building the image library

If you want to rebuild the image library from a different PDF source:

```bash
pip install pymupdf pillow torch torchvision open-clip-torch
python scripts/extract.py      # extracts images → public/ppdt/
python scripts/classify.py     # zero-shot CLIP into 6 categories
```

This writes `src/data/scenes.json` consumed by the app.

## Deploy to Netlify

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set GEMINI_API_KEY "your_key"
netlify deploy --prod
```

Netlify free tier is sufficient: 100 GB/month bandwidth, 125k function invocations/month. Gemini free tier: 1,500 requests/day.

## Licence

Code: MIT. Images are from open SSB practice sets circulating online — used here for educational practice only.
