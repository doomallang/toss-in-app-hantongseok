import type { Group } from "../types";
import { DIFFICULTY_COLORS } from "../constants";

interface Props {
  group: Group;
  isNew?: boolean;
}

export function SolvedGroup({ group, isNew }: Props) {
  return (
    <div
      className={`solved-group${isNew ? " solved-group--new" : ""}`}
      style={{ backgroundColor: DIFFICULTY_COLORS[group.difficulty] }}
      data-difficulty={group.difficulty}
    >
      <p className="solved-category">{group.category}</p>
      <p className="solved-words">{group.words.join(", ")}</p>
    </div>
  );
}
