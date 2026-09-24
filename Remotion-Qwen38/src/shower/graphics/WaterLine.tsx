import React from "react";
import { useCurrentFrame } from "remotion";

const WAVE_PERIOD = 216;

const buildWave = (y: number, amplitude: number, width: number) => {
  let d = `M0 ${y}`;
  for (let x = 0; x < width; x += WAVE_PERIOD) {
    d += ` Q${x + WAVE_PERIOD / 4} ${y - amplitude} ${x + WAVE_PERIOD / 2} ${y}`;
    d += ` Q${x + (WAVE_PERIOD * 3) / 4} ${y + amplitude} ${x + WAVE_PERIOD} ${y}`;
  }
  d += ` L${width} 200 L0 200 Z`;
  return d;
};

const WAVE_A = buildWave(46, 16, 2592);
const WAVE_B = buildWave(62, 12, 2592);

type WaterLineProps = {
  color: string;
  height?: number;
};

export const WaterLine: React.FC<WaterLineProps> = ({ color, height = 220 }) => {
  const frame = useCurrentFrame();
  const shiftA = -((frame * 1.4) % WAVE_PERIOD);
  const shiftB = ((frame * 0.9) % WAVE_PERIOD) - WAVE_PERIOD;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <svg
        width={2592}
        height={200}
        viewBox="0 0 2592 200"
        style={{ position: "absolute", bottom: 0, left: shiftB, opacity: 0.55 }}
      >
        <path d={WAVE_B} fill={color} />
      </svg>
      <svg
        width={2592}
        height={200}
        viewBox="0 0 2592 200"
        style={{ position: "absolute", bottom: 0, left: shiftA }}
      >
        <path d={WAVE_A} fill={color} />
      </svg>
    </div>
  );
};
