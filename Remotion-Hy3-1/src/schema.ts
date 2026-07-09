import { z } from "zod";
import { zColor, zTextarea } from "@remotion/zod-types";

export const paletteSchema = z.object({
  bg1: zColor(),
  bg2: zColor(),
  card: zColor(),
  accent: zColor(),
  text: zColor(),
  illo: zColor(),
});

export type Palette = z.infer<typeof paletteSchema>;

export const factSchema = z.object({
  text: zTextarea(),
  illustration: z.enum(["octopus", "cloud", "banana", "honey", "star"]),
  palette: paletteSchema,
});

export type Fact = z.infer<typeof factSchema>;

export type IllustrationKey = Fact["illustration"];

export const schema = z.object({
  facts: z.array(factSchema),
  outroPalette: paletteSchema,
  factDuration: z.number().int().min(30).max(600).step(1),
  outroDuration: z.number().int().min(30).max(600).step(1),
});

export type MyCompositionProps = z.infer<typeof schema>;

export const defaultProps: MyCompositionProps = {
  facts: [
    {
      text: "Octopuses have three hearts and blue blood!",
      illustration: "octopus",
      palette: {
        bg1: "#a78bfa",
        bg2: "#f0abfc",
        card: "#ffffff",
        accent: "#7c3aed",
        text: "#2e1065",
        illo: "#c084fc",
      },
    },
    {
      text: "A single fluffy cloud can weigh over a million pounds!",
      illustration: "cloud",
      palette: {
        bg1: "#38bdf8",
        bg2: "#818cf8",
        card: "#ffffff",
        accent: "#0369a1",
        text: "#0c1c4d",
        illo: "#7dd3fc",
      },
    },
    {
      text: "Bananas are berries, but strawberries are not!",
      illustration: "banana",
      palette: {
        bg1: "#fde047",
        bg2: "#fb923c",
        card: "#fffdf5",
        accent: "#b45309",
        text: "#451a03",
        illo: "#fde047",
      },
    },
    {
      text: "Honey never spoils. Pots found in tombs are still tasty!",
      illustration: "honey",
      palette: {
        bg1: "#fbbf24",
        bg2: "#f472b6",
        card: "#fffaf0",
        accent: "#b45309",
        text: "#4a1d05",
        illo: "#f59e0b",
      },
    },
  ],
  outroPalette: {
    bg1: "#34d399",
    bg2: "#22d3ee",
    card: "#ffffff",
    accent: "#047857",
    text: "#022c22",
    illo: "#6ee7b7",
  },
  factDuration: 135,
  outroDuration: 90,
};
