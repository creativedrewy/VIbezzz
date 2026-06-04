# Ball Breaker

A futuristic retro brick breaker built with Three.js and TypeScript.

## Run

```sh
npm install
npm run dev
```

## Build a Shareable HTML File

```sh
npm run build
```

The bundled game is written to `dist/index.html`. That file is self-contained and can be shared directly.

## Controls

- Move: mouse, trackpad, left/right arrows, or A/D
- Start/restart: click, tap, Enter, or Space

## Verification

```sh
npm run check:visual
```

The visual smoke test opens the local dev server, verifies the start screen, starts gameplay, checks WebGL pixels, and writes a screenshot to `/tmp/ball-breaker-check.png`.
