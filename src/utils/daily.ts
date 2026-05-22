// 앱 출시일 기준 (KST) — 이 날짜가 #1번 퍼즐에 해당
const EPOCH_MS = new Date("2025-05-13T00:00:00+09:00").getTime();

function todayKSTMidnightMs(): number {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  kst.setHours(0, 0, 0, 0);
  return kst.getTime();
}

export function getDailyIndex(puzzleCount: number): number {
  const days = Math.floor((todayKSTMidnightMs() - EPOCH_MS) / (24 * 60 * 60 * 1000));
  return ((days % puzzleCount) + puzzleCount) % puzzleCount;
}

/** 다음 KST 자정까지 남은 밀리초 */
export function msUntilNextDaily(): number {
  const now = Date.now();
  const kst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  kst.setHours(24, 0, 0, 0);
  return kst.getTime() - now;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
