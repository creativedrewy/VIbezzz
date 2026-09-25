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
import { Heart, PawPrint, Sparkle } from "../graphics/decor";
import { FONT } from "../fonts";

export const OUTRO_FRAMES = 110;

const rnd = (n: number) => {
  const x = Math.sin(n * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const OutroScene: React.FC<{
  outroLine: string;
  outroCta: string;
}> = ({ outroLine, outroCta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const punch = interpolate(frame, [0, 12], [1.14, 1], { extrapolateRight: "clamp" });

  const cat = spring({
    frame: frame - 8,
    fps,
    config: { damping: 8, stiffness: 110, mass: 0.9 },
  });

  const ctaWords = outroCta.split(" ").filter((w) => w.length > 0);
  const ctaDone = 34 + ctaWords.length * 6;

  return (
    <AbsoluteFill style={{ scale: punch }}>
      <SceneBackground top="#FFB35C" bottom="#FF3D8F" ink="#4F0F2A" seed={5} paws={5} />

      {Array.from({ length: 9 }, (_, i) => {
        const at = ctaDone - 20 + i * 5;
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
              opacity: p < 0.05 ? 0 : interpolate(frame - at, [10, 60], [1, 0], {
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
          top: "13%",
          display: "flex",
          justifyContent: "center",
          scale: cat,
          rotate: `${interpolate(Math.sin(frame / 14), [-1, 1], [-4, 4])}deg`,
        }}
      >
        <CatFace size={330} fur="#FFFFFF" ink="#4F0F2A" expression="wink" />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "43%",
          display: "flex",
          justifyContent: "center",
        }}
        >
          <PopWords
            text={outroLine}
            startFrame={20}
            staggerFrames={5}
            fontSize={62}
          color="#FFFFFF"
          ink="#4F0F2A"
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "54%",
          display: "flex",
          justifyContent: "center",
        }}
        >
          <PopWords
            text={outroCta}
            startFrame={34}
            staggerFrames={6}
            fontSize={100}
          color="#FFFFFF"
          ink="#4F0F2A"
          accentForWords={[ctaWords.length - 1]}
          accent="#FFE14D"
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "9%",
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
            opacity: interpolate(frame, [ctaDone + 16, ctaDone + 26], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          no audio? purr-fect for textless scrolling
        </div>
      </div>
    </AbsoluteFill>
  );
};
