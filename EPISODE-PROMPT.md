# PROMPT EPISODE — pakai ini di awal setiap episode baru

Salin, isi bagian `<...>`, kirim ke agen. Template: `music-video/` (Remotion, 1920x1080@30fps).

```
/zlnaCreator /imnnraFllstck episode baru pakai template music-video.

Track      : <nama track>
MP3        : <path lengkap mp3>
Key art    : <path gambar referensi gaya, atau "sama seperti eps sebelumnya">
Judul card : <JUDUL UNTUK TITLE CARD, default = nama track>
Target     : <penonton / zona, mis. internasional synthwave>

Aturan wajib:
1. Jalankan node new-episode.mjs "<mp3>" "<judul>" lalu still check frame 100 / tengah / akhir.
2. JANGAN render MP4 tanpa instruksi eksplisit saya. Saya review di Studio dulu.
3. Setelah saya sahkan, render ke D:\my-videoyoutube\imnnra\eps<N>\ dengan nama <track>.mp4.
4. Buat paket publish lengkap: judul (3 varian), deskripsi + chapters + hashtag,
   18 tags (<500 char), thumbnail dari key art (ffmpeg), jadwal = 19:00 UTC
   dikonversi ke WITA, kartu di 70% durasi, layar akhir 20 detik terakhir
   (subscribe + channel), komentar pinned.
5. Semua angka timing (chapters, kartu, layar akhir) dihitung dari beatdata.json, bukan tebakan.
```

## Catatan kecil yang sering berubah per episode
- Gaya visual beda total → minta agen sesuaikan palet di `src/visuals.tsx` (konstanta `PAPER`, `accentA/B`) sebelum still check.
- Durasi track beda → otomatis; `OUTRO_START` dan semua Sequence mengikuti `beatdata.json`.
- Render lama normal (blur + 72 bar SVG); ±40 menit untuk ~3 menit video di mesin ini.
