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
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 gap-10 animate-fade-in">
      <button
        onClick={onCancel}
        className="absolute top-5 right-5 px-3 py-1.5 text-xs uppercase tracking-widest text-bone-400 hover:text-bone-100 border border-white/10 hover:border-white/20 rounded-md transition"
      >
        ← Back
      </button>

      <div className="text-center space-y-3">
        <div className="text-[11px] uppercase tracking-widest text-bone-500">{subtitle}</div>
        <h1 className="font-display text-5xl md:text-6xl font-normal text-bone-50">{title}</h1>
      </div>

      {thumbUrl && (
        <div className="w-36 aspect-[4/3] rounded-md overflow-hidden border border-white/5 bg-black opacity-50">
          <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="scale-[1.6]">
        <Timer seconds={seconds} total={duration} />
      </div>

      <ul className="max-w-md w-full space-y-2.5 text-bone-300 text-sm">
        {instructions.map((line, i) => (
          <li key={i} className="flex gap-3">
            <span className="font-mono text-xs text-gold-400 pt-0.5">0{i + 1}</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {allowFinishEarly && (
        <button
          onClick={onDone}
          className="px-5 py-2.5 rounded-md border border-white/10 hover:border-gold-400/50 text-sm text-bone-300 hover:text-gold-300 transition"
        >
          Finish early →
        </button>
      )}
    </div>
  );
}
