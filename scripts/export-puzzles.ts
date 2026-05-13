import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { puzzles } from "../src/data/puzzles";

const outPath = join(process.cwd(), "public", "puzzles.json");
mkdirSync(join(process.cwd(), "public"), { recursive: true });
writeFileSync(outPath, JSON.stringify(puzzles, null, 2), "utf-8");
console.log(`✓ ${puzzles.length}개 퍼즐 → public/puzzles.json`);
