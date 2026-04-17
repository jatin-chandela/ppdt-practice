import React, { useState } from 'react';
import useTimer from '../hooks/useTimer.js';
import Timer from './Timer.jsx';

const DURATION = 30;

export default function PicturePhase({ session, onDone, onCancel }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { seconds } = useTimer(DURATION, { autoStart: true, onExpire: onDone });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 gap-5">
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white border border-sand-300 hover:bg-sand-100 text-sm text-ink-700"
      >
        ← Back
      </button>

      <div className="text-xs uppercase tracking-widest text-olive-700 font-semibold">
        Observe — Set #{session.scene.id}
      </div>

      <div className="relative w-full max-w-3xl aspect-[4/3] bg-sand-100 rounded-xl overflow-hidden border border-sand-200">
        {!loaded && !failed && (
          <div className="absolute inset-0 flex items-center justify-center text-ink-500 animate-pulse text-sm">
            Loading image…
          </div>
        )}
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-500 gap-2 text-center px-6">
            <div className="text-sm">Couldn't load image. Check your connection.</div>
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

      <div className="text-xs text-ink-500 text-center max-w-md">
        Note — number of characters, age, sex, mood, and the central action.
      </div>

      <button
        onClick={onDone}
        className="px-6 py-2.5 rounded-lg bg-olive-600 hover:bg-olive-700 text-sand-50 font-semibold text-sm"
      >
        Finish early — next step
      </button>
    </div>
  );
}
