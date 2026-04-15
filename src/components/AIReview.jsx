import React, { useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';

const MIN_CHARS = 20;

export default function AIReview({ initialFile = null, initialBlob = null }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(() => {
    if (initialBlob) return URL.createObjectURL(initialBlob);
    if (initialFile) return URL.createObjectURL(initialFile);
    return null;
  });
  const [stage, setStage] = useState('idle'); // idle | ocr | review | done | error
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const pickFile = (f) => {
    setPreview(URL.createObjectURL(f));
    setStage('idle');
    setText('');
    setResult(null);
    setError(null);
    runOcr(f);
  };

  const onFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
  };

  const runOcr = async (source) => {
    setStage('ocr');
    setProgress(0);
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(source);
      await worker.terminate();
      setText(data.text.trim());
      setStage('edit');
    } catch (e) {
      setError(String(e));
      setStage('error');
    }
  };

  const runReview = async () => {
    if (text.trim().length < MIN_CHARS) {
      setError(`Need at least ${MIN_CHARS} characters of story text.`);
      return;
    }
    setStage('review');
    setError(null);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: text }),
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

  // Auto-start OCR if we were passed a blob
  React.useEffect(() => {
    if (initialBlob && stage === 'idle') runOcr(initialBlob);
    else if (initialFile && stage === 'idle') runOcr(initialFile);

  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      <div>
        <div className="font-semibold text-lg">AI story review</div>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload a photo of your handwritten story. We extract the text in your browser and send only the text to Gemini for SSB-style feedback.
        </p>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFileInput} className="hidden" />

      {!preview ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full p-6 rounded-lg border-2 border-dashed border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-300 text-sm"
        >
          📷 Upload photo of your story
        </button>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-black">
            <img src={preview} alt="" className="w-full object-cover" />
          </div>
          <div className="space-y-2">
            {stage === 'ocr' && (
              <div className="text-sm text-slate-300">
                <div>Extracting text… {progress}%</div>
                <div className="mt-1 h-1.5 bg-slate-800 rounded overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {(stage === 'edit' || stage === 'review' || stage === 'done') && (
              <>
                <label className="text-xs text-slate-400">Extracted text (fix typos if needed)</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm focus:border-emerald-500 focus:outline-none"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    Re-upload
                  </button>
                </div>
                <button
                  onClick={runReview}
                  disabled={stage === 'review' || text.trim().length < MIN_CHARS}
                  className="w-full mt-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-sm"
                >
                  {stage === 'review' ? 'Analyzing…' : stage === 'done' ? 'Re-analyze' : '✨ Get AI feedback'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-900 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && <ReviewResult result={result} />}
    </div>
  );
}

function ReviewResult({ result }) {
  const {
    overall_score, word_count, structural_check,
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
