import { AbsoluteFill } from "remotion";
import { CaptionWords, PopLine } from "./interactive/Text";
import { Fact, Hook, Outro } from "./interactive/Scenes";

export const CAT_FACTS_FPS = 30;
export const CAT_FACTS_DURATION = 810;

export const CatFactsVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1D0B2E" }}>
      <Hook from={0} durationInFrames={100} name="Hook">
        <PopLine
          name="Hook title"
          from={0}
          durationInFrames={100}
          style={{ translate: "70px 230px" }}
          fontSize={150}
          captions={[
            { text: "did", startMs: 133, endMs: 300, timestampMs: null, confidence: null },
            { text: "you", startMs: 433, endMs: 600, timestampMs: null, confidence: null },
            { text: "know", startMs: 733, endMs: 900, timestampMs: null, confidence: null },
          ]}
        />
        <PopLine
          name="Hook subtitle"
          from={0}
          durationInFrames={100}
          style={{ translate: "70px 1360px" }}
          fontSize={72}
          color="#FFD60A"
          captions={[
            { text: "...cats", startMs: 2067, endMs: 2234, timestampMs: null, confidence: null },
            { text: "are", startMs: 2233, endMs: 2400, timestampMs: null, confidence: null },
            { text: "weird?", startMs: 2400, endMs: 2567, timestampMs: null, confidence: null },
          ]}
        />
      </Hook>

      <Fact
        from={100}
        durationInFrames={120}
        name="CAT FACT #1"
        graphic="clowder"
        bgTop="#BEF8E8"
        bgBottom="#2EC4B6"
        accent="#FF5D8F"
        ink="#0E3B36"
        fur="#FFC96B"
        seed={2}
      >
        <PopLine
          name="Badge"
          from={0}
          durationInFrames={120}
          pill
          style={{ translate: "70px 240px" }}
          captions={[
            { text: "cat fact #1", startMs: 200, endMs: 367, timestampMs: null, confidence: null },
          ]}
          ink="#0E3B36"
        />
        <CaptionWords
          name="Caption"
          from={0}
          durationInFrames={120}
          style={{ translate: "70px 1060px" }}
          highlightIndex={7}
          accent="#FF5D8F"
          captions={[
            { text: "a", startMs: 800, endMs: 967, timestampMs: null, confidence: null },
            { text: "group", startMs: 967, endMs: 1134, timestampMs: null, confidence: null },
            { text: "of", startMs: 1133, endMs: 1300, timestampMs: null, confidence: null },
            { text: "cats", startMs: 1300, endMs: 1467, timestampMs: null, confidence: null },
            { text: "is", startMs: 1467, endMs: 1634, timestampMs: null, confidence: null },
            { text: "called", startMs: 1633, endMs: 1800, timestampMs: null, confidence: null },
            { text: "a", startMs: 1800, endMs: 1967, timestampMs: null, confidence: null },
            { text: "clowder", startMs: 1967, endMs: 2134, timestampMs: null, confidence: null },
          ]}
        />
      </Fact>

      <Fact
        from={220}
        durationInFrames={120}
        name="CAT FACT #2"
        graphic="sweet"
        bgTop="#FFE3EC"
        bgBottom="#FF8FAB"
        accent="#FFD60A"
        ink="#5A1E3C"
        fur="#B8C6DB"
        seed={3}
      >
        <PopLine
          name="Badge"
          from={0}
          durationInFrames={120}
          pill
          style={{ translate: "70px 240px" }}
          captions={[
            { text: "cat fact #2", startMs: 200, endMs: 367, timestampMs: null, confidence: null },
          ]}
          ink="#5A1E3C"
        />
        <CaptionWords
          name="Caption"
          from={0}
          durationInFrames={120}
          style={{ translate: "70px 1060px" }}
          highlightIndex={3}
          accent="#FFD60A"
          captions={[
            { text: "cats", startMs: 800, endMs: 967, timestampMs: null, confidence: null },
            { text: "can't", startMs: 967, endMs: 1134, timestampMs: null, confidence: null },
            { text: "taste", startMs: 1133, endMs: 1300, timestampMs: null, confidence: null },
            { text: "sweet", startMs: 1300, endMs: 1467, timestampMs: null, confidence: null },
            { text: "things", startMs: 1467, endMs: 1634, timestampMs: null, confidence: null },
          ]}
        />
      </Fact>

      <Fact
        from={340}
        durationInFrames={120}
        name="CAT FACT #3"
        graphic="ears"
        bgTop="#D9EEFF"
        bgBottom="#5BC0FF"
        accent="#FF7A00"
        ink="#0F3B5C"
        fur="#F4A259"
        seed={4}
      >
        <PopLine
          name="Badge"
          from={0}
          durationInFrames={120}
          pill
          style={{ translate: "70px 240px" }}
          captions={[
            { text: "cat fact #3", startMs: 200, endMs: 367, timestampMs: null, confidence: null },
          ]}
          ink="#0F3B5C"
        />
        <CaptionWords
          name="Caption"
          from={0}
          durationInFrames={120}
          style={{ translate: "70px 1060px" }}
          highlightIndex={4}
          accent="#FF7A00"
          captions={[
            { text: "a", startMs: 800, endMs: 967, timestampMs: null, confidence: null },
            { text: "cat's", startMs: 967, endMs: 1134, timestampMs: null, confidence: null },
            { text: "ear", startMs: 1133, endMs: 1300, timestampMs: null, confidence: null },
            { text: "has", startMs: 1300, endMs: 1467, timestampMs: null, confidence: null },
            { text: "32", startMs: 1467, endMs: 1634, timestampMs: null, confidence: null },
            { text: "muscles", startMs: 1633, endMs: 1800, timestampMs: null, confidence: null },
          ]}
        />
      </Fact>

      <Fact
        from={460}
        durationInFrames={120}
        name="CAT FACT #4"
        graphic="purr"
        bgTop="#EFE1FF"
        bgBottom="#B388FF"
        accent="#FF4D8D"
        ink="#3E2A66"
        fur="#9AD8A0"
        seed={5}
      >
        <PopLine
          name="Badge"
          from={0}
          durationInFrames={120}
          pill
          style={{ translate: "70px 240px" }}
          captions={[
            { text: "cat fact #4", startMs: 200, endMs: 367, timestampMs: null, confidence: null },
          ]}
          ink="#3E2A66"
        />
        <CaptionWords
          name="Caption"
          from={0}
          durationInFrames={120}
          style={{ translate: "70px 1060px" }}
          highlightIndex={4}
          accent="#FF4D8D"
          captions={[
            { text: "a", startMs: 800, endMs: 967, timestampMs: null, confidence: null },
            { text: "cat's", startMs: 967, endMs: 1134, timestampMs: null, confidence: null },
            { text: "purr", startMs: 1133, endMs: 1300, timestampMs: null, confidence: null },
            { text: "can", startMs: 1300, endMs: 1467, timestampMs: null, confidence: null },
            { text: "heal", startMs: 1467, endMs: 1634, timestampMs: null, confidence: null },
            { text: "bones", startMs: 1633, endMs: 1800, timestampMs: null, confidence: null },
          ]}
        />
      </Fact>

      <Fact
        from={580}
        durationInFrames={120}
        name="CAT FACT #5"
        graphic="sleep"
        bgTop="#7B74E0"
        bgBottom="#2D2A5E"
        accent="#FFD93D"
        ink="#16143A"
        fur="#C9CCE8"
        seed={6}
      >
        <PopLine
          name="Badge"
          from={0}
          durationInFrames={120}
          pill
          style={{ translate: "70px 240px" }}
          captions={[
            { text: "cat fact #5", startMs: 200, endMs: 367, timestampMs: null, confidence: null },
          ]}
          ink="#16143A"
        />
        <CaptionWords
          name="Caption"
          from={0}
          durationInFrames={120}
          style={{ translate: "70px 1060px" }}
          highlightIndex={2}
          accent="#FFD93D"
          captions={[
            { text: "cats", startMs: 800, endMs: 967, timestampMs: null, confidence: null },
            { text: "sleep", startMs: 967, endMs: 1134, timestampMs: null, confidence: null },
            { text: "70%", startMs: 1133, endMs: 1300, timestampMs: null, confidence: null },
            { text: "of", startMs: 1300, endMs: 1467, timestampMs: null, confidence: null },
            { text: "their", startMs: 1467, endMs: 1634, timestampMs: null, confidence: null },
            { text: "life", startMs: 1633, endMs: 1800, timestampMs: null, confidence: null },
          ]}
        />
      </Fact>

      <Outro from={700} durationInFrames={110} name="Outro">
        <PopLine
          name="Outro line"
          from={0}
          durationInFrames={110}
          style={{ translate: "70px 740px" }}
          fontSize={62}
          captions={[
            { text: "meow", startMs: 667, endMs: 834, timestampMs: null, confidence: null },
            { text: "you", startMs: 833, endMs: 1000, timestampMs: null, confidence: null },
            { text: "doing?", startMs: 1000, endMs: 1167, timestampMs: null, confidence: null },
          ]}
        />
        <PopLine
          name="Outro CTA"
          from={0}
          durationInFrames={110}
          style={{ translate: "70px 930px" }}
          fontSize={100}
          accentIndex={4}
          captions={[
            { text: "follow", startMs: 1133, endMs: 1334, timestampMs: null, confidence: null },
            { text: "for", startMs: 1333, endMs: 1534, timestampMs: null, confidence: null },
            { text: "more", startMs: 1533, endMs: 1734, timestampMs: null, confidence: null },
            { text: "cat", startMs: 1733, endMs: 1934, timestampMs: null, confidence: null },
            { text: "facts", startMs: 1933, endMs: 2134, timestampMs: null, confidence: null },
          ]}
        />
      </Outro>
    </AbsoluteFill>
  );
};
