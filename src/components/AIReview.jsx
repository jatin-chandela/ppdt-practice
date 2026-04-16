import React, { useRef, useState } from 'react';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mimeType: file.type || 'image/jpeg' });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AIReview({ initialBlob = null }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(() => initialBlob ? URL.createObjectURL(initialBlob) : null);
  const [file, setFile] = useState(initialBlob || null);
  const [mode, setMode] = useState('image'); // image | text
  const [manualText, setManualText] = useState('');
  const [stage, setStage] = useState('idle'); // idle | sending | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onFileInput = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setStage('idle');
  };

  const submit = async () => {
    setStage('sending');
    setError(null);
    try {
      let body;
      if (mode === 'image' && file) {
        const { base64, mimeType } = await fileToBase64(file);
        body = { image: base64, mimeType };
      } else {
        body = { story: manualText };
      }

      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data);
      setStage('done');
    } catch (e) {
      setError(e.message);
      setStage('error');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      <div>
        <div className="font-semibold text-lg">AI story review</div>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload a photo of your handwritten story — Gemini reads the handwriting directly and gives SSB-style feedback.
        </p>
      </div>

      <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-1 text-xs">
        <button
          onClick={() => setMode('image')}
          className={`flex-1 px-3 py-1.5 rounded-md transition ${mode === 'image' ? 'bg-slate-800 text-slate-100' : 'text-slate-400'}`}
        >
          📷 Photo of story
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 px-3 py-1.5 rounded-md transition ${mode === 'text' ? 'bg-slate-800 text-slate-100' : 'text-slate-400'}`}
        >
          ⌨️ Type story
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFileInput} className="hidden" />

      {mode === 'image' ? (
        preview ? (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black">
              <img src={preview} alt="preview" className="w-full max-h-72 object-contain" />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-xs hover:bg-black"
              >
                Replace
              </button>
            </div>
            <button
              onClick={submit}
              disabled={stage === 'sending'}
              className="w-full px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-sm"
            >
              {stage === 'sending' ? 'Gemini is reading & analyzing…' : stage === 'done' ? '✨ Re-analyze' : '✨ Get AI feedback'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full p-8 rounded-lg border-2 border-dashed border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-300 text-sm"
          >
            📷 Take / choose photo of your handwritten story
          </button>
        )
      ) : (
        <div className="space-y-2">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={6}
            placeholder="Type or paste your story here…"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <div className="text-xs text-slate-500 text-right">
            {manualText.trim() ? manualText.trim().split(/\s+/).length : 0} words
          </div>
          <button
            onClick={submit}
            disabled={stage === 'sending' || manualText.trim().length < 20}
            className="w-full px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-sm"
          >
            {stage === 'sending' ? 'Analyzing…' : stage === 'done' ? '✨ Re-analyze' : '✨ Get AI feedback'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-900 text-sm text-red-300">
          {error}
          <button onClick={submit} className="ml-2 underline hover:text-red-200">Retry</button>
        </div>
      )}

      {result && <ReviewResult result={result} />}
    </div>
  );
}

function ReviewResult({ result }) {
  const {
    transcribed_text, overall_score, word_count, structural_check,
    strengths, weaknesses, olqs_demonstrated, olqs_missing,
    suggested_rewrite, verdict,
  } = result;

  const scoreColor =
    overall_score >= 8 ? 'text-emerald-400' :
    overall_score >= 6 ? 'text-amber-400' :
    'text-red-400';

  return (
    <div className="pt-4 border-t border-slate-800 space-y-4">
      <div className="flex items-baseline gap-4">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Score</div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{overall_score}<span className="text-2xl text-slate-500">/10</span></div>
        </div>
        <div className="text-sm text-slate-300 flex-1">{verdict}</div>
      </div>

      {transcribed_text && (
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-1.5">What Gemini read from your handwriting</div>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{transcribed_text}</p>
        </div>
      )}

      <Checklist check={structural_check} wordCount={word_count} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Block title="Strengths" items={strengths} accent="emerald" />
        <Block title="Weaknesses" items={weaknesses} accent="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TagCloud title="OLQs demonstrated" items={olqs_demonstrated} accent="emerald" />
        <TagCloud title="OLQs missing" items={olqs_missing} accent="slate" />
      </div>

      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-1.5">Suggested rewrite</div>
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{suggested_rewrite}</p>
      </div>
    </div>
  );
}

function Checklist({ check, wordCount }) {
  const items = [
    { label: 'Named hero', ok: check.has_named_hero },
    { label: 'Past established', ok: check.has_past },
    { label: 'Present action', ok: check.has_present_action },
    { label: 'Positive future', ok: check.has_positive_future },
    { label: 'Characters defined', ok: check.characters_defined },
    { label: `${wordCount} words`, ok: wordCount >= 60 && wordCount <= 130 },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i.label} className={`px-2 py-1 rounded text-xs ${i.ok ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
          {i.ok ? '✓' : '✗'} {i.label}
        </span>
      ))}
    </div>
  );
}

function Block({ title, items, accent }) {
  const color = accent === 'emerald' ? 'text-emerald-300' : 'text-red-300';
  return (
    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
      <div className={`text-xs uppercase tracking-widest mb-1.5 ${color}`}>{title}</div>
      <ul className="space-y-1 text-sm text-slate-200">
        {(items || []).map((s, i) => <li key={i} className="flex gap-2"><span className="text-slate-500">•</span><span>{s}</span></li>)}
        {(!items || items.length === 0) && <li className="text-slate-500 italic">—</li>}
      </ul>
    </div>
  );
}

function TagCloud({ title, items, accent }) {
  const color = accent === 'emerald'
    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    : 'bg-slate-800 text-slate-400 border-slate-700';
  return (
    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
      <div className="text-xs uppercase tracking-widest text-slate-400 mb-1.5">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {(items || []).map((t) => (
          <span key={t} className={`px-2 py-0.5 rounded text-xs border ${color}`}>{t}</span>
        ))}
        {(!items || items.length === 0) && <span className="text-slate-500 italic text-sm">—</span>}
      </div>
    </div>
  );
}
