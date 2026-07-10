# Did You Know — Cats (Remotion)

Portrait viral-style short built with Remotion **Interactive** elements so Studio can select, drag, and edit every layer.

## Quick start

```bash
cd Remotion-Grok45
npm install
npm run dev
```

## How to edit in Studio

1. **Click any graphic or caption on the canvas** — it outlines and selects (Interactive elements).
2. **Timeline tracks** name every layer (cat, words, decor, badge, CTA).
3. Drag on canvas or edit **Offset / Scale / Rotate / Opacity** in the inspector.
4. Double-click text layers to edit copy where supported.
5. Open the right sidebar (**⌘/Ctrl + J**) → **Props** for composition-wide copy + colors.
6. Save prop/style edits with 💾.

## Composition

| Setting | Value |
|--------|-------|
| ID | `DidYouKnowCats` |
| Size | 1080×1920 (9:16) |
| FPS | 30 |
| Duration | 360 frames (12s) |

Source: `src/DidYouKnowCats.tsx` (Interactive.* for each entity).

## Render

```bash
npx remotion render DidYouKnowCats out/did-you-know-cats.mp4
```
