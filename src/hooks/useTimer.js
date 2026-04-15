import { useEffect, useRef, useState, useCallback } from 'react';

export default function useTimer(initialSeconds, { autoStart = true, onExpire } = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  const firedRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && !firedRef.current) {
      firedRef.current = true;
      setRunning(false);
      onExpireRef.current?.();
    }
  }, [seconds]);

  const reset = useCallback((newSeconds) => {
    firedRef.current = false;
    setSeconds(newSeconds ?? initialSeconds);
    setRunning(true);
  }, [initialSeconds]);

  const pause = useCallback(() => setRunning(false), []);
  const resume = useCallback(() => setRunning(true), []);

  return { seconds, running, pause, resume, reset };
}
