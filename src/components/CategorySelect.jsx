import React, { useState } from 'react';
import { categories, countsByCategory, pool, randomScene } from '../data/scenes.js';

export default function CategorySelect({ onStart, lastSceneId, onOpenAttempts }) {
  const [catId, setCatId] = useState('all');
  const [browsing, setBrowsing] = useState(false);
  const counts = countsByCategory();

  const startWith = (scene) => onStart({ scene, startedAt: new Date().toISOString() });
  const goRandom = () => startWith(randomScene(catId, lastSceneId ? [lastSceneId] : []));

  const filtered = pool(catId);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">PPDT Practice</h1>
          <p className="text-slate-400 mt-1">
            SSB Screening simulator — {counts.all} local practice images. Write on paper; the app runs the timers.
          </p>
        </div>
        <button
          onClick={onOpenAttempts}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm whitespace-nowrap"
        >
          📸 My Attempts
        </button>
      </div>

      <div className="mb-6 p-4 rounded-lg border border-slate-800 bg-slate-900/60 text-sm text-slate-300 leading-relaxed">
        <div className="font-semibold text-slate-100 mb-1">How it works</div>
        <ol className="list-decimal list-inside space-y-0.5">
          <li><span className="text-emerald-400 font-semibold">30s</span> — observe the picture.</li>
          <li><span className="text-emerald-400 font-semibold">1 min</span> — note characters, age, sex, mood, action on paper.</li>
          <li><span className="text-emerald-400 font-semibold">4 min</span> — write the story on paper (past → present → future).</li>
        </ol>
      </div>

      <h2 className="text-lg font-semibold mb-3">Choose a category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        {categories.map((c) => {
          const active = catId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCatId(c.id)}
              className={`p-3 rounded-xl border text-left transition ${
                active
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-100'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="text-xl">{c.emoji}</div>
              <div className="text-sm font-medium mt-1">{c.label}</div>
              <div className="text-xs text-slate-500">{counts[c.id] || 0} images</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={goRandom}
          disabled={filtered.length === 0}
          className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold"
        >
          🎲 Random from {categories.find((c) => c.id === catId).label} ({filtered.length})
        </button>
        <button
          onClick={() => setBrowsing((v) => !v)}
          className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700"
        >
          {browsing ? 'Hide' : 'Browse thumbnails'}
        </button>
      </div>

      {browsing && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => startWith(s)}
              title={`#${s.id} · ${s.category}`}
              className="group relative aspect-square rounded-lg overflow-hidden bg-black border border-slate-800 hover:border-emerald-500"
            >
              <img src={s.url} alt="" loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[10px] bg-black/70 text-slate-200 opacity-0 group-hover:opacity-100">
                #{s.id}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
