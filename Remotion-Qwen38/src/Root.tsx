import "./index.css";
import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { CatFactsVideo } from "./CatFacts";
import { catFactsDefaults, catFactsSchema, CatFactsProps } from "./schema";
import { ShowerThoughtsVideo } from "./shower/ShowerThoughts";
import {
  showerThoughtsDefaults,
  showerThoughtsSchema,
  ShowerThoughtsProps,
} from "./shower/schema";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

const calculateMetadata: CalculateMetadataFunction<CatFactsProps> = ({
  props,
}) => {
  const sceneCount = props.facts.length + 2;
  const totalFrames =
    props.hookDurationInFrames +
    props.facts.reduce((sum, fact) => sum + fact.durationInFrames, 0) +
    props.outroDurationInFrames -
    (sceneCount - 1) * props.transitionDurationInFrames;

  return {
    durationInFrames: Math.max(30, Math.round(totalFrames)),
  };
};

const calculateShowerMetadata: CalculateMetadataFunction<ShowerThoughtsProps> =
  ({ props }) => {
    const sceneCount = props.thoughts.length + 2;
    const totalFrames =
      props.hookDurationInFrames +
      props.thoughts.reduce((sum, thought) => sum + thought.durationInFrames, 0) +
      props.outroDurationInFrames -
      (sceneCount - 1) * props.transitionDurationInFrames;

    return {
      durationInFrames: Math.max(30, Math.round(totalFrames)),
    };
  };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CatFacts"
        component={CatFactsVideo}
        durationInFrames={750}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={catFactsSchema}
        defaultProps={catFactsDefaults}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="ShowerThoughts"
        component={ShowerThoughtsVideo}
        durationInFrames={945}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={showerThoughtsSchema}
        defaultProps={showerThoughtsDefaults}
        calculateMetadata={calculateShowerMetadata}
      />
    </>
  );
};
