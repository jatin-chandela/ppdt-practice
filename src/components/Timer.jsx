import React from 'react';

function fmt(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function Timer({ seconds, total }) {
  const pct = total ? (seconds / total) * 100 : 0;
  let color = 'text-emerald-400';
  let bar = 'bg-emerald-500';
  if (pct <= 33) { color = 'text-amber-400'; bar = 'bg-amber-500'; }
  if (seconds <= 10) { color = 'text-red-400'; bar = 'bg-red-500'; }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`font-mono text-4xl font-bold tabular-nums ${color}`}>
        {fmt(seconds)}
      </div>
      <div className="w-40 h-1.5 bg-slate-800 rounded overflow-hidden">
        <div className={`h-full ${bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
