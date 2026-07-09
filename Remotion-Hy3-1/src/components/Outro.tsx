import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Interactive,
} from "remotion";
import { Background } from "./Background";
import { Illustration } from "./illustrations";
import { FactCaption } from "./FactCaption";
import { fredoka } from "../fonts";
import type { Palette } from "../schema";

export const Outro: React.FC<{ palette: Palette }> = ({ palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 120 },
    durationInFrames: 26,
  });
  const starScale = interpolate(pop, [0, 1], [0.3, 1]);
  const wiggle = Math.sin(frame / 8) * 4;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Background palette={palette} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 40,
          padding: 60,
        }}
      >
        <Interactive.Div
          name="Illustration"
          style={{
            width: 380,
            height: 380,
            scale: starScale,
            rotate: `${wiggle}deg`,
            filter: "drop-shadow(0 22px 28px rgba(0,0,0,0.22))",
          }}
        >
          <Illustration kind="star" color={palette.illo} />
        </Interactive.Div>
        <Interactive.Div
          name="Caption Card"
          style={{
            background: palette.card,
            borderRadius: 44,
            padding: "44px 48px",
            border: `6px solid ${palette.accent}`,
            boxShadow: `0 14px 0 ${palette.accent}, 0 26px 40px rgba(0,0,0,0.18)`,
            maxWidth: 940,
          }}
        >
          <FactCaption
            text="Follow for more fun facts!"
            accent={palette.accent}
            textColor={palette.text}
            delay={22}
          />
        </Interactive.Div>
        <Interactive.Span
          name="Handle"
          style={{
            fontFamily: fredoka,
            fontWeight: 700,
            fontSize: 36,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: 1,
          }}
        >
          @funfactfrenzy
        </Interactive.Span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
