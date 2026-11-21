// Deterministic audio data helpers — everything is a pure function of the
// precomputed beatdata.json (offline ffmpeg analysis). No Math.random, no Date.
import beatData from "../public/beatdata.json";

export const DATA = {
  fps: beatData.fps as number,
  frames: beatData.frames as number,
  durationSec: beatData.durationSec as number,
  bpm: beatData.bpm as number,
  beats: beatData.beatsFrame as number[],
  bands: beatData.bands as number[][], // [frames][8] normalized 0..1
};

const N = DATA.frames;

// Per-frame mean energy, 3-frame centered smoothing.
export const ENERGY: number[] = (() => {
  const out: number[] = new Array(N);
  for (let f = 0; f < N; f++) {
    let s = 0;
    let c = 0;
    for (let k = Math.max(0, f - 1); k <= Math.min(N - 1, f + 1); k++) {
      const row = DATA.bands[k];
      s +=
        (row[0] +
          row[1] +
          row[2] +
          row[3] +
          row[4] +
          row[5] +
          row[6] +
          row[7]) /
        8;
      c++;
    }
    out[f] = s / c;
  }
  return out;
})();

// Onset strength per beat: energy jump vs ~100ms earlier.
const beatStrength = DATA.beats.map((b) => {
  const prev = DATA.bands[Math.max(0, b - 3)];
  const cur = DATA.bands[Math.min(N - 1, b)];
  let jump = 0;
  for (let ch = 0; ch < 8; ch++) jump += Math.max(0, cur[ch] - prev[ch]);
  return Math.min(1, 0.35 + jump * 1.6);
});

// Decaying beat envelope per frame: punch on onset, 0.82^age decay (~15 frames).
export const BEAT_ENV: number[] = (() => {
  const out = new Array(N).fill(0);
  DATA.beats.forEach((b, i) => {
    const s = beatStrength[i];
    for (let a = 0; a + b < N && a < 18; a++) {
      out[b + a] = Math.max(out[b + a], s * Math.pow(0.82, a));
    }
  });
  return out;
})();

// Index of the most recent beat and its age in frames (for expanding rings).
export const lastBeat = (f: number): { age: number; strength: number } => {
  let best = -1;
  for (let i = DATA.beats.length - 1; i >= 0; i--) {
    if (DATA.beats[i] <= f) {
      best = i;
      break;
    }
  }
  if (best < 0) return { age: 999, strength: 0 };
  return { age: f - DATA.beats[best], strength: beatStrength[best] };
};

// Climax = strongest sustained energy window between 40% and 85% of the track.
export const CLIMAX_FRAME: number = (() => {
  let bestF = Math.floor(N * 0.6);
  let bestV = -1;
  const win = Math.round(DATA.fps * 4);
  for (let f = Math.floor(N * 0.4); f < Math.floor(N * 0.85); f++) {
    let s = 0;
    for (let k = f; k < Math.min(N, f + win); k++) s += ENERGY[k];
    if (s > bestV) {
      bestV = s;
      bestF = f;
    }
  }
  return bestF;
})();

// Band value for a ring bin with light temporal smoothing; bins mirror bands.
export const binValue = (f: number, bin: number, bins: number): number => {
  // walk 0..8 across the full circle, mirrored at the halfway point
  const t = (bin / bins) * 8;
  const pos = t <= 4 ? t : 8 - t;
  const lo = Math.min(6, Math.floor(pos));
  const frac = pos - lo;
  const row = DATA.bands[Math.max(0, Math.min(N - 1, f))];
  const a = row[lo];
  const b = row[lo + 1];
  const prevRow = DATA.bands[Math.max(0, Math.min(N - 1, f - 1))];
  const prev = prevRow[lo];
  const v = a * (1 - frac) + b * frac;
  return (v * 2 + prev) / 3; // ease jitter
};
