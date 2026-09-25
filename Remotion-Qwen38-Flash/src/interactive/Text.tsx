import { type Caption } from "@remotion/captions";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import {
  Interactive,
  Sequence,
  type InteractivitySchema,
  type InteractiveBaseProps,
  type InteractiveTransformProps,
  type SequenceControls,
} from "remotion";
import { CaptionWordsView, PopWordsView } from "../components/TextRender";

type PopLineProps = InteractiveBaseProps &
  InteractiveTransformProps & {
    readonly captions: Caption[];
    readonly fontSize?: number;
    readonly color?: string;
    readonly ink?: string;
    readonly accentIndex?: number;
    readonly pill?: boolean;
    readonly controls?: SequenceControls;
    readonly style?: CSSProperties;
  };

const popLineSchema = {
  ...Interactive.baseSchema,
  ...Interactive.captionsSchema,
  ...Interactive.transformSchema,
  fontSize: {
    type: "number", hiddenFromList: false,
    min: 10,
    step: 1,
    default: 100,
    description: "Font size",
    integer: true,
  },
  accentIndex: {
    type: "number", hiddenFromList: false,
    min: -1,
    step: 1,
    default: -1,
    description: "Accent word index",
    integer: true,
  },
  color: { type: "color", default: "#FFFFFF", description: "Text color" },
  ink: { type: "color", default: "#2A0F4F", description: "Outline color" },
  pill: { type: "boolean", default: false, description: "Pill badge" },
} as const satisfies InteractivitySchema;

const PopLineInner = forwardRef<HTMLDivElement, PopLineProps>(
  (
    {
      captions,
      fontSize = 100,
      color = "#FFFFFF",
      ink = "#2A0F4F",
      accentIndex = -1,
      pill = false,
      style,
      name,
      controls,
      ...sequenceProps
    },
    ref,
  ) => {
    const outlineRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

    return (
      <Sequence
        layout="none"
        {...sequenceProps}
        name={name ?? "<PopLine>"}
        controls={controls}
        outlineRef={outlineRef}
      >
        <div
          ref={outlineRef}
          style={{ position: "absolute", left: 0, top: 0, ...style }}
        >
          <PopWordsView
            captions={captions}
            fontSize={fontSize}
            color={color}
            ink={ink}
            accentIndex={accentIndex}
            pill={pill}
            width={940}
          />
        </div>
      </Sequence>
    );
  },
);

export const PopLine = Interactive.withSchema({
  Component: PopLineInner,
  componentName: "<PopLine>",
  schema: popLineSchema,
  supportsEffects: false,
});

type CaptionWordsProps = InteractiveBaseProps &
  InteractiveTransformProps & {
    readonly captions: Caption[];
    readonly highlightIndex?: number;
    readonly accent?: string;
    readonly ink?: string;
    readonly color?: string;
    readonly fontSize?: number;
    readonly controls?: SequenceControls;
    readonly style?: CSSProperties;
  };

const captionWordsSchema = {
  ...Interactive.baseSchema,
  ...Interactive.captionsSchema,
  ...Interactive.transformSchema,
  highlightIndex: {
    type: "number", hiddenFromList: false,
    min: -1,
    step: 1,
    default: -1,
    description: "Highlight word index",
    integer: true,
  },
  fontSize: {
    type: "number", hiddenFromList: false,
    min: 10,
    step: 1,
    default: 92,
    description: "Font size",
    integer: true,
  },
  accent: { type: "color", default: "#FF5D8F", description: "Highlight color" },
  ink: { type: "color", default: "#0E3B36", description: "Outline color" },
  color: { type: "color", default: "#FFFFFF", description: "Text color" },
} as const satisfies InteractivitySchema;

const CaptionWordsInner = forwardRef<HTMLDivElement, CaptionWordsProps>(
  (
    {
      captions,
      highlightIndex = -1,
      accent = "#FF5D8F",
      ink = "#0E3B36",
      color = "#FFFFFF",
      fontSize = 92,
      style,
      name,
      controls,
      ...sequenceProps
    },
    ref,
  ) => {
    const outlineRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

    return (
      <Sequence
        layout="none"
        {...sequenceProps}
        name={name ?? "<CaptionWords>"}
        controls={controls}
        outlineRef={outlineRef}
      >
        <div
          ref={outlineRef}
          style={{ position: "absolute", left: 0, top: 0, ...style }}
        >
          <CaptionWordsView
            captions={captions}
            highlightIndex={highlightIndex}
            accent={accent}
            ink={ink}
            color={color}
            fontSize={fontSize}
            width={940}
          />
        </div>
      </Sequence>
    );
  },
);

export const CaptionWords = Interactive.withSchema({
  Component: CaptionWordsInner,
  componentName: "<CaptionWords>",
  schema: captionWordsSchema,
  supportsEffects: false,
});
