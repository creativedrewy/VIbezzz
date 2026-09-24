import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ShowerBackground } from "../components/ShowerBackground";
import { Droplets, ShowerHead } from "../graphics/ShowerHead";
import { RubberDuck } from "../graphics/RubberDuck";
import { WaterLine } from "../graphics/WaterLine";
import { captionFont } from "../../fonts";
import { Easing } from "remotion";

const softEasing = Easing.bezier(0.22, 1, 0.36, 1);

export type ShowerHookSceneProps = {
  titleTop: string;
  titleBottom: string;
  subtitle: string;
  bgTop: string;
  bgBottom: string;
  titleColor: string;
  titleGlow: string;
  subtitleBg: string;
  subtitleColor: string;
  duckBody: string;
  duckBeak: string;
  waterColor: string;
  dropletColor: string;
  metalColor: string;
};

export const ShowerHookScene: React.FC<ShowerHookSceneProps> = (props) => {
  const frame = useCurrentFrame();

  const line1Opacity = interpolate(frame, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const line1Rise = interpolate(frame, [6, 22], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const line2Opacity = interpolate(frame, [16, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const line2Rise = interpolate(frame, [16, 32], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });
  const pillOpacity = interpolate(frame, [36, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pillRise = interpolate(frame, [36, 50], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: softEasing,
  });

  const duckBob = Math.sin(frame * 0.12) * 10;
  const duckTilt = Math.sin(frame * 0.09) * 4;

  const titleStyle: React.CSSProperties = {
    fontFamily: captionFont,
    fontWeight: 800,
    fontSize: 148,
    letterSpacing: 4,
    color: props.titleColor,
    textShadow: `0 0 46px ${props.titleGlow}, 0 6px 0 rgba(0,0,0,0.25)`,
  };

  return (
    <AbsoluteFill>
      <ShowerBackground topColor={props.bgTop} bottomColor={props.bgBottom} seed={4} />

      <div
        style={{
          position: "absolute",
          top: 30,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ShowerHead size={330} metalColor={props.metalColor} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Droplets color={props.dropletColor} width={250} fallDistance={820} seed={6} />
      </div>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingTop: 240,
          paddingBottom: 320,
        }}
      >
        <div style={{ ...titleStyle, opacity: line1Opacity, translate: `0px ${line1Rise}px` }}>
          {props.titleTop}
        </div>
        <div style={{ ...titleStyle, opacity: line2Opacity, translate: `0px ${line2Rise}px` }}>
          {props.titleBottom}
        </div>
        <div
          style={{
            marginTop: 34,
            backgroundColor: props.subtitleBg,
            color: props.subtitleColor,
            fontFamily: captionFont,
            fontWeight: 700,
            fontSize: 44,
            padding: "16px 48px 22px",
            borderRadius: 999,
            border: "2px solid rgba(255,255,255,0.3)",
            opacity: pillOpacity,
            translate: `0px ${pillRise}px`,
          }}
        >
          {props.subtitle}
        </div>
      </AbsoluteFill>

      <WaterLine color={props.waterColor} />
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          translate: `-50% ${duckBob}px`,
          rotate: `${duckTilt}deg`,
          filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.25))",
        }}
      >
        <RubberDuck size={300} bodyColor={props.duckBody} beakColor={props.duckBeak} />
      </div>
    </AbsoluteFill>
  );
};
