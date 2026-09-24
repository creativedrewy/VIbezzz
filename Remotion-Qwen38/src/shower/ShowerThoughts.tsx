import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { ShowerHookScene } from "./scenes/ShowerHookScene";
import { ThoughtScene } from "./scenes/ThoughtScene";
import { ShowerOutroScene } from "./scenes/ShowerOutroScene";
import type { ShowerThoughtsProps } from "./schema";

export const ShowerThoughtsVideo: React.FC<ShowerThoughtsProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getPresentation = (index: number): TransitionPresentation<any> => {
    if (props.transitionStyle === "fade") return fade();
    if (props.transitionStyle === "slide") {
      const dirs = ["from-bottom", "from-right", "from-left", "from-top"] as const;
      return slide({ direction: dirs[index % dirs.length] });
    }
    return wipe({ direction: index % 2 === 0 ? "from-left" : "from-right" });
  };

  const timing = () =>
    linearTiming({ durationInFrames: props.transitionDurationInFrames });

  const children: React.ReactNode[] = [];

  children.push(
    <TransitionSeries.Sequence key="hook" durationInFrames={props.hookDurationInFrames}>
      <ShowerHookScene
        titleTop={props.hookTitleTop}
        titleBottom={props.hookTitleBottom}
        subtitle={props.hookSubtitle}
        bgTop={props.hookBgTop}
        bgBottom={props.hookBgBottom}
        titleColor={props.hookTitleColor}
        titleGlow={props.hookTitleGlow}
        subtitleBg={props.hookSubtitleBg}
        subtitleColor={props.hookSubtitleColor}
        duckBody={props.duckBody}
        duckBeak={props.duckBeak}
        waterColor={props.waterColor}
        dropletColor={props.dropletColor}
        metalColor={props.metalColor}
      />
    </TransitionSeries.Sequence>
  );

  props.thoughts.forEach((thought, i) => {
    children.push(
      <TransitionSeries.Transition
        key={`transition-${i}`}
        presentation={getPresentation(i)}
        timing={timing()}
      />
    );
    children.push(
      <TransitionSeries.Sequence
        key={`thought-${i}`}
        durationInFrames={thought.durationInFrames}
      >
        <ThoughtScene
          thought={thought}
          index={i}
          textFontSize={props.textFontSize}
          framesPerWord={props.framesPerWord}
          duckBody={props.duckBody}
          duckBeak={props.duckBeak}
          waterColor={props.waterColor}
          dropletColor={props.dropletColor}
          metalColor={props.metalColor}
        />
      </TransitionSeries.Sequence>
    );
  });

  children.push(
    <TransitionSeries.Transition
      key="transition-outro"
      presentation={getPresentation(props.thoughts.length)}
      timing={timing()}
    />
  );
  children.push(
    <TransitionSeries.Sequence key="outro" durationInFrames={props.outroDurationInFrames}>
      <ShowerOutroScene
        title={props.outroTitle}
        subtitle={props.outroSubtitle}
        handle={props.outroHandle}
        bgTop={props.outroBgTop}
        bgBottom={props.outroBgBottom}
        titleColor={props.outroTitleColor}
        titleGlow={props.outroTitleGlow}
        subtitleColor={props.outroSubtitleColor}
        handleBg={props.outroHandleBg}
        handleColor={props.outroHandleColor}
        duckBody={props.duckBody}
        duckBeak={props.duckBeak}
        waterColor={props.waterColor}
      />
    </TransitionSeries.Sequence>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0F172A" }}>
      <TransitionSeries>{children}</TransitionSeries>
    </AbsoluteFill>
  );
};
