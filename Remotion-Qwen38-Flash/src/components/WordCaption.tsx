import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT, outlinedText } from "../fonts";

const containsWord = (word: string, target: string) =>
  word.toLowerCase().replace(/[^a-z0-9%]/g, "") ===
  target.toLowerCase().replace(/[^a-z0-9%]/g, "");

export const WordCaption: React.FC<{
  text: string;
  highlightWord: string;
  accent: string;
  ink: string;
  startFrame: number;
  staggerFrames: number;
  fontSize?: number;
  color?: string;
  maxWidth?: number;
}> = ({
  text,
  highlightWord,
  accent,
  ink,
  startFrame,
  staggerFrames,
  fontSize = 92,
  color = "#FFFFFF",
  maxWidth = 940,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(" ").filter((w) => w.length > 0);
  const keywordIndex = highlightWord
    ? words.findIndex((w) => containsWord(w, highlightWord))
    : -1;
  const highlightAt = startFrame + words.length * staggerFrames + 6;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: 26,
        rowGap: 14,
        maxWidth,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize,
        textTransform: "uppercase",
        lineHeight: 1.18,
        letterSpacing: 1,
      }}
    >
      {words.map((word, i) => {
        const wordAt = startFrame + i * staggerFrames;
        const pop = spring({
          frame: frame - wordAt,
          fps,
          config: { damping: 9, stiffness: 170, mass: 0.6 },
        });
        const opacity = interpolate(frame - wordAt, [0, 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isKeyword = i === keywordIndex;
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
            key={`${word}-${i}`}
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
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const PopWords: React.FC<{
  text: string;
  startFrame: number;
  staggerFrames: number;
  fontSize: number;
  color: string;
  ink: string;
  accentForWords?: number[];
  accent?: string;
  maxWidth?: number;
}> = ({
  text,
  startFrame,
  staggerFrames,
  fontSize,
  color,
  ink,
  accentForWords = [],
  accent = "#FFD60A",
  maxWidth = 940,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ").filter((w) => w.length > 0);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: fontSize * 0.22,
        rowGap: fontSize * 0.1,
        maxWidth,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize,
        textTransform: "uppercase",
      }}
    >
      {words.map((word, i) => {
        const pop = spring({
          frame: frame - startFrame - i * staggerFrames,
          fps,
          config: { damping: 8, stiffness: 160, mass: 0.7 },
        });
        const isAccent = accentForWords.includes(i);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              opacity: interpolate(pop, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
              scale: pop,
              rotate: `${(1 - pop) * (i % 2 === 0 ? -8 : 8)}deg`,
              color: isAccent ? accent : color,
              ...outlinedText(Math.round(fontSize / 16), ink),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
