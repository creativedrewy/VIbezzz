import { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PawPrint, Sparkle } from "../graphics/decor";

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const SceneBackground: React.FC<{
  top: string;
  bottom: string;
  ink: string;
  seed?: number;
  paws?: number;
}> = ({ top, bottom, ink, seed = 0, paws = 6 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const items = useMemo(
    () =>
      Array.from({ length: paws }, (_, i) => ({
        x: rnd(i + seed * 13) * width,
        size: 36 + rnd(i + 3.7 + seed) * 52,
        speed: 0.9 + rnd(i + 9.1 + seed) * 1.4,
        rot: (rnd(i + 5.5 + seed) - 0.5) * 50,
        phase: rnd(i + 2.2 + seed) * 40,
      })),
    [paws, seed, width],
  );

  const blobX = interpolate(Math.sin(frame / 60 + seed), [-1, 1], [width * 0.18, width * 0.82]);
  const blobY = interpolate(Math.cos(frame / 70 + seed), [-1, 1], [height * 0.16, height * 0.34]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: blobX - 260,
          top: blobY - 260,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.20)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: width - blobX - 170,
          top: height * 0.62 + interpolate(Math.sin(frame / 50), [-1, 1], [-60, 60]),
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.06)",
        }}
      />
      {items.map((p, i) => {
        const travel = height + 400;
        const y = height + 200 - (((frame * p.speed + p.phase * 30) % travel) + 0);
        const sway = interpolate(Math.sin(frame / 30 + i * 2), [-1, 1], [-18, 18]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + sway,
              top: y,
              opacity: 0.16,
              rotate: `${p.rot + interpolate(Math.sin(frame / 40 + i), [-1, 1], [-14, 14])}deg`,
            }}
          >
            <PawPrint size={p.size} fill={ink} />
          </div>
        );
      })}
      {Array.from({ length: 7 }, (_, i) => {
        const sx = rnd(i + 40 + seed) * width;
        const sy = rnd(i + 63 + seed) * height * 0.9;
        const scale = interpolate(Math.sin((frame + i * 17) / 9), [-1, 1], [0.3, 1]);
        return (
          <div
            key={`s${i}`}
            style={{ position: "absolute", left: sx, top: sy, scale, opacity: 0.5 + scale * 0.4 }}
          >
            <Sparkle size={18 + rnd(i + 11) * 26} fill="#FFFFFF" />
          </div>
        );
      })}
    </div>
  );
};
