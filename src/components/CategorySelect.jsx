import React, { useEffect, useState } from 'react';
import { categories, countsByCategory, pool, randomScene } from '../data/scenes.js';
import { useAuth } from '../lib/auth.jsx';
import { getStats } from '../lib/storage.js';

export default function CategorySelect({ onStart, lastSceneId, onOpenAttempts }) {
  const { user } = useAuth();
  const [catId, setCatId] = useState('all');
  const [stats, setStats] = useState(null);
  const counts = countsByCategory();

  useEffect(() => {
    if (!user) return;
    getStats(user.id).then(setStats).catch(() => {});
  }, [user]);

  useEffect(() => {
    const p = pool(catId);
    const shuffled = [...p].sort(() => Math.random() - 0.5).slice(0, 2);
    shuffled.forEach((s) => {
      const img = new Image();
      img.src = s.url;
    });
  }, [catId]);

  const startWith = (scene) => onStart({ scene, startedAt: new Date().toISOString() });
  const goRandom = () => startWith(randomScene(catId, lastSceneId ? [lastSceneId] : []));
  const filtered = pool(catId);
  const activeCat = categories.find((c) => c.id === catId);

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 lg:h-[calc(100vh-3.5rem)] flex flex-col gap-4">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold text-ink-900">PPDT Practice</h1>
          <span className="text-xs uppercase tracking-widest text-olive-700 font-semibold">SSB Screening</span>
        </div>
        <p className="text-ink-500 text-sm mt-0.5">
          {counts.all} images · 30s observe · 1m notes · 4m story. Write on paper; the app times it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white border border-sand-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-ink-900">Category</h2>
            <span className="text-xs text-ink-500">{filtered.length} in {activeCat.label.toLowerCase()}</span>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {categories.map((c) => {
              const active = catId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCatId(c.id)}
                  className={`px-2 py-2 rounded-lg border text-left text-xs transition ${
                    active
                      ? 'bg-olive-600 border-olive-700 text-sand-50'
                      : 'bg-sand-50 border-sand-200 hover:border-olive-300 text-ink-700'
                  }`}
                >
                  <div className="font-semibold leading-tight">{c.label}</div>
                  <div className={`text-[10px] mt-0.5 ${active ? 'text-sand-100' : 'text-ink-500'}`}>{counts[c.id] || 0}</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={goRandom}
            disabled={filtered.length === 0}
            className="w-full px-6 py-4 rounded-lg bg-olive-600 hover:bg-olive-700 disabled:opacity-40 text-sand-50 font-semibold text-base shadow-sm transition"
          >
            Begin — random from {activeCat.label}
          </button>

          <div className="border-t border-sand-200 pt-4">
            <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">Browse</div>
            <div className="grid grid-cols-6 md:grid-cols-10 gap-1.5 overflow-y-auto max-h-44 pr-1">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => startWith(s)}
                  title={`#${s.id}`}
                  className="group relative aspect-square rounded bg-sand-100 border border-sand-200 hover:border-olive-500 overflow-hidden"
                >
                  <img src={s.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-sand-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-ink-900">Your progress</h2>
            <button onClick={onOpenAttempts} className="text-xs text-olive-700 hover:underline font-medium">
              View all →
            </button>
          </div>

          {!stats ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <div className="text-ink-500 text-sm mb-1">No data yet</div>
                <div className="text-xs text-ink-300">Finish a session and get AI review to build your heatmap.</div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <MiniStat label="Reviewed" value={stats.total} />
                <MiniStat label="Average" value={`${stats.avg}/10`} />
              </div>

              {stats.latest.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-500 mb-1.5">Last {stats.latest.length} scores</div>
                  <div className="flex gap-1 items-end h-12">
                    {stats.latest.map((s, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-olive-500"
                        style={{ height: `${(s / 10) * 100}%`, minHeight: '4px' }}
                        title={`${s}/10`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <div className="text-[10px] uppercase tracking-widest text-ink-500 mb-1.5">OLQ heatmap · where you lose marks</div>
                <OLQHeatmap misses={stats.olqMisses} hits={stats.olqHits} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="p-2.5 rounded-lg bg-sand-50 border border-sand-200">
      <div className="text-[10px] uppercase tracking-widest text-ink-500">{label}</div>
      <div className="text-xl font-bold text-olive-700 mt-0.5">{value}</div>
    </div>
  );
}

function OLQHeatmap({ misses = {}, hits = {} }) {
  const all = new Set([...Object.keys(misses), ...Object.keys(hits)]);
  if (all.size === 0) {
    return <div className="text-xs text-ink-300 italic">No OLQ data yet.</div>;
  }
  const entries = [...all].map((k) => ({
    name: k,
    miss: misses[k] || 0,
    hit: hits[k] || 0,
  })).sort((a, b) => b.miss - a.miss);

  const maxMiss = Math.max(1, ...entries.map((e) => e.miss));

  return (
    <div className="flex flex-wrap gap-1 overflow-y-auto pr-1">
      {entries.map((e) => {
        const intensity = e.miss / maxMiss;
        const bg = e.miss === 0
          ? 'bg-olive-100 text-olive-800 border-olive-200'
          : intensity > 0.66
            ? 'bg-red-200 text-red-900 border-red-300'
            : intensity > 0.33
              ? 'bg-khaki-400/40 text-khaki-600 border-khaki-400/60'
              : 'bg-sand-100 text-ink-700 border-sand-300';
        return (
          <span
            key={e.name}
            className={`px-2 py-0.5 rounded text-[11px] border ${bg}`}
            title={`${e.hit} hits · ${e.miss} misses`}
          >
            {e.name} <span className="opacity-70">{e.miss}×</span>
          </span>
        );
      })}
    </div>
  );
}
