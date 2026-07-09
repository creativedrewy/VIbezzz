import { AbsoluteFill, Sequence } from "remotion";
import { FactScene } from "./components/FactScene";
import { Outro } from "./components/Outro";
import type { MyCompositionProps } from "./schema";

export const MyComposition: React.FC<MyCompositionProps> = ({
  facts,
  outroPalette,
  factDuration,
  outroDuration,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {facts.map((fact, i) => (
        <Sequence
          key={i}
          from={i * factDuration}
          durationInFrames={factDuration}
        >
          <FactScene fact={fact} index={i} />
        </Sequence>
      ))}
      <Sequence
        from={facts.length * factDuration}
        durationInFrames={outroDuration}
      >
        <Outro palette={outroPalette} />
      </Sequence>
    </AbsoluteFill>
  );
};
