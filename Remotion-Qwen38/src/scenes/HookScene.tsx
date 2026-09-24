import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Sparkles } from "../components/Sparkles";
import { CatFace } from "../graphics/CatFace";
import { captionFont, displayFont } from "../fonts";

const popEasing = Easing.bezier(0.34, 1.56, 0.64, 1);

export type HookSceneProps = {
  titleTop: string;
  titleBottom: string;
  subtitle: string;
  bgTop: string;
  bgBottom: string;
  titleColor: string;
  titleShadow: string;
  accentColor: string;
  accentShadow: string;
  subtitleBg: string;
  subtitleColor: string;
  catMain: string;
  catAccent: string;
};

export const HookScene: React.FC<HookSceneProps> = ({
  titleTop,
  titleBottom,
  subtitle,
  bgTop,
  bgBottom,
  titleColor,
  titleShadow,
  accentColor,
  accentShadow,
  subtitleBg,
  subtitleColor,
  catMain,
  catAccent,
}) => {
  const frame = useCurrentFrame();

  const line1Scale = interpolate(frame, [3, 18], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });
  const line1Opacity = interpolate(frame, [3, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Scale = interpolate(frame, [13, 28], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });
  const line2Opacity = interpolate(frame, [13, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const catScale = interpolate(frame, [24, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });
  const catRise = interpolate(frame, [24, 42], [260, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });
  const pillOpacity = interpolate(frame, [40, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pillSlide = interpolate(frame, [40, 55], [70, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });

  return (
    <AbsoluteFill>
      <Background
        topColor={bgTop}
        bottomColor={bgBottom}
        shapeColor="#FFFFFF"
        shapeCount={12}
        seed={7}
        showRays
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 200,
          paddingBottom: 190,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 160,
              color: titleColor,
              textShadow: `0 14px 0 ${titleShadow}`,
              rotate: "-4deg",
              letterSpacing: 3,
              opacity: line1Opacity,
              scale: `${line1Scale}`,
            }}
          >
            {titleTop}
          </div>
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 215,
              color: accentColor,
              textShadow: `0 16px 0 ${accentShadow}`,
              rotate: "3deg",
              letterSpacing: 4,
              marginTop: -10,
              opacity: line2Opacity,
              scale: `${line2Scale}`,
            }}
          >
            {titleBottom}
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <div
            style={{
              scale: `${catScale}`,
              translate: `0px ${catRise}px`,
            }}
          >
            <div
              style={{
                rotate: `${Math.sin(frame * 0.07) * 3}deg`,
                translate: `0px ${Math.sin(frame * 0.11) * 10}px`,
                filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.22))",
              }}
            >
              <CatFace
                size={540}
                mainColor={catMain}
                accentColor={catAccent}
                eyeStyle="happy"
              />
            </div>
          </div>
          <Sparkles count={7} seed={3} />
        </div>

        <div
          style={{
            backgroundColor: subtitleBg,
            color: subtitleColor,
            fontFamily: captionFont,
            fontWeight: 800,
            fontSize: 46,
            padding: "16px 52px 22px",
            borderRadius: 999,
            boxShadow: "0 10px 0 rgba(0,0,0,0.16)",
            opacity: pillOpacity,
            translate: `0px ${pillSlide}px`,
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
