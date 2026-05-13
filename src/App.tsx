import { useState, useMemo } from "react";
import { GameBoard } from "./components/GameBoard";
import { TutorialModal, isTutorialSeen } from "./components/TutorialModal";
import { usePuzzles } from "./hooks/usePuzzles";
import { useColorBlind } from "./contexts/ColorBlindContext";
import { useAdMob } from "./hooks/useAdMob";
import "./App.css";

export default function App() {
  const { puzzles, loading } = usePuzzles();
  const MAX_DAY = puzzles.length - 1;

  const [currentDay, setCurrentDay] = useState(() => Math.floor(Math.random() * puzzles.length));
  const [editingNumber, setEditingNumber] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showTutorial, setShowTutorial] = useState(() => !isTutorialSeen());
  const { isColorBlind, toggle: toggleColorBlind } = useColorBlind();
  const { isNative } = useAdMob();

  const puzzle = useMemo(() => {
    const idx = ((currentDay % puzzles.length) + puzzles.length) % puzzles.length;
    const base = puzzles[idx];
    return { ...base, id: currentDay };
  }, [currentDay, puzzles]);

  const puzzleNumber = currentDay + 1;

  const goToDay = (day: number) => {
    setCurrentDay(Math.max(0, Math.min(day, MAX_DAY)));
  };

  const goToRandom = () => {
    if (puzzles.length <= 1) return;
    let next: number;
    do { next = Math.floor(Math.random() * puzzles.length); } while (next === currentDay);
    setCurrentDay(next);
  };

  const handleNumberClick = () => {
    setInputValue(String(puzzleNumber));
    setEditingNumber(true);
  };

  const handleNumberSubmit = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num >= 1) goToDay(num - 1);
    setEditingNumber(false);
  };

  return (
    <div className={`app${isNative ? " app--native" : ""}`}>
      <header className="header">
        <div className="header-top">
          <h1 className="title">커넥션스</h1>
          <div className="header-actions">
            <button
              className={`cb-toggle-btn${isColorBlind ? " cb-toggle-btn--on" : ""}`}
              onClick={toggleColorBlind}
              aria-label={isColorBlind ? "색맹 모드 끄기" : "색맹 모드 켜기"}
              aria-pressed={isColorBlind}
              title="색맹 모드"
            >
              ◑
            </button>
            <button className="help-btn" onClick={() => setShowTutorial(true)} aria-label="게임 방법">
              ?
            </button>
          </div>
        </div>
        <div className="puzzle-nav">
          <button className="nav-btn" onClick={() => goToDay(currentDay - 1)} disabled={currentDay <= 0}>
            ‹
          </button>
          {editingNumber ? (
            <input
              className="puzzle-number-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleNumberSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNumberSubmit();
                if (e.key === "Escape") setEditingNumber(false);
              }}
              autoFocus
            />
          ) : (
            <button className="puzzle-number-btn" onClick={handleNumberClick}>
              #{puzzleNumber}
            </button>
          )}
          <button className="nav-btn" onClick={() => goToDay(currentDay + 1)} disabled={currentDay >= MAX_DAY}>
            ›
          </button>
        </div>
        <button className="random-btn" onClick={goToRandom}>
          🎲 랜덤 문제
        </button>
        <p className="subtitle">
          공통점 있는 단어를 4개씩 묶어보세요
          {loading && <span className="loading-dot"> ·</span>}
        </p>
      </header>

      <GameBoard key={currentDay} puzzle={puzzle} puzzleNumber={puzzleNumber} />

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );
}
