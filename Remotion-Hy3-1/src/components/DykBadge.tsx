import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Interactive,
} from "remotion";
import { fredoka } from "../fonts";

export const DykBadge: React.FC<{ accent: string; text: string }> = ({
  accent,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 11, mass: 0.6, stiffness: 140 },
    durationInFrames: 22,
  });
  const scale = interpolate(pop, [0, 0.7, 1], [0.2, 1.18, 1]);
  const wiggle = Math.sin(frame / 6) * 2;

  return (
    <Interactive.Div
      name="DYK Badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "18px 40px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.95)",
        boxShadow: `0 10px 0 ${accent}, 0 18px 30px rgba(0,0,0,0.18)`,
        scale,
        rotate: `${wiggle}deg`,
        border: `4px solid ${accent}`,
      }}
      from={-3}
    >
      <svg width="34" height="34" viewBox="0 0 24 24">
        <path
          d="M9 18h6m-5 3h4M12 2a6 6 0 0 1 3.5 10.9c-.6.4-1 .9-1.1 1.6h-4.8c-.1-.7-.5-1.2-1.1-1.6A6 6 0 0 1 12 2Z"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <Interactive.Span
        name="DYK Text"
        style={{
          fontFamily: fredoka,
          fontWeight: 700,
          fontSize: 46,
          letterSpacing: 1,
          color: accent,
          textTransform: "uppercase",
        }}
      >
        {text}
      </Interactive.Span>
    </Interactive.Div>
  );
};
