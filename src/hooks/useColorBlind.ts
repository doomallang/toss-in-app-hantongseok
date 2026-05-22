import { useState, useEffect } from "react";

const KEY = "connections-color-blind";

export function useColorBlind() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(KEY) === "on");

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.setAttribute("data-colorblind", "on");
    } else {
      root.removeAttribute("data-colorblind");
    }
  }, [enabled]);

  const toggle = () => {
    const next = !enabled;
    localStorage.setItem(KEY, next ? "on" : "off");
    setEnabled(next);
  };

  return { enabled, toggle };
}
