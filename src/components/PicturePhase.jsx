import React, { useState } from 'react';
import useTimer from '../hooks/useTimer.js';
import Timer from './Timer.jsx';

const DURATION = 30;

export default function PicturePhase({ session, onDone, onCancel }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { seconds } = useTimer(DURATION, { autoStart: true, onExpire: onDone });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 gap-8 animate-fade-in">
      <button
        onClick={onCancel}
        className="absolute top-5 right-5 px-3 py-1.5 text-xs uppercase tracking-widest text-bone-400 hover:text-bone-100 border border-white/10 hover:border-white/20 rounded-md transition"
      >
        ← Back
      </button>

      <div className="text-[11px] uppercase tracking-widest text-bone-500">
        Observe · Set #{session.scene.id}
      </div>

      <div className="relative w-full max-w-3xl aspect-[4/3] bg-black rounded-md overflow-hidden border border-white/5">
        {!loaded && !failed && (
          <div className="absolute inset-0 flex items-center justify-center text-bone-500 animate-pulse text-sm">
            Loading image…
          </div>
        )}
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-bone-400 gap-2 text-center px-6">
            <div className="font-display text-4xl italic">no image</div>
            <div className="text-sm">Check your connection and try another set.</div>
          </div>
        ) : (
          <img
            src={session.scene.url}
            alt={`PPDT scene ${session.scene.id}`}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`w-full h-full object-contain bg-black transition-opacity duration-500 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      <Timer seconds={seconds} total={DURATION} />

      <div className="text-xs text-bone-500 max-w-md text-center leading-relaxed">
        Note — number of characters, age, sex, mood, and the central action.
      </div>

      <button
        onClick={onDone}
        className="px-6 py-3 rounded-md bg-gold-400 hover:bg-gold-300 text-ink-950 font-medium text-sm transition"
      >
        Finish early — next step
      </button>
    </div>
  );
}
