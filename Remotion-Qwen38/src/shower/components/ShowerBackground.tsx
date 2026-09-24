import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const rand = (i: number, seed: number) => {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type ShowerBackgroundProps = {
  topColor: string;
  bottomColor: string;
  bubbleCount?: number;
  steamCount?: number;
  seed?: number;
};

export const ShowerBackground: React.FC<ShowerBackgroundProps> = ({
  topColor,
  bottomColor,
  bubbleCount = 10,
  steamCount = 3,
  seed = 1,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(175deg, ${topColor} 0%, ${bottomColor} 100%)`,
        }}
      />

      {Array.from({ length: steamCount }).map((_, i) => {
        const period = 190 + i * 40;
        const p =
          ((((frame * 1.1 + i * 70) % period) + period) % period) / period;
        const left = 12 + i * 34 + rand(i, seed) * 10;
        const sway = Math.sin(p * Math.PI * 3 + i) * 40;
        return (
          <div
            key={`steam-${i}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              bottom: -140,
              width: 70,
              height: 260,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.5)",
              filter: "blur(26px)",
              opacity: Math.sin(p * Math.PI) * 0.35,
              translate: `${sway}px ${-p * 1500}px`,
              rotate: `${8 + i * 5}deg`,
            }}
          />
        );
      })}

      {Array.from({ length: bubbleCount }).map((_, i) => {
        const period = 220 + Math.round(rand(i + 9, seed) * 140);
        const p =
          ((((frame * 1.2 + i * 31 + rand(i + 50, seed) * period) % period) +
            period) %
            period) /
          period;
        const size = 22 + rand(i * 5 + 3, seed) * 58;
        const left = 4 + rand(i * 7 + 1, seed) * 90;
        const sway = Math.sin(p * Math.PI * 4 + i * 2) * 26;
        const opacity = Math.sin(p * Math.PI) * 0.7;
        return (
          <div
            key={`bubble-${i}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              bottom: -80,
              width: size,
              height: size,
              borderRadius: "50%",
              border: "2.5px solid rgba(255,255,255,0.55)",
              backgroundColor: "rgba(255,255,255,0.10)",
              opacity,
              translate: `${sway}px ${-p * 2100}px`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "22%",
                top: "16%",
                width: "26%",
                height: "26%",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.75)",
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
