import { useCurrentFrame, interpolate, Easing, Interactive } from "remotion";
import { baloo } from "../fonts";

export const FactCaption: React.FC<{
  text: string;
  accent: string;
  textColor: string;
  delay?: number;
}> = ({ text, accent, textColor, delay = 0 }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");

  return (
    <Interactive.Div
      name="Caption"
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.22em",
        maxWidth: 900,
        fontFamily: baloo,
        fontWeight: 800,
        fontSize: 62,
        lineHeight: 1.2,
        color: textColor,
        textAlign: "center",
      }}
    >
      {words.map((w, i) => {
        const start = delay + i * 7;
        const lf = frame - start;
        const op = interpolate(lf, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const ty = interpolate(lf, [0, 10], [30, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const sc = interpolate(lf, [0, 10], [0.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
        const hl = interpolate(lf, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <Interactive.Span
            key={i}
            name="Word"
            style={{
              position: "relative",
              display: "inline-block",
              translate: `0px ${ty}px`,
              scale: sc,
              opacity: op,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: -6,
                right: -6,
                bottom: 8,
                height: "46%",
                background: accent,
                opacity: 0.45 * hl,
                borderRadius: 12,
                transform: `scaleX(${hl})`,
                transformOrigin: "left center",
                zIndex: 0,
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>{w}</span>
          </Interactive.Span>
        );
      })}
    </Interactive.Div>
  );
};
