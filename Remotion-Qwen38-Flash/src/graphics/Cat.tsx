import { interpolate, useCurrentFrame } from "remotion";

type CatFaceProps = {
  size: number;
  fur: string;
  ink: string;
  expression?: "happy" | "wow" | "sly" | "sleepy" | "wink";
  blush?: boolean;
};

const EXPRESSIONS: Record<string, { left: string; right: string }> = {
  happy: { left: "happy", right: "happy" },
  wow: { left: "open", right: "open" },
  sly: { left: "half", right: "half" },
  sleepy: { left: "sleepy", right: "sleepy" },
  wink: { left: "happy", right: "open" },
};

const Eye: React.FC<{ kind: string; cx: number; ink: string }> = ({ kind, cx, ink }) => {
  if (kind === "happy") {
    return (
      <path
        d={`M${cx - 15} 106 q15 -20 30 0`}
        fill="none"
        stroke={ink}
        strokeWidth="9"
        strokeLinecap="round"
      />
    );
  }
  if (kind === "sleepy") {
    return (
      <path
        d={`M${cx - 15} 100 q15 16 30 0`}
        fill="none"
        stroke={ink}
        strokeWidth="9"
        strokeLinecap="round"
      />
    );
  }
  if (kind === "half") {
    return (
      <g>
        <circle cx={cx} cy="104" r="12" fill={ink} />
        <path
          d={`M${cx - 14} 104 q14 -18 28 0 Z`}
          fill="#FFFFFF"
          stroke={ink}
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </g>
    );
  }
  return (
    <g>
      <circle cx={cx} cy="104" r="12.5" fill={ink} />
      <circle cx={cx - 4} cy="100" r="4" fill="#FFFFFF" />
    </g>
  );
};

export const CatFace: React.FC<CatFaceProps> = ({
  size,
  fur,
  ink,
  expression = "happy",
  blush = true,
}) => {
  const ex = EXPRESSIONS[expression];
  return (
    <svg width={size} height={size * (210 / 240)} viewBox="0 0 240 210">
      <g stroke={ink} strokeWidth="6" strokeLinejoin="round">
        <path d="M52 70 L30 12 L106 46 Z" fill={fur} />
        <path d="M188 70 L210 12 L134 46 Z" fill={fur} />
        <path d="M57 58 L46 28 L84 46 Z" fill="#FFAEC9" strokeWidth="0" />
        <path d="M183 58 L194 28 L156 46 Z" fill="#FFAEC9" strokeWidth="0" />
        <ellipse cx="120" cy="118" rx="88" ry="74" fill={fur} />
      </g>
      <g fill={ink} opacity="0.18">
        <path d="M96 46 l10 -18 l10 18 z" />
        <path d="M114 44 l8 -16 l8 16 z" opacity="0.7" />
      </g>
      <Eye kind={ex.left} cx={84} ink={ink} />
      <Eye kind={ex.right} cx={156} ink={ink} />
      <path
        d="M110 122 h20 l-10 13 z"
        fill="#FF6B8F"
        stroke={ink}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M120 138 q-11 13 -24 5 M120 138 q11 13 24 5"
        fill="none"
        stroke={ink}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <g stroke={ink} strokeWidth="4" strokeLinecap="round" opacity="0.85">
        <path d="M52 120 L14 110" fill="none" />
        <path d="M50 134 L12 136" fill="none" />
        <path d="M188 120 L226 110" fill="none" />
        <path d="M190 134 L228 136" fill="none" />
      </g>
      {blush ? (
        <g fill="#FF8FAB" opacity="0.55">
          <ellipse cx="66" cy="142" rx="15" ry="9" />
          <ellipse cx="174" cy="142" rx="15" ry="9" />
        </g>
      ) : null}
    </svg>
  );
};

export const PurrWaves: React.FC<{ size: number; color: string; flipped?: boolean }> = ({
  size,
  color,
  flipped = false,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 60 48"
      style={{ scale: flipped ? "-1 1" : "1 1" }}
    >
      {[0, 1, 2].map((i) => {
        const pulse = interpolate(
          Math.sin((frame + i * 6) / 4),
          [-1, 1],
          [0.25, 1],
        );
        return (
          <path
            key={i}
            d={`M${14 + i * 12} 6 q${-14 - i * 4} 18 0 36`}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            opacity={pulse}
          />
        );
      })}
    </svg>
  );
};
