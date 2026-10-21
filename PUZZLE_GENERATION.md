# 퍼즐 생성 가이드

사용자가 "퍼즐 N개 생성해줘" 라고 하면 아래 절차를 그대로 따른다.

## 1. 기존 카테고리 수집

`src/data/puzzles.ts` 파일을 읽고 모든 `category` 값을 추출한다.
중복 생성 방지를 위해 이 목록을 생성 시 반드시 참고한다.

## 2. 퍼즐 형식

```typescript
{
  id: number,           // 기존 최대 id + 1부터 순서대로
  groups: [
    { category: "카테고리명", words: ["단어1", "단어2", "단어3", "단어4"], difficulty: 1 },
    { category: "카테고리명", words: ["단어1", "단어2", "단어3", "단어4"], difficulty: 2 },
    { category: "카테고리명", words: ["단어1", "단어2", "단어3", "단어4"], difficulty: 3 },
    { category: "카테고리명", words: ["단어1", "단어2", "단어3", "단어4"], difficulty: 4 },
  ],
}
```

- 각 퍼즐: 4개 그룹
- 각 그룹: 정확히 4개 단어
- 난이도: 1=쉬움, 2=보통, 3=어려움, 4=매우어려움 (4개 난이도 모두 사용)
- 한 퍼즐 내 카테고리명 중복 금지
- 기존 카테고리와 중복 금지
- 주제 다양화: K-POP, 드라마, 영화, 음식, 스포츠, 지역, 역사, 직업, 자연, 일상, 앱/서비스 등

## 3. puzzles.ts에 추가하는 방법

`src/data/puzzles.ts` 파일에서 마지막 퍼즐 (`},`) 바로 뒤, `];\n\nexport function getTodaysPuzzle` 직전에 새 퍼즐을 삽입한다.

삽입 위치 예시:
```
  },        ← 기존 마지막 퍼즐 끝
  {         ← 여기서부터 새 퍼즐 추가
    id: 100,
    ...
  },
];          ← 배열 닫기

export function getTodaysPuzzle ...
```

## 4. public/puzzles.json 업데이트

puzzles.ts 수정 후 반드시 실행:
```bash
pnpm run export-puzzles
```

## 5. 완료 후

변경된 파일 목록:
- `src/data/puzzles.ts` — 퍼즐 추가됨
- `public/puzzles.json` — 자동 생성됨

커밋 여부는 사용자에게 확인한다.
