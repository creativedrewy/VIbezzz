import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Captions } from "../components/Captions";
import { Sparkles } from "../components/Sparkles";
import { FactGraphic } from "../graphics/FactGraphics";
import { captionFont } from "../fonts";
import type { FactProps } from "../schema";

const popEasing = Easing.bezier(0.34, 1.56, 0.64, 1);

type FactSceneProps = {
  fact: FactProps;
  index: number;
  captionFontSize: number;
  framesPerWord: number;
};

export const FactScene: React.FC<FactSceneProps> = ({
  fact,
  index,
  captionFontSize,
  framesPerWord,
}) => {
  const frame = useCurrentFrame();

  const badgeScale = interpolate(frame, [2, 14], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });
  const badgeOpacity = interpolate(frame, [2, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const graphicScale = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });
  const floatY = Math.sin(frame * 0.09) * 12;

  const highlightWords = fact.highlight
    .split(/[\s,]+/)
    .map((w) => w.trim())
    .filter(Boolean);

  return (
    <AbsoluteFill>
      <Background
        topColor={fact.bgTop}
        bottomColor={fact.bgBottom}
        shapeColor={fact.shapeColor}
        shapeCount={9}
        seed={index * 13 + 3}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 150,
          paddingBottom: 170,
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            color: fact.highlightBg,
            fontFamily: captionFont,
            fontWeight: 800,
            fontSize: 44,
            letterSpacing: 2,
            padding: "10px 46px 16px",
            borderRadius: 999,
            boxShadow: "0 9px 0 rgba(0,0,0,0.15)",
            opacity: badgeOpacity,
            scale: `${badgeScale}`,
          }}
        >
          {fact.label}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            width: "100%",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                scale: `${graphicScale}`,
                translate: `0px ${floatY * graphicScale}px`,
                filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.2))",
              }}
            >
              <FactGraphic
                kind={fact.graphic}
                mainColor={fact.graphicMain}
                accentColor={fact.graphicAccent}
                size={520}
              />
            </div>
            <Sparkles count={5} seed={index + 5} />
          </div>
        </div>

        <div
          style={{
            minHeight: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "0 70px",
            boxSizing: "border-box",
          }}
        >
          <Captions
            text={fact.caption}
            highlightWords={highlightWords}
            color={fact.captionColor}
            highlightColor={fact.highlightColor}
            highlightBg={fact.highlightBg}
            startFrame={30}
            framesPerWord={framesPerWord}
            fontSize={captionFontSize}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
