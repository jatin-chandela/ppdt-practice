import React, { useState } from 'react';
import { categories, countsByCategory, pool, randomScene } from '../data/scenes.js';

export default function CategorySelect({ onStart, lastSceneId, onOpenAttempts }) {
  const [catId, setCatId] = useState('all');
  const [browsing, setBrowsing] = useState(false);
  const counts = countsByCategory();

  const startWith = (scene) => onStart({ scene, startedAt: new Date().toISOString() });
  const goRandom = () => startWith(randomScene(catId, lastSceneId ? [lastSceneId] : []));

  const filtered = pool(catId);
  const activeCat = categories.find((c) => c.id === catId);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-fade-up">
      <header className="mb-14 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-bone-500 mb-3">SSB Screening · Practice</div>
          <h1 className="font-display text-6xl md:text-7xl font-normal text-bone-50 leading-none">
            Picture <span className="italic text-gold-300">Perception</span>
          </h1>
          <p className="text-bone-400 mt-5 max-w-lg leading-relaxed">
            A quiet simulator for the PPDT. {counts.all} local images, timed the way the board does it. Write on paper — the app keeps time.
          </p>
        </div>
        <button
          onClick={onOpenAttempts}
          className="shrink-0 px-4 py-2 text-xs uppercase tracking-widest text-bone-400 hover:text-bone-100 border border-white/10 hover:border-white/20 rounded-md transition"
        >
          My attempts
        </button>
      </header>

      <section className="mb-14 border-t border-white/5 pt-8">
        <div className="text-[11px] uppercase tracking-widest text-bone-500 mb-5">The three phases</div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <Phase n="01" time="30 s" title="Observe" desc="Study the picture. Count characters, read mood, catch the central action." />
          <Phase n="02" time="1 min" title="Note" desc="Jot characters, age, sex, mood, and the action on paper." />
          <Phase n="03" time="4 min" title="Write" desc="Compose a story — past, present, a concrete future." />
        </ol>
      </section>

      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-2xl text-bone-100">Choose a category</h2>
          <span className="text-xs text-bone-500">{filtered.length} in {activeCat.label.toLowerCase()}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {categories.map((c) => {
            const active = catId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCatId(c.id)}
                className={`p-4 rounded-md border text-left transition ${
                  active
                    ? 'bg-gold-400/10 border-gold-400/40 text-bone-50'
                    : 'bg-transparent border-white/5 hover:border-white/15 text-bone-300'
                }`}
              >
                <div className="text-sm font-medium">{c.label}</div>
                <div className="text-[11px] text-bone-500 mt-1">{counts[c.id] || 0} images</div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={goRandom}
          disabled={filtered.length === 0}
          className="px-6 py-3 rounded-md bg-gold-400 hover:bg-gold-300 disabled:opacity-40 text-ink-950 font-medium text-sm transition"
        >
          Begin — random from {activeCat.label}
        </button>
        <button
          onClick={() => setBrowsing((v) => !v)}
          className="px-5 py-3 rounded-md border border-white/10 hover:border-white/20 text-sm text-bone-300 hover:text-bone-100 transition"
        >
          {browsing ? 'Hide thumbnails' : 'Browse thumbnails'}
        </button>
      </div>

      {browsing && (
        <div className="mt-8 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 animate-fade-in">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => startWith(s)}
              title={`#${s.id} · ${s.category}`}
              className="group relative aspect-square rounded-md overflow-hidden bg-black border border-white/5 hover:border-gold-400/50 transition"
            >
              <img src={s.url} alt="" loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 text-[10px] bg-black/80 text-bone-200 opacity-0 group-hover:opacity-100">
                #{s.id}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Phase({ n, time, title, desc }) {
  return (
    <li className="border-l border-white/10 pl-5">
      <div className="font-mono text-xs text-gold-300 mb-1">{n} · {time}</div>
      <div className="font-display text-xl text-bone-100 mb-1">{title}</div>
      <div className="text-bone-400 text-sm leading-relaxed">{desc}</div>
    </li>
  );
}
