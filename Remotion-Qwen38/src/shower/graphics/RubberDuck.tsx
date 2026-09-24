import React from "react";

type RubberDuckProps = {
  size: number;
  bodyColor: string;
  beakColor: string;
};

export const RubberDuck: React.FC<RubberDuckProps> = ({
  size,
  bodyColor,
  beakColor,
}) => (
  <svg width={size} height={size * 0.77} viewBox="0 0 220 170" fill="none">
    <path d="M42 108 Q18 96 24 72 Q46 84 56 94 Z" fill={bodyColor} />
    <ellipse cx="110" cy="122" rx="76" ry="42" fill={bodyColor} />
    <path d="M92 120 Q114 104 140 118 Q120 136 92 120 Z" fill="#000000" opacity="0.1" />
    <circle cx="150" cy="70" r="40" fill={bodyColor} />
    <path
      d="M184 64 Q210 60 212 74 Q210 88 184 84 Q177 74 184 64 Z"
      fill={beakColor}
    />
    <circle cx="158" cy="58" r="5.5" fill="#1F2937" />
    <circle cx="160" cy="56" r="2" fill="#FFFFFF" />
    <circle cx="168" cy="80" r="7" fill={beakColor} opacity="0.45" />
  </svg>
);
