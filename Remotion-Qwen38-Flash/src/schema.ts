import { z } from "zod";

export const graphicKeySchema = z.enum([
  "clowder",
  "sweet",
  "ears",
  "purr",
  "sleep",
]);

export type GraphicKey = z.infer<typeof graphicKeySchema>;

export const factSchema = z.object({
  label: z.string().describe("Badge text, e.g. CAT FACT #1"),
  text: z.string().describe("Fact text — animates in word by word"),
  highlightWord: z
    .string()
    .describe("The word that pops with the accent color"),
  graphic: graphicKeySchema.describe("Illustration shown in the sticker card"),
  bgTop: z.string().describe("Background gradient top color (hex)"),
  bgBottom: z.string().describe("Background gradient bottom color (hex)"),
  accent: z.string().describe("Caption highlight + art accent color"),
  ink: z.string().describe("Outline / shadow color"),
  fur: z.string().describe("Cat fur color"),
});

export const catFactsSchema = z.object({
  hookLine1: z.string().describe("Big hook words, space separated"),
  hookLine2: z.string().describe("Second hook line"),
  outroLine: z.string().describe("Outro lead-in text"),
  outroCta: z
    .string()
    .describe("Outro call to action, space separated words pop in"),
  facts: z.array(factSchema).describe("The did-you-know facts, in order"),
});

export type Fact = z.infer<typeof factSchema>;
export type CatFactsProps = z.infer<typeof catFactsSchema>;

export const DEFAULT_FACTS: Fact[] = [
  {
    label: "CAT FACT #1",
    text: "a group of cats is called a clowder",
    highlightWord: "clowder",
    graphic: "clowder",
    bgTop: "#BEF8E8",
    bgBottom: "#2EC4B6",
    accent: "#FF5D8F",
    ink: "#0E3B36",
    fur: "#FFC96B",
  },
  {
    label: "CAT FACT #2",
    text: "cats can't taste sweet things",
    highlightWord: "sweet",
    graphic: "sweet",
    bgTop: "#FFE3EC",
    bgBottom: "#FF8FAB",
    accent: "#FFD60A",
    ink: "#5A1E3C",
    fur: "#B8C6DB",
  },
  {
    label: "CAT FACT #3",
    text: "a cat's ear has 32 muscles",
    highlightWord: "32",
    graphic: "ears",
    bgTop: "#D9EEFF",
    bgBottom: "#5BC0FF",
    accent: "#FF7A00",
    ink: "#0F3B5C",
    fur: "#F4A259",
  },
  {
    label: "CAT FACT #4",
    text: "a cat's purr can heal bones",
    highlightWord: "heal",
    graphic: "purr",
    bgTop: "#EFE1FF",
    bgBottom: "#B388FF",
    accent: "#FF4D8D",
    ink: "#3E2A66",
    fur: "#9AD8A0",
  },
  {
    label: "CAT FACT #5",
    text: "cats sleep 70% of their life",
    highlightWord: "70%",
    graphic: "sleep",
    bgTop: "#7B74E0",
    bgBottom: "#2D2A5E",
    accent: "#FFD93D",
    ink: "#16143A",
    fur: "#C9CCE8",
  },
];

export const DEFAULT_PROPS: CatFactsProps = {
  hookLine1: "did you know",
  hookLine2: "...cats are weird?",
  outroLine: "meow you doing?",
  outroCta: "follow for more cat facts",
  facts: DEFAULT_FACTS,
};
