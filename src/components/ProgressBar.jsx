import React from 'react';
import { PHASES } from '../hooks/usePhase.js';

const STEPS = [
  { id: PHASES.PICTURE,   label: 'Picture',   time: '30s' },
  { id: PHASES.CHARACTER, label: 'Character', time: '1m' },
  { id: PHASES.STORY,     label: 'Story',     time: '4m' },
];

export default function ProgressBar({ phase }) {
  const activeIdx = STEPS.findIndex((s) => s.id === phase);
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEPS.map((s, i) => {
        const active = i === activeIdx;
        const done = i < activeIdx;
        return (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition ${
              active ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' :
              done   ? 'bg-slate-800 border-slate-700 text-slate-400' :
                       'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                active ? 'bg-emerald-400 text-slate-900' :
                done   ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-500'
              }`}>{i + 1}</span>
              <span>{s.label}</span>
              <span className="opacity-60">{s.time}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-slate-700" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
