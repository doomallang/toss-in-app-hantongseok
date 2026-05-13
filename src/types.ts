export type Difficulty = 1 | 2 | 3 | 4;

export interface Group {
  category: string;
  words: string[];
  difficulty: Difficulty;
}

export interface Puzzle {
  id: number;
  groups: Group[];
}

export type GameStatus = "playing" | "won" | "lost";

export interface Guess {
  words: string[];
  wordDifficulties: Difficulty[];
  correct: boolean;
}

export interface GameState {
  shuffledWords: string[];
  selectedWords: string[];
  solvedGroups: Group[];
  lives: number;
  status: GameStatus;
  guessHistory: Guess[];
  oneAway: boolean;
}
