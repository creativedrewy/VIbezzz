import { loadFont as loadLuckiestGuy } from "@remotion/google-fonts/LuckiestGuy";
import { loadFont as loadBaloo2 } from "@remotion/google-fonts/Baloo2";

const { fontFamily: displayFontFamily } = loadLuckiestGuy();
const { fontFamily: captionFontFamily } = loadBaloo2("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

export const displayFont = displayFontFamily;
export const captionFont = captionFontFamily;
