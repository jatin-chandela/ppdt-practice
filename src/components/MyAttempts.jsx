import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth.jsx';
import { listAttempts, deleteAttempt, getStats } from '../lib/storage.js';
import AIReview from './AIReview.jsx';

export default function MyAttempts({ onBack }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [reviewing, setReviewing] = useState(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [r, s] = await Promise.all([listAttempts(user.id), getStats(user.id)]);
    setRows(r);
    setStats(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const del = async (row) => {
    await deleteAttempt(row.id, row.photo_path);
    if (open === row.id) setOpen(null);
    if (reviewing?.id === row.id) setReviewing(null);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Attempts</h2>
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">← Back</button>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total reviewed" value={stats.total} />
          <Stat label="Avg. score" value={`${stats.avg}/10`} />
          <Stat label="Last 5 scores" value={stats.latest.join(', ')} />
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 col-span-2 md:col-span-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">OLQ weakness heatmap (most missed)</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(stats.olqMisses)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([name, count]) => (
                  <span key={name} className="px-2 py-1 rounded text-xs bg-red-500/15 text-red-300 border border-red-500/30">
                    {name} ({count}×)
                  </span>
                ))}
              {Object.keys(stats.olqMisses).length === 0 && <span className="text-slate-500 text-xs italic">No data yet</span>}
            </div>
          </div>
        </div>
      )}

      {reviewing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Reviewing — PPDT Set #{reviewing.scene_id}</div>
            <button onClick={() => setReviewing(null)} className="text-sm text-slate-400 hover:text-slate-200">Close ✕</button>
          </div>
          <AIReview key={reviewing.id} initialImageUrl={reviewing.photo_url} />
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="p-10 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400">
          No uploads yet. Complete a session and snap a photo of your story.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              <button onClick={() => setOpen(open === r.id ? null : r.id)} className="block w-full aspect-[4/3] bg-black">
                <img src={r.photo_url} alt="" className="w-full h-full object-cover" />
              </button>
              <div className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">PPDT Set #{r.scene_id}</div>
                    <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</div>
                    {r.ai_score != null && (
                      <div className={`text-xs font-semibold mt-0.5 ${r.ai_score >= 6 ? 'text-emerald-400' : r.ai_score >= 4 ? 'text-amber-400' : 'text-red-400'}`}>
                        Score: {r.ai_score}/10
                      </div>
                    )}
                  </div>
                  <img src={r.scene_url} alt="" className="w-12 h-12 object-cover rounded border border-slate-800" />
                </div>
                {r.note && <p className="text-xs text-slate-400 mt-2">{r.note}</p>}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => setReviewing(r)}
                    className="text-xs px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                  >
                    ✨ AI review
                  </button>
                  <button
                    onClick={() => del(r)}
                    className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-red-900/60 text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {open === r.id && (
                <div className="border-t border-slate-800 bg-black">
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
    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
      <div className="text-xs text-slate-500 uppercase tracking-widest">{label}</div>
      <div className="text-lg font-bold mt-0.5">{value}</div>
    </div>
  );
}
