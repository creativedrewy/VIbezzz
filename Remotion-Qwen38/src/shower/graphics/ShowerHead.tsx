import React from "react";
import { useCurrentFrame } from "remotion";

type ShowerHeadProps = {
  size: number;
  metalColor: string;
};

export const ShowerHead: React.FC<ShowerHeadProps> = ({ size, metalColor }) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 200 110" fill="none">
    <rect x="92" y="0" width="16" height="34" rx="8" fill={metalColor} />
    <path d="M52 68 Q52 32 100 32 Q148 32 148 68 Z" fill={metalColor} />
    <rect x="46" y="64" width="108" height="14" rx="7" fill={metalColor} />
    <rect x="46" y="64" width="108" height="14" rx="7" fill="#000000" opacity="0.15" />
    {[64, 82, 100, 118, 136].map((x) => (
      <circle key={x} cx={x} cy="71" r="3.4" fill="#475569" />
    ))}
  </svg>
);

const rand = (i: number, seed: number) => {
  const x = Math.sin(i * 73.3 + seed * 197.9) * 31457.2715;
  return x - Math.floor(x);
};

type DropletsProps = {
  count?: number;
  color: string;
  width?: number;
  fallDistance?: number;
  seed?: number;
};

export const Droplets: React.FC<DropletsProps> = ({
  count = 9,
  color,
  width = 220,
  fallDistance = 620,
  seed = 2,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: `calc(50% - ${width / 2}px)`,
        width,
        height: fallDistance + 40,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const period = 46 + Math.round(rand(i, seed) * 26);
        const p = (((frame + i * 13 + rand(i + 40, seed) * period) % period) + period) % period / period;
        const left = rand(i * 3 + 7, seed) * (width - 14);
        const opacity = p < 0.12 ? p / 0.12 : p > 0.82 ? (1 - p) / 0.18 : 0.85;
        const stretch = 1 + Math.sin(p * Math.PI) * 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top: p * fallDistance,
              width: 10,
              height: 17 * stretch,
              borderRadius: 999,
              backgroundColor: color,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};
