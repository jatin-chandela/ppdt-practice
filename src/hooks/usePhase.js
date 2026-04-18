import { useState, useCallback, useEffect } from 'react';

export const PHASES = {
  IDLE: 'idle',
  PICTURE: 'picture',
  CHARACTER: 'character',
  STORY: 'story',
  DONE: 'done',
  ATTEMPTS: 'attempts',
};

const ORDER = [PHASES.IDLE, PHASES.PICTURE, PHASES.CHARACTER, PHASES.STORY, PHASES.DONE];
const STORAGE_KEY = 'ssb:phase';
const VALID = new Set(Object.values(PHASES));

function readInitial() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && VALID.has(v) ? v : PHASES.IDLE;
  } catch { return PHASES.IDLE; }
}

export default function usePhase() {
  const [phase, setPhase] = useState(readInitial);

  useEffect(() => {
    try {
      if (phase === PHASES.IDLE) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, phase);
    } catch {}
  }, [phase]);

  const next = useCallback(() => {
    setPhase((p) => {
      const i = ORDER.indexOf(p);
      if (i === -1 || i === ORDER.length - 1) return p;
      return ORDER[i + 1];
    });
  }, []);

  const goTo = useCallback((p) => setPhase(p), []);
  const reset = useCallback(() => setPhase(PHASES.IDLE), []);

  return { phase, next, goTo, reset };
}
