import React from 'react';

function fmt(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function Timer({ seconds, total }) {
  const pct = total ? (seconds / total) * 100 : 0;
  let color = 'text-bone-100';
  let bar = 'bg-gold-400';
  if (pct <= 33) { color = 'text-gold-300'; bar = 'bg-gold-400'; }
  if (seconds <= 10) { color = 'text-red-300'; bar = 'bg-red-400'; }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`font-mono text-5xl font-medium tabular-nums tracking-tight ${color}`}>
        {fmt(seconds)}
      </div>
      <div className="w-48 h-px bg-white/10 overflow-hidden">
        <div className={`h-full ${bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
