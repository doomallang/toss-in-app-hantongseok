import { useState, useEffect } from "react";
import type { GameStatus, Guess, Difficulty } from "../types";
import type { Stats } from "../hooks/useStats";
import { useBackButton } from "../hooks/useBackButton";
import { formatTime } from "../hooks/useTimer";
import { generateResultImage } from "../utils/generateResultImage";

const DIFFICULTY_EMOJI: Record<Difficulty, string> = {
  1: "🟨",
  2: "🟩",
  3: "🟦",
  4: "🟥",
};

interface Props {
  status: GameStatus;
  puzzleNumber: number;
  guessHistory: Guess[];
  stats: Stats;
  elapsed: number;
  hintCount: number;
  onClose: () => void;
}

function generateShareText(puzzleNumber: number, guessHistory: Guess[], elapsed: number): string {
  const rows = guessHistory
    .map((g) => g.wordDifficulties.map((d) => DIFFICULTY_EMOJI[d]).join(""))
    .join("\n");
  return `커넥션스 #${puzzleNumber} ⏱${formatTime(elapsed)}\n${rows}`;
}

function winRate(stats: Stats): number {
  if (stats.totalPlayed === 0) return 0;
  return Math.round((stats.totalWon / stats.totalPlayed) * 100);
}

export function ResultModal({ status, puzzleNumber, guessHistory, stats, elapsed, hintCount, onClose }: Props) {
  const shareText = generateShareText(puzzleNumber, guessHistory, elapsed);
  const [copied, setCopied] = useState(false);
  const [imageSharing, setImageSharing] = useState(false);

  useBackButton(true, onClose);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // user cancelled
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const handleImageShare = async () => {
    if (imageSharing) return;
    setImageSharing(true);
    try {
      const blob = await generateResultImage({ puzzleNumber, guessHistory, elapsed, hintCount });
      const file = new File([blob], `connections-${puzzleNumber}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
        } catch {
          // user cancelled
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `connections-${puzzleNumber}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // 생성 실패 무시
    } finally {
      setImageSharing(false);
    }
  };

  const maxDistCount = Math.max(...Object.values(stats.mistakeDistribution), 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p className="modal-emoji">{status === "won" ? "🎉" : "😢"}</p>
        <h2 className="modal-title">{status === "won" ? "정답!" : "아쉬워요"}</h2>
        <p className="modal-subtitle">커넥션스 #{puzzleNumber}</p>
        <p className="modal-time">⏱ {formatTime(elapsed)}</p>
        {hintCount > 0 && (
          <p className="modal-hint-used">💡 힌트 {hintCount}회 사용</p>
        )}

        <div className="result-grid">
          {guessHistory.map((guess, i) => (
            <div key={i} className="result-row">
              {guess.wordDifficulties.map((d, j) => (
                <span key={j} className="result-emoji">{DIFFICULTY_EMOJI[d]}</span>
              ))}
            </div>
          ))}
        </div>

        <div className="stats-section">
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">{stats.totalPlayed}</span>
              <span className="stat-label">플레이</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{winRate(stats)}%</span>
              <span className="stat-label">승률</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.currentStreak}</span>
              <span className="stat-label">연속 클리어</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.maxStreak}</span>
              <span className="stat-label">최대 연속</span>
            </div>
          </div>

          <p className="dist-title">실수 횟수 분포</p>
          <div className="dist-chart">
            {[0, 1, 2, 3, 4].map((n) => {
              const count = stats.mistakeDistribution[n] ?? 0;
              const pct = Math.round((count / maxDistCount) * 100);
              return (
                <div key={n} className="dist-row">
                  <span className="dist-label">{n}</span>
                  <div className="dist-bar-wrap">
                    <div className="dist-bar" style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}>
                      {count > 0 && <span className="dist-count">{count}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="share-btns">
          <button className="share-btn share-btn--text" onClick={handleShare}>
            {copied ? "복사됐어요! ✓" : "텍스트 공유"}
          </button>
          <button className="share-btn share-btn--image" onClick={handleImageShare} disabled={imageSharing}>
            {imageSharing ? "생성 중…" : "이미지 공유"}
          </button>
        </div>
        <button className="close-btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
