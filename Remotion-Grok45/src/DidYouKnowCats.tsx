import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const didYouKnowCatsSchema = z.object({
  hookText: z.string(),
  factLine1: z.string(),
  factLine2: z.string(),
  highlightNumber: z.string(),
  highlightLabel: z.string(),
  tagline: z.string(),
  endCta: z.string(),
  catName: z.string(),
  backgroundTop: zColor(),
  backgroundBottom: zColor(),
  accentPink: zColor(),
  accentYellow: zColor(),
  accentMint: zColor(),
  accentLavender: zColor(),
  cardColor: zColor(),
  textColor: zColor(),
  highlightColor: zColor(),
});

export type DidYouKnowCatsProps = z.infer<typeof didYouKnowCatsSchema>;

const fontFamily =
  'system-ui, "Segoe UI Rounded", "Arial Rounded MT Bold", sans-serif';

export const DidYouKnowCats: React.FC<DidYouKnowCatsProps> = ({
  hookText,
  factLine1,
  factLine2,
  highlightNumber,
  highlightLabel,
  tagline,
  endCta,
  catName,
  backgroundTop,
  backgroundBottom,
  accentPink,
  accentYellow,
  accentMint,
  accentLavender,
  cardColor,
  textColor,
  highlightColor,
}) => {
  const frame = useCurrentFrame();

  const hookWords = hookText.split(" ");
  const line1Words = factLine1.split(" ");
  const line2Words = factLine2.split(" ");
  const taglineWords = tagline.split(" ");

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, ${backgroundTop}, ${backgroundBottom})`,
        fontFamily,
        overflow: "hidden",
      }}
    >
      <Interactive.Div
        name="Background blob pink"
        style={{
          position: "absolute",
          left: -100,
          top: -80,
          width: 420,
          height: 420,
          borderRadius: "50%",
          backgroundColor: accentPink,
          opacity: 0.18,
          filter: "blur(10px)",
        }}
      />
      <Interactive.Div
        name="Background blob mint"
        style={{
          position: "absolute",
          right: -100,
          bottom: 200,
          width: 380,
          height: 380,
          borderRadius: "50%",
          backgroundColor: accentMint,
          opacity: 0.2,
          filter: "blur(10px)",
        }}
      />
      <Interactive.Div
        name="Background blob yellow"
        style={{
          position: "absolute",
          left: 40,
          top: 500,
          width: 260,
          height: 260,
          borderRadius: "50%",
          backgroundColor: accentYellow,
          opacity: 0.22,
          filter: "blur(8px)",
        }}
      />
      <Interactive.Div
        name="Decor: heart NW"
        style={{
          position: "absolute",
          left: 80,
          top: 160,
          opacity: interpolate(frame, [0, 18], [0, 0.85], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 18], [0.4, 1], {
            easing: Easing.out(Easing.back(1.4)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 58, 90, 180, 270, 360],
            [
              "0px 0px",
              "3.9px -6.4px",
              "6px -10px",
              "0px 0px",
              "-6px 10px",
              "0px 0px",
            ],
          ),
          rotate: interpolate(frame, [0, 180, 360], ["-8deg", "8deg", "-8deg"]),
        }}
      >
        <svg width={36} height={36} viewBox="0 0 40 40">
          <path
            d="M20 34 C20 34 4 24 4 14 C4 8 8 5 12 5 C16 5 18 8 20 11 C22 8 24 5 28 5 C32 5 36 8 36 14 C36 24 20 34 20 34Z"
            fill={accentPink}
          />
        </svg>
      </Interactive.Div>
      <Interactive.Div
        name="Decor: yarn NE"
        style={{
          position: "absolute",
          left: 900,
          top: 280,
          opacity: interpolate(frame, [4, 22], [0, 0.85], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [4, 22], [0.4, 1], {
            easing: Easing.out(Easing.back(1.4)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 90, 180, 270, 360],
            ["0px 0px", "-8px 8px", "0px 0px", "8px -8px", "0px 0px"],
          ),
          rotate: interpolate(
            frame,
            [0, 180, 360],
            ["10deg", "-10deg", "10deg"],
          ),
        }}
      >
        <svg width={48} height={48} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill={accentYellow} />
          <path
            d="M10 20 C18 16 30 16 38 20 M8 26 C18 22 30 22 40 26 M12 32 C20 28 28 28 36 32"
            stroke="#ffffff"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />
        </svg>
      </Interactive.Div>
      <Interactive.Div
        name="Decor: paw left"
        style={{
          position: "absolute",
          left: 140,
          top: 900,
          opacity: interpolate(frame, [8, 28], [0, 0.85], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [8, 28], [0.4, 1], {
            easing: Easing.out(Easing.back(1.4)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 100, 200, 300, 360],
            ["0px 0px", "0px -12px", "0px 0px", "0px 12px", "0px 0px"],
          ),
          rotate: interpolate(frame, [0, 180, 360], ["-6deg", "6deg", "-6deg"]),
        }}
      >
        <svg width={44} height={44} viewBox="0 0 48 48">
          <ellipse cx="24" cy="30" rx="12" ry="10" fill={accentLavender} />
          <circle cx="10" cy="18" r="5" fill={accentLavender} />
          <circle cx="20" cy="12" r="5.5" fill={accentLavender} />
          <circle cx="32" cy="12" r="5.5" fill={accentLavender} />
          <circle cx="38" cy="18" r="5" fill={accentLavender} />
        </svg>
      </Interactive.Div>
      <Interactive.Div
        name="Decor: fish right"
        style={{
          position: "absolute",
          left: 860,
          top: 1100,
          opacity: interpolate(frame, [12, 32], [0, 0.85], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [12, 32], [0.4, 1], {
            easing: Easing.out(Easing.back(1.4)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 90, 180, 270, 360],
            ["0px 0px", "10px 0px", "0px 0px", "-10px 0px", "0px 0px"],
          ),
        }}
      >
        <svg width={52} height={30} viewBox="0 0 56 32">
          <ellipse cx="26" cy="16" rx="18" ry="11" fill={accentMint} />
          <path d="M42 16 L54 6 L50 16 L54 26 Z" fill={accentMint} />
          <circle cx="16" cy="14" r="2.5" fill="#2D1B4E" />
        </svg>
      </Interactive.Div>
      <Interactive.Div
        name="Decor: star top"
        style={{
          position: "absolute",
          left: 540,
          top: 120,
          opacity: interpolate(frame, [2, 18], [0, 0.9], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [2, 18], [0.3, 1], {
            easing: Easing.out(Easing.back(1.6)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: interpolate(frame, [0, 360], ["0deg", "360deg"]),
        }}
      >
        <svg width={28} height={28} viewBox="0 0 40 40">
          <path
            d="M20 4 L24 14 L35 14 L26 21 L29 32 L20 25 L11 32 L14 21 L5 14 L16 14 Z"
            fill={accentPink}
          />
        </svg>
      </Interactive.Div>
      <Interactive.Div
        name="Decor: yarn SW"
        style={{
          position: "absolute",
          left: 70,
          top: 1200,
          opacity: interpolate(frame, [16, 36], [0, 0.85], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [16, 36], [0.4, 1], {
            easing: Easing.out(Easing.back(1.4)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 120, 240, 360],
            ["0px 0px", "0px -14px", "0px 0px", "0px 14px"],
          ),
        }}
      >
        <svg width={42} height={42} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill={accentMint} />
          <path
            d="M10 20 C18 16 30 16 38 20 M8 26 C18 22 30 22 40 26 M12 32 C20 28 28 28 36 32"
            stroke="#ffffff"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />
        </svg>
      </Interactive.Div>
      <Interactive.Div
        name="Decor: heart SE"
        style={{
          position: "absolute",
          left: 920,
          top: 1600,
          opacity: interpolate(frame, [20, 40], [0, 0.85], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [20, 40], [0.4, 1], {
            easing: Easing.out(Easing.back(1.4)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 100, 200, 300, 360],
            ["0px 0px", "0px -10px", "0px 0px", "0px 10px", "0px 0px"],
          ),
        }}
      >
        <svg width={30} height={30} viewBox="0 0 40 40">
          <path
            d="M20 34 C20 34 4 24 4 14 C4 8 8 5 12 5 C16 5 18 8 20 11 C22 8 24 5 28 5 C32 5 36 8 36 14 C36 24 20 34 20 34Z"
            fill={accentPink}
          />
        </svg>
      </Interactive.Div>
      <Interactive.Div
        name="Decor: star SW"
        style={{
          position: "absolute",
          left: 120,
          top: 1500,
          opacity: interpolate(frame, [18, 38], [0, 0.9], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [18, 38], [0.3, 1], {
            easing: Easing.out(Easing.back(1.6)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: interpolate(frame, [0, 360], ["0deg", "-360deg"]),
        }}
      >
        <svg width={34} height={34} viewBox="0 0 40 40">
          <path
            d="M20 4 L24 14 L35 14 L26 21 L29 32 L20 25 L11 32 L14 21 L5 14 L16 14 Z"
            fill={accentYellow}
          />
        </svg>
      </Interactive.Div>
      <Interactive.Div
        name="Hook badge"
        style={{
          position: "absolute",
          left: 140,
          top: 72,
          width: 800,
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(frame, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 16], [0.6, 1], {
            easing: Easing.out(Easing.back(1.5)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Interactive.Div
          name="Hook badge surface"
          style={{
            background: `linear-gradient(135deg, ${accentPink}, #FF8EC8)`,
            borderRadius: 28,
            padding: "22px 36px",
            boxShadow: `0 12px 0 ${accentYellow}, 0 22px 40px rgba(255, 107, 181, 0.35)`,
            display: "flex",
            gap: 14,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {hookWords.map((word, i) => (
            <Interactive.Span
              key={`hook-${i}`}
              name={`Hook word: ${word}`}
              style={{
                color: "#FFFFFF",
                fontFamily,
                fontWeight: 900,
                fontSize: 54,
                letterSpacing: 2,
                display: "inline-block",
                opacity: interpolate(frame - i * 3, [0, 10], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                translate: interpolate(
                  frame - i * 3,
                  [0, 12],
                  ["0px 24px", "0px 0px"],
                  {
                    easing: Easing.out(Easing.cubic),
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                ),
                scale: interpolate(frame - i * 3, [0, 12], [0.7, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {word}
            </Interactive.Span>
          ))}
        </Interactive.Div>
      </Interactive.Div>
      <Interactive.Div
        name="Sparkle 1"
        style={{
          position: "absolute",
          left: 150,
          top: 60,
          fontSize: 28,
          opacity: interpolate(frame, [8, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [8, 18], [0, 1], {
            easing: Easing.out(Easing.back(2)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: interpolate(frame, [8, 68], ["0deg", "90deg"]),
        }}
      >
        ✨
      </Interactive.Div>
      <Interactive.Div
        name="Sparkle 2"
        style={{
          position: "absolute",
          left: 900,
          top: 65,
          fontSize: 28,
          opacity: interpolate(frame, [12, 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [12, 22], [0, 1], {
            easing: Easing.out(Easing.back(2)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: interpolate(frame, [12, 72], ["0deg", "-90deg"]),
        }}
      >
        ✨
      </Interactive.Div>
      <Interactive.Div
        name="Cat character"
        style={{
          position: "absolute",
          left: 330,
          top: 200,
          width: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: interpolate(frame, [20, 40], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [20, 42], [0.25, 1], {
            easing: Easing.out(Easing.back(1.3)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [20, 42, 90, 150, 210, 270, 330, 360],
            [
              "0px 100px",
              "0px 0px",
              "0px -6px",
              "0px 0px",
              "0px -6px",
              "0px 0px",
              "0px -4px",
              "0px 0px",
            ],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        <Interactive.Svg
          name="Cat body SVG"
          width={420}
          height={420}
          viewBox="0 0 420 420"
        >
          <Interactive.Ellipse
            name="Cat shadow"
            cx={210}
            cy={390}
            rx={90}
            ry={18}
            fill={textColor}
            opacity={0.08}
          />
          <Interactive.G
            name="Cat tail"
            style={{
              rotate: interpolate(
                frame,
                [20, 80, 140, 200, 260, 320, 360],
                [
                  "-12deg",
                  "12deg",
                  "-12deg",
                  "12deg",
                  "-12deg",
                  "12deg",
                  "-8deg",
                ],
              ),
              transformOrigin: "300px 280px",
            }}
          >
            <path
              d="M280 260 C340 220 370 180 360 130 C355 110 340 105 330 120 C320 140 300 190 275 240"
              fill={accentLavender}
            />
            <path
              d="M330 120 C338 108 352 112 348 128 C342 148 325 180 310 210"
              fill={accentPink}
              opacity={0.9}
            />
          </Interactive.G>
          <Interactive.Ellipse
            name="Cat body"
            cx={210}
            cy={300}
            rx={110}
            ry={90}
            fill={accentLavender}
          />
          <Interactive.Ellipse
            name="Cat belly"
            cx={210}
            cy={310}
            rx={70}
            ry={55}
            fill="#FFF8FF"
            opacity={0.95}
          />
          <Interactive.Ellipse
            name="Cat leg left"
            cx={145}
            cy={360}
            rx={28}
            ry={34}
            fill={accentLavender}
          />
          <Interactive.Ellipse
            name="Cat leg right"
            cx={275}
            cy={360}
            rx={28}
            ry={34}
            fill={accentLavender}
          />
          <Interactive.Ellipse
            name="Cat paw left"
            cx={145}
            cy={385}
            rx={24}
            ry={12}
            fill={accentPink}
          />
          <Interactive.Ellipse
            name="Cat paw right"
            cx={275}
            cy={385}
            rx={24}
            ry={12}
            fill={accentPink}
          />
          <Interactive.Circle
            name="Cat head"
            cx={210}
            cy={175}
            r={100}
            fill={accentLavender}
          />
          <Interactive.G
            name="Cat left ear"
            style={{
              rotate: interpolate(
                frame,
                [20, 140, 160, 180, 200, 220, 240, 360],
                [
                  "0deg",
                  "0deg",
                  "-16deg",
                  "16deg",
                  "-16deg",
                  "16deg",
                  "0deg",
                  "0deg",
                ],
              ),
              transformOrigin: "145px 95px",
            }}
          >
            <path d="M90 160 L120 45 L185 115 Z" fill={accentLavender} />
            <path d="M110 145 L125 70 L170 120 Z" fill={accentPink} />
          </Interactive.G>
          <Interactive.G
            name="Cat right ear"
            style={{
              rotate: interpolate(
                frame,
                [20, 140, 160, 180, 200, 220, 240, 360],
                [
                  "0deg",
                  "0deg",
                  "16deg",
                  "-16deg",
                  "16deg",
                  "-16deg",
                  "0deg",
                  "0deg",
                ],
              ),
              transformOrigin: "275px 95px",
            }}
          >
            <path d="M330 160 L300 45 L235 115 Z" fill={accentLavender} />
            <path d="M310 145 L295 70 L250 120 Z" fill={accentPink} />
          </Interactive.G>
          <Interactive.Circle
            name="Cat cheek left"
            cx={140}
            cy={195}
            r={22}
            fill={accentPink}
            opacity={0.45}
          />
          <Interactive.Circle
            name="Cat cheek right"
            cx={280}
            cy={195}
            r={22}
            fill={accentPink}
            opacity={0.45}
          />
          <Interactive.Ellipse
            name="Cat eye left"
            cx={165}
            cy={170}
            rx={22}
            ry={28}
            fill="#2D1B4E"
          />
          <Interactive.Circle
            name="Cat eye left shine"
            cx={172}
            cy={160}
            r={8}
            fill="#FFFFFF"
          />
          <Interactive.Ellipse
            name="Cat eye right"
            cx={255}
            cy={170}
            rx={22}
            ry={28}
            fill="#2D1B4E"
          />
          <Interactive.Circle
            name="Cat eye right shine"
            cx={262}
            cy={160}
            r={8}
            fill="#FFFFFF"
          />
          <Interactive.Path
            name="Cat nose"
            d="M200 200 L220 200 L210 212 Z"
            fill={accentPink}
          />
          <Interactive.Path
            name="Cat mouth"
            d="M210 212 C210 224 198 230 190 224 M210 212 C210 224 222 230 230 224"
            stroke="#2D1B4E"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <Interactive.Circle
            name="Cat collar bell"
            cx={210}
            cy={275}
            r={14}
            fill={accentYellow}
          />
          <Interactive.Path
            name="Cat bow left"
            d="M180 270 L200 278 L180 290 Z"
            fill={accentMint}
          />
          <Interactive.Path
            name="Cat bow right"
            d="M240 270 L220 278 L240 290 Z"
            fill={accentMint}
          />
        </Interactive.Svg>

        <Interactive.Div
          name="Cat name tag"
          style={{
            marginTop: -12,
            padding: "8px 22px",
            borderRadius: 999,
            backgroundColor: accentYellow,
            color: textColor,
            fontFamily,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: 1,
            boxShadow: "0 8px 0 rgba(45, 27, 78, 0.12)",
          }}
        >
          {catName}
        </Interactive.Div>
      </Interactive.Div>
      <Interactive.Div
        name="Caption card"
        style={{
          position: "absolute",
          left: 48,
          top: 700,
          width: 984,
          backgroundColor: cardColor,
          borderRadius: 36,
          padding: "36px 28px 40px",
          border: `4px solid ${accentYellow}`,
          boxShadow: `0 16px 0 ${accentMint}, 0 28px 50px rgba(45, 27, 78, 0.12)`,
          opacity: interpolate(frame, [70, 90], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [70, 92], ["0px 60px", "0px 0px"], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [70, 92], [0.92, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          textAlign: "center",
        }}
      >
        <Interactive.Div
          name="Fact line 1 row"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {line1Words.map((word, i) => (
            <Interactive.Span
              key={`fact1-${i}`}
              name={`Caption word: ${word}`}
              style={{
                color: textColor,
                fontFamily,
                fontWeight: 800,
                fontSize: 44,
                display: "inline-block",
                opacity: interpolate(frame, [78 + i * 3, 90 + i * 3], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                translate: interpolate(
                  frame,
                  [78 + i * 3, 92 + i * 3],
                  ["0px 28px", "0px 0px"],
                  {
                    easing: Easing.out(Easing.cubic),
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                ),
                scale: interpolate(frame, [78 + i * 3, 92 + i * 3], [0.85, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {word}
            </Interactive.Span>
          ))}
        </Interactive.Div>

        <Interactive.Div
          name="Highlight callout"
          style={{
            margin: "20px auto",
            width: 260,
            background: `linear-gradient(135deg, ${highlightColor}, #FF8A5B)`,
            borderRadius: 28,
            padding: "16px 40px 10px",
            boxShadow: `0 10px 0 ${accentYellow}`,
            opacity: interpolate(frame, [110, 126], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [110, 128], [0.4, 1], {
              easing: Easing.out(Easing.back(1.6)),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Interactive.Div
            name="Highlight number"
            style={{
              fontFamily,
              fontWeight: 900,
              fontSize: 110,
              lineHeight: 0.9,
              color: "#FFFFFF",
              letterSpacing: -2,
              textAlign: "center",
            }}
          >
            {highlightNumber}
          </Interactive.Div>
          <Interactive.Div
            name="Highlight label"
            style={{
              fontFamily,
              fontWeight: 900,
              fontSize: 36,
              color: "#FFFFFF",
              letterSpacing: 6,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            {highlightLabel}
          </Interactive.Div>
        </Interactive.Div>

        <Interactive.Div
          name="Fact line 2 row"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            marginTop: 12,
          }}
        >
          {line2Words.map((word, i) => (
            <Interactive.Span
              key={`fact2-${i}`}
              name={`Caption word: ${word}`}
              style={{
                color: textColor,
                fontFamily,
                fontWeight: 800,
                fontSize: 44,
                display: "inline-block",
                opacity: interpolate(
                  frame,
                  [145 + i * 3, 157 + i * 3],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                ),
                translate: interpolate(
                  frame,
                  [145 + i * 3, 159 + i * 3],
                  ["0px 28px", "0px 0px"],
                  {
                    easing: Easing.out(Easing.cubic),
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                ),
                scale: interpolate(
                  frame,
                  [145 + i * 3, 159 + i * 3],
                  [0.85, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                ),
              }}
            >
              {word}
            </Interactive.Span>
          ))}
        </Interactive.Div>
      </Interactive.Div>
      <Interactive.Div
        name="Tagline bubble"
        style={{
          position: "absolute",
          left: 90,
          top: 1180,
          width: 900,
          backgroundColor: "rgba(255,255,255,0.92)",
          borderRadius: 24,
          padding: "20px 28px",
          boxShadow: "0 10px 30px rgba(45, 27, 78, 0.1)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
          opacity: interpolate(frame, [200, 220], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [200, 222], ["0px 40px", "0px 0px"], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {taglineWords.map((word, i) => (
          <Interactive.Span
            key={`tag-${i}`}
            name={`Tagline word: ${word}`}
            style={{
              color: textColor,
              fontFamily,
              fontWeight: 700,
              fontSize: 32,
              display: "inline-block",
              opacity: interpolate(frame, [205 + i * 3, 217 + i * 3], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [205 + i * 3, 219 + i * 3],
                ["0px 20px", "0px 0px"],
                {
                  easing: Easing.out(Easing.cubic),
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            {word}
          </Interactive.Span>
        ))}
      </Interactive.Div>
      <Interactive.Div
        name="Caption progress bar"
        style={{
          position: "absolute",
          left: 400,
          top: 1320,
          height: 8,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${highlightColor}, ${accentYellow})`,
          width: interpolate(frame, [200, 320], [0, 280], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          opacity: interpolate(frame, [200, 220], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <Interactive.Div
        name="End CTA group"
        style={{
          position: "absolute",
          left: 340,
          top: 1480,
          width: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: interpolate(frame, [300, 320], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [300, 324], [0.5, 1], {
            easing: Easing.out(Easing.back(1.4)),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Interactive.Div
          name="End ring outer"
          style={{
            position: "absolute",
            width: interpolate(frame, [300, 340], [120, 300], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            height: interpolate(frame, [300, 340], [120, 300], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            borderRadius: "50%",
            border: `6px solid ${accentPink}`,
            opacity: interpolate(frame, [300, 340], [0.7, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            top: 20,
          }}
        />
        <Interactive.Div
          name="End heart badge"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accentPink}, ${accentYellow})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            boxShadow: "0 10px 30px rgba(255,107,181,0.4)",
            zIndex: 2,
          }}
        >
          😻
        </Interactive.Div>
        <Interactive.Div
          name="End CTA text"
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 36,
            color: textColor,
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: "12px 28px",
            borderRadius: 999,
            boxShadow: `0 8px 0 ${accentMint}`,
          }}
        >
          {endCta}
        </Interactive.Div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DidYouKnowCats"
        component={DidYouKnowCats}
        durationInFrames={360}
        fps={30}
        width={1080}
        height={1920}
        schema={didYouKnowCatsSchema}
        defaultProps={{
          hookText: "DID YOU KNOW?",
          factLine1: "Cats have",
          factLine2: "in each ear!",
          highlightNumber: "32",
          highlightLabel: "MUSCLES",
          tagline: "They can spin their ears 180° like tiny sonar dishes",
          endCta: "Follow for more 🐾",
          catName: "Mochi",
          backgroundTop: "#FFE8F5",
          backgroundBottom: "#E8F4FF",
          accentPink: "#FF6BB5",
          accentYellow: "#FFD93D",
          accentMint: "#6BFFB8",
          accentLavender: "#C4A1FF",
          cardColor: "#FFFFFF",
          textColor: "#2D1B4E",
          highlightColor: "#FF4D8D",
        }}
      />
    </>
  );
};
