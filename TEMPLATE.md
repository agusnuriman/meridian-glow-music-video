# TEMPLATE musik-video — cara pakai untuk episode berikutnya

Satu project ini = template semua episode. Tidak perlu copy folder.

## Alur episode baru (3 langkah)

```powershell
cd D:\my-videoyoutube\imnnra\eps1\music-video

# 1. Bootstrap: copy mp3 + analisis beat + patch judul/track di Root.tsx
node new-episode.mjs "D:\path\ke\track_baru.mp3" "NAMA TRACK" ["SUBTITLE"]

# 2. Verifikasi visual (boleh ganti N dengan frame tengah/akhir dari beatdata.json)
npx remotion still MeridianGlow out/ep-check1.png --frame=100
npx remotion studio --port 3000   # review manual, wajib sebelum render

# 3. Render HANYA setelah user memerintahkan eksplisit
npx remotion render MeridianGlow "D:\my-videoyoutube\imnnra\eps<N>\<track>.mp4" --log=error
```

## Yang otomatis ikut track baru
- Durasi, beat grid, climax, OUTRO_START, chapters timing — semua dari `public/beatdata.json` hasil analisis offline (`analyze-audio.mjs`, ffmpeg 8-band RMS + spectral flux).

## Yang kadang perlu diedit manual (sedikit)
| Ingin ubah | File | Bagian |
|---|---|---|
| Palet warna / gaya poster | `src/visuals.tsx` | `PAPER`, `INK`, `accentA/B` di `Root.tsx` defaultProps |
| Emblem (logo tengah) | `src/visuals.tsx` | komponen `EmblemArt` (SVG vektor, jangan raster) |
| Teks outro | `src/Root.tsx` | `outroLine` |
| Durasi title card / outro | `src/MeridianGlow.tsx` | `durationInFrames={240}`, `DATA.frames - 250` |

## Aturan tetap (jangan dilanggar)
1. Tidak ada render MP4 tanpa instruksi eksplisit user.
2. Frame-driven murni: tanpa `Math.random()`/`Date.now()` — pakai `random(seed)`.
3. Data audio selalu diekstrak offline, tidak saat render.
4. zod ENOENT Studio: kalau muncul, salin `node_modules\zod` ke `node_modules\@remotion\studio\node_modules\zod`, restart Studio.

## Paket publish (setiap episode)
Checklist + contoh lengkap ada di `../EPISODE-PROMPT.md` dan riwayat eps1:
judul 3 varian, deskripsi+chapters+hashtag, tags <500 char, thumbnail dari key art
(`ffmpeg -i keyart.jpg -vf scale=1280:720,...`), jadwal 19:00 UTC = 03:00 WITA Sabtu,
kartu di 70% durasi, layar akhir 20 dtk (subscribe+channel), komentar pinned.
