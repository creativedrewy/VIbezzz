import "./index.css";
import { Composition } from "remotion";
import { CatFactsVideo, CAT_FACTS_DURATION, CAT_FACTS_FPS } from "./CatFacts";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CatFacts"
        component={CatFactsVideo}
        fps={CAT_FACTS_FPS}
        width={1080}
        height={1920}
        durationInFrames={CAT_FACTS_DURATION}
      />
    </>
  );
};
