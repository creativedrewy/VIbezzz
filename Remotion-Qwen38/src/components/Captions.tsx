import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { captionFont } from "../fonts";

const normalizeWord = (word: string) =>
  word
    .replace(/[^a-zA-Z0-9°%]/g, "")
    .toLowerCase();

const popEasing = Easing.bezier(0.34, 1.56, 0.64, 1);

type CaptionsProps = {
  text: string;
  highlightWords: string[];
  color: string;
  highlightColor: string;
  highlightBg: string;
  startFrame: number;
  framesPerWord: number;
  fontSize: number;
};

export const Captions: React.FC<CaptionsProps> = ({
  text,
  highlightWords,
  color,
  highlightColor,
  highlightBg,
  startFrame,
  framesPerWord,
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);
  const highlightSet = new Set(
    highlightWords.map((w) => normalizeWord(w)).filter(Boolean)
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "14px 20px",
        fontFamily: captionFont,
        fontWeight: 800,
        fontSize,
        lineHeight: 1.22,
        textAlign: "center",
      }}
    >
      {words.map((word, i) => {
        const t = startFrame + i * framesPerWord;
        const isHighlight = highlightSet.has(normalizeWord(word));

        const pop = interpolate(frame, [t, t + 10], [0.35, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: popEasing,
        });
        const opacity = interpolate(frame, [t, t + 3], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const slide = interpolate(frame, [t, t + 10], [46, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: popEasing,
        });
        const pulse =
          isHighlight && frame > t + 12
            ? 1 + Math.sin((frame - t - 12) * 0.3) * 0.05
            : 1;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity,
              scale: `${pop * pulse}`,
              translate: `0px ${slide}px`,
              color: isHighlight ? highlightColor : color,
              backgroundColor: isHighlight ? highlightBg : "transparent",
              borderRadius: isHighlight ? 28 : 0,
              padding: isHighlight ? "2px 26px 10px" : 0,
              textShadow: isHighlight
                ? "0 4px 10px rgba(0,0,0,0.18)"
                : "0 4px 12px rgba(0,0,0,0.18)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
