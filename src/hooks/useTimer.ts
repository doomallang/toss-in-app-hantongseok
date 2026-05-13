import { useState, useEffect } from "react";

function timerKey(puzzleId: number) {
  return `connections-timer-${puzzleId}`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * running=true 동안 1초씩 카운트, localStorage에 매초 저장.
 * 새로고침해도 이어서 진행되고, 앱을 닫고 있던 시간은 포함되지 않음.
 */
export function useTimer(puzzleId: number, running: boolean) {
  const key = timerKey(puzzleId);

  const [elapsed, setElapsed] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        try { localStorage.setItem(key, String(next)); } catch { /* ignore */ }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, key]);

  return elapsed;
}
