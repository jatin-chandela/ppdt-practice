import React from 'react';
import useTimer from '../hooks/useTimer.js';
import Timer from './Timer.jsx';

export default function TimerPhase({
  title,
  subtitle,
  instructions,
  duration,
  onDone,
  onCancel,
  thumbUrl,
  allowFinishEarly = false,
}) {
  const { seconds } = useTimer(duration, { autoStart: true, onExpire: onDone });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 gap-8">
      <button
        onClick={onCancel}
        className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
      >
        ← Back
      </button>

      <div className="text-center">
        <div className="text-sm uppercase tracking-widest text-slate-400 mb-2">{subtitle}</div>
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
      </div>

      {thumbUrl && (
        <div className="w-40 aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 bg-black opacity-60">
          <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="scale-[2]">
        <Timer seconds={seconds} total={duration} />
      </div>

      <ul className="max-w-md w-full space-y-2 text-slate-300 text-sm">
        {instructions.map((line, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-emerald-400">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {allowFinishEarly && (
        <button
          onClick={onDone}
          className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300"
        >
          Finish early →
        </button>
      )}
    </div>
  );
}
