import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../fonts";
import { CatFace, PurrWaves } from "./Cat";
import { Heart, IceCream, PawPrint, Sparkle, YarnBall, Fish } from "./decor";
import type { GraphicKey } from "../schema";

type IllustrationProps = {
  fur: string;
  ink: string;
  accent: string;
};

const usePopIn = (delayFrames: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 8, stiffness: 140, mass: 0.7 },
  });
};

const Bob: React.FC<{ children: React.ReactNode; amplitude?: number; speed?: number }> = ({
  children,
  amplitude = 10,
  speed = 26,
}) => {
  const frame = useCurrentFrame();
  const y = interpolate(Math.sin(frame / speed), [-1, 1], [-amplitude, amplitude]);
  return <div style={{ translate: `0 ${y}px` }}>{children}</div>;
};

export const ClowderIllustration: React.FC<IllustrationProps> = ({ fur, ink, accent }) => {
  const s = usePopIn(6);
  return (
    <div style={{ scale: s }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ translate: "0 34px", rotate: "-8deg", opacity: s }}>
          <Bob amplitude={6} speed={30}>
            <CatFace size={150} fur="#8EA8C3" ink={ink} expression="wink" />
          </Bob>
        </div>
        <div style={{ zIndex: 2, translate: "0 -10px" }}>
          <Bob amplitude={9} speed={24}>
            <CatFace size={210} fur={fur} ink={ink} expression="wow" />
          </Bob>
        </div>
        <div style={{ translate: "0 28px", rotate: "7deg", opacity: s }}>
          <Bob amplitude={6} speed={34}>
            <CatFace size={145} fur="#FFFFFF" ink={ink} expression="happy" />
          </Bob>
        </div>
      </div>
      <div style={{ position: "relative", height: 0 }}>
        <div style={{ position: "absolute", left: -250, top: 30, opacity: s }}>
          <YarnBall size={84} fill={accent} line={ink} />
        </div>
        <div style={{ position: "absolute", right: -240, top: 50, opacity: s }}>
          <Fish size={80} fill={accent} stroke={ink} strokeWidth={4} />
        </div>
      </div>
    </div>
  );
};

export const SweetIllustration: React.FC<IllustrationProps> = ({ fur, ink, accent }) => {
  const s = usePopIn(6);
  const scoop = usePopIn(20);
  return (
    <div style={{ scale: s, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ rotate: "-6deg" }}>
        <Bob amplitude={8}>
          <CatFace size={230} fur={fur} ink={ink} expression="sly" />
        </Bob>
      </div>
      <div style={{ scale: scoop, translate: "30px -20px", rotate: "10deg" }}>
        <IceCream size={130} ink={ink} scoop="#FFD8E4" accent={accent} />
      </div>
    </div>
  );
};

export const EarsIllustration: React.FC<IllustrationProps> = ({ fur, ink, accent }) => {
  const frame = useCurrentFrame();
  const s = usePopIn(6);
  const ring = interpolate(Math.sin(frame / 8), [-1, 1], [0.9, 1.12]);
  const badge = usePopIn(26);
  return (
    <div style={{ scale: s, position: "relative" }}>
      <CatFace size={250} fur={fur} ink={ink} expression="wow" />
      <div
        style={{
          position: "absolute",
          left: -28,
          top: -18,
          width: 130,
          height: 130,
          borderRadius: "50%",
          border: `7px dashed ${accent}`,
          scale: ring,
          rotate: `${frame * 1.2}deg`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -46,
          top: -6,
          scale: badge,
          background: accent,
          color: ink,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 62,
          padding: "8px 24px",
          borderRadius: 999,
          border: `6px solid ${ink}`,
          boxShadow: "0 8px 0 rgba(0,0,0,0.2)",
        }}
      >
        32!
      </div>
      <div style={{ position: "absolute", left: -180, bottom: -40 }}>
        <Sparkle size={50} fill="#FFFFFF" />
      </div>
    </div>
  );
};

export const PurrIllustration: React.FC<IllustrationProps> = ({ fur, ink, accent }) => {
  const s = usePopIn(6);
  const frame = useCurrentFrame();
  return (
    <div style={{ scale: s, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ translate: `${interpolate(Math.sin(frame / 6), [-1, 1], [-6, 6])}px` }}>
        <PurrWaves size={130} color={ink} flipped />
      </div>
      <div style={{ position: "relative" }}>
        <Bob amplitude={7} speed={18}>
          <CatFace size={230} fur={fur} ink={ink} expression="happy" />
        </Bob>
        <div style={{ position: "absolute", left: 30, top: -70 }}>
          <Heart size={44} fill={accent} />
        </div>
        <div style={{ position: "absolute", right: 20, top: -110 }}>
          <Heart size={30} fill="#FF8FAB" />
        </div>
      </div>
      <div style={{ translate: `${interpolate(Math.sin(frame / 6), [-1, 1], [6, -6])}px` }}>
        <PurrWaves size={130} color={ink} />
      </div>
    </div>
  );
};

