"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolved: "dark" | "light";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  resolved: "dark",
  setTheme: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme) || "dark";
    setThemeState(stored);
  }, []);

  useEffect(() => {
    const apply = (t: Theme) => {
      const isDark =
        t === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
          : t === "dark";
      const next = isDark ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      setResolved(next);
    };

    apply(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem("theme", next);
    setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
