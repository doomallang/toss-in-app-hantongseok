import type { Group, Difficulty } from "../types";
import { useColorBlind, DIFFICULTY_SHAPES } from "../contexts/ColorBlindContext";

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  1: "#f9df6d",
  2: "#a0c35a",
  3: "#b0c4ef",
  4: "#ba81c5",
};

interface Props {
  group: Group;
  isNew?: boolean;
}

export function SolvedGroup({ group, isNew }: Props) {
  const { isColorBlind } = useColorBlind();

  return (
    <div
      className={`solved-group${isNew ? " solved-group--new" : ""}`}
      style={{ backgroundColor: DIFFICULTY_COLORS[group.difficulty] }}
    >
      <p className="solved-category">
        {isColorBlind && (
          <span className="cb-shape" aria-hidden="true">
            {DIFFICULTY_SHAPES[group.difficulty]}{" "}
          </span>
        )}
        {group.category}
      </p>
      <p className="solved-words">{group.words.join(", ")}</p>
    </div>
  );
}
