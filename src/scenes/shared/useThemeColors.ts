import { useEffect, useState } from "react";

export interface ThemeColors {
  bg: string;
  bgElevated: string;
  /**
   * Scenes need this to pick a blend mode: additive blending only reads as
   * "glow" against a dark backdrop. On the light theme it adds toward white and
   * the geometry vanishes, so light-theme scenes must blend normally instead.
   */
  isDark: boolean;
}

// Kept in lockstep with --bg / --bg-elevated in tokens.css.
const DARK: ThemeColors = { bg: "#14100d", bgElevated: "#1c1611", isDark: true };
const LIGHT: ThemeColors = { bg: "#fff8f4", bgElevated: "#fffbf8", isDark: false };

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
