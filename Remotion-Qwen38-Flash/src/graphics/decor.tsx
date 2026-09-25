import { useCurrentFrame, interpolate } from "remotion";

type ShapeProps = {
  size: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
};

export const PawPrint: React.FC<ShapeProps> = ({
  size,
  fill,
  stroke,
  strokeWidth = 0,
}) => {
  return (
    <svg width={size} height={size * (44 / 40)} viewBox="0 0 40 44">
      <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
        <ellipse cx="20" cy="30" rx="13" ry="11" />
        <ellipse cx="6" cy="14" rx="5.5" ry="7" transform="rotate(-18 6 14)" />
        <ellipse cx="15.5" cy="8" rx="5.5" ry="7.5" transform="rotate(-6 15.5 8)" />
        <ellipse cx="26" cy="8" rx="5.5" ry="7.5" transform="rotate(6 26 8)" />
        <ellipse cx="35" cy="14" rx="5.5" ry="7" transform="rotate(18 35 14)" />
      </g>
    </svg>
  );
};

export const Heart: React.FC<ShapeProps> = ({ size, fill, stroke, strokeWidth = 0 }) => {
  return (
    <svg width={size} height={size * (38 / 40)} viewBox="0 0 40 38">
      <path
        d="M20 36 C -6 18 2 -4 20 8 C 38 -4 46 18 20 36 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export const Sparkle: React.FC<ShapeProps> = ({ size, fill }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <path
        d="M20 0 Q23 17 40 20 Q23 23 20 40 Q17 23 0 20 Q17 17 20 0 Z"
        fill={fill}
      />
    </svg>
  );
};

export const Fish: React.FC<ShapeProps> = ({ size, fill, stroke, strokeWidth = 0 }) => {
  return (
    <svg width={size} height={size * (28 / 40)} viewBox="0 0 40 28">
      <g stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M30 4 L40 0 L37 14 L40 28 L30 24 Z" fill={fill} />
        <ellipse cx="16" cy="14" rx="16" ry="11" fill={fill} />
      </g>
      <circle cx="10" cy="11" r="2.6" fill={stroke ?? "#000"} stroke="none" />
      <path
        d="M16 6 q4 8 0 16"
        fill="none"
        stroke={stroke ?? "#000"}
        strokeWidth={Math.max(1.6, strokeWidth)}
        opacity={0.55}
      />
    </svg>
  );
};

export const YarnBall: React.FC<{ size: number; fill: string; line: string }> = ({
  size,
  fill,
  line,
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="28" r="22" fill={fill} />
      <g fill="none" stroke={line} strokeWidth="3" strokeLinecap="round">
        <path d="M12 20 Q30 34 50 22" />
        <path d="M10 30 Q30 44 51 31" />
        <path d="M18 10 Q26 28 16 46" />
        <path d="M40 8 Q36 30 46 44" />
      </g>
      <path
        d="M46 44 Q56 50 52 58"
        fill="none"
        stroke={line}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const IceCream: React.FC<{ size: number; ink: string; scoop: string; accent: string }> =
  ({ size, ink, scoop, accent }) => {
    return (
      <svg width={size} height={size * (1.5)} viewBox="0 0 80 120">
        <path
          d="M24 58 L40 116 L56 58 Z"
          fill="#E8B15C"
          stroke={ink}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <g stroke={ink} strokeWidth="4" opacity="0.6">
          <path d="M29 70 L49 90" fill="none" />
          <path d="M35 86 L45 76" fill="none" />
        </g>
        <circle cx="32" cy="46" r="18" fill={scoop} stroke={ink} strokeWidth="5" />
        <circle cx="50" cy="42" r="16" fill={accent} stroke={ink} strokeWidth="5" />
        <circle cx="41" cy="22" r="13" fill={scoop} stroke={ink} strokeWidth="5" />
        <circle cx="41" cy="10" r="5.5" fill="#FF4D6D" stroke={ink} strokeWidth="3" />
      </svg>
    );
  };

export const Twinkle: React.FC<{ size: number; fill: string; delayFrames?: number }> = ({
  size,
  fill,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(Math.sin((frame - delayFrames) / 7), [-1, 1], [0.4, 1]);
  const opacity = interpolate(scale, [0.4, 1], [0.35, 1]);
  return (
    <div style={{ scale, opacity }}>
      <Sparkle size={size} fill={fill} />
    </div>
  );
};
