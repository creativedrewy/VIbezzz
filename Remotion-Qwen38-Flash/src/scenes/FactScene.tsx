import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SceneBackground } from "../components/Background";
import { WordCaption } from "../components/WordCaption";
import { GRAPHICS } from "../graphics/Illustrations";
import { FONT, outlinedText } from "../fonts";
import type { Fact } from "../schema";

export const FACT_FRAMES = 120;

const WORD_START = 24;
const WORD_STAGGER = 5;

export const FactScene: React.FC<{ fact: Fact; seed: number }> = ({ fact, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Art = GRAPHICS[fact.graphic];

  const punch = interpolate(frame, [0, 12], [1.14, 1], { extrapolateRight: "clamp" });

  const badge = spring({
    frame: frame - 6,
    fps,
    config: { damping: 9, stiffness: 150, mass: 0.6 },
  });

  const words = fact.text.split(" ").filter((w) => w.length > 0);
  const captionDone = WORD_START + words.length * WORD_STAGGER + 20;
  const artNudge = interpolate(
    frame,
    [Math.max(WORD_START, captionDone - 40), captionDone],
    [0, -30],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ scale: punch }}>
      <SceneBackground
        top={fact.bgTop}
        bottom={fact.bgBottom}
        ink={fact.ink}
        seed={seed}
        paws={6}
      />

      <div
        style={{
          position: "absolute",
          top: "11%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 44,
            textTransform: "uppercase",
            letterSpacing: 3,
            color: "#FFFFFF",
            background: fact.ink,
            padding: "12px 36px",
            borderRadius: 999,
            border: "5px solid #FFFFFF",
            boxShadow: "0 10px 0 rgba(0,0,0,0.22)",
            scale: badge,
            opacity: interpolate(badge, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
            translate: `0 ${(1 - badge) * -140}px`,
          }}
        >
          {fact.label}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "22%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          translate: `0 ${artNudge}px`,
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 60,
            border: `8px solid ${fact.ink}`,
            boxShadow: "0 16px 0 rgba(0,0,0,0.20)",
            padding: "44px 52px 52px",
            scale: spring({
              frame: frame - 10,
              fps,
              config: { damping: 8, stiffness: 120, mass: 0.8 },
            }),
          }}
        >
          <Art fur={fact.fur} ink={fact.ink} accent={fact.accent} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "10.5%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <WordCaption
          text={fact.text}
          highlightWord={fact.highlightWord}
          accent={fact.accent}
          ink={fact.ink}
          startFrame={WORD_START}
          staggerFrames={WORD_STAGGER}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "4%",
          right: "7%",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 34,
          color: "rgba(255,255,255,0.85)",
          ...outlinedText(3, fact.ink),
          rotate: "-6deg",
        }}
      >
        meow~
      </div>
    </AbsoluteFill>
  );
};
