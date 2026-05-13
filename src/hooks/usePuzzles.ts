import { useState, useEffect } from "react";
import type { Puzzle } from "../types";
import { puzzles as builtinPuzzles } from "../data/puzzles";
import { PUZZLES_URL, PUZZLES_CACHE_KEY } from "../puzzleConfig";

function loadCache(): Puzzle[] | null {
  try {
    const raw = localStorage.getItem(PUZZLES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Puzzle[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function saveCache(data: Puzzle[]) {
  try {
    localStorage.setItem(PUZZLES_CACHE_KEY, JSON.stringify(data));
  } catch {
    // storage full 등 무시
  }
}

export function usePuzzles() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>(() => loadCache() ?? builtinPuzzles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(PUZZLES_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Puzzle[]>;
      })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          saveCache(data);
          setPuzzles(data);
        }
      })
      .catch(() => {
        // 네트워크 오류 → 캐시 or 내장 데이터로 유지
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { puzzles, loading };
}
