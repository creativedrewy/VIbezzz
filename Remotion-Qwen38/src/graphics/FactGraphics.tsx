import React from "react";
import { useCurrentFrame } from "remotion";
import { CatFace } from "./CatFace";
import { HeartIcon, PawPrint } from "./icons";
import { displayFont } from "../fonts";

export type FactGraphicKind = "sleepyCat" | "earCat" | "pawTrio" | "heartCat";

type FactGraphicProps = {
  kind: FactGraphicKind;
  mainColor: string;
  accentColor: string;
  size: number;
};

const popScale = (frame: number, start: number, duration = 16) => {
  const t = (frame - start) / duration;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const SleepyCat: React.FC<{ mainColor: string; accentColor: string; size: number }> = ({
  mainColor,
  accentColor,
  size,
}) => {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin(frame * 0.09) * 0.025;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ scale: `${breathe}`, transformOrigin: "50% 85%" }}>
        <CatFace
          size={size}
          mainColor={mainColor}
          accentColor={accentColor}
          eyeStyle="sleepy"
        />
      </div>
      {[0, 1, 2].map((i) => {
        const cycle = ((((frame * 1.1 + i * 45) % 135) + 135) % 135) / 135;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: size * 0.72 + i * size * 0.07 + cycle * size * 0.1,
              top: size * 0.22 - cycle * size * 0.28,
              opacity: Math.sin(cycle * Math.PI),
              fontSize: size * (0.1 + i * 0.035) + cycle * size * 0.03,
              fontFamily: displayFont,
              color: "#FFFFFF",
              textShadow: "0 5px 12px rgba(0,0,0,0.22)",
              rotate: `${12 + i * 7}deg`,
            }}
          >
            Z
          </div>
        );
      })}
    </div>
  );
};

const EarCat: React.FC<{ mainColor: string; accentColor: string; size: number }> = ({
  mainColor,
  accentColor,
  size,
}) => {
  const frame = useCurrentFrame();
  const wiggle = Math.sin(frame * 0.22) * 13;
  const arrowOpacity = Math.min(1, 0.65 + Math.sin(frame * 0.18) * 0.35);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <CatFace
        size={size}
        mainColor={mainColor}
        accentColor={accentColor}
        eyeStyle="open"
        earWiggle={wiggle}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        style={{ position: "absolute", top: 0, left: 0, opacity: arrowOpacity }}
      >
        <path
          d="M62 100 A56 56 0 0 0 52 182"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path d="M52 194 L38 168 L68 166 Z" fill="#FFFFFF" />
        <path
          d="M338 100 A56 56 0 0 1 348 182"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path d="M348 194 L332 166 L362 168 Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

const PawTrio: React.FC<{ mainColor: string; accentColor: string; size: number }> = ({
  mainColor,
  accentColor,
  size,
}) => {
  const frame = useCurrentFrame();
  const pawSize = size * 0.44;
  const layout = [
    { x: -1, rot: -14, delay: 4, color: mainColor },
    { x: 0, rot: 0, delay: 12, color: accentColor },
    { x: 1, rot: 14, delay: 20, color: mainColor },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {layout.map((paw, i) => {
        const pop = popScale(frame, paw.delay);
        const wiggle = Math.sin(frame * 0.14 + i * 1.7) * 5;
        const lift = paw.x === 0 ? -size * 0.08 : size * 0.05;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(50% + ${paw.x * size * 0.33}px - ${pawSize / 2}px)`,
              top: `calc(50% + ${lift}px - ${pawSize / 2}px)`,
              scale: `${Math.max(0, pop)}`,
              rotate: `${paw.rot + wiggle}deg`,
              filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.18))",
            }}
          >
            <PawPrint color={paw.color} size={pawSize} />
          </div>
        );
      })}
    </div>
  );
};

const HeartCat: React.FC<{ mainColor: string; accentColor: string; size: number }> = ({
  mainColor,
  accentColor,
  size,
}) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame * 0.42) * 0.13;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <CatFace
        size={size}
        mainColor={mainColor}
        accentColor={accentColor}
        eyeStyle="happy"
      />
      <div
        style={{
          position: "absolute",
          top: -size * 0.09,
          right: -size * 0.1,
          scale: `${pulse}`,
          filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.2))",
        }}
      >
        <HeartIcon color={accentColor} size={size * 0.3} />
      </div>
      {[0, 1, 2].map((i) => {
        const cycle = ((((frame * 1.3 + i * 50) % 150) + 150) % 150) / 150;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: size * (0.02 + i * 0.1) + cycle * size * 0.05,
              top: size * 0.55 - cycle * size * 0.5,
              opacity: Math.sin(cycle * Math.PI) * 0.9,
              scale: `${0.6 + cycle * 0.5}`,
            }}
          >
            <HeartIcon color="#FFFFFF" size={size * 0.07} />
          </div>
        );
      })}
    </div>
  );
};

export const FactGraphic: React.FC<FactGraphicProps> = ({
  kind,
  mainColor,
  accentColor,
  size,
}) => {
  if (kind === "sleepyCat") {
    return <SleepyCat mainColor={mainColor} accentColor={accentColor} size={size} />;
  }
  if (kind === "earCat") {
    return <EarCat mainColor={mainColor} accentColor={accentColor} size={size} />;
  }
  if (kind === "pawTrio") {
    return <PawTrio mainColor={mainColor} accentColor={accentColor} size={size} />;
  }
  return <HeartCat mainColor={mainColor} accentColor={accentColor} size={size} />;
};
