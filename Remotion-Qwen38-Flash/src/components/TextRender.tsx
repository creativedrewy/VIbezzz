import { type Caption } from "@remotion/captions";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT, outlinedText } from "../fonts";

const wordFrame = (c: Caption, fps: number) => (c.startMs / 1000) * fps;

export const PopWordsView: React.FC<{
  captions: Caption[];
  fontSize: number;
  color: string;
  ink: string;
  accentIndex: number;
  pill: boolean;
  width: number;
}> = ({ captions, fontSize, color, ink, accentIndex, pill, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        width,
        columnGap: fontSize * 0.22,
        rowGap: fontSize * 0.1,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize,
        textTransform: "uppercase",
      }}
    >
      {captions.map((c, i) => {
        const pop = spring({
          frame: frame - wordFrame(c, fps),
          fps,
          config: { damping: 8, stiffness: 160, mass: 0.7 },
        });
        const isAccent = i === accentIndex;
        return (
          <span
            key={`${c.text}-${i}`}
            style={{
              display: "inline-block",
              opacity: interpolate(pop, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
              scale: pop,
              rotate: `${(1 - pop) * (i % 2 === 0 ? -8 : 8)}deg`,
              color: isAccent ? "#FFE14D" : color,
              ...(pill
                ? {
                    background: ink,
                    color,
                    padding: "10px 36px",
                    borderRadius: 999,
                    border: "5px solid #FFFFFF",
                    boxShadow: "0 10px 0 rgba(0,0,0,0.22)",
                    letterSpacing: 3,
                    fontSize: 44,
                  }
                : outlinedText(Math.round(fontSize / 16), ink)),
            }}
          >
            {c.text}
          </span>
        );
      })}
    </div>
  );
};

export const CaptionWordsView: React.FC<{
  captions: Caption[];
  highlightIndex: number;
  accent: string;
  ink: string;
  color: string;
  fontSize: number;
  width: number;
}> = ({ captions, highlightIndex, accent, ink, color, fontSize, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lastEndMs = Math.max(...captions.map((c) => c.endMs), 0);
  const highlightAt = (lastEndMs / 1000) * fps + 6;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        width,
        columnGap: 26,
        rowGap: 14,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize,
        textTransform: "uppercase",
        lineHeight: 1.18,
        letterSpacing: 1,
      }}
    >
      {captions.map((c, i) => {
        const at = wordFrame(c, fps);
        const pop = spring({
          frame: frame - at,
          fps,
          config: { damping: 9, stiffness: 170, mass: 0.6 },
        });
        const opacity = interpolate(frame - at, [0, 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isKeyword = i === highlightIndex;
        const hl = isKeyword
          ? spring({
              frame: frame - highlightAt,
              fps,
              config: { damping: 6, stiffness: 210, mass: 0.7 },
            })
          : 0;
        const keywordScale = interpolate(hl, [0, 0.6, 1], [1, 1.32, 1.08], {
          extrapolateRight: "clamp",
        });
        const highlightBox = isKeyword
          ? {
              background: accent,
              color: ink,
              padding: "2px 20px",
              borderRadius: 26,
              border: `5px solid ${ink}`,
              boxShadow: "0 8px 0 rgba(0,0,0,0.18)",
              opacity: interpolate(hl, [0, 0.4], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }
          : {};

        return (
          <span
            key={`${c.text}-${i}`}
            style={{
              display: "inline-block",
              opacity,
              scale: pop * (isKeyword ? keywordScale : 1),
              translate: `0 ${(1 - pop) * 60}px`,
              rotate: `${(1 - pop) * (i % 2 === 0 ? -10 : 10)}deg`,
              color: isKeyword && hl > 0.2 ? undefined : color,
              ...outlinedText(6, isKeyword && hl > 0.2 ? "transparent" : ink),
              ...highlightBox,
            }}
          >
            {c.text}
          </span>
        );
      })}
    </div>
  );
};
