import {
  forwardRef,
  type ReactNode,
} from "react";
import {
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Interactive,
  type InteractivitySchema,
  type InteractiveBaseProps,
  type SequenceControls,
} from "remotion";
import { SceneBackground } from "../components/Background";
import { CatFace } from "../graphics/Cat";
import { GRAPHICS } from "../graphics/Illustrations";
import { Heart, PawPrint, Sparkle } from "../graphics/decor";
import { FONT } from "../fonts";
import type { GraphicKey } from "../schema";

const rnd = (n: number) => {
  const x = Math.sin(n * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const usePunch = () => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, 12], [1.14, 1], { extrapolateRight: "clamp" });
};

type HookProps = InteractiveBaseProps & {
  readonly children?: ReactNode;
  readonly bgTop?: string;
  readonly bgBottom?: string;
  readonly ink?: string;
  readonly fur?: string;
  readonly controls?: SequenceControls;
};

const hookSchema = {
  ...Interactive.baseSchema,
  bgTop: { type: "color", default: "#FF9EC4", description: "Background top" },
  bgBottom: { type: "color", default: "#7C3AED", description: "Background bottom" },
  ink: { type: "color", default: "#2A0F4F", description: "Ink color" },
  fur: { type: "color", default: "#FFC96B", description: "Cat fur" },
} as const satisfies InteractivitySchema;

export const Hook = Interactive.withSchema({
  componentName: "<Hook>",
  supportsEffects: false,
  schema: hookSchema,
  Component: forwardRef<HTMLDivElement, HookProps>(
    ({ children, bgTop = "#FF9EC4", bgBottom = "#7C3AED", ink = "#2A0F4F", fur = "#FFC96B", name, controls, ...sequenceProps }, ref) => {
      const frame = useCurrentFrame();
      const { fps, height } = useVideoConfig();
      const punch = usePunch();
      const catRise = spring({
        frame: frame - 40,
        fps,
        config: { damping: 9, stiffness: 110, mass: 0.9 },
      });
      const catY = interpolate(catRise, [0, 1], [height * 0.45, 0]);
      const wiggle = interpolate(Math.sin(frame / 12), [-1, 1], [-3, 3]);

      return (
        <Sequence {...sequenceProps} name={name ?? "<Hook>"} controls={controls} ref={ref}>
          <div style={{ position: "absolute", inset: 0, scale: punch }}>
            <SceneBackground top={bgTop} bottom={bgBottom} ink={ink} seed={1} paws={7} />
          </div>
          <div style={{ position: "absolute", inset: 0, scale: punch }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "44%",
                display: "flex",
                justifyContent: "center",
                translate: `0 ${catY}px`,
                rotate: `${wiggle}deg`,
              }}
            >
              <div style={{ position: "relative" }}>
                <CatFace size={440} fur={fur} ink={ink} expression="wow" />
                <div style={{ position: "absolute", left: -115, top: 40, rotate: "-20deg" }}>
                  <PawPrint size={52} fill="#FFFFFF" />
                </div>
                <div style={{ position: "absolute", right: -105, top: 85, rotate: "24deg" }}>
                  <PawPrint size={52} fill="#FFD60A" />
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "4%",
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                gap: 44,
              }}
            >
              {[0, 1, 2, 3, 4].map((i) => {
                const step = spring({
                  frame: frame - 58 - i * 7,
                  fps,
                  config: { damping: 7, stiffness: 200 },
                });
                return (
                  <div
                    key={i}
                    style={{
                      opacity: interpolate(step, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
                      scale: step,
                      rotate: `${i % 2 === 0 ? -16 : 14}deg`,
                    }}
                  >
                    <PawPrint size={46} fill="#FFFFFF" />
                  </div>
                );
              })}
            </div>
          </div>
          {children}
        </Sequence>
      );
    },
  ),
});

type FactProps = InteractiveBaseProps & {
  readonly children?: ReactNode;
  readonly graphic?: GraphicKey;
  readonly bgTop?: string;
  readonly bgBottom?: string;
  readonly accent?: string;
  readonly ink?: string;
  readonly fur?: string;
  readonly seed?: number;
  readonly controls?: SequenceControls;
};

const factSchema = {
  ...Interactive.baseSchema,
  graphic: {
    type: "enum",
    default: "clowder",
    description: "Illustration",
    variants: {
      clowder: {},
      sweet: {},
      ears: {},
      purr: {},
      sleep: {},
    },
  },
  bgTop: { type: "color", default: "#BEF8E8", description: "Background top" },
  bgBottom: { type: "color", default: "#2EC4B6", description: "Background bottom" },
  accent: { type: "color", default: "#FF5D8F", description: "Accent color" },
  ink: { type: "color", default: "#0E3B36", description: "Ink color" },
  fur: { type: "color", default: "#FFC96B", description: "Cat fur" },
  seed: { type: "number", hiddenFromList: false, step: 1, default: 2, description: "Background seed", integer: true },
} as const satisfies InteractivitySchema;

