import { useState, useCallback } from "react";
import type { Puzzle, GameState, Group, Difficulty } from "../types";

export const MAX_LIVES = 4;
const MAX_SELECTION = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWordDifficulty(word: string, groups: Group[]): Difficulty {
  const group = groups.find((g) => g.words.includes(word));
  return group?.difficulty ?? 1;
}

function getKey(puzzleId: number): string {
  return `connections-${puzzleId}-${new Date().toDateString()}`;
}

function cleanOldSaves(puzzleId: number) {
  const currentKey = getKey(puzzleId);
  const toDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("connections-") && key !== currentKey) {
      toDelete.push(key);
    }
  }
  toDelete.forEach((k) => localStorage.removeItem(k));
}

function getSavedState(puzzleId: number): Partial<GameState> | null {
  const raw = localStorage.getItem(getKey(puzzleId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<GameState>;
  } catch {
    return null;
  }
}

function saveState(puzzleId: number, state: GameState) {
  localStorage.setItem(getKey(puzzleId), JSON.stringify(state));
}

function initState(puzzle: Puzzle): GameState {
  cleanOldSaves(puzzle.id);
  const saved = getSavedState(puzzle.id);
  if (saved?.shuffledWords && saved.status) {
    return {
      shuffledWords: saved.shuffledWords,
      selectedWords: [],
      solvedGroups: saved.solvedGroups ?? [],
      lives: saved.lives ?? MAX_LIVES,
      status: saved.status,
      guessHistory: saved.guessHistory ?? [],
      oneAway: false,
    };
  }
  const allWords = puzzle.groups.flatMap((g) => g.words);
  return {
    shuffledWords: shuffle(allWords),
    selectedWords: [],
    solvedGroups: [],
    lives: MAX_LIVES,
    status: "playing",
    guessHistory: [],
    oneAway: false,
  };
}

export function useGame(puzzle: Puzzle) {
  const [state, setState] = useState<GameState>(() => initState(puzzle));

  const updateState = useCallback(
    (updater: (prev: GameState) => GameState) => {
      setState((prev) => {
        const next = updater(prev);
        saveState(puzzle.id, next);
        return next;
      });
    },
    [puzzle.id],
  );

  const selectWord = useCallback(
    (word: string) => {
      if (state.status !== "playing") return;
      setState((prev) => {
        if (prev.selectedWords.includes(word)) {
          return { ...prev, selectedWords: prev.selectedWords.filter((w) => w !== word), oneAway: false };
        }
        if (prev.selectedWords.length >= MAX_SELECTION) return prev;
        return { ...prev, selectedWords: [...prev.selectedWords, word], oneAway: false };
      });
    },
    [state.status],
  );

  const submitGuess = useCallback(() => {
    updateState((prev) => {
      if (prev.selectedWords.length !== MAX_SELECTION) return prev;

      const { selectedWords, shuffledWords, solvedGroups, lives, guessHistory } = prev;
      const matchedGroup = puzzle.groups.find(
        (g) => !solvedGroups.includes(g) && g.words.every((w) => selectedWords.includes(w)),
      );
      const wordDifficulties = selectedWords.map((w) => getWordDifficulty(w, puzzle.groups));

      if (matchedGroup) {
        const newSolvedGroups = [...solvedGroups, matchedGroup];
        const newShuffled = shuffledWords.filter((w) => !matchedGroup.words.includes(w));
        const newHistory = [...guessHistory, { words: selectedWords, wordDifficulties, correct: true }];
        const isWon = newSolvedGroups.length === puzzle.groups.length;
        return {
          ...prev,
          shuffledWords: newShuffled,
          selectedWords: [],
          solvedGroups: newSolvedGroups,
          guessHistory: newHistory,
          status: isWon ? "won" : "playing",
          oneAway: false,
        };
      } else {
        const newLives = lives - 1;
        const newHistory = [...guessHistory, { words: selectedWords, wordDifficulties, correct: false }];
        const oneAwayExists = puzzle.groups.some(
          (g) => !solvedGroups.includes(g) && g.words.filter((w) => selectedWords.includes(w)).length === 3,
        );
        return {
          ...prev,
          selectedWords: [],
          lives: newLives,
          guessHistory: newHistory,
          status: newLives === 0 ? "lost" : "playing",
          oneAway: oneAwayExists,
        };
      }
    });
  }, [puzzle.groups, updateState]);

  const shuffleWords = useCallback(() => {
    setState((prev) => ({ ...prev, shuffledWords: shuffle(prev.shuffledWords) }));
  }, []);

  const deselectAll = useCallback(() => {
    setState((prev) => ({ ...prev, selectedWords: [], oneAway: false }));
  }, []);

  return { state, selectWord, submitGuess, shuffleWords, deselectAll };
}
