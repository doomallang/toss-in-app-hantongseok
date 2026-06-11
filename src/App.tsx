import { useMemo, useState, useEffect } from "react";
import { GameBoard } from "./components/GameBoard";
import { isTutorialSeen, TutorialModal } from "./components/TutorialModal";
import { usePuzzles } from "./hooks/usePuzzles";
import { useStats } from "./hooks/useStats";
import { useAdMob } from "./hooks/useAdMob";
import { useDarkMode } from "./hooks/useDarkMode";
import { getDailyIndex, msUntilNextDaily, formatCountdown } from "./utils/daily";
import { useColorBlind } from "./hooks/useColorBlind";
import "./App.css";

export default function App() {
  const { puzzles, loading } = usePuzzles();
  const MAX_DAY = puzzles.length - 1;

  const dailyIndex = useMemo(() => getDailyIndex(puzzles.length), [puzzles.length]);

  const [currentDay, setCurrentDay] = useState(() => getDailyIndex(puzzles.length));
  const [editingNumber, setEditingNumber] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showTutorial, setShowTutorial] = useState(() => !isTutorialSeen());
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { enabled: isColorBlind, toggle: toggleColorBlind } = useColorBlind();
  const { isNative, bannerHeight } = useAdMob();
  const { stats, recordResult, exportStats, importStats } = useStats();

  const isDaily = currentDay === dailyIndex;

  const [countdown, setCountdown] = useState(() => formatCountdown(msUntilNextDaily()));
  useEffect(() => {
    const id = setInterval(() => setCountdown(formatCountdown(msUntilNextDaily())), 1000);
    return () => clearInterval(id);
  }, []);

  const isWon = stats.wonPuzzleIds?.includes(currentDay) ?? false;
  const isCompleted = stats.completedPuzzleIds.includes(currentDay);
  const isLost = isCompleted && !isWon;

  const puzzle = useMemo(() => {
    const idx = ((currentDay % puzzles.length) + puzzles.length) % puzzles.length;
    const base = puzzles[idx];
    return { ...base, id: currentDay };
  }, [currentDay, puzzles]);

  const puzzleNumber = currentDay + 1;

  const goToDay = (day: number) => {
    setCurrentDay(Math.max(0, Math.min(day, MAX_DAY)));
  };

  const goToDaily = () => {
    setCurrentDay(dailyIndex);
  };

  const goToRandom = () => {
    if (puzzles.length <= 1) return;
    const incomplete = Array.from({ length: puzzles.length }, (_, i) => i).filter(
      (i) => i !== currentDay && !stats.completedPuzzleIds.includes(i),
    );
    const pool = incomplete.length > 0 ? incomplete : Array.from({ length: puzzles.length }, (_, i) => i).filter((i) => i !== currentDay);
    setCurrentDay(pool[Math.floor(Math.random() * pool.length)]);
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

  const nativeStyle = isNative
    ? ({ "--banner-height": `${bannerHeight}px` } as React.CSSProperties)
    : undefined;

  return (
    <div className={`app${isNative ? " app--native" : ""}`} style={nativeStyle}>
      <header className="header">
        <div className="header-top">
          <h1 className="title">커넥션스</h1>
          <div className="header-actions">
            <button
              className={`cb-mode-btn${isColorBlind ? " cb-mode-btn--on" : ""}`}
              onClick={toggleColorBlind}
              aria-label={isColorBlind ? "색맹 모드 끄기" : "색맹 모드 켜기"}
              aria-pressed={isColorBlind}
              title="색맹 모드"
            >
              ◈
            </button>
            <button
              className={`dark-toggle-btn${isDark ? " dark-toggle-btn--on" : ""}`}
              onClick={toggleDark}
              aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
              aria-pressed={isDark}
              title={isDark ? "라이트 모드" : "다크 모드"}
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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
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
              {isDaily && <span className="daily-badge">오늘</span>}
              {isWon && <span className="result-badge result-badge--won">✓</span>}
              {isLost && <span className="result-badge result-badge--lost">✗</span>}
            </button>
          )}
          <button className="nav-btn" onClick={() => goToDay(currentDay + 1)} disabled={currentDay >= MAX_DAY}>
            ›
          </button>
        </div>
        <div className="header-nav-btns">
          <button
            className={`nav-shortcut-btn${isDaily ? " nav-shortcut-btn--active" : ""}`}
            onClick={goToDaily}
            disabled={isDaily}
          >
            📅 오늘의 문제
          </button>
          <button className="nav-shortcut-btn" onClick={goToRandom}>
            🎲 랜덤 문제
          </button>
        </div>
        <p className="subtitle">
          공통점 있는 단어를 4개씩 묶어보세요
          {loading && <span className="loading-dot"> ·</span>}
          <span className="app-version"> v{__APP_VERSION__}</span>
          <span className="completion-rate"> · {stats.completedPuzzleIds.length}/{puzzles.length} 완료</span>
        </p>
        {isDaily && isCompleted && (
          <p className="next-daily-countdown">다음 문제까지 {countdown}</p>
        )}
      </header>

      <GameBoard
        key={currentDay}
        puzzle={puzzle}
        puzzleNumber={puzzleNumber}
        stats={stats}
        recordResult={recordResult}
        exportStats={exportStats}
        importStats={importStats}
      />

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );
}
