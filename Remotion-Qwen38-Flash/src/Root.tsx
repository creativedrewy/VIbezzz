import "./index.css";
import { Composition } from "remotion";
import { CatFactsVideo, CAT_FACTS_FPS, catFactsDurationInFrames } from "./CatFacts";
import { catFactsSchema, DEFAULT_PROPS } from "./schema";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CatFacts"
        component={CatFactsVideo}
        fps={CAT_FACTS_FPS}
        width={1080}
        height={1920}
        durationInFrames={catFactsDurationInFrames(DEFAULT_PROPS)}
        schema={catFactsSchema}
        defaultProps={DEFAULT_PROPS}
      />
    </>
  );
};
