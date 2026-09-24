import React from "react";

export type CatEyeStyle = "open" | "happy" | "sleepy";

type CatFaceProps = {
  size: number;
  mainColor: string;
  accentColor: string;
  eyeColor?: string;
  eyeStyle?: CatEyeStyle;
  earWiggle?: number;
  stickerColor?: string | null;
};

const EYE = "#4A342E";

export const CatFace: React.FC<CatFaceProps> = ({
  size,
  mainColor,
  accentColor,
  eyeColor = EYE,
  eyeStyle = "open",
  earWiggle = 0,
  stickerColor = "#FFFFFF",
}) => {
  const stickerWidth = 20;

  const earOuterLeft = "M92 168 L80 56 L188 108 Z";
  const earOuterRight = "M308 168 L320 56 L212 108 Z";
  const earInnerLeft = "M102 150 L95 85 L158 116 Z";
  const earInnerRight = "M298 150 L305 85 L242 116 Z";

  const eyes = () => {
    if (eyeStyle === "open") {
      return (
        <>
          <ellipse cx="152" cy="225" rx="16" ry="23" fill={eyeColor} />
          <ellipse cx="248" cy="225" rx="16" ry="23" fill={eyeColor} />
          <circle cx="146" cy="215" r="6" fill="#FFFFFF" />
          <circle cx="157" cy="234" r="3" fill="#FFFFFF" />
          <circle cx="242" cy="215" r="6" fill="#FFFFFF" />
          <circle cx="253" cy="234" r="3" fill="#FFFFFF" />
        </>
      );
    }
    if (eyeStyle === "happy") {
      return (
        <>
          <path
            d="M132 230 Q152 205 172 230"
            stroke={eyeColor}
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M228 230 Q248 205 268 230"
            stroke={eyeColor}
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    }
    return (
      <>
        <path
          d="M132 222 Q152 243 172 222"
          stroke={eyeColor}
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M228 222 Q248 243 268 222"
          stroke={eyeColor}
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />
      </>
    );
  };

  return (
    <svg width={size} height={size} viewBox="0 0 400 400" fill="none">
      <g transform={`rotate(${-earWiggle} 130 155)`}>
        {stickerColor ? (
          <path
            d={earOuterLeft}
            fill={stickerColor}
            stroke={stickerColor}
            strokeWidth={stickerWidth}
            strokeLinejoin="round"
          />
        ) : null}
        <path
          d={earOuterLeft}
          fill={mainColor}
          stroke={mainColor}
          strokeWidth={14}
          strokeLinejoin="round"
        />
        <path
          d={earInnerLeft}
          fill={accentColor}
          stroke={accentColor}
          strokeWidth={8}
          strokeLinejoin="round"
        />
      </g>
      <g transform={`rotate(${earWiggle} 270 155)`}>
        {stickerColor ? (
          <path
            d={earOuterRight}
            fill={stickerColor}
            stroke={stickerColor}
            strokeWidth={stickerWidth}
            strokeLinejoin="round"
          />
        ) : null}
        <path
          d={earOuterRight}
          fill={mainColor}
          stroke={mainColor}
          strokeWidth={14}
          strokeLinejoin="round"
        />
        <path
          d={earInnerRight}
          fill={accentColor}
          stroke={accentColor}
          strokeWidth={8}
          strokeLinejoin="round"
        />
      </g>

      {stickerColor ? (
        <ellipse
          cx="200"
          cy="230"
          rx="152"
          ry="128"
          fill={stickerColor}
          stroke={stickerColor}
          strokeWidth={stickerWidth}
        />
      ) : null}
      <ellipse cx="200" cy="230" rx="152" ry="128" fill={mainColor} />

      <ellipse cx="112" cy="262" rx="26" ry="15" fill={accentColor} opacity="0.5" />
      <ellipse cx="288" cy="262" rx="26" ry="15" fill={accentColor} opacity="0.5" />

      {eyes()}

      <path
        d="M200 270 C191 259 184 254 184 247 A9 9 0 0 1 200 241 A9 9 0 0 1 216 247 C216 254 209 259 200 270 Z"
        fill={accentColor}
      />
      <path
        d="M200 270 L200 277 M200 277 Q187 292 172 279 M200 277 Q213 292 228 279"
        stroke={eyeColor}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />

      <g stroke={eyeColor} strokeWidth="6" strokeLinecap="round" opacity="0.7">
        <path d="M96 240 L32 226" />
        <path d="M96 256 L28 256" />
        <path d="M96 272 L32 288" />
        <path d="M304 240 L368 226" />
        <path d="M304 256 L372 256" />
        <path d="M304 272 L368 288" />
      </g>
    </svg>
  );
};
