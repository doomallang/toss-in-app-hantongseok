import type { Guess } from "../types";
import { formatTime } from "../hooks/useTimer";
import { DIFFICULTY_COLORS as DIFF_COLORS } from "../constants";

const FONT = "-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateResultImage(params: {
  puzzleNumber: number;
  guessHistory: Guess[];
  elapsed: number;
  hintCount: number;
}): Promise<Blob> {
  const { puzzleNumber, guessHistory, elapsed, hintCount } = params;
  const colors = DIFF_COLORS;

  const W = 360;
  const PADDING = 24;
  const SQ = 38;
  const GAP = 7;

  // 높이 계산
  let totalH = PADDING;
  totalH += 32; // 타이틀
  totalH += 10; // 간격
  totalH += 22; // 퍼즐 번호
  totalH += 8;  // 간격
  totalH += 24; // 시간
  if (hintCount > 0) totalH += 22;
  totalH += 20; // 그리드 위 간격
  totalH += guessHistory.length * (SQ + GAP) + GAP;
  totalH += 20; // 그리드 아래 간격
  totalH += 18; // 브랜딩
  totalH += PADDING;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = totalH * dpr;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 배경
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, totalH);

  let y = PADDING;

  // 타이틀
  y += 16;
  ctx.font = `800 22px ${FONT}`;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("커넥션스", W / 2, y);
  y += 16 + 10;

  // 퍼즐 번호
  y += 11;
  ctx.font = `600 14px ${FONT}`;
  ctx.fillStyle = "#888888";
  ctx.fillText(`#${puzzleNumber}`, W / 2, y);
  y += 11 + 8;

  // 시간
  y += 12;
  ctx.font = `700 17px ${FONT}`;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText(`⏱ ${formatTime(elapsed)}`, W / 2, y);
  y += 12;

  // 힌트 사용
  if (hintCount > 0) {
    y += 11;
    ctx.font = `600 13px ${FONT}`;
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`💡 힌트 ${hintCount}회 사용`, W / 2, y);
    y += 11;
  }

  y += 20;

  // 추측 그리드
  const totalGridW = 4 * SQ + 3 * GAP;
  const gridX = (W - totalGridW) / 2;

  guessHistory.forEach((guess, row) => {
    const rowY = y + GAP + row * (SQ + GAP);
    guess.wordDifficulties.forEach((diff, col) => {
      const x = gridX + col * (SQ + GAP);

      roundedRect(ctx, x, rowY, SQ, SQ, 6);
      ctx.fillStyle = colors[diff];
      ctx.fill();

      // 오답 행: X 표시
      if (!guess.correct) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 10, rowY + 10);
        ctx.lineTo(x + SQ - 10, rowY + SQ - 10);
        ctx.moveTo(x + SQ - 10, rowY + 10);
        ctx.lineTo(x + 10, rowY + SQ - 10);
        ctx.stroke();
        ctx.restore();
      }
    });
  });

  y += guessHistory.length * (SQ + GAP) + GAP + 20;

  // 브랜딩
  y += 9;
  ctx.font = `500 11px ${FONT}`;
  ctx.fillStyle = "#cccccc";
  ctx.fillText("한통속 커넥션스", W / 2, y);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}
