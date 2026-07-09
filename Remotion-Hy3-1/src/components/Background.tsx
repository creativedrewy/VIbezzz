import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { Palette } from "../schema";

const SHAPES = [
  { x: 0.12, y: 0.18, s: 1.1, rot: 18, kind: "circle" as const, drift: 0.05 },
  { x: 0.82, y: 0.12, s: 0.8, rot: -12, kind: "star" as const, drift: 0.07 },
  { x: 0.7, y: 0.82, s: 1.3, rot: 24, kind: "circle" as const, drift: 0.04 },
  { x: 0.2, y: 0.78, s: 0.7, rot: -20, kind: "triangle" as const, drift: 0.06 },
  { x: 0.5, y: 0.05, s: 0.6, rot: 8, kind: "star" as const, drift: 0.08 },
  { x: 0.9, y: 0.55, s: 0.9, rot: 30, kind: "circle" as const, drift: 0.05 },
  { x: 0.05, y: 0.55, s: 0.75, rot: -8, kind: "triangle" as const, drift: 0.07 },
  { x: 0.35, y: 0.45, s: 0.5, rot: 14, kind: "star" as const, drift: 0.09 },
];

const STAR_POINTS =
  "M12 0 L15 9 L24 9 L17 15 L20 24 L12 18 L4 24 L7 15 L0 9 L9 9 Z";

export const Background: React.FC<{ palette: Palette }> = ({ palette }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const scale = interpolate(enter, [0, 1], [1.15, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        scale,
        background: `linear-gradient(150deg, ${palette.bg1} 0%, ${palette.bg2} 100%)`,
      }}
    >
      {SHAPES.map((shape, i) => {
        const loop = (frame / fps + i * 1.7) % 3;
        const yFloat = shape.y * height - loop * height * 0.35;
        const wiggle = Math.sin((frame / fps + i) * 1.5) * 18;
        const opacity = interpolate(loop, [0, 0.4, 2.6, 3], [0, 0.5, 0.5, 0]);
        const size = 90 * shape.s;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: shape.x * width + wiggle,
              top: yFloat,
              width: size,
              height: size,
              opacity,
              rotate: `${shape.rot + frame * 0.4}deg`,
            }}
          >
            {shape.kind === "circle" && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.55)",
                }}
              />
            )}
            {shape.kind === "star" && (
              <svg viewBox="0 0 24 24" width="100%" height="100%">
                <path d={STAR_POINTS} fill="rgba(255,255,255,0.6)" />
              </svg>
            )}
            {shape.kind === "triangle" && (
              <svg viewBox="0 0 24 24" width="100%" height="100%">
                <path d="M12 1 L23 23 L1 23 Z" fill="rgba(255,255,255,0.5)" />
              </svg>
            )}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 55%)",
        }}
      />
    </div>
  );
};
