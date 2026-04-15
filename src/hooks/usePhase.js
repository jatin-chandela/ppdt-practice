import { useState, useCallback } from 'react';

export const PHASES = {
  IDLE: 'idle',
  PICTURE: 'picture',
  CHARACTER: 'character',
  STORY: 'story',
  DONE: 'done',
  ATTEMPTS: 'attempts',
};

const ORDER = [PHASES.IDLE, PHASES.PICTURE, PHASES.CHARACTER, PHASES.STORY, PHASES.DONE];

export default function usePhase() {
  const [phase, setPhase] = useState(PHASES.IDLE);

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
