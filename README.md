# Vibez — Web Apps Playground

A set of interactive browser experiments and games. Each app is a self-contained, compiled web app that runs entirely in the browser — open the link to try it online.

## Apps

| App | Link | Description |
| --- | --- | --- |
| **Ball Breaker — GLM 5.1** | [BallBreaker-GLM51](BallBreaker-GLM51) | A neon brick-breaker built with Three.js. Move the paddle and clear every block. Variant generated with GLM 5.1. |
| **Ball Breaker — GPT 5.5** | [BallBreaker-GPT55](BallBreaker-GPT55) | A futuristic retro brick breaker with Three.js and TypeScript. Mouse, keyboard, or touch controls. Variant generated with GPT 5.5. |
| **Ball Breaker — Grok 4.5** | [Ballbreaker-Grok45](Ballbreaker-Grok45) | A 2.5D Arkanoid-style brick breaker with score, lives, and level HUD. Variant generated with Grok 4.5. |
| **LDraw → GLB Converter** | [LdrawGLTF](LdrawGLTF) | Convert LDraw model files into optimized GLB/glTF assets for Three.js and other 3D engines. |
| **Wheel of Standup** | [WheelOfStandup](WheelOfStandup) | A 3D Price-is-Right style spinning wheel built with Three.js — pick who's up next. |

## Trying it online

Open [`index.html`](index.html) for a visual home page linking to every app, or jump straight to any app above.

For local viewing, serve the folder over HTTP so module paths load correctly:

```sh
python3 -m http.server
# then open http://localhost:8000/
```

## How the builds are produced

Each app lives in its own folder and is built with Vite (`npm install && npm run build`), producing a `dist/` output. The `dist/` folders are gitignored, so the committed, deployable artifacts are copied into the version-controlled [`web/`](web) directory. To refresh them, rebuild and re-copy:

```sh
for app in BallBreaker-GLM51 BallBreaker-GPT55 Ballbreaker-Grok45 LdrawGLTF WheelOfStandup; do
  (cd "$app" && npm install && npm run build)
done
cp -R BallBreaker-GLM51/dist web/ball-breaker-glm51
cp -R BallBreaker-GPT55/dist web/ball-breaker-gpt55
cp -R Ballbreaker-Grok45/dist web/ball-breaker-grok45
cp -R LdrawGLTF/dist      web/ldraw-gltf
cp -R WheelOfStandup/dist web/wheel-of-standup
```
