/** Scene palette per theme (kept in sync with globals.css tokens). */
export const sceneTheme = {
  dark: {
    background: "#0e0c12",
    desk: "#1a1622",
    deskEdge: "#2a2435",
    metal: "#3a3446",
    accent: "#9d8cff",
    screen: "#120f1a",
    code: ["#9d8cff", "#7ce0a8", "#e8c47a", "#5cc8ff", "#ece9f5"],
    ambient: 0.35,
    key: 1.4,
    shirt: "#141218",
    pants: "#1c1a22",
    chair: "#16141b",
  },
  light: {
    background: "#f5f3fa",
    desk: "#e9e5f2",
    deskEdge: "#d6d0e6",
    metal: "#c4bed4",
    accent: "#6b4eff",
    screen: "#16131f",
    code: ["#9d8cff", "#7ce0a8", "#e8c47a", "#5cc8ff", "#ece9f5"],
    ambient: 0.9,
    key: 1.6,
    shirt: "#1e1c24",
    pants: "#2a2832",
    chair: "#2a2733",
  },
} as const;

export type SceneTheme = (typeof sceneTheme)[keyof typeof sceneTheme];
