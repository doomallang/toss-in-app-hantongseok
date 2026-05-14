import { useState, useEffect } from "react";
import type { Puzzle } from "../types";
import { puzzles as builtinPuzzles } from "../data/puzzles";
import { PUZZLES_URL, PUZZLES_CACHE_KEY, PUZZLES_CACHE_TS_KEY, PUZZLES_CACHE_TTL_MS } from "../puzzleConfig";

function isCacheExpired(): boolean {
  const ts = localStorage.getItem(PUZZLES_CACHE_TS_KEY);
  if (!ts) return true;
  return Date.now() - parseInt(ts, 10) > PUZZLES_CACHE_TTL_MS;
}

function loadCache(): Puzzle[] | null {
  if (isCacheExpired()) return null;
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
    localStorage.setItem(PUZZLES_CACHE_TS_KEY, String(Date.now()));
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
