import { createContext, useContext, useState } from "react";
import type { Difficulty } from "../types";

export const DIFFICULTY_SHAPES: Record<Difficulty, string> = {
  1: "●",
  2: "■",
  3: "▲",
  4: "◆",
};

// 색맹 모드에서 공유 텍스트용 이모지 (모양으로 구분)
export const DIFFICULTY_EMOJI_CB: Record<Difficulty, string> = {
  1: "⬡",
  2: "⬛",
  3: "🔺",
  4: "🔷",
};

interface ColorBlindCtx {
  isColorBlind: boolean;
  toggle: () => void;
}

const ColorBlindContext = createContext<ColorBlindCtx>({
  isColorBlind: false,
  toggle: () => {},
});

export function ColorBlindProvider({ children }: { children: React.ReactNode }) {
  const [isColorBlind, setIsColorBlind] = useState(
    () => localStorage.getItem("connections-colorblind") === "1",
  );

  const toggle = () => {
    setIsColorBlind((prev) => {
      const next = !prev;
      localStorage.setItem("connections-colorblind", next ? "1" : "0");
      return next;
    });
  };

  return (
    <ColorBlindContext.Provider value={{ isColorBlind, toggle }}>
      {children}
    </ColorBlindContext.Provider>
  );
}

export function useColorBlind() {
  return useContext(ColorBlindContext);
}
