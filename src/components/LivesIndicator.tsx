interface Props {
  lives: number;
  maxLives: number;
}

export function LivesIndicator({ lives, maxLives }: Props) {
  return (
    <div className="lives-indicator">
      <span className="lives-label">남은 기회</span>
      <div className="lives-dots">
        {Array.from({ length: maxLives }).map((_, i) => (
          <div key={i} className={`lives-dot ${i < lives ? "active" : "inactive"}`} />
        ))}
      </div>
    </div>
  );
}
