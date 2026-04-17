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
    <div className="flex items-center justify-center gap-2 py-3">
      {STEPS.map((s, i) => {
        const active = i === activeIdx;
        const done = i < activeIdx;
        return (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
              active ? 'bg-olive-600 border-olive-700 text-sand-50' :
              done   ? 'bg-olive-100 border-olive-200 text-olive-700' :
                       'bg-white border-sand-200 text-ink-500'
            }`}>
              <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                active ? 'bg-sand-50 text-olive-700' :
                done   ? 'bg-olive-600 text-sand-50' : 'bg-sand-100 text-ink-500'
              }`}>{i + 1}</span>
              <span>{s.label}</span>
              <span className="opacity-70">{s.time}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-3 h-px bg-sand-300" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
