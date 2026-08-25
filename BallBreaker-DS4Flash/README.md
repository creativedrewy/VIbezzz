# BALL BREAKER ⚡ DS4FLASH

A **2.5D tabletop-style Arkanoid clone** built entirely on Three.js. Bricks, paddle, ball and walls are real 3D geometry on a neon wireframe table, rendered with custom GLSL shaders and a two-pass bloom post-processing pipeline.

- **Self-contained**: `npm run build` emits a single `dist/index.html` with all JS inlined. No network requests, no external dependencies at runtime. Open it straight from disk (`file://`).
- **Language**: TypeScript, compiled with esbuild.
- **Screens**: Startup menu, in-game HUD/banners, and game-over screen with final score + best (persisted to `localStorage`).
- **Controls**: Mouse (move = paddle, click = launch), keyboard (`←/→` or `A/D` = move, `Space/Enter` = launch), and touch (drag = paddle, tap = launch).

## Play

```
npm install
npm run build        # -> dist/index.html (single file)
open dist/index.html
```

For live editing with an auto-rebuilding server:

```
npm run dev
```

## Gameplay

- Break bricks to score. Higher rows are worth more; the bottom row and heavy bricks resist multiple hits.
- **Three-screen flow**: menu → play → game-over (with restart). Banners announce each level.
- **Combo / multiplier**: chained multi-brick hits build a multiplier up to ×8.
- **Power-up capsules** occasionally drop from broken bricks:
  - 🌊 *Expand* — paddle grows for a while
  - 💗 *Multi-ball* — split into extra balls
  - 💚 *1UP* — extra life
  - 🕳 *Slow* — brief slow-motion
- **Lives**: start with 3. Lose all → game over.
- Flashing brick-hit feedback, camera shake, particle bursts, floating score popups, a glowing ball trail, and a light that follows the ball.

## Rendering / effects

- Custom shader materials for the animated neon floor, starfield sky dome, energy-ball, paddle, capsules and particle points.
- Manual **bloom** (bright-pass → separable gaussian blur at half-res → composite with ACES tonemapping + vignette + scanlines) via render targets.
- `GraphicsQuality`-free minimal setup: prefers WebGL2, falls back to WebGL1-safe shaders.

## Scripts

| Command | Description |
| --- | --- |
| `npm run build` | Compile to a single-file `dist/index.html` |
| `npm run dev` | Auto-rebuild + serve at `http://localhost:5173` |
| `npm run typecheck` | `tsc --noEmit` over `src/` |
| `node smoke.mjs` | Headless runtime test (menu → move → launch → verify sim is live) |

`smoke.mjs` requires a local headless Chromium via `playwright-core`; point `CHROME_BIN` at a build if needed.