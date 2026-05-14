import { useState, useEffect } from "react";

const DARK_KEY = "connections-dark-mode";

type DarkPref = "light" | "dark" | null;

function getSystemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function loadPref(): DarkPref {
  const v = localStorage.getItem(DARK_KEY);
  if (v === "light" || v === "dark") return v;
  return null;
}

export function useDarkMode() {
  const [pref, setPref] = useState<DarkPref>(() => loadPref());

  const isDark = pref === "dark" || (pref === null && getSystemDark());

  useEffect(() => {
    const root = document.documentElement;
    if (pref === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (pref === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [pref]);

  const toggle = () => {
    const next: DarkPref = isDark ? "light" : "dark";
    localStorage.setItem(DARK_KEY, next);
    setPref(next);
  };

  return { isDark, toggle };
}
