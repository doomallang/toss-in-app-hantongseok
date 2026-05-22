import { useState, useEffect, useRef, useCallback } from "react";
import { useGame, MAX_LIVES } from "../hooks/useGame";
import type { Stats } from "../hooks/useStats";
import { useTimer, formatTime } from "../hooks/useTimer";
import { WordCard } from "./WordCard";
import { SolvedGroup } from "./SolvedGroup";
import { LivesIndicator } from "./LivesIndicator";
import { ResultModal } from "./ResultModal";
import { Confetti } from "./Confetti";
import { Toast } from "./Toast";
import type { Puzzle, Group } from "../types";
import { DIFFICULTY_COLORS } from "../constants";

const MAX_HINTS = 3;

interface Props {
  puzzle: Puzzle;
  puzzleNumber: number;
  stats: Stats;
  recordResult: (puzzleId: number, won: boolean, mistakeCount: number, hintCount: number) => void;
  exportStats: () => string;
  importStats: (json: string) => boolean;
}

export function GameBoard({ puzzle, puzzleNumber, stats, recordResult, exportStats, importStats }: Props) {
  const { state, selectWord, submitGuess, shuffleWords, deselectAll } = useGame(puzzle);
  const { shuffledWords, selectedWords, solvedGroups, lives, status, guessHistory, oneAway } = state;

  const [showResult, setShowResult] = useState(status !== "playing");
  const [shaking, setShaking] = useState(false);
  const [hintWords, setHintWords] = useState<Map<string, string>>(new Map());
  const [solvingWords, setSolvingWords] = useState<{ words: string[]; color: string } | null>(null);
  const [newGroup, setNewGroup] = useState<Group | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const toastIdRef = useRef(0);

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

  const addToast = useCallback((message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 게임 종료 감지
  useEffect(() => {
    if (status === "playing") return;
    if (!resultRecordedRef.current) {
      resultRecordedRef.current = true;
      const mistakes = MAX_LIVES - lives;
      const hints = hintWords.size;
      recordResult(puzzle.id, status === "won", mistakes, hints);

      if (status === "won") {
        if (mistakes === 0 && hints === 0) addToast("완벽 클리어!");
        else if (mistakes === 0) addToast("실수 없이 클리어!");
        else if (hints === 0) addToast("힌트 없이 클리어!");

        const prevStreak = stats.currentStreak;
        if (prevStreak + 1 > stats.maxStreak && prevStreak + 1 >= 3) {
          addToast(`🔥 ${prevStreak + 1}연승 달성!`);
        }
      }
    }
    const timer = setTimeout(() => setShowResult(true), status === "won" ? 1200 : 300);
    return () => clearTimeout(timer);
  }, [status, lives, puzzle.id, recordResult, hintWords.size, addToast, stats]);

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

  const handleHint = useCallback(() => {
    if (hintWords.size >= MAX_HINTS) return;
    const candidates = shuffledWords.filter((w) => !hintWords.has(w));
    if (candidates.length === 0) return;
    const word = candidates[Math.floor(Math.random() * candidates.length)];
    const group = puzzle.groups.find((g) => g.words.includes(word));
    if (!group) return;
    setHintWords((prev) => new Map([...prev, [word, DIFFICULTY_COLORS[group.difficulty]]]));
  }, [hintWords, shuffledWords, puzzle.groups]);

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

  // 키보드 단축키: S=섞기, D/Escape=선택해제, H=힌트
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isPlaying || !!solvingWords) return;
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "s" || e.key === "S") shuffleWords();
      if (e.key === "Escape" || e.key === "d" || e.key === "D") deselectAll();
      if (e.key === "h" || e.key === "H") handleHint();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isPlaying, solvingWords, shuffleWords, deselectAll, handleHint]);

  return (
    <>
      {status === "won" && <Confetti />}
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} onDone={() => removeToast(t.id)} />
      ))}

      <div className="board">
        {solvedGroups.map((group) => (
          <SolvedGroup key={group.category} group={group} isNew={group === newGroup} />
        ))}
        <div className={`word-grid${shaking ? " shaking" : ""}`}>
          {shuffledWords.map((word) => {
            const solving = solvingWords?.words.includes(word) ?? false;
            const hintColor = hintWords.get(word);
            return (
              <WordCard
                key={word}
                word={word}
                selected={selectedWords.includes(word)}
                disabled={!isPlaying || !!solvingWords}
                solving={solving}
                solvingColor={solvingWords?.color}
                hintColor={hintColor}
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
        <button
          className="btn btn-secondary"
          onClick={handleHint}
          disabled={!isPlaying || !!solvingWords || hintWords.size >= MAX_HINTS}
        >
          힌트 ({MAX_HINTS - hintWords.size})
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
          solvedGroups={solvedGroups}
          stats={stats}
          elapsed={elapsed}
          hintCount={hintWords.size}
          exportStats={exportStats}
          importStats={importStats}
          onClose={() => setShowResult(false)}
        />
      )}
    </>
  );
}
