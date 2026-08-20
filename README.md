# Ransom Note Generator

Type a message and watch it get spelled out in cut-out letters, collaged onto a torn paper background — like a classic ransom note.

## Features

- **Type directly into the note** — no separate input field, the paper itself is editable
- **Real cut-out letters** where available (magazine-style clippings), with a randomized CSS-generated fallback for any character that doesn't have image variants yet
- **Randomized per letter**: font, rotation, size, color, and clip shape are all seeded, so the look is stable while you type but reshuffles on every page load
- **Custom text cursor** positioned against the actual rendered letters, not a generic font's metrics
- **Auto-fit**: typing is capped so the note never overflows its paper background
- **Download as PNG** of the finished note

## Stack

- React + TypeScript
- Vite
- Tailwind CSS v4

## Getting started

```bash
npm install
npm run dev
```

## Project structure

- `src/App.tsx` — page shell (title, download button)
- `src/components/RansomNote.tsx` — the editable note surface, cursor, and text-fit logic
- `src/components/RansomLetter.tsx` — renders a single letter (image cutout or CSS fallback)
- `src/lib/letterSprites.ts` — loads and groups letter cutout images from `src/assets/letters/`
- `src/lib/letterStyle.ts` — generates the fallback CSS letter style for characters with no image
- `src/lib/random.ts` — seeded PRNG utilities

## Adding more letter variants

Drop a PNG into `src/assets/letters/` named after the character it represents (e.g. `o.png`). Additional variants of the same letter get a numeric suffix (`o-1.png`, `o-2.png`, ...) and are picked at random per occurrence.

## Credits

Letter cutout graphics from [OnlyGFX](https://www.onlygfx.com/) — see `src/assets/letters/licence.txt`.
