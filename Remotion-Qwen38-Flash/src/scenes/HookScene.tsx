import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SceneBackground } from "../components/Background";
import { PopWords } from "../components/WordCaption";
import { CatFace } from "../graphics/Cat";
import { PawPrint } from "../graphics/decor";
import { FONT } from "../fonts";

export const HOOK_FRAMES = 100;

export const HookScene: React.FC<{
  hookLine1: string;
  hookLine2: string;
}> = ({ hookLine1, hookLine2 }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  const punch = interpolate(frame, [0, 12], [1.16, 1], {
    extrapolateRight: "clamp",
  });

  const catRise = spring({
    frame: frame - 40,
    fps,
    config: { damping: 9, stiffness: 110, mass: 0.9 },
  });
  const catY = interpolate(catRise, [0, 1], [height * 0.45, 0]);
  const wiggle = interpolate(Math.sin(frame / 12), [-1, 1], [-3, 3]);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, scale: punch }}>
        <SceneBackground top="#FF9EC4" bottom="#7C3AED" ink="#2A0F4F" seed={1} paws={7} />
      </div>
      <div style={{ position: "absolute", inset: 0, scale: punch }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
          top: "13%",
          display: "flex",
          justifyContent: "center",
        }}
        >
          <PopWords
            text={hookLine1}
            startFrame={4}
            staggerFrames={9}
            fontSize={150}
            color="#FFFFFF"
            ink="#2A0F4F"
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "48%",
            display: "flex",
            justifyContent: "center",
            translate: `0 ${catY}px`,
            rotate: `${wiggle}deg`,
          }}
        >
          <div style={{ position: "relative" }}>
            <CatFace size={380} fur="#FFC96B" ink="#2A0F4F" expression="wow" />
            <div style={{ position: "absolute", left: -120, top: 40, rotate: "-20deg" }}>
              <PawPrint size={54} fill="#FFFFFF" />
            </div>
            <div style={{ position: "absolute", right: -110, top: 90, rotate: "24deg" }}>
              <PawPrint size={54} fill="#FFD60A" />
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
          top: "78%",
          display: "flex",
          justifyContent: "center",
        }}
        >
          <PopWords
            text={hookLine2}
            startFrame={62}
            staggerFrames={5}
            fontSize={72}
            color="#FFD60A"
            ink="#2A0F4F"
          />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "5%",
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
      <div style={{ fontFamily: FONT }} />
    </AbsoluteFill>
  );
};
