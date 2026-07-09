import "./index.css";
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition } from "./Composition";
import { schema, defaultProps } from "./schema";
import type { MyCompositionProps } from "./schema";

const calculateMetadata: CalculateMetadataFunction<MyCompositionProps> = ({
  props,
}) => {
  return {
    durationInFrames:
      props.facts.length * props.factDuration + props.outroDuration,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DidYouKnow"
        component={MyComposition}
        schema={schema}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
