import type { IllustrationKey } from "../schema";

const eye = (cx: number, cy: number, r = 11) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill="#ffffff" />
    <circle cx={cx + 2} cy={cy + 2} r={r * 0.55} fill="#2b2b3a" />
    <circle cx={cx - 2} cy={cy - 2} r={r * 0.22} fill="#ffffff" />
  </>
);

const cheek = (cx: number, cy: number, color = "rgba(255,122,173,0.55)") => (
  <circle cx={cx} cy={cy} r={9} fill={color} />
);

const smile = (cx: number, cy: number, w = 26) => (
  <path
    d={`M${cx - w / 2} ${cy} Q${cx} ${cy + 14} ${cx + w / 2} ${cy}`}
    stroke="#2b2b3a"
    strokeWidth={4}
    fill="none"
    strokeLinecap="round"
  />
);

const Octopus = ({ color }: { color: string }) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    {[58, 86, 114, 142].map((x, i) => (
      <path
        key={i}
        d={`M${x} 120 q-14 30 4 55 q14 -12 9 -30 q10 18 20 4 q-2 -28 -33 -29 Z`}
        fill={color}
      />
    ))}
    <ellipse cx={100} cy={84} rx={64} ry={60} fill={color} />
    <ellipse cx={100} cy={100} rx={42} ry={44} fill="rgba(255,255,255,0.35)" />
    {eye(80, 80)}
    {eye(120, 80)}
    {cheek(62, 96)}
    {cheek(138, 96)}
    {smile(100, 104, 28)}
  </svg>
);

const Cloud = ({ color }: { color: string }) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <path
      d="M55 130 a34 34 0 0 1 6 -66 a40 40 0 0 1 74 6 a30 30 0 0 1 8 60 Z"
      fill={color}
    />
    <path
      d="M55 130 a34 34 0 0 1 6 -66 a40 40 0 0 1 74 6 a30 30 0 0 1 8 60 Z"
      fill="rgba(255,255,255,0.25)"
      transform="translate(0,-6)"
    />
    {eye(85, 110)}
    {eye(120, 110)}
    {cheek(66, 124, "rgba(255,150,170,0.5)")}
    {cheek(139, 124, "rgba(255,150,170,0.5)")}
    {smile(102, 126, 24)}
    <path d="M78 150 l-6 22" stroke="#38bdf8" strokeWidth={6} strokeLinecap="round" />
    <path d="M104 150 l4 22" stroke="#38bdf8" strokeWidth={6} strokeLinecap="round" />
    <path d="M128 150 l10 20" stroke="#38bdf8" strokeWidth={6} strokeLinecap="round" />
  </svg>
);

const Banana = ({ color }: { color: string }) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <path
      d="M40 60 q10 90 110 100 q40 -4 36 -34 q-6 -22 -30 -18 q-46 -6 -64 -54 q-12 -18 -52 -14 q-10 4 -0 24 Z"
      fill={color}
    />
    <path
      d="M52 78 q8 70 92 84 q22 -2 20 -18 q-58 -8 -86 -70 Z"
      fill="rgba(255,255,255,0.3)"
    />
    {eye(96, 110)}
    {eye(126, 116)}
    {cheek(82, 122, "rgba(255,120,150,0.5)")}
    {cheek(140, 128, "rgba(255,120,150,0.5)")}
    {smile(112, 128, 20)}
    <path d="M150 56 q14 -10 8 -26" stroke="#7c4a03" strokeWidth={7} strokeLinecap="round" fill="none" />
  </svg>
);

const Honey = ({ color }: { color: string }) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <rect x={52} y={70} width={96} height={104} rx={22} fill={color} />
    <rect x={52} y={92} width={96} height={82} rx={14} fill="rgba(255,255,255,0.35)" />
    <rect x={64} y={48} width={72} height={30} rx={12} fill="#caa15a" />
    <rect x={78} y={30} width={44} height={22} rx={10} fill="#e9c97f" />
    {eye(86, 116)}
    {eye(114, 116)}
    {cheek(70, 130, "rgba(255,120,150,0.5)")}
    {cheek(130, 130, "rgba(255,120,150,0.5)")}
    {smile(100, 132, 22)}
    <ellipse cx={100} cy={150} rx={20} ry={8} fill="rgba(255,255,255,0.45)" />
  </svg>
);

const Star = ({ color }: { color: string }) => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <path
      d="M100 18 L124 74 L186 80 L138 122 L152 184 L100 152 L48 184 L62 122 L14 80 L76 74 Z"
      fill={color}
    />
    <path
      d="M100 18 L124 74 L186 80 L138 122 L152 184 L100 152 L48 184 L62 122 L14 80 L76 74 Z"
      fill="rgba(255,255,255,0.25)"
      transform="translate(0,-8)"
    />
    {eye(82, 96)}
    {eye(118, 96)}
    {cheek(64, 110, "rgba(255,120,150,0.5)")}
    {cheek(136, 110, "rgba(255,120,150,0.5)")}
    {smile(100, 110, 22)}
  </svg>
);

export const Illustration: React.FC<{
  kind: IllustrationKey;
  color: string;
}> = ({ kind, color }) => {
  switch (kind) {
    case "octopus":
      return <Octopus color={color} />;
    case "cloud":
      return <Cloud color={color} />;
    case "banana":
      return <Banana color={color} />;
    case "honey":
      return <Honey color={color} />;
    case "star":
      return <Star color={color} />;
  }
};
