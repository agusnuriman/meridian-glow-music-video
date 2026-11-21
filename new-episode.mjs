// One-shot episode bootstrap for the music-video template.
// Usage: node new-episode.mjs "<path mp3>" "<TITLE>" ["<SUBTITLE>"]
// Steps: copy mp3 -> public/track.mp3, run offline beat analysis, patch Root.tsx defaultProps.
// After this: open Studio, review stills, render ONLY on explicit user instruction.
import { execFileSync } from "node:child_process";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

const [mp3Path, title, subtitle = "ORIGINAL MIX"] = process.argv.slice(2);
if (!mp3Path || !title) {
  console.error(
    'usage: node new-episode.mjs "<mp3 path>" "<TITLE>" ["<SUBTITLE>"]',
  );
  process.exit(1);
}

// 1. Audio asset -> public/track.mp3
copyFileSync(mp3Path, "public/track.mp3");
console.log("copied mp3 -> public/track.mp3");

// 2. Offline analysis -> public/beatdata.json (fps/frames/bands/beats grid)
execFileSync("node", ["analyze-audio.mjs", mp3Path], { stdio: "inherit" });
console.log("beatdata.json regenerated");

// 3. Patch defaultProps in src/Root.tsx
const ROOT = "src/Root.tsx";
let src = readFileSync(ROOT, "utf8");
const set = (key, val) => {
  const re = new RegExp(`(${key}: )'[^']*'`);
  if (!re.test(src))
    throw new Error(`defaultProps key '${key}' not found in Root.tsx`);
  src = src.replace(re, `$1'${val.replace(/'/g, "\\'")}'`);
};
set("title", title.toUpperCase());
set("subtitle", subtitle);
set("trackFile", "track.mp3");
writeFileSync(ROOT, src);
console.log(
  `Root.tsx patched: title='${title.toUpperCase()}', subtitle='${subtitle}', trackFile='track.mp3'`,
);

console.log(
  "\nNext: npx remotion still MeridianGlow out/check.png --frame=100, then Studio review.",
);
