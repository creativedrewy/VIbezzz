import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ShowerBackground } from "../components/ShowerBackground";
import { RubberDuck } from "../graphics/RubberDuck";
import { WaterLine } from "../graphics/WaterLine";
import { captionFont } from "../../fonts";

const softEasing = Easing.bezier(0.22, 1, 0.36, 1);

export type ShowerOutroSceneProps = {
  title: string;
  subtitle: string;
  handle: string;
  bgTop: string;
  bgBottom: string;
  titleColor: string;
  titleGlow: string;
  subtitleColor: string;
  handleBg: string;
  handleColor: string;
  duckBody: string;
  duckBeak: string;
  waterColor: string;
};

export const ShowerOutroScene: React.FC<ShowerOutroSceneProps> = (props) => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [3, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const titleRise = interpolate(frame, [3, 20], [46, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const duckScale = interpolate(frame, [12, 28], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const duckOpacity = interpolate(frame, [12, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subOpacity = interpolate(frame, [24, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subRise = interpolate(frame, [24, 38], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const pillOpacity = interpolate(frame, [36, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pillRise = interpolate(frame, [36, 50], [36, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });

  const duckBob = Math.sin(frame * 0.12) * 12;
  const duckTilt = Math.sin(frame * 0.09) * 5;

  return (
    <AbsoluteFill>
      <ShowerBackground
        topColor={props.bgTop}
        bottomColor={props.bgBottom}
        bubbleCount={14}
        seed={31}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          paddingBottom: 260,
        }}
      >
        <div
          style={{
            fontFamily: captionFont,
            fontWeight: 800,
            fontSize: 138,
            letterSpacing: 3,
            color: props.titleColor,
            textShadow: `0 0 46px ${props.titleGlow}, 0 6px 0 rgba(0,0,0,0.25)`,
            opacity: titleOpacity,
            translate: `0px ${titleRise}px`,
            textAlign: "center",
          }}
        >
          {props.title}
        </div>

        <div
          style={{
            opacity: duckOpacity,
            scale: `${duckScale}`,
            translate: `0px ${duckBob}px`,
            rotate: `${duckTilt}deg`,
            filter: "drop-shadow(0 16px 22px rgba(0,0,0,0.28))",
          }}
        >
          <RubberDuck size={380} bodyColor={props.duckBody} beakColor={props.duckBeak} />
        </div>

        <div
          style={{
            fontFamily: captionFont,
            fontWeight: 700,
            fontSize: 58,
            color: props.subtitleColor,
            textShadow: "0 4px 16px rgba(0,0,0,0.3)",
            opacity: subOpacity,
            translate: `0px ${subRise}px`,
          }}
        >
          {props.subtitle}
        </div>

        <div
          style={{
            backgroundColor: props.handleBg,
            border: "2px solid rgba(255,255,255,0.3)",
            color: props.handleColor,
            fontFamily: captionFont,
            fontWeight: 800,
            fontSize: 48,
            padding: "14px 50px 20px",
            borderRadius: 999,
            opacity: pillOpacity,
            translate: `0px ${pillRise}px`,
          }}
        >
          {props.handle}
        </div>
      </AbsoluteFill>

      <WaterLine color={props.waterColor} />
    </AbsoluteFill>
  );
};
