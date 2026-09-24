import React from "react";
import { useCurrentFrame } from "remotion";
import { SparkleIcon } from "../graphics/icons";

const rand = (i: number, seed: number) => {
  const x = Math.sin(i * 91.7 + seed * 233.3) * 24634.6345;
  return x - Math.floor(x);
};

type SparklesProps = {
  count?: number;
  color?: string;
  seed?: number;
};

export const Sparkles: React.FC<SparklesProps> = ({
  count = 6,
  color = "#FFFFFF",
  seed = 1,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        inset: -60,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const left = rand(i * 2 + 1, seed) * 100;
        const top = rand(i * 4 + 2, seed) * 100;
        const size = 26 + rand(i * 6 + 3, seed) * 40;
        const twinkle = Math.max(0, Math.sin(frame * 0.13 + i * 2.3));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              opacity: twinkle * 0.9,
              scale: `${0.4 + twinkle * 0.6}`,
              rotate: `${frame * 0.6 + i * 55}deg`,
              filter: "drop-shadow(0 0 8px rgba(255,255,255,0.6))",
            }}
          >
            <SparkleIcon color={color} size={size} />
          </div>
        );
      })}
    </div>
  );
};
