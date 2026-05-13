import { useColorBlind } from "../contexts/ColorBlindContext";

interface Props {
  word: string;
  selected: boolean;
  disabled: boolean;
  solving?: boolean;
  solvingColor?: string;
  hintColor?: string;
  hintShape?: string;
  onClick: () => void;
}

export function WordCard({
  word,
  selected,
  disabled,
  solving,
  solvingColor,
  hintColor,
  hintShape,
  onClick,
}: Props) {
  const { isColorBlind } = useColorBlind();
  const style: React.CSSProperties = {};

  if (solving && solvingColor) {
    style.backgroundColor = solvingColor;
    style.color = "#1a1a1a";
  } else if (hintColor) {
    style.boxShadow = `inset 0 -4px 0 ${hintColor}`;
  }

  return (
    <button
      className={[
        "word-card",
        selected ? "selected" : "",
        disabled ? "disabled" : "",
        solving ? "solving" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{word}</span>
      {isColorBlind && hintShape && !solving && (
        <span className="cb-hint-shape" aria-hidden="true">
          {hintShape}
        </span>
      )}
    </button>
  );
}
