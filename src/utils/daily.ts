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
