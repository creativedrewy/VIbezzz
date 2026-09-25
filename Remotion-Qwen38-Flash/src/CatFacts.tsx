import { AbsoluteFill, Sequence } from "remotion";
import { HookScene, HOOK_FRAMES } from "./scenes/HookScene";
import { FactScene, FACT_FRAMES } from "./scenes/FactScene";
import { OutroScene, OUTRO_FRAMES } from "./scenes/OutroScene";
import { DEFAULT_PROPS, type CatFactsProps } from "./schema";

export const CAT_FACTS_FPS = 30;

export const catFactsDurationInFrames = (props: CatFactsProps): number =>
  HOOK_FRAMES + props.facts.length * FACT_FRAMES + OUTRO_FRAMES;

export const CatFactsVideo: React.FC<CatFactsProps> = (props) => {
  const outroFrom = HOOK_FRAMES + props.facts.length * FACT_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1D0B2E" }}>
      <Sequence durationInFrames={HOOK_FRAMES} name="Hook">
        <HookScene hookLine1={props.hookLine1} hookLine2={props.hookLine2} />
      </Sequence>

      {props.facts.map((fact, i) => (
        <Sequence
          key={`${fact.label}-${i}`}
          name={fact.label}
          from={HOOK_FRAMES + i * FACT_FRAMES}
          durationInFrames={FACT_FRAMES}
        >
          <FactScene fact={fact} seed={i + 2} />
        </Sequence>
      ))}

      <Sequence name="Outro" from={outroFrom} durationInFrames={OUTRO_FRAMES}>
        <OutroScene outroLine={props.outroLine} outroCta={props.outroCta} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const catFactsDefaultProps = DEFAULT_PROPS;
