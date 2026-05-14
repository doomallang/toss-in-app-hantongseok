import type { Group, Difficulty } from "../types";

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
  return (
    <div
      className={`solved-group${isNew ? " solved-group--new" : ""}`}
      style={{ backgroundColor: DIFFICULTY_COLORS[group.difficulty] }}
    >
      <p className="solved-category">{group.category}</p>
      <p className="solved-words">{group.words.join(", ")}</p>
    </div>
  );
}
