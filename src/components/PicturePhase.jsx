import React, { useState } from 'react';
import useTimer from '../hooks/useTimer.js';
import Timer from './Timer.jsx';

const DURATION = 30;

export default function PicturePhase({ session, onDone, onCancel }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { seconds } = useTimer(DURATION, { autoStart: true, onExpire: onDone });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 gap-6">
      <button
        onClick={onCancel}
        className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
      >
        ← Back
      </button>

      <div className="text-sm uppercase tracking-widest text-slate-400">
        Observe the picture — PPDT Set #{session.scene.id}
      </div>

      <div className="relative w-full max-w-3xl aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
        {!loaded && !failed && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 animate-pulse">
            Loading image…
          </div>
        )}
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 text-center px-6">
            <div className="text-5xl">🖼️</div>
            <div>Couldn't load image. Check your internet connection and try another set.</div>
          </div>
        ) : (
          <img
            src={session.scene.url}
            alt={`PPDT scene ${session.scene.id}`}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`w-full h-full object-contain bg-black transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      <Timer seconds={seconds} total={DURATION} />
      <div className="text-xs text-slate-500">
        Note: number of characters, age, sex, mood, and the central action.
      </div>
    </div>
  );
}
