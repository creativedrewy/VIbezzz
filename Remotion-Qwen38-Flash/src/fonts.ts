import { type CSSProperties } from "react";
import { loadFont } from "@remotion/google-fonts/Baloo2";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

export const FONT = fontFamily;

export const outlinedText = (strokePx: number, ink: string): CSSProperties => {
  const dirs = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  const shadows = dirs
    .map(
      ([x, y]) =>
        `${x * strokePx}px ${y * strokePx}px 0 ${ink}, ${x * strokePx}px ${y * strokePx}px 0 ${ink}`,
    )
    .join(", ");
  return { textShadow: `${shadows}, 0 10px 0 rgba(0,0,0,0.18)` };
};
