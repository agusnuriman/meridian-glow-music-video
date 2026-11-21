# meridian-glow music-video

Remotion music visualizer template — episode 1: MERIDIAN GLOW (Retro Sunset Synthwave).
Video: https://youtu.be/kKuLQNySGNY

1080p @ 30fps, beat-synced dari analisis audio offline (ffmpeg, tanpa API key).
Musik original — bebas dipakai ulang, tanpa klaim copyright, tanpa royalti.
Kode: MIT. Yang diminta cuma satu: subscribe + bantu channel berkembang.

## Mulai episode baru (3 langkah)

```powershell
node new-episode.mjs "D:\path\track_baru.mp3" "NAMA TRACK"
npx remotion studio            # review dulu, WAJIB sebelum render
npx remotion render MeridianGlow out\episode.mp4
```

Detail lengkap: `TEMPLATE.md`. Prompt siap-pakai per episode: `../EPISODE-PROMPT.md`.

## Struktur

| Path | Isi |
|---|---|
| `analyze-audio.mjs` | analisis offline: 8-band RMS + onset/beat -> `public/beatdata.json` |
| `new-episode.mjs` | bootstrap episode: copy mp3, regenerasi beatdata, patch props |
| `src/MeridianGlow.tsx` | susunan layer + arc scene |
| `src/visuals.tsx` | semua layer visual (emblem SVG, dunes, spectrum bars, cards) |
| `src/audio-data.ts` | energi/beat/climax per frame, pure function dari beatdata |
| `src/Root.tsx` | komposisi + zod props (title, subtitle, trackFile, accentA/B) |

## Development

```powershell
npm install
npx remotion studio        # http://localhost:3000
npx remotion still MeridianGlow out/check.png --frame=100
```