export const Fact = Interactive.withSchema({
  componentName: "<Fact>",
  supportsEffects: false,
  schema: factSchema,
  Component: forwardRef<HTMLDivElement, FactProps>(
    (
      {
        children,
        graphic = "clowder",
        bgTop = "#BEF8E8",
        bgBottom = "#2EC4B6",
        accent = "#FF5D8F",
        ink = "#0E3B36",
        fur = "#FFC96B",
        seed = 2,
        name,
        controls,
        ...sequenceProps
      },
      ref,
    ) => {
      const frame = useCurrentFrame();
      const { fps } = useVideoConfig();
      const punch = usePunch();
      const Art = GRAPHICS[graphic] ?? GRAPHICS.clowder;

      return (
        <Sequence {...sequenceProps} name={name ?? "<Fact>"} controls={controls} ref={ref}>
          <SceneBackground top={bgTop} bottom={bgBottom} ink={ink} seed={seed} paws={6} />
          <div
            style={{
              position: "absolute",
              top: "21%",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              scale: punch,
            }}
          >
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 60,
                border: `8px solid ${ink}`,
                boxShadow: "0 16px 0 rgba(0,0,0,0.20)",
                padding: "44px 52px 52px",
                scale: spring({
                  frame: frame - 10,
                  fps,
                  config: { damping: 8, stiffness: 120, mass: 0.8 },
                }),
              }}
            >
              <Art fur={fur} ink={ink} accent={accent} />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "4%",
              right: "7%",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 34,
              color: "rgba(255,255,255,0.85)",
              textShadow: `0 3px 0 ${ink}`,
              rotate: "-6deg",
            }}
          >
            meow~
          </div>
          {children}
        </Sequence>
      );
    },
  ),
});

type OutroProps = InteractiveBaseProps & {
  readonly children?: ReactNode;
  readonly bgTop?: string;
  readonly bgBottom?: string;
  readonly ink?: string;
  readonly fur?: string;
  readonly controls?: SequenceControls;
};

const outroSchema = {
  ...Interactive.baseSchema,
  bgTop: { type: "color", default: "#FFB35C", description: "Background top" },
  bgBottom: { type: "color", default: "#FF3D8F", description: "Background bottom" },
  ink: { type: "color", default: "#4F0F2A", description: "Ink color" },
  fur: { type: "color", default: "#FFFFFF", description: "Cat fur" },
} as const satisfies InteractivitySchema;

export const Outro = Interactive.withSchema({
  componentName: "<Outro>",
  supportsEffects: false,
  schema: outroSchema,
  Component: forwardRef<HTMLDivElement, OutroProps>(
    ({ children, bgTop = "#FFB35C", bgBottom = "#FF3D8F", ink = "#4F0F2A", fur = "#FFFFFF", name, controls, ...sequenceProps }, ref) => {
      const frame = useCurrentFrame();
      const { fps, width, height } = useVideoConfig();
      const cat = spring({
        frame: frame - 8,
        fps,
        config: { damping: 8, stiffness: 110, mass: 0.9 },
      });

      return (
        <Sequence {...sequenceProps} name={name ?? "<Outro>"} controls={controls} ref={ref}>
          <SceneBackground top={bgTop} bottom={bgBottom} ink={ink} seed={5} paws={5} />
          {Array.from({ length: 9 }, (_, i) => {
            const at = 30 + i * 5;
            const p = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 60 } });
            const x = rnd(i * 3 + 1) * width * 0.9 + width * 0.05;
            const startY = height * (0.55 + rnd(i * 7 + 2) * 0.4);
            const y = interpolate(p, [0, 1], [startY, startY - height * (0.3 + rnd(i) * 0.3)]);
            const size = 34 + rnd(i + 9) * 46;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  opacity:
                    p < 0.05
                      ? 0
                      : interpolate(frame - at, [10, 60], [1, 0], {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        }),
                  rotate: `${(rnd(i) - 0.5) * 40 + interpolate(frame - at, [0, 60], [0, 30])}deg`,
                }}
              >
                {i % 3 === 0 ? (
                  <PawPrint size={size} fill="#FFFFFF" />
                ) : i % 3 === 1 ? (
                  <Heart size={size} fill="#FFE14D" />
                ) : (
                  <Sparkle size={size} fill="#FFFFFF" />
                )}
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "12%",
              display: "flex",
              justifyContent: "center",
              scale: cat,
              rotate: `${interpolate(Math.sin(frame / 14), [-1, 1], [-4, 4])}deg`,
            }}
          >
            <CatFace size={400} fur={fur} ink={ink} expression="wink" />
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "6%",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 40,
                color: "#FFFFFF",
                background: "rgba(79,15,42,0.55)",
                padding: "10px 30px",
                borderRadius: 999,
                opacity: interpolate(frame, [84, 94], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              no audio? purr-fect for textless scrolling
            </div>
          </div>
          {children}
        </Sequence>
      );
    },
  ),
});
