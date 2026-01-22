export const BASE_COLORS = {
    primary: "#f47b25",
    primaryDark: "#d6661a",

    sky400: "#38bdf8",
    red400: "#f87171",
    blue400: "#60a5fa",
    yellow400: "#facc15",
    emerald400: "#34d399",
    emerald500: "#10b981",

    white: "#ffffff",
    black: "#000000",

    slate300: "#cbd5e1",
    slate400: "#94a3b8",
    slate500: "#64748b",
    slate600: "#475569",
    slate900: "#0f172a",
};

export const DARK_THEME = {
    ...BASE_COLORS,
    background: "#0b0b0f",
    backgroundLight: "#121212", // used for slightly lighter backgrounds
    backgroundElevated: "#1c1c21",

    surface: "#1c1c21",
    surfaceAlt: "#24242a",
    surfaceDark: "#27272a",
    surfaceLight: "#ffffff", // careful with this one in dark mode context

    card: "#1c1c21",
    cardHighlight: "#2f2f36",

    text: "#ffffff",
    textMuted: "#a1a1aa",
    textSecondary: "#9d9da8",
    textInverse: "#0f172a",
    subtext: "#a1a1aa",

    divider: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.08)",

    inputBackground: "rgba(255,255,255,0.05)",
};

export const LIGHT_THEME = {
    ...BASE_COLORS,
    background: "#f8f7f5", // Light beige/off-white from valid matches
    backgroundLight: "#ffffff",
    backgroundElevated: "#ffffff",

    surface: "#ffffff",
    surfaceAlt: "#f1f5f9",
    surfaceDark: "#e2e8f0",
    surfaceLight: "#ffffff",

    card: "#ffffff",
    cardHighlight: "#f8fafc",

    text: "#0f172a", // Slate 900
    textMuted: "#64748b", // Slate 500
    textSecondary: "#475569", // Slate 600
    textInverse: "#ffffff",
    subtext: "#64748b",

    divider: "rgba(0,0,0,0.06)",
    border: "rgba(0,0,0,0.08)",

    inputBackground: "rgba(0,0,0,0.04)",
};

// Default export for backward compatibility during refactor
export const COLORS = DARK_THEME;

export type ThemeColors = typeof DARK_THEME;

export type ColorPalette = typeof COLORS;
