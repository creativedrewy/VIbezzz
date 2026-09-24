import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Sparkles } from "../components/Sparkles";
import { CatFace } from "../graphics/CatFace";
import { HeartIcon, PawPrint } from "../graphics/icons";
import { captionFont, displayFont } from "../fonts";

const popEasing = Easing.bezier(0.34, 1.56, 0.64, 1);

export type OutroSceneProps = {
  title: string;
  subtitle: string;
  handle: string;
  bgTop: string;
  bgBottom: string;
  titleColor: string;
  titleShadow: string;
  subtitleColor: string;
  handleBg: string;
  handleColor: string;
  catMain: string;
  catAccent: string;
  pawColor: string;
};

export const OutroScene: React.FC<OutroSceneProps> = ({
  title,
  subtitle,
  handle,
  bgTop,
  bgBottom,
  titleColor,
  titleShadow,
  subtitleColor,
  handleBg,
  handleColor,
  catMain,
  catAccent,
  pawColor,
}) => {
  const frame = useCurrentFrame();

  const titleScale = interpolate(frame, [3, 18], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });
  const titleOpacity = interpolate(frame, [3, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleBounce = frame > 18 ? Math.abs(Math.sin(frame * 0.12)) * 12 : 0;

  const catScale = interpolate(frame, [10, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });
  const wave = Math.sin(frame * 0.45) * 20;

  const subScale = interpolate(frame, [20, 32], [0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });
  const subOpacity = interpolate(frame, [20, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pillSlide = interpolate(frame, [32, 46], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: popEasing,
  });
  const pillOpacity = interpolate(frame, [32, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background
        topColor={bgTop}
        bottomColor={bgBottom}
        shapeColor="#FFFFFF"
        shapeCount={10}
        seed={21}
        showRays
      />

      {Array.from({ length: 6 }).map((_, i) => {
        const cycle = ((((frame * 1.5 + i * 42) % 160) + 160) % 160) / 160;
        const left = 8 + ((i * 37) % 84);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              bottom: -80,
              translate: `0px ${-cycle * 1500}px`,
              opacity: Math.sin(cycle * Math.PI) * 0.85,
              scale: `${0.5 + ((i * 13) % 7) / 10}`,
              rotate: `${Math.sin(cycle * 6 + i) * 15}deg`,
            }}
          >
            <HeartIcon color={i % 2 === 0 ? "#FFFFFF" : "#FDE047"} size={64} />
          </div>
        );
      })}

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
          paddingBottom: 120,
        }}
      >
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 185,
            color: titleColor,
            textShadow: `0 14px 0 ${titleShadow}`,
            letterSpacing: 4,
            rotate: "-3deg",
            opacity: titleOpacity,
            scale: `${titleScale}`,
            translate: `0px ${-titleBounce}px`,
          }}
        >
          {title}
        </div>

        <div style={{ position: "relative", scale: `${catScale}` }}>
          <div
            style={{
              rotate: `${Math.sin(frame * 0.08) * 2.5}deg`,
              filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.22))",
            }}
          >
            <CatFace
              size={460}
              mainColor={catMain}
              accentColor={catAccent}
              eyeStyle="happy"
            />
          </div>
          <div
            style={{
              position: "absolute",
              right: -64,
              top: 205,
              rotate: `${wave}deg`,
              transformOrigin: "50% 90%",
              filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.2))",
            }}
          >
            <PawPrint color={pawColor} size={150} />
          </div>
          <Sparkles count={6} seed={9} />
        </div>

        <div
          style={{
            fontFamily: captionFont,
            fontWeight: 800,
            fontSize: 66,
            color: subtitleColor,
            textShadow: "0 6px 0 rgba(0,0,0,0.16)",
            opacity: subOpacity,
            scale: `${subScale}`,
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            backgroundColor: handleBg,
            color: handleColor,
            fontFamily: captionFont,
            fontWeight: 800,
            fontSize: 50,
            padding: "14px 54px 20px",
            borderRadius: 999,
            boxShadow: "0 10px 0 rgba(0,0,0,0.16)",
            opacity: pillOpacity,
            translate: `0px ${pillSlide}px`,
          }}
        >
          {handle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
