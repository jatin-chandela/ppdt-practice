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
    <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-up">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-bone-500 mb-2">Archive</div>
          <h2 className="font-display text-5xl text-bone-50">My attempts</h2>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs uppercase tracking-widest text-bone-400 hover:text-bone-100 border border-white/10 hover:border-white/20 rounded-md transition"
        >
          ← Back
        </button>
      </div>

      {stats && (
        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-md overflow-hidden">
          <Stat label="Total reviewed" value={stats.total} />
          <Stat label="Average" value={`${stats.avg}/10`} />
          <Stat label="Last five" value={stats.latest.join(' · ') || '—'} wide />
          <div className="p-5 bg-ink-950 col-span-2 md:col-span-4">
            <div className="text-[11px] text-bone-500 uppercase tracking-widest mb-3">OLQ weakness heatmap</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(stats.olqMisses)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([name, count]) => (
                  <span key={name} className="px-2.5 py-1 rounded text-xs bg-red-500/10 text-red-300 border border-red-500/20">
                    {name} <span className="opacity-60">· {count}</span>
                  </span>
                ))}
              {Object.keys(stats.olqMisses).length === 0 && <span className="text-bone-500 text-xs italic">No data yet</span>}
            </div>
          </div>
        </div>
      )}

      {reviewing && (
        <div className="mb-8 p-5 border border-white/5 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-widest text-bone-400">Reviewing · Set #{reviewing.scene_id}</div>
            <button onClick={() => setReviewing(null)} className="text-xs text-bone-400 hover:text-bone-100">Close ✕</button>
          </div>
          <AIReview key={reviewing.id} initialImageUrl={reviewing.photo_url} />
        </div>
      )}

      {loading ? (
        <div className="text-bone-500 text-sm">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="p-16 rounded-md border border-white/5 text-center text-bone-400">
          <div className="font-display text-3xl italic mb-2">Nothing yet.</div>
          <div className="text-sm">Complete a session and upload a photo of your story.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-md border border-white/5 overflow-hidden hover:border-white/15 transition">
              <button onClick={() => setOpen(open === r.id ? null : r.id)} className="block w-full aspect-[4/3] bg-black">
                <img src={r.photo_url} alt="" className="w-full h-full object-cover" />
              </button>
              <div className="p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg text-bone-100">Set #{r.scene_id}</div>
                    <div className="text-[11px] text-bone-500 uppercase tracking-widest mt-0.5">{new Date(r.created_at).toLocaleDateString()}</div>
                    {r.ai_score != null && (
                      <div className={`text-xs font-medium mt-1.5 ${r.ai_score >= 6 ? 'text-gold-300' : r.ai_score >= 4 ? 'text-bone-300' : 'text-red-300'}`}>
                        {r.ai_score}/10
                      </div>
                    )}
                  </div>
                  <img src={r.scene_url} alt="" className="w-12 h-12 object-cover rounded border border-white/5 shrink-0" />
                </div>
                {r.note && <p className="text-xs text-bone-400 mt-3 leading-relaxed">{r.note}</p>}
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => setReviewing(r)}
                    className="text-[11px] uppercase tracking-widest px-2.5 py-1 rounded border border-gold-400/30 text-gold-300 hover:bg-gold-400/10 transition"
                  >
                    AI review
                  </button>
                  <button
                    onClick={() => del(r)}
                    className="text-[11px] uppercase tracking-widest px-2.5 py-1 rounded border border-white/10 text-bone-400 hover:text-red-300 hover:border-red-500/30 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {open === r.id && (
                <div className="border-t border-white/5 bg-black">
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

function Stat({ label, value, wide }) {
  return (
    <div className={`p-5 bg-ink-950 ${wide ? 'col-span-2' : ''}`}>
      <div className="text-[11px] text-bone-500 uppercase tracking-widest">{label}</div>
      <div className="font-display text-3xl text-bone-50 mt-1">{value}</div>
    </div>
  );
}
