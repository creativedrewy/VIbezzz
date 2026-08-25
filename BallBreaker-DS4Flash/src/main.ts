import { Game } from "./game";

const canvas = document.getElementById("gl") as HTMLCanvasElement;
const game = new Game(canvas);
game.start();

window.addEventListener("beforeunload", () => game.dispose());