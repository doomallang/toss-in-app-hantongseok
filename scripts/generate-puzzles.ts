import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { puzzles as existingPuzzles } from "../src/data/puzzles";

const client = new Anthropic();
const COUNT = parseInt(process.argv[2] ?? "10", 10);

const existingCategories = new Set<string>(
  existingPuzzles.flatMap((p) => p.groups.map((g) => g.category)),
);
const nextId = Math.max(...existingPuzzles.map((p) => p.id)) + 1;

console.log(`기존 ${existingPuzzles.length}개 퍼즐 (${existingCategories.size}개 카테고리) 확인`);
console.log(`새 퍼즐 ${COUNT}개 생성 시작...`);

const response = await (client.messages.create as Function)({
  model: "claude-opus-4-8",
  max_tokens: 16000,
  thinking: { type: "adaptive" },
  messages: [
    {
      role: "user",
      content: `한국어 커넥션스 게임용 퍼즐 ${COUNT}개를 JSON으로 생성해주세요.

다음 형식의 순수 JSON만 출력하세요 (마크다운 코드블록 없이):
{
  "puzzles": [
    {
      "groups": [
        { "category": "카테고리명", "words": ["단어1", "단어2", "단어3", "단어4"], "difficulty": 1 },
        { "category": "카테고리명", "words": ["단어1", "단어2", "단어3", "단어4"], "difficulty": 2 },
        { "category": "카테고리명", "words": ["단어1", "단어2", "단어3", "단어4"], "difficulty": 3 },
        { "category": "카테고리명", "words": ["단어1", "단어2", "단어3", "단어4"], "difficulty": 4 }
      ]
    }
  ]
}

규칙:
- 각 퍼즐은 정확히 4개의 그룹
- 각 그룹은 정확히 4개의 단어
- 난이도: 1=쉬움, 2=보통, 3=어려움, 4=매우어려움
- 한 퍼즐 내 카테고리명 중복 금지
- 아래 기존 카테고리와 절대 중복 금지
- 주제 다양화: 음식, K-POP, 드라마, 스포츠, 지역, 역사, 직업, 언어, 자연, 일상 등

기존 카테고리 (중복 금지):
${[...existingCategories].join(", ")}`,
    },
  ],
});

const textBlock = response.content.find((c: { type: string }) => c.type === "text");
if (!textBlock || textBlock.type !== "text") {
  throw new Error("응답에서 텍스트를 찾을 수 없음");
}

let jsonText = (textBlock as { type: "text"; text: string }).text.trim();
const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
if (codeBlockMatch) jsonText = codeBlockMatch[1];

interface Group {
  category: string;
  words: string[];
  difficulty: number;
}
interface GeneratedPuzzle {
  groups: Group[];
}

const result = JSON.parse(jsonText) as { puzzles: GeneratedPuzzle[] };

if (!result.puzzles?.length) {
  throw new Error("생성된 퍼즐 없음");
}

for (const puzzle of result.puzzles) {
  if (puzzle.groups.length !== 4) throw new Error(`그룹 수 오류: ${puzzle.groups.length}`);
  for (const g of puzzle.groups) {
    if (g.words.length !== 4) throw new Error(`단어 수 오류 (${g.category}): ${g.words.length}개`);
    if (![1, 2, 3, 4].includes(g.difficulty))
      throw new Error(`난이도 오류 (${g.category}): ${g.difficulty}`);
  }
}

console.log(`✓ ${result.puzzles.length}개 퍼즐 생성됨`);

function formatPuzzle(puzzle: GeneratedPuzzle, id: number): string {
  const groupLines = puzzle.groups
    .map(
      (g) =>
        `      { category: ${JSON.stringify(g.category)}, words: [${g.words.map((w) => JSON.stringify(w)).join(", ")}], difficulty: ${g.difficulty} }`,
    )
    .join(",\n");
  return `  {\n    id: ${id},\n    groups: [\n${groupLines},\n    ],\n  }`;
}

const puzzlesPath = join(process.cwd(), "src/data/puzzles.ts");
let fileContent = readFileSync(puzzlesPath, "utf-8");

const newEntries = result.puzzles.map((p, i) => formatPuzzle(p, nextId + i)).join(",\n");

fileContent = fileContent.replace(
  /\n\];\n\nexport function getTodaysPuzzle/,
  `\n${newEntries},\n];\n\nexport function getTodaysPuzzle`,
);
writeFileSync(puzzlesPath, fileContent, "utf-8");
console.log(`✓ puzzles.ts 업데이트 (id ${nextId}~${nextId + result.puzzles.length - 1})`);

const allPuzzles = [
  ...existingPuzzles,
  ...result.puzzles.map((p, i) => ({ id: nextId + i, groups: p.groups })),
];
const outPath = join(process.cwd(), "public", "puzzles.json");
mkdirSync(join(process.cwd(), "public"), { recursive: true });
writeFileSync(outPath, JSON.stringify(allPuzzles, null, 2), "utf-8");
console.log(`✓ ${allPuzzles.length}개 퍼즐 → public/puzzles.json`);
