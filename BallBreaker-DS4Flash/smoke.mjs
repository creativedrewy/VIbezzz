import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";

const root = process.cwd();
const fileUrl = "file://" + resolve(root, "dist/index.html");
const html = await readFile(resolve(root, "dist/index.html"), "utf8");

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_BIN,
  args: ["--use-angle=swiftshader-webgl", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--allow-file-access-from-files"],
});

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(fileUrl, { waitUntil: "load" });
await page.waitForTimeout(2000);

const webglOk = await page.evaluate(() => {
  const c = document.createElement("canvas");
  return !!(c.getContext("webgl2") || c.getContext("webgl"));
});

await page.click("#start-btn");
await page.waitForTimeout(900);

// Mouse control: move pointer across paddle plane
await page.mouse.move(560, 500);
await page.waitForTimeout(120);
await page.mouse.move(900, 500);
await page.waitForTimeout(400);
// Keyboard control
await page.keyboard.down("ArrowRight");
await page.waitForTimeout(500);
await page.keyboard.up("ArrowRight");
await page.keyboard.down("ArrowLeft");
await page.waitForTimeout(500);
await page.keyboard.up("ArrowLeft");
// Keyboard launch
await page.keyboard.press("Space");
await page.waitForTimeout(300);

const before = await page.evaluate(() => ({
  score: document.getElementById("score").textContent,
  lives: document.getElementById("lives").textContent,
}));

// Launch bullet: touch drag should drive the (newly attached) paddle, tap should launch
await page.evaluate(() => {
  const c = document.getElementById("gl");
  const rect = c.getBoundingClientRect();
  const fire = (type, x, y) =>
    c.dispatchEvent(new PointerEvent(type, {
      pointerId: 7, pointerType: "touch", isPrimary: true,
      clientX: rect.left + x, clientY: rect.top + y, bubbles: true,
    }));
  fire("pointermove", 420, 510);
  fire("pointermove", 560, 505);
});

// Give the launched ball time to connect with bricks or fall out (5s)
await page.waitForTimeout(5000);

const after = await page.evaluate(() => {
  const score = document.getElementById("score").textContent;
  const lives = document.getElementById("lives").textContent;
  const level = document.getElementById("level").textContent;
  const overlayHidden = document.getElementById("start").classList.contains("hidden");
  const overShown = !document.getElementById("gameover").classList.contains("hidden");
  return { score, lives, level, overlayHidden, overShown };
});

await browser.close();
server.close();
console.log(JSON.stringify({ webglOk, before, after, errors }, null, 2));

if (errors.length > 0) {
  errors.forEach((e) => console.log("  " + e));
  process.exit(1);
}
if (!webglOk || after.overlayHidden === false) {
  console.log("FAIL: webgl or overlay state wrong");
  process.exit(1);
}
if (before.score === after.score && before.lives === after.lives) {
  console.log("FAIL: simulation appears dead (neither score nor lives changed after launch)");
  process.exit(1);
}
console.log("SMOKE TEST PASSED");