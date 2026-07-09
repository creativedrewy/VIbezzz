import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Interactive,
} from "remotion";
import { Background } from "./Background";
import { DykBadge } from "./DykBadge";
import { FactCaption } from "./FactCaption";
import { Illustration } from "./illustrations";
import { fredoka } from "../fonts";
import type { Fact } from "../schema";

export const FactScene: React.FC<{ fact: Fact; index: number }> = ({
  fact,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { palette } = fact;

  const illo = spring({
    frame: frame - 10,
    fps,
    config: { damping: 13, mass: 0.8, stiffness: 120 },
    durationInFrames: 26,
  });
  const illoScale = interpolate(illo, [0, 1], [0.4, 1]);
  const wiggle = Math.sin(frame / 9) * 3;

  const exit = interpolate(
    frame,
    [durationInFrames - 16, durationInFrames],
    [1, 1.12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 16, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${exit})`,
        opacity: exitOpacity,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Background palette={palette} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 36,
          padding: 60,
        }}
      >
        <DykBadge accent={palette.accent} text={`Did you know? #${index + 1}`} />

        <Interactive.Div
          name="Illustration"
          style={{
            width: 520,
            height: 520,
            scale: illoScale,
            rotate: `${wiggle}deg`,
            filter: "drop-shadow(0 22px 28px rgba(0,0,0,0.22))",
          }}
        >
          <Illustration kind={fact.illustration} color={palette.illo} />
        </Interactive.Div>

        <Interactive.Div
          name="Caption Card"
          style={{
            background: palette.card,
            borderRadius: 44,
            padding: "44px 48px",
            boxShadow: `0 14px 0 ${palette.accent}, 0 26px 40px rgba(0,0,0,0.18)`,
            border: `6px solid ${palette.accent}`,
            maxWidth: 940,
          }}
        >
          <FactCaption
            text={fact.text}
            accent={palette.accent}
            textColor={palette.text}
            delay={26}
          />
        </Interactive.Div>
      </AbsoluteFill>

      <Interactive.Span
        name="Handle"
        style={{
          position: "absolute",
          bottom: 40,
          fontFamily: fredoka,
          fontWeight: 600,
          fontSize: 30,
          color: "rgba(255,255,255,0.9)",
          letterSpacing: 1,
        }}
      >
        @funfactfrenzy
      </Interactive.Span>
    </AbsoluteFill>
  );
};
