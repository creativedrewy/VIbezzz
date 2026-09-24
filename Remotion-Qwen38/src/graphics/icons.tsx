import React from "react";

type IconProps = {
  color: string;
  size: number;
};

export const PawPrint: React.FC<IconProps> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <ellipse cx="50" cy="70" rx="24" ry="19" fill={color} />
    <ellipse cx="23" cy="46" rx="10.5" ry="13" fill={color} transform="rotate(-18 23 46)" />
    <ellipse cx="41" cy="33" rx="10.5" ry="14" fill={color} transform="rotate(-6 41 33)" />
    <ellipse cx="59" cy="33" rx="10.5" ry="14" fill={color} transform="rotate(6 59 33)" />
    <ellipse cx="77" cy="46" rx="10.5" ry="13" fill={color} transform="rotate(18 77 46)" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ color, size }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 100 90" fill="none">
    <path
      d="M50 87 C22 62 3 46 3 28 A24 24 0 0 1 50 16 A24 24 0 0 1 97 28 C97 46 78 62 50 87 Z"
      fill={color}
    />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M50 3 L61 38 L98 38 L68 59 L79 95 L50 72 L21 95 L32 59 L2 38 L39 38 Z"
      fill={color}
    />
  </svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0 Z"
      fill={color}
    />
  </svg>
);

export const FishIcon: React.FC<IconProps> = ({ color, size }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 120 78" fill="none">
    <path d="M12 39 Q42 6 82 39 Q42 72 12 39 Z" fill={color} />
    <path d="M80 39 L112 16 L112 62 Z" fill={color} />
    <circle cx="34" cy="33" r="5" fill="#FFFFFF" />
  </svg>
);
