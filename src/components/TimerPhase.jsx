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
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 gap-6">
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white border border-sand-300 hover:bg-sand-100 text-sm text-ink-700"
      >
        ← Back
      </button>

      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-olive-700 font-semibold mb-1">{subtitle}</div>
        <h1 className="text-3xl md:text-4xl font-bold text-ink-900">{title}</h1>
      </div>

      {thumbUrl && (
        <div className="w-32 aspect-[4/3] rounded-lg overflow-hidden border border-sand-200 bg-sand-100 opacity-80">
          <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="scale-150">
        <Timer seconds={seconds} total={duration} />
      </div>

      <ul className="max-w-md w-full space-y-2 text-ink-700 text-sm bg-white border border-sand-200 rounded-xl p-4">
        {instructions.map((line, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-olive-600 font-bold">{i + 1}.</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {allowFinishEarly && (
        <button
          onClick={onDone}
          className="px-5 py-2 rounded-lg bg-olive-600 hover:bg-olive-700 text-sand-50 text-sm font-semibold"
        >
          Finish early →
        </button>
      )}
    </div>
  );
}
