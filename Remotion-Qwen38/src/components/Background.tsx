import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FishIcon, HeartIcon, PawPrint, StarIcon } from "../graphics/icons";

const rand = (i: number, seed: number) => {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type BackgroundProps = {
  topColor: string;
  bottomColor: string;
  shapeColor: string;
  shapeCount?: number;
  seed?: number;
  showRays?: boolean;
};

const RayPaths = Array.from({ length: 12 }).map((_, i) => {
  const a1 = ((i * 30) * Math.PI) / 180;
  const a2 = ((i * 30 + 13) * Math.PI) / 180;
  const r = 1500;
  return `M1000,1000 L${1000 + r * Math.cos(a1)},${1000 + r * Math.sin(a1)} L${
    1000 + r * Math.cos(a2)
  },${1000 + r * Math.sin(a2)} Z`;
});

export const Background: React.FC<BackgroundProps> = ({
  topColor,
  bottomColor,
  shapeColor,
  shapeCount = 10,
  seed = 1,
  showRays = false,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${topColor} 0%, ${bottomColor} 100%)`,
        }}
      />
      {showRays ? (
        <svg
          width={2800}
          height={2800}
          viewBox="0 0 2000 2000"
          style={{
            position: "absolute",
            left: "50%",
            top: "38%",
            translate: "-50% -50%",
            rotate: `${frame * 0.25}deg`,
            opacity: 0.13,
          }}
        >
          {RayPaths.map((d, i) => (
            <path key={i} d={d} fill="#FFFFFF" />
          ))}
        </svg>
      ) : null}
      {Array.from({ length: shapeCount }).map((_, i) => {
        const kind = ["paw", "heart", "star", "circle", "fish"][i % 5];
        const left = rand(i * 3 + 1, seed) * 92 + 2;
        const top = rand(i * 5 + 2, seed) * 90 + 3;
        const size = 44 + rand(i * 7 + 3, seed) * 70;
        const baseRot = rand(i * 11 + 4, seed) * 60 - 30;
        const drift = Math.sin((frame + i * 37) / 42) * 16;
        const rot = baseRot + Math.sin((frame + i * 23) / 55) * 8;
        const opacity = 0.14 + rand(i * 13 + 5, seed) * 0.12;

        const style: React.CSSProperties = {
          position: "absolute",
          left: `${left}%`,
          top: `${top}%`,
          opacity,
          translate: `0px ${drift}px`,
          rotate: `${rot}deg`,
        };

        if (kind === "paw") {
          return (
            <div key={i} style={style}>
              <PawPrint color={shapeColor} size={size} />
            </div>
          );
        }
        if (kind === "heart") {
          return (
            <div key={i} style={style}>
              <HeartIcon color={shapeColor} size={size} />
            </div>
          );
        }
        if (kind === "star") {
          return (
            <div key={i} style={style}>
              <StarIcon color={shapeColor} size={size} />
            </div>
          );
        }
        if (kind === "fish") {
          return (
            <div key={i} style={style}>
              <FishIcon color={shapeColor} size={size} />
            </div>
          );
        }
        return (
          <div
            key={i}
            style={{
              ...style,
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: "50%",
              backgroundColor: shapeColor,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
