// Offline audio analysis: MP3 (arg1) -> public/beatdata.json
// Pipeline: ffmpeg decode (8kHz mono f32) -> 8 log-band biquad split -> per-frame RMS @30fps
// -> spectral-flux onset detection with adaptive threshold -> beat timestamps.
// Deterministic, stdlib-only Node. Run from repo root.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";

const MP3 =
  process.argv[2] || "D:/my-videoyoutube/imnnra/eps1/Music/Meridian_Glow.mp3";
const SR = 8000;
const FPS = 30;
const OUT = "public/beatdata.json";

// 1. Decode to raw PCM float32 mono 8kHz
mkdirSync("tmp", { recursive: true });
execSync(
  `ffmpeg -y -v error -i "${MP3}" -f f32le -ac 1 -ar ${SR} tmp/audio.raw`,
);
const buf = readFileSync("tmp/audio.raw");
const samples = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
const durationSec = samples.length / SR;
const frames = Math.round(durationSec * FPS);

// 2. Biquad filters (RBJ cookbook, Butterworth Q=0.7071)
const makeBiquad = (b0, b1, b2, a1, a2) => {
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
  return (x) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    return y;
  };
};
const coeffs = (b0, b1, b2, a0, a1, a2) =>
  makeBiquad(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0);
const lp = (fc) => {
  const w = (2 * Math.PI * fc) / SR;
  const cos = Math.cos(w);
  const alpha = Math.sin(w) / (2 * 0.7071);
  return coeffs(
    (1 - Math.cos(w)) / 2,
    1 - cos,
    (1 - Math.cos(w)) / 2,
    1 + alpha,
    -2 * cos,
    1 - alpha,
  );
};
const hp = (fc) => {
  const w = (2 * Math.PI * fc) / SR;
  const cos = Math.cos(w);
  const alpha = Math.sin(w) / (2 * 0.7071);
  return coeffs(
    (1 + cos) / 2,
    -(1 + cos),
    (1 + cos) / 2,
    1 + alpha,
    -2 * cos,
    1 - alpha,
  );
};

// 8 log-spaced bands (Nyquist 4kHz @ 8kHz SR): 40-100,100-200,...,3400+
const EDGES = [40, 100, 200, 400, 800, 1600, 2600, 3400];
const filters = [];
for (let i = 0; i < EDGES.length; i++) {
  const hi = i === EDGES.length - 1 ? null : EDGES[i + 1];
  filters.push({ low: hp(EDGES[i]), high: hi ? lp(hi) : null });
}

// 3. Per-frame RMS per band (single pass, frame = SR/FPS samples)
const spf = Math.floor(SR / FPS);
const bandE = []; // [frames][8] raw RMS
for (let f = 0; f < frames; f++) {
  bandE.push(new Array(8).fill(0));
}
const sums = Array.from({ length: 8 }, () => new Float64Array(frames));
for (let ch = 0; ch < 8; ch++) {
  const { low, high } = filters[ch];
  let acc = 0;
  let count = 0;
  for (let n = 0; n < samples.length; n++) {
    let s = low(samples[n]);
    if (high) s = high(s);
    acc += s * s;
    count++;
    if (count === spf) {
      const f = Math.floor(n / spf);
      if (f < frames) sums[ch][f] = Math.sqrt(acc / count);
      acc = 0;
      count = 0;
    }
  }
}
for (let f = 0; f < frames; f++) {
  for (let ch = 0; ch < 8; ch++) bandE[f][ch] = sums[ch][f];
}

// 4. Onset detection on log-band-energy spectral flux
const logE = bandE.map((row) => row.map((v) => Math.log(1 + v * 60)));
const flux = new Float64Array(frames);
for (let f = 1; f < frames; f++) {
  let s = 0;
  for (let ch = 0; ch < 8; ch++) {
    const d = logE[f][ch] - logE[f - 1][ch];
    if (d > 0) s += d;
  }
  flux[f] = s;
}
// adaptive threshold: local mean over window + delta
const W = 12;
const beats = [];
for (let f = 2; f < frames - 1; f++) {
  let m = 0;
  for (let k = f - W; k <= f + W; k++) m += flux[k];
  m /= 2 * W + 1;
  const thr = m * 1.8 + 0.008;
  if (flux[f] > thr && flux[f] >= flux[f - 1] && flux[f] > flux[f + 1]) {
    const last = beats[beats.length - 1];
    if (last === undefined || f - last >= Math.round(FPS * 0.18)) beats.push(f);
  }
}

// 5. BPM estimate from median inter-beat interval
const ivs = [];
for (let i = 1; i < beats.length; i++) ivs.push(beats[i] - beats[i - 1]);
ivs.sort((a, b) => a - b);
const med = ivs.length ? ivs[Math.floor(ivs.length / 2)] : FPS;
const bpm = Math.round(((60 * FPS) / med) * 10) / 10;

// 6. Normalize energies 0..1 per band (P95 scale) for render-time use
const norm = bandE.map((row) => row.slice());
for (let ch = 0; ch < 8; ch++) {
  const col = norm.map((r) => r[ch]).sort((a, b) => a - b);
  const p95 = col[Math.floor(col.length * 0.95)] || 1;
  for (let f = 0; f < frames; f++) {
    norm[f][ch] = Math.round(Math.min(1, norm[f][ch] / p95) * 1000) / 1000;
  }
}

mkdirSync("public", { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({
    fps: FPS,
    frames,
    durationSec: Math.round(durationSec * 1000) / 1000,
    bpm,
    beatsSec: beats.map((f) => Math.round((f / FPS) * 1000) / 1000),
    beatsFrame: beats,
    bands: norm,
  }),
);
rmSync("tmp", { recursive: true, force: true });
console.log(
  `beatdata.json: ${frames} frames, ${beats.length} beats, ~${bpm} BPM, ${durationSec.toFixed(1)}s`,
);
