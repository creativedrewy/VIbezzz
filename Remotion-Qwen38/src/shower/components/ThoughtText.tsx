import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { captionFont } from "../../fonts";

const softEasing = Easing.bezier(0.22, 1, 0.36, 1);

const normalizeWord = (word: string) =>
  word.replace(/[^a-zA-Z0-9°%]/g, "").toLowerCase();

type ThoughtTextProps = {
  text: string;
  highlightWords: string[];
  color: string;
  highlightColor: string;
  highlightBg: string;
  glowColor: string;
  startFrame: number;
  framesPerWord: number;
  fontSize: number;
};

export const ThoughtText: React.FC<ThoughtTextProps> = ({
  text,
  highlightWords,
  color,
  highlightColor,
  highlightBg,
  glowColor,
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
        gap: "12px 18px",
        fontFamily: captionFont,
        fontWeight: 700,
        fontSize,
        lineHeight: 1.3,
        textAlign: "center",
      }}
    >
      {words.map((word, i) => {
        const t = startFrame + i * framesPerWord;
        const isHighlight = highlightSet.has(normalizeWord(word));

        const opacity = interpolate(frame, [t, t + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: softEasing,
        });
        const rise = interpolate(frame, [t, t + 14], [30, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: softEasing,
        });
        const scale = interpolate(frame, [t, t + 14], [0.94, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: softEasing,
        });

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity,
              scale: `${scale}`,
              translate: `0px ${rise}px`,
              color: isHighlight ? highlightColor : color,
              backgroundColor: isHighlight ? highlightBg : "transparent",
              borderRadius: isHighlight ? 26 : 0,
              padding: isHighlight ? "2px 24px 8px" : 0,
              textShadow: isHighlight
                ? `0 0 26px ${glowColor}`
                : "0 3px 14px rgba(0,0,0,0.3)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