export const SleepIllustration: React.FC<IllustrationProps> = ({ fur, ink, accent }) => {
  const frame = useCurrentFrame();
  const s = usePopIn(6);
  const moon = usePopIn(14);
  const breathe = 1 + interpolate(Math.sin(frame / 16), [-1, 1], [0, 0.025]);

  return (
    <div style={{ scale: s, position: "relative" }}>
      <div style={{ scale: moon }}>
        <svg width={400} height={306} viewBox="0 0 340 260">
          <circle cx="168" cy="160" r="94" fill={accent} stroke={ink} strokeWidth="7" />
          <circle cx="206" cy="122" r="84" fill="#FFFFFF" />
          <g transform={`translate(160 170) scale(${breathe}) translate(-160 -170)`}>
            <ellipse cx="182" cy="146" rx="80" ry="62" fill={fur} stroke={ink} strokeWidth="6" />
            <path
              d="M110 208 q66 30 142 4"
              fill="none"
              stroke={ink}
              strokeWidth="19"
              strokeLinecap="round"
            />
            <path
              d="M110 208 q66 30 142 4"
              fill="none"
              stroke={fur}
              strokeWidth="11"
              strokeLinecap="round"
            />
            <g stroke={ink} strokeWidth="6" strokeLinejoin="round">
              <path d="M78 92 L66 50 L104 72 Z" fill={fur} />
              <path d="M128 70 L152 42 L160 82 Z" fill={fur} />
              <path d="M80 84 L74 60 L97 72 Z" fill="#FFAEC9" strokeWidth="0" />
              <path d="M131 68 L146 50 L150 75 Z" fill="#FFAEC9" strokeWidth="0" />
              <circle cx="115" cy="118" r="48" fill={fur} />
            </g>
            <g fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round">
              <path d="M92 118 q9 11 18 0" />
              <path d="M124 118 q9 11 18 0" />
            </g>
            <path
              d="M109 130 h12 l-6 8 z"
              fill="#FF6B8F"
              stroke={ink}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M115 140 q-6 8 -14 3 M115 140 q6 8 14 3"
              fill="none"
              stroke={ink}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <g stroke={ink} strokeWidth="3.5" strokeLinecap="round" opacity="0.85">
              <path d="M70 122 L42 116" fill="none" />
              <path d="M70 134 L40 138" fill="none" />
              <path d="M160 122 L188 116" fill="none" />
              <path d="M160 134 L190 138" fill="none" />
            </g>
            <g fill="#FF8FAB" opacity="0.55">
              <ellipse cx="84" cy="140" rx="10" ry="6" />
              <ellipse cx="146" cy="140" rx="10" ry="6" />
            </g>
            <g stroke={ink} strokeWidth="4">
              <ellipse cx="100" cy="168" rx="15" ry="11" fill={fur} />
              <ellipse cx="130" cy="171" rx="15" ry="11" fill={fur} />
            </g>
            <g stroke={ink} strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
              <path d="M96 162 v9 M104 162 v9" fill="none" />
              <path d="M126 165 v9 M134 165 v9" fill="none" />
            </g>
          </g>
        </svg>
      </div>
      {["Z", "z", "Z"].map((l, i) => {
        const cycle = 72;
        const t = (((frame - 20 - i * 24) % cycle) + cycle) % cycle;
        const p = frame < 20 + i * 18 ? -1 : t / cycle;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${46 + i * 7}%`,
              bottom: `${48 + p * 32}%`,
              fontSize: 34 + i * 12,
              fontFamily: FONT,
              fontWeight: 800,
              color: i === 2 ? accent : "#FFFFFF",
              opacity: p < 0 ? 0 : Math.sin(p * Math.PI),
              rotate: `${-14 + i * 10}deg`,
            }}
          >
            {l}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: -160, top: 40 }}>
        <Sparkle size={38} fill="#FFFFFF" />
      </div>
      <div style={{ position: "absolute", right: -165, top: 20 }}>
        <PawPrint size={34} fill="#FFFFFF" />
      </div>
    </div>
  );
};

export const GRAPHICS: Record<GraphicKey, React.FC<IllustrationProps>> = {
  clowder: ClowderIllustration,
  sweet: SweetIllustration,
  ears: EarsIllustration,
  purr: PurrIllustration,
  sleep: SleepIllustration,
};
