import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { HookScene } from "./scenes/HookScene";
import { FactScene } from "./scenes/FactScene";
import { OutroScene } from "./scenes/OutroScene";
import type { CatFactsProps } from "./schema";

type TransitionKind = CatFactsProps["transitionStyle"];

const slideDirections = ["from-bottom", "from-right", "from-left", "from-top"] as const;

export const CatFactsVideo: React.FC<CatFactsProps> = (props) => {
  const { width, height } = useVideoConfig();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getPresentation = (kind: TransitionKind, index: number): TransitionPresentation<any> => {
    switch (kind) {
      case "fade":
        return fade();
      case "slide":
        return slide({ direction: slideDirections[index % slideDirections.length] });
      case "wipe":
        return wipe({ direction: index % 2 === 0 ? "from-left" : "from-right" });
      case "clockWipe":
        return clockWipe({ width, height });
      case "flip":
        return flip({ direction: index % 2 === 0 ? "from-left" : "from-right" });
      case "mixed":
      default: {
        const mixed = index % 5;
        if (mixed === 0) return slide({ direction: "from-bottom" });
        if (mixed === 1) return clockWipe({ width, height });
        if (mixed === 2) return wipe({ direction: "from-left" });
        if (mixed === 3) return fade();
        return flip({ direction: "from-right" });
      }
    }
  };

  const timing = () =>
    linearTiming({ durationInFrames: props.transitionDurationInFrames });

  const children: React.ReactNode[] = [];

  children.push(
    <TransitionSeries.Sequence key="hook" durationInFrames={props.hookDurationInFrames}>
      <HookScene
        titleTop={props.hookTitleTop}
        titleBottom={props.hookTitleBottom}
        subtitle={props.hookSubtitle}
        bgTop={props.hookBgTop}
        bgBottom={props.hookBgBottom}
        titleColor={props.hookTitleColor}
        titleShadow={props.hookTitleShadow}
        accentColor={props.hookAccentColor}
        accentShadow={props.hookAccentShadow}
        subtitleBg={props.hookSubtitleBg}
        subtitleColor={props.hookSubtitleColor}
        catMain={props.hookCatMain}
        catAccent={props.hookCatAccent}
      />
    </TransitionSeries.Sequence>
  );

  props.facts.forEach((fact, i) => {
    children.push(
      <TransitionSeries.Transition
        key={`transition-${i}`}
        presentation={getPresentation(props.transitionStyle, i)}
        timing={timing()}
      />
    );
    children.push(
      <TransitionSeries.Sequence key={`fact-${i}`} durationInFrames={fact.durationInFrames}>
        <FactScene
          fact={fact}
          index={i}
          captionFontSize={props.captionFontSize}
          framesPerWord={props.framesPerWord}
        />
      </TransitionSeries.Sequence>
    );
  });

  children.push(
    <TransitionSeries.Transition
      key="transition-outro"
      presentation={getPresentation(props.transitionStyle, props.facts.length)}
      timing={timing()}
    />
  );
  children.push(
    <TransitionSeries.Sequence key="outro" durationInFrames={props.outroDurationInFrames}>
      <OutroScene
        title={props.outroTitle}
        subtitle={props.outroSubtitle}
        handle={props.outroHandle}
        bgTop={props.outroBgTop}
        bgBottom={props.outroBgBottom}
        titleColor={props.outroTitleColor}
        titleShadow={props.outroTitleShadow}
        subtitleColor={props.outroSubtitleColor}
        handleBg={props.outroHandleBg}
        handleColor={props.outroHandleColor}
        catMain={props.outroCatMain}
        catAccent={props.outroCatAccent}
        pawColor={props.outroPawColor}
      />
    </TransitionSeries.Sequence>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      <TransitionSeries>{children}</TransitionSeries>
    </AbsoluteFill>
  );
};
