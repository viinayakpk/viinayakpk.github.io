import { useEffect, useState } from "react";

export interface ThemeColors {
  bg: string;
  bgElevated: string;
}

const DARK: ThemeColors = { bg: "#08090d", bgElevated: "#141225" };
const LIGHT: ThemeColors = { bg: "#f7f7fb", bgElevated: "#ffffff" };

function readTheme(): ThemeColors {
  if (typeof document === "undefined") return DARK;
  return document.documentElement.dataset.theme === "light" ? LIGHT : DARK;
}

/** Watches the FOUC-safe data-theme attribute so r3f scenes can match the page background exactly. */
export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(readTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}
