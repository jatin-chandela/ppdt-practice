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
    <div className="flex items-center justify-center gap-6 py-6 text-[11px] uppercase tracking-widest">
      {STEPS.map((s, i) => {
        const active = i === activeIdx;
        const done = i < activeIdx;
        return (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 transition ${
              active ? 'text-gold-300' : done ? 'text-bone-400' : 'text-bone-600'
            }`}>
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                active ? 'border-gold-400 text-gold-300' :
                done   ? 'border-bone-500 text-bone-400' :
                         'border-white/10 text-bone-600'
              }`}>{i + 1}</span>
              <span>{s.label}</span>
              <span className="opacity-50">· {s.time}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-white/10" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
