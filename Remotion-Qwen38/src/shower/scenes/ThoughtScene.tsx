import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ShowerBackground } from "../components/ShowerBackground";
import { ThoughtText } from "../components/ThoughtText";
import { Droplets, ShowerHead } from "../graphics/ShowerHead";
import { RubberDuck } from "../graphics/RubberDuck";
import { WaterLine } from "../graphics/WaterLine";
import { captionFont } from "../../fonts";
import type { ShowerThoughtProps } from "../schema";

const softEasing = Easing.bezier(0.22, 1, 0.36, 1);

type ThoughtSceneProps = {
  thought: ShowerThoughtProps;
  index: number;
  textFontSize: number;
  framesPerWord: number;
  duckBody: string;
  duckBeak: string;
  waterColor: string;
  dropletColor: string;
  metalColor: string;
};

export const ThoughtScene: React.FC<ThoughtSceneProps> = ({
  thought,
  index,
  textFontSize,
  framesPerWord,
  duckBody,
  duckBeak,
  waterColor,
  dropletColor,
  metalColor,
}) => {
  const frame = useCurrentFrame();

  const badgeOpacity = interpolate(frame, [2, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeRise = interpolate(frame, [2, 14], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const cardOpacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const cardScale = interpolate(frame, [8, 26], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const cardFloat = Math.sin(frame * 0.06) * 8;

  const duckBob = Math.sin(frame * 0.12 + index) * 9;
  const duckTilt = Math.sin(frame * 0.09 + index) * 4;

  const highlightWords = thought.highlight
    .split(/[\s,]+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const tail = [
    { size: 44, left: -30, bottom: -56, at: 16 },
    { size: 28, left: -62, bottom: -96, at: 20 },
    { size: 16, left: -84, bottom: -128, at: 24 },
  ];

  return (
    <AbsoluteFill>
      <ShowerBackground
        topColor={thought.bgTop}
        bottomColor={thought.bgBottom}
        seed={index * 11 + 5}
      />

      <div
        style={{
          position: "absolute",
          top: 20,
          right: 40,
          rotate: "16deg",
          transformOrigin: "80% 20%",
        }}
      >
        <ShowerHead size={210} metalColor={metalColor} />
        <div style={{ position: "absolute", top: 100, left: 40 }}>
          <Droplets
            color={dropletColor}
            width={130}
            fallDistance={430}
            count={6}
            seed={index + 3}
          />
        </div>
      </div>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 150,
          paddingBottom: 260,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.14)",
            border: "2px solid rgba(255,255,255,0.3)",
            color: thought.textColor,
            fontFamily: captionFont,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: 3,
            padding: "10px 42px 16px",
            borderRadius: 999,
            opacity: badgeOpacity,
            translate: `0px ${badgeRise}px`,
          }}
        >
          {thought.label}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "0 60px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ position: "relative" }}>
            {tail.map((t, i) => {
              const opacity = interpolate(frame, [t.at, t.at + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: t.left,
                    bottom: t.bottom,
                    width: t.size,
                    height: t.size,
                    borderRadius: "50%",
                    backgroundColor: thought.cardBg,
                    border: `3px solid ${thought.cardBorder}`,
                    opacity,
                  }}
                />
              );
            })}
            <div
              style={{
                width: 900,
                boxSizing: "border-box",
                backgroundColor: thought.cardBg,
                border: `3px solid ${thought.cardBorder}`,
                borderRadius: 56,
                padding: "64px 56px",
                boxShadow: "0 26px 60px rgba(0,0,0,0.28)",
                opacity: cardOpacity,
                scale: `${cardScale}`,
                translate: `0px ${cardFloat}px`,
              }}
            >
              <ThoughtText
                text={thought.text}
                highlightWords={highlightWords}
                color={thought.textColor}
                highlightColor={thought.highlightColor}
                highlightBg={thought.highlightBg}
                glowColor={thought.highlightColor}
                startFrame={30}
                framesPerWord={framesPerWord}
                fontSize={textFontSize}
              />
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <WaterLine color={waterColor} />
      <div
        style={{
          position: "absolute",
          bottom: 110,
          right: 80,
          translate: `0px ${duckBob}px`,
          rotate: `${duckTilt}deg`,
          filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.25))",
        }}
      >
        <RubberDuck size={240} bodyColor={duckBody} beakColor={duckBeak} />
      </div>
    </AbsoluteFill>
  );
};
