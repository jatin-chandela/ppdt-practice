import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth.jsx';
import { listAttempts, deleteAttempt, getStats } from '../lib/storage.js';
import AIReview from './AIReview.jsx';

export default function MyAttempts({ onBack }) {
  const { user, isAnonymous } = useAuth();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [reviewing, setReviewing] = useState(null);

  const load = async () => {
    if (!user || isAnonymous) { setLoading(false); return; }
    setLoading(true);
    const [r, s] = await Promise.all([listAttempts(user.id), getStats(user.id)]);
    setRows(r);
    setStats(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, isAnonymous]);

  const del = async (row) => {
    await deleteAttempt(row.id, row.photo_path);
    if (open === row.id) setOpen(null);
    if (reviewing?.id === row.id) setReviewing(null);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-ink-900">My Attempts</h2>
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-white border border-sand-300 hover:bg-sand-100 text-sm text-ink-700">← Back</button>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total reviewed" value={stats.total} />
          <Stat label="Average" value={`${stats.avg}/10`} />
          <Stat label="Last 5 scores" value={stats.latest.join(', ')} />
          <div className="p-3 rounded-xl bg-white border border-sand-200 col-span-2 md:col-span-4">
            <div className="text-xs text-ink-500 uppercase tracking-widest mb-2">OLQ weakness heatmap</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(stats.olqMisses)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([name, count]) => (
                  <span key={name} className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 border border-red-200">
                    {name} ({count}×)
                  </span>
                ))}
              {Object.keys(stats.olqMisses).length === 0 && <span className="text-ink-300 text-xs italic">No data yet</span>}
            </div>
          </div>
        </div>
      )}

      {reviewing && (
        <div className="mb-6 p-4 bg-white border border-sand-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-ink-500">Reviewing — PPDT Set #{reviewing.scene_id}</div>
            <button onClick={() => setReviewing(null)} className="text-sm text-ink-500 hover:text-ink-900">Close ✕</button>
          </div>
          <AIReview key={reviewing.id} initialImageUrl={reviewing.photo_url} />
        </div>
      )}

      {loading ? (
        <div className="text-ink-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="p-10 rounded-xl bg-white border border-sand-200 text-center text-ink-500">
          No uploads yet. Complete a session and snap a photo of your story.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl bg-white border border-sand-200 overflow-hidden">
              <button onClick={() => setOpen(open === r.id ? null : r.id)} className="block w-full aspect-[4/3] bg-sand-100">
                <img src={r.photo_url} alt="" className="w-full h-full object-cover" />
              </button>
              <div className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-ink-900">PPDT Set #{r.scene_id}</div>
                    <div className="text-xs text-ink-500">{new Date(r.created_at).toLocaleString()}</div>
                    {r.ai_score != null && (
                      <div className={`text-xs font-semibold mt-0.5 ${r.ai_score >= 6 ? 'text-olive-700' : r.ai_score >= 4 ? 'text-khaki-600' : 'text-red-700'}`}>
                        Score: {r.ai_score}/10
                      </div>
                    )}
                  </div>
                  <img src={r.scene_url} alt="" className="w-12 h-12 object-cover rounded border border-sand-200" />
                </div>
                {r.note && <p className="text-xs text-ink-700 mt-2">{r.note}</p>}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => setReviewing(r)}
                    className="text-xs px-2 py-1 rounded bg-olive-100 text-olive-800 border border-olive-200 hover:bg-olive-200"
                  >
                    AI review
                  </button>
                  <button
                    onClick={() => del(r)}
                    className="text-xs px-2 py-1 rounded bg-white border border-sand-300 hover:bg-red-50 hover:text-red-700 text-ink-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {open === r.id && (
                <div className="border-t border-sand-200 bg-sand-100">
                  <img src={r.photo_url} alt="" className="w-full object-contain max-h-[70vh]" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white border border-sand-200">
      <div className="text-xs text-ink-500 uppercase tracking-widest">{label}</div>
      <div className="text-lg font-bold mt-0.5 text-olive-700">{value}</div>
    </div>
  );
}
