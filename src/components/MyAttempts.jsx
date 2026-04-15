import React, { useEffect, useState } from 'react';
import { listAttempts, deleteAttempt } from '../lib/storage.js';
import AIReview from './AIReview.jsx';

export default function MyAttempts({ onBack }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [reviewing, setReviewing] = useState(null);

  const load = async () => {
    setLoading(true);
    const r = await listAttempts();
    setRows(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const urls = React.useMemo(() => {
    const m = new Map();
    rows.forEach((r) => m.set(r.id, URL.createObjectURL(r.blob)));
    return m;
  }, [rows]);

  useEffect(() => {
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [urls]);

  const del = async (id) => {
    await deleteAttempt(id);
    if (open === id) setOpen(null);
    if (reviewing?.id === id) setReviewing(null);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Attempts</h2>
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">
          ← Back
        </button>
      </div>

      {reviewing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Reviewing attempt — PPDT Set #{reviewing.sceneId}</div>
            <button
              onClick={() => setReviewing(null)}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              Close ✕
            </button>
          </div>
          <AIReview key={reviewing.id} initialBlob={reviewing.blob} />
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
              <button
                onClick={() => setOpen(open === r.id ? null : r.id)}
                className="block w-full aspect-[4/3] bg-black"
              >
                <img src={urls.get(r.id)} alt="" className="w-full h-full object-cover" />
              </button>
              <div className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">PPDT Set #{r.sceneId}</div>
                    <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <img src={r.sceneUrl} alt="" className="w-12 h-12 object-cover rounded border border-slate-800" />
                </div>
                {r.note && <p className="text-xs text-slate-400 mt-2">{r.note}</p>}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => setReviewing(r)}
                    className="text-xs px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                  >
                    ✨ AI review
                  </button>
                  <a
                    href={urls.get(r.id)}
                    download={`ppdt-${r.sceneId}-${r.id.slice(0, 6)}.jpg`}
                    className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => del(r.id)}
                    className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-red-900/60 text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {open === r.id && (
                <div className="border-t border-slate-800 bg-black">
                  <img src={urls.get(r.id)} alt="" className="w-full object-contain max-h-[70vh]" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
