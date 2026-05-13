import { useCallback } from "react";

export interface Stats {
  totalPlayed: number;
  totalWon: number;
  currentStreak: number;
  maxStreak: number;
  mistakeDistribution: Record<number, number>; // 0~4 wrong guesses
  completedPuzzleIds: number[];
}

const STATS_KEY = "connections-stats";

const DEFAULT_STATS: Stats = {
  totalPlayed: 0,
  totalWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  mistakeDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
  completedPuzzleIds: [],
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
  const recordResult = useCallback(
    (puzzleId: number, won: boolean, mistakeCount: number) => {
      const stats = loadStats();

      // prevent double-counting the same puzzle
      if (stats.completedPuzzleIds.includes(puzzleId)) return;

      const newStats: Stats = {
        ...stats,
        totalPlayed: stats.totalPlayed + 1,
        totalWon: won ? stats.totalWon + 1 : stats.totalWon,
        completedPuzzleIds: [...stats.completedPuzzleIds.slice(-99), puzzleId],
        mistakeDistribution: won
          ? { ...stats.mistakeDistribution, [mistakeCount]: (stats.mistakeDistribution[mistakeCount] ?? 0) + 1 }
          : stats.mistakeDistribution,
        currentStreak: won ? stats.currentStreak + 1 : 0,
        maxStreak: won
          ? Math.max(stats.maxStreak, stats.currentStreak + 1)
          : stats.maxStreak,
      };

      saveStats(newStats);
    },
    [],
  );

  return { loadStats, recordResult };
}
