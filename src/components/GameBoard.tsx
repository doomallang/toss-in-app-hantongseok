import { useState, useEffect, useRef, useCallback } from "react";
import { useGame, MAX_LIVES } from "../hooks/useGame";
import { useStats, loadStats } from "../hooks/useStats";
import { useTimer, formatTime } from "../hooks/useTimer";
import { WordCard } from "./WordCard";
import { SolvedGroup } from "./SolvedGroup";
import { LivesIndicator } from "./LivesIndicator";
import { ResultModal } from "./ResultModal";
import { Confetti } from "./Confetti";
import type { Puzzle, Difficulty, Group } from "../types";
import { DIFFICULTY_SHAPES } from "../contexts/ColorBlindContext";

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  1: "#f9df6d",
  2: "#a0c35a",
  3: "#b0c4ef",
  4: "#ba81c5",
};

interface Props {
  puzzle: Puzzle;
  puzzleNumber: number;
}

export function GameBoard({ puzzle, puzzleNumber }: Props) {
  const { state, selectWord, submitGuess, shuffleWords, deselectAll } = useGame(puzzle);
  const { shuffledWords, selectedWords, solvedGroups, lives, status, guessHistory, oneAway } = state;
  const { recordResult } = useStats();

  const [showResult, setShowResult] = useState(status !== "playing");
  const [shaking, setShaking] = useState(false);
  const [hintWords, setHintWords] = useState<Map<string, string>>(new Map());
  const [solvingWords, setSolvingWords] = useState<{ words: string[]; color: string } | null>(null);
  const [newGroup, setNewGroup] = useState<Group | null>(null);

  const elapsed = useTimer(puzzle.id, status === "playing");

  const prevGuessCountRef = useRef(guessHistory.length);
  const prevSolvedLengthRef = useRef(solvedGroups.length);
  const resultRecordedRef = useRef(status !== "playing");

  const isPlaying = status === "playing";

  // 새 그룹 해결 감지 → 슬라이드인 애니메이션 트리거
  useEffect(() => {
    if (solvedGroups.length > prevSolvedLengthRef.current) {
      const latest = solvedGroups[solvedGroups.length - 1];
      setNewGroup(latest);
      prevSolvedLengthRef.current = solvedGroups.length;
      const t = setTimeout(() => setNewGroup(null), 700);
      return () => clearTimeout(t);
    }
  }, [solvedGroups]);

  // 게임 종료 감지
  useEffect(() => {
    if (status === "playing") return;
    if (!resultRecordedRef.current) {
      resultRecordedRef.current = true;
      recordResult(puzzle.id, status === "won", MAX_LIVES - lives);
    }
    const timer = setTimeout(() => setShowResult(true), status === "won" ? 1200 : 300);
    return () => clearTimeout(timer);
  }, [status, lives, puzzle.id, recordResult]);

  // 틀렸을 때 흔들기
  useEffect(() => {
    if (guessHistory.length > prevGuessCountRef.current) {
      const last = guessHistory[guessHistory.length - 1];
      if (last && !last.correct) setShaking(true);
    }
    prevGuessCountRef.current = guessHistory.length;
  }, [guessHistory]);

  useEffect(() => {
    if (!shaking) return;
    const t = setTimeout(() => setShaking(false), 500);
    return () => clearTimeout(t);
  }, [shaking]);

  // 정답이면 애니메이션 후 submitGuess, 오답이면 즉시
  const handleSubmit = useCallback(() => {
    if (selectedWords.length !== 4 || !isPlaying || solvingWords) return;

    const matched = puzzle.groups.find(
      (g) => !solvedGroups.includes(g) && g.words.every((w) => selectedWords.includes(w)),
    );

    if (matched) {
      setSolvingWords({ words: [...selectedWords], color: DIFFICULTY_COLORS[matched.difficulty] });
      setTimeout(() => {
        setSolvingWords(null);
        submitGuess();
      }, 520);
    } else {
      submitGuess();
    }
  }, [selectedWords, isPlaying, solvingWords, puzzle.groups, solvedGroups, submitGuess]);

  // 4개 선택되면 300ms 후 자동 제출
  useEffect(() => {
    if (selectedWords.length !== 4 || !isPlaying || solvingWords) return;
    const t = setTimeout(() => handleSubmit(), 300);
    return () => clearTimeout(t);
  }, [selectedWords.length, isPlaying, solvingWords, handleSubmit]);

  const handleHint = () => {
    const candidates = shuffledWords.filter((w) => !hintWords.has(w));
    if (candidates.length === 0) return;
    const word = candidates[Math.floor(Math.random() * candidates.length)];
    const group = puzzle.groups.find((g) => g.words.includes(word));
    if (!group) return;
    // color|shape 형식으로 저장
    const value = `${DIFFICULTY_COLORS[group.difficulty]}|${DIFFICULTY_SHAPES[group.difficulty]}`;
    setHintWords((prev) => new Map([...prev, [word, value]]));
  };

  return (
    <>
      {status === "won" && <Confetti />}

      <div className="board">
        {solvedGroups.map((group) => (
          <SolvedGroup key={group.category} group={group} isNew={group === newGroup} />
        ))}
        <div className={`word-grid${shaking ? " shaking" : ""}`}>
          {shuffledWords.map((word) => {
            const solving = solvingWords?.words.includes(word) ?? false;
            const hintVal = hintWords.get(word);
            const [hintColor, hintShape] = hintVal ? hintVal.split("|") : [];
            return (
              <WordCard
                key={word}
                word={word}
                selected={selectedWords.includes(word)}
                disabled={!isPlaying || !!solvingWords}
                solving={solving}
                solvingColor={solvingWords?.color}
                hintColor={hintColor}
                hintShape={hintShape}
                onClick={() => selectWord(word)}
              />
            );
          })}
        </div>
      </div>

      {oneAway && <p className="one-away-hint">하나만 더! 거의 다 왔어요</p>}

      <div className="game-status-row">
        <LivesIndicator lives={lives} maxLives={MAX_LIVES} />
        <span className="timer">⏱ {formatTime(elapsed)}</span>
      </div>

      <div className="actions">
        <button className="btn btn-secondary" onClick={shuffleWords} disabled={!isPlaying || !!solvingWords}>
          섞기
        </button>
        <button
          className="btn btn-secondary"
          onClick={deselectAll}
          disabled={!isPlaying || selectedWords.length === 0 || !!solvingWords}
        >
          선택 해제
        </button>
        <button className="btn btn-secondary" onClick={handleHint} disabled={!isPlaying || !!solvingWords}>
          힌트
        </button>
      </div>

      {status !== "playing" && !showResult && (
        <button className="result-peek-btn" onClick={() => setShowResult(true)}>
          결과 보기
        </button>
      )}

      {showResult && status !== "playing" && (
        <ResultModal
          status={status}
          puzzleNumber={puzzleNumber}
          guessHistory={guessHistory}
          stats={loadStats()}
          elapsed={elapsed}
          onClose={() => setShowResult(false)}
        />
      )}
    </>
  );
}
