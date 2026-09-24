import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const showerThoughtSchema = z.object({
  label: z.string().describe("Badge shown above the thought card"),
  text: z.string().describe("The shower thought, animated word by word"),
  highlight: z
    .string()
    .describe("Space or comma separated words to glow-highlight"),
  durationInFrames: z.number().min(30).describe("Scene length in frames"),
  bgTop: zColor().describe("Background gradient top color"),
  bgBottom: zColor().describe("Background gradient bottom color"),
  cardBg: zColor().describe("Thought bubble card fill"),
  cardBorder: zColor().describe("Thought bubble card border"),
  textColor: zColor().describe("Thought text color"),
  highlightColor: zColor().describe("Highlighted word color"),
  highlightBg: zColor().describe("Highlighted word pill fill"),
});

export const showerThoughtsSchema = z.object({
  hookTitleTop: z.string().describe("Hook first line"),
  hookTitleBottom: z.string().describe("Hook second line"),
  hookSubtitle: z.string().describe("Hook subtitle pill text"),
  hookDurationInFrames: z.number().min(30).describe("Hook scene length"),
  hookBgTop: zColor(),
  hookBgBottom: zColor(),
  hookTitleColor: zColor(),
  hookTitleGlow: zColor().describe("Soft glow color behind the title"),
  hookSubtitleBg: zColor(),
  hookSubtitleColor: zColor(),

  thoughts: z.array(showerThoughtSchema).describe("The shower thought blurbs"),

  outroTitle: z.string().describe("Outro big line"),
  outroSubtitle: z.string().describe("Outro subtitle"),
  outroHandle: z.string().describe("Outro handle pill text"),
  outroDurationInFrames: z.number().min(30).describe("Outro scene length"),
  outroBgTop: zColor(),
  outroBgBottom: zColor(),
  outroTitleColor: zColor(),
  outroTitleGlow: zColor(),
  outroSubtitleColor: zColor(),
  outroHandleBg: zColor(),
  outroHandleColor: zColor(),

  duckBody: zColor().describe("Rubber duck body color"),
  duckBeak: zColor().describe("Rubber duck beak color"),
  waterColor: zColor().describe("Water line color"),
  dropletColor: zColor().describe("Falling droplet color"),
  metalColor: zColor().describe("Shower head metal color"),

  textFontSize: z.number().min(36).describe("Thought text font size"),
  framesPerWord: z
    .number()
    .min(1)
    .describe("Frames between each word appearing"),
  transitionStyle: z.enum(["fade", "slide", "wipe"]),
  transitionDurationInFrames: z.number().min(1),
});

export type ShowerThoughtProps = z.infer<typeof showerThoughtSchema>;
export type ShowerThoughtsProps = z.infer<typeof showerThoughtsSchema>;

export const showerThoughtsDefaults: ShowerThoughtsProps = {
  hookTitleTop: "SHOWER",
  hookTitleBottom: "THOUGHTS",
  hookSubtitle: "things you only ponder under hot water",
  hookDurationInFrames: 120,
  hookBgTop: "#312E81",
  hookBgBottom: "#0891B2",
  hookTitleColor: "#F8FAFC",
  hookTitleGlow: "#A5F3FC",
  hookSubtitleBg: "rgba(255,255,255,0.16)",
  hookSubtitleColor: "#E0F2FE",

  thoughts: [
    {
      label: "SHOWER THOUGHT #1",
      text: "You have never seen your own face, only reflections and photos",
      highlight: "reflections and photos",
      durationInFrames: 165,
      bgTop: "#312E81",
      bgBottom: "#7C3AED",
      cardBg: "rgba(255,255,255,0.12)",
      cardBorder: "rgba(255,255,255,0.35)",
      textColor: "#F8FAFC",
      highlightColor: "#FDE047",
      highlightBg: "rgba(255,255,255,0.18)",
    },
    {
      label: "SHOWER THOUGHT #2",
      text: "Shampoo is just soap that went to college",
      highlight: "went to college",
      durationInFrames: 165,
      bgTop: "#0F766E",
      bgBottom: "#22D3EE",
      cardBg: "rgba(255,255,255,0.12)",
      cardBorder: "rgba(255,255,255,0.35)",
      textColor: "#F8FAFC",
      highlightColor: "#FDE047",
      highlightBg: "rgba(255,255,255,0.18)",
    },
    {
      label: "SHOWER THOUGHT #3",
      text: "Your best ideas arrive exactly three minutes into the shower",
      highlight: "three minutes",
      durationInFrames: 165,
      bgTop: "#1E40AF",
      bgBottom: "#38BDF8",
      cardBg: "rgba(255,255,255,0.12)",
      cardBorder: "rgba(255,255,255,0.35)",
      textColor: "#F8FAFC",
      highlightColor: "#FDE047",
      highlightBg: "rgba(255,255,255,0.18)",
    },
    {
      label: "SHOWER THOUGHT #4",
      text: "Clouds are just the sky saving showers for later",
      highlight: "the sky",
      durationInFrames: 165,
      bgTop: "#4C1D95",
      bgBottom: "#DB2777",
      cardBg: "rgba(255,255,255,0.12)",
      cardBorder: "rgba(255,255,255,0.35)",
      textColor: "#F8FAFC",
      highlightColor: "#FDE047",
      highlightBg: "rgba(255,255,255,0.18)",
    },
    {
      label: "SHOWER THOUGHT #5",
      text: "You forget 90% of your shower thoughts by towel time",
      highlight: "90%",
      durationInFrames: 165,
      bgTop: "#134E4A",
      bgBottom: "#2DD4BF",
      cardBg: "rgba(255,255,255,0.12)",
      cardBorder: "rgba(255,255,255,0.35)",
      textColor: "#F8FAFC",
      highlightColor: "#FDE047",
      highlightBg: "rgba(255,255,255,0.18)",
    },
  ],

  outroTitle: "STAY CURIOUS",
  outroSubtitle: "follow for more shower thoughts",
  outroHandle: "@shower.thoughts",
  outroDurationInFrames: 120,
  outroBgTop: "#0C4A6E",
  outroBgBottom: "#22D3EE",
  outroTitleColor: "#F8FAFC",
  outroTitleGlow: "#A5F3FC",
  outroSubtitleColor: "#E0F2FE",
  outroHandleBg: "rgba(255,255,255,0.16)",
  outroHandleColor: "#FDE047",

  duckBody: "#FDE047",
  duckBeak: "#FB923C",
  waterColor: "rgba(186,230,253,0.35)",
  dropletColor: "rgba(186,230,253,0.75)",
  metalColor: "#CBD5E1",

  textFontSize: 76,
  framesPerWord: 5,
  transitionStyle: "fade",
  transitionDurationInFrames: 20,
};
