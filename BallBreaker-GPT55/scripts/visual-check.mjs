import { chromium } from 'playwright';

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true
});

const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1
});

const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') {
    errors.push(message.text());
  }
});

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const startVisible = await page.locator('#start-screen.active').count();
const canvasStats = await page.locator('#game').evaluate((canvas) => {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const width = canvas.width;
  const height = canvas.height;
  let nonBlack = 0;

  if (gl) {
    for (let i = 0; i < 25; i += 1) {
      const x = Math.floor(((i % 5) + 0.5) * width / 5);
      const y = Math.floor((Math.floor(i / 5) + 0.5) * height / 5);
      const pixel = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      if (pixel[0] + pixel[1] + pixel[2] > 10) {
        nonBlack += 1;
      }
    }
  }

  return { width, height, hasGl: Boolean(gl), nonBlack };
});

await page.click('#start-button');
await page.waitForTimeout(250);
await page.mouse.move(180, 690, { steps: 3 });
await page.waitForTimeout(80);
await page.mouse.move(1100, 690, { steps: 4 });
await page.waitForTimeout(160);

const startStillVisible = await page.locator('#start-screen.active').count();
const scoreText = await page.locator('#score').textContent();
const livesText = await page.locator('#lives').textContent();
await page.screenshot({ path: '/tmp/ball-breaker-check.png', fullPage: true });
await browser.close();

const result = {
  startVisible: startVisible === 1,
  gameStarted: startStillVisible === 0,
  scoreText,
  livesText,
  canvasStats,
  errors
};

console.log(JSON.stringify(result, null, 2));

if (!result.startVisible || !result.gameStarted || !canvasStats.hasGl || canvasStats.nonBlack < 5 || errors.length) {
  process.exitCode = 1;
}
