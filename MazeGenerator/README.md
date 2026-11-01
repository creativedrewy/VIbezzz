# Maze Generator

A client-side-only maze generator that runs entirely in the browser — no build step, no server.

- Set the maze **width and height**, then generate a fresh maze every time.
- **Play it online:** move the runner from START to the finish star with arrow keys / WASD, the on-screen pad, taps, or swipes. Spikes, spinning saws, and patrolling critters reset you to START on touch — press JUMP (or Space) to sail over them.
- Hazards are always placed with at least one empty square between any two of them, so there is always a landing spot between jumps; extra hazards are dropped on crowded sizes to keep that gap.
- **Print it:** download a clean black-and-white PNG or SVG of the same maze, with the hazards drawn frozen in place, and print it from your photos/files app.

## Files

- `index.html` — the whole app in a single self-contained file (the only external request is Google Fonts, with system-font fallbacks).

## Publishing

The deployable copy for GitHub Pages lives in [`web/maze-generator/`](../web/maze-generator) and is just a copy of this folder's `index.html`:

```sh
cp MazeGenerator/index.html web/maze-generator/index.html
```

Live at: https://creativedrewy.github.io/VIbezzz/web/maze-generator/
