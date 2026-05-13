import { useMemo } from "react";

const COLORS = ["#f9df6d", "#a0c35a", "#b0c4ef", "#ba81c5", "#ff6b35", "#ffffff"];
const COUNT = 48;

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  shape: "rect" | "circle";
}

export function Confetti() {
  const pieces = useMemo<Piece[]>(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.6,
      duration: 1.8 + Math.random() * 1.2,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    })), []);

  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.shape === "circle" ? p.size : p.size * 0.5,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
