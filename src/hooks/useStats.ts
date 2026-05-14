import { useState, useCallback } from "react";

export interface Stats {
  totalPlayed: number;
  totalWon: number;
  currentStreak: number;
  maxStreak: number;
  mistakeDistribution: Record<number, number>; // 0~4 wrong guesses
  completedPuzzleIds: number[];
  totalHintsUsed: number;
}

const STATS_KEY = "connections-stats";

const DEFAULT_STATS: Stats = {
  totalPlayed: 0,
  totalWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  mistakeDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
  completedPuzzleIds: [],
  totalHintsUsed: 0,
};

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) } as Stats;
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(() => loadStats());

  const recordResult = useCallback(
    (puzzleId: number, won: boolean, mistakeCount: number, hintCount: number) => {
      setStats((prev) => {
        if (prev.completedPuzzleIds.includes(puzzleId)) return prev;

        const next: Stats = {
          ...prev,
          totalPlayed: prev.totalPlayed + 1,
          totalWon: won ? prev.totalWon + 1 : prev.totalWon,
          completedPuzzleIds: [...prev.completedPuzzleIds.slice(-99), puzzleId],
          mistakeDistribution: won
            ? { ...prev.mistakeDistribution, [mistakeCount]: (prev.mistakeDistribution[mistakeCount] ?? 0) + 1 }
            : prev.mistakeDistribution,
          currentStreak: won ? prev.currentStreak + 1 : 0,
          maxStreak: won ? Math.max(prev.maxStreak, prev.currentStreak + 1) : prev.maxStreak,
          totalHintsUsed: prev.totalHintsUsed + hintCount,
        };

        saveStats(next);
        return next;
      });
    },
    [],
  );

  return { stats, recordResult };
}
