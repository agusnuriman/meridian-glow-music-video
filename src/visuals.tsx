// Visual layers — all motion is a pure function of useCurrentFrame().
// Rebrand: warm retro travel-poster key art (img/38xtyg38xtyg3.jpg).
// Motion personality: Premium/cinematic — long holds, smooth drifts, beats
// PULSE the visuals instead of cutting them.
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {BEAT_ENV, binValue, CLIMAX_FRAME, DATA, ENERGY, lastBeat} from './audio-data';

// Poster palette pulled from the key art.
export const PAPER = '#f4ead8';
const INK = '#2b3a5c';
const ORANGE_DEEP = '#c96a12';

// Sky-to-paper gradient with a sun glow that swells with track energy.
export const AuroraBackground: React.FC<{
  accentA: string;
  accentB: string;
}> = ({accentA, accentB}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const e = ENERGY[frame];
  const t = frame / DATA.fps;
  const blobs = [
    {
      color: accentA, // warm orange haze
      x: 0.3 + 0.1 * Math.sin(t * 0.11),
      y: 0.42 + 0.08 * Math.cos(t * 0.07),
      size: 0.9 + e * 0.3,
      o: 0.14 + e * 0.1,
    },
    {
      color: accentB, // teal haze low right
      x: 0.72 + 0.09 * Math.sin(t * 0.09 + 2.1),
      y: 0.62 + 0.09 * Math.cos(t * 0.06 + 1.3),
      size: 0.85 + e * 0.3,
      o: 0.13 + e * 0.1,
    },
  ];
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #9ccfdd 0%, #d9cdb2 52%, ${PAPER} 100%)`,
      }}
    >
      {/* sun glow behind the emblem, breathes with energy */}
      <div
        style={{
          position: 'absolute',
          left: width / 2 - height * 0.55,
          top: height * 0.5 - height * 0.55,
          width: height * 1.1,
          height: height * 1.1,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,214,140,${0.5 + e * 0.3}) 0%, rgba(255,214,140,0) 62%)`,
        }}
      />
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x * width,
            top: b.y * height,
            width: width * 0.7 * b.size,
            height: width * 0.7 * b.size,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.color} 0%, transparent 62%)`,
            opacity: b.o,
            filter: 'blur(70px)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// The key-art emblem redrawn as pure vector art — no raster crop, no edges.
// Hand-traced from img/38xtyg38xtyg3.jpg: sun circle, flame, dunes, water bar.
const EmblemArt: React.FC<{size: number}> = ({size}) => {
  const h = (size * 560) / 440;
  return (
    <svg width={size} height={h} viewBox="0 0 440 560">
      <defs>
        <linearGradient id="em-circle" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#33566e" />
          <stop offset="42%" stopColor="#d97a2e" />
          <stop offset="100%" stopColor="#f2913f" />
        </linearGradient>
        <radialGradient id="em-sun" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0%" stopColor="#fff6dc" />
          <stop offset="65%" stopColor="#ffd98a" />
          <stop offset="100%" stopColor="#f7b95f" />
        </radialGradient>
        <linearGradient id="em-flame" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#f08a24" />
          <stop offset="55%" stopColor="#f0954a" />
          <stop offset="100%" stopColor="#ef988a" />
        </linearGradient>
        <clipPath id="em-clip">
          <circle cx={210} cy={330} r={175} />
        </clipPath>
      </defs>
      {/* main sun circle */}
      <circle cx={210} cy={330} r={175} fill="url(#em-circle)" />
      <g clipPath="url(#em-clip)">
        {/* inner glowing sun */}
        <circle cx={185} cy={300} r={95} fill="url(#em-sun)" />
        {/* dune bands */}
        <path
          d="M 35 322 C 90 302 130 332 180 327 C 232 322 262 347 320 342 L 385 337 L 385 385 L 35 385 Z"
          fill="#f0a04a"
        />
        <path
          d="M 35 352 C 100 342 160 367 230 360 C 300 353 342 372 385 364 L 385 405 L 35 405 Z"
          fill="#ef9385"
          opacity={0.9}
        />
        {/* bottom orange swell + teal streaks */}
        <path
          d="M 60 432 C 120 422 152 447 210 442 C 262 438 302 457 360 447 L 360 505 L 60 505 Z"
          fill="#ef8b32"
        />
        <rect x={178} y={452} width={172} height={26} rx={13} fill="#4d93aa" />
        <rect x={120} y={486} width={140} height={14} rx={7} fill="#4d93aa" opacity={0.7} />
      </g>
      {/* flame: slim comma over the circle's right arc, tip high above it */}
      <path
        d="M 246 16
           C 230 92 234 158 258 214
           C 280 264 292 316 288 368
           C 285 420 264 452 236 466
           C 288 450 322 396 328 330
           C 334 254 310 148 246 16 Z"
        fill="url(#em-flame)"
      />
      {/* water bar crossing the full emblem, extends past the circle */}
      <rect x={28} y={392} width={368} height={20} rx={10} fill="#3f8fa8" />
      <rect x={300} y={384} width={140} height={9} rx={4.5} fill="#f7ecd8" opacity={0.95} />
      <path
        d="M 30 396 C 12 396 8 388 14 382 C 20 376 34 380 40 388 Z"
        fill="#4a86a0"
      />
    </svg>
  );
};

export const EmblemLayer: React.FC<{dim?: boolean}> = ({dim = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const env = BEAT_ENV[frame];
  const e = ENERGY[frame];
  const enter = spring({frame: frame - 120, fps, config: {damping: 200}});
  const breathe = 1 + env * 0.018 + e * 0.03;
  const tilt = Math.sin(frame / DATA.fps / 3) * 1.2; // deg, slow sway
  const opacity = interpolate(frame, [120, 190], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: dim ? opacity * 0.35 : opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          transform: `scale(${breathe * (0.86 + enter * 0.14)}) rotate(${tilt}deg)`,
          filter: 'drop-shadow(0 18px 46px rgba(160,90,20,0.28))',
        }}
      >
        <EmblemArt size={500} />
      </div>
    </AbsoluteFill>
  );
};

// Warm dust motes drifting upward, brightened on beats.
export const StarField: React.FC<{count?: number}> = ({count = 90}) => {
  const frame = useCurrentFrame();
  const env = BEAT_ENV[frame];
  const motes = [];
  for (let i = 0; i < count; i++) {
    const seed = `mote-${i}`;
    const x = random(`${seed}-x`) * 1920;
    const baseY = random(`${seed}-y`) * 1080;
    const size = 2 + random(`${seed}-s`) * 4;
    const speed = 0.25 + random(`${seed}-sp`) * 0.6;
    const phase = random(`${seed}-ph`) * Math.PI * 2;
    const sway = Math.sin(frame * 0.02 + phase) * 22;
    const y = (((baseY - frame * speed * 4) % 1140) + 1140) % 1140 - 30;
    const tw = 0.5 + 0.5 * Math.sin(frame * speed * 0.12 + phase);
    const opacity = tw * (0.16 + env * 0.18);
    const warm = random(`${seed}-w`) > 0.5;
    motes.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x + sway,
          top: y,
          width: size,
          height: size,
          borderRadius: '50%',
          background: warm ? '#f2b26b' : '#ffffff',
          opacity,
        }}
      />,
    );
  }
  return <AbsoluteFill>{motes}</AbsoluteFill>;
};

// Layered dune silhouettes along the bottom, mirroring the poster.
export const DuneLayers: React.FC = () => {
  const frame = useCurrentFrame();
  const e = ENERGY[frame];
  const t = frame / DATA.fps;
  const dune = (
    fill: string,
    yBase: number,
    amp: number,
    drift: number,
    opacity: number,
  ) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const x = (i / 24) * 2200 - 140;
      const y =
        yBase +
        amp * Math.sin(i * 0.9 + drift + t * 0.18) +
        amp * 0.5 * Math.sin(i * 1.7 - drift * 1.3 + t * 0.11) -
        e * 8;
      pts.push(`${x},${y.toFixed(1)}`);
    }
    return (
      <polygon
        points={`-160,1240 ${pts.join(' ')} 2080,1240`}
        fill={fill}
        opacity={opacity}
      />
    );
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {dune('#f2b26b', 950, 34, 0.6, 0.75)}
        {dune('#7fb8c9', 995, 28, 2.4, 0.7)}
        {dune(PAPER, 1035, 20, 4.1, 0.95)}
      </svg>
    </AbsoluteFill>
  );
};

// Center radial spectrum: 72 bins around the emblem, warm ink bars.
export const RadialBars: React.FC<{
  accentA: string;
  accentB: string;
  dim?: boolean;
}> = ({accentA, accentB, dim = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const BINS = 72;
  const CX = 960;
  const CY = 540;
  const R0 = 300;
  const MAXLEN = 190;

  // climax swell: whole ring breathes bigger around the drop window
  const dToClimax = Math.abs(frame - CLIMAX_FRAME);
  const climaxBoost = interpolate(dToClimax, [0, 150], [1.28, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // entrance: ring grows in with a spring after the intro
  const enter = spring({frame: frame - 170, fps, config: {damping: 200}});
  const env = BEAT_ENV[frame];
  const punch = 1 + env * 0.025;
  const rot = (frame / DATA.fps) * 1.6; // slow continuous spin, deg

  const bars = [];
  for (let i = 0; i < BINS; i++) {
    const raw = binValue(frame, i, BINS);
    const v = Math.pow(raw, 1.35); // contrast curve: quiet bins sit shorter
    // per-bin identity: stable size bias + gentle flutter, deterministic seeds
    const bias = 0.72 + random(`bin-${i}`) * 0.55;
    const fl =
      0.92 +
      0.08 *
        Math.sin(
          frame * (0.25 + random(`fl-${i}`) * 0.5) +
            random(`ph-${i}`) * Math.PI *
              2,
        );
    const len = (10 + v * bias * fl * MAXLEN * climaxBoost) * enter;
    const ang = (i / BINS) * 360 + rot;
    const mix = i / BINS; // alternate warm/cool halves
    const color = mix < 0.5 ? accentA : accentB;
    const rad = (ang * Math.PI) / 180;
    const x1 = CX + Math.cos(rad) * R0;
    const y1 = CY + Math.sin(rad) * R0;
    const x2 = CX + Math.cos(rad) * (R0 + len);
    const y2 = CY + Math.sin(rad) * (R0 + len);
    bars.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={5 + v * 5}
        strokeLinecap="round"
        opacity={0.3 + v * 0.55}
      />,
    );
  }
  return (
    <AbsoluteFill style={{opacity: dim ? 0.3 : 1}}>
      <svg
        width={1920}
        height={1080}
        style={{
          position: 'absolute',
          transform: `scale(${punch})`,
          transformOrigin: '50% 50%',
        }}
      >
        {bars}
      </svg>
    </AbsoluteFill>
  );
};

// Expanding ring fired by each detected beat; size/opacity decay with age.
export const BeatRings: React.FC<{accentA: string; accentB: string}> = ({
  accentA,
  accentB,
}) => {
  const frame = useCurrentFrame();
  const {age, strength} = lastBeat(frame);
  if (age > 26 || strength < 0.4) return null;
  const p = age / 26;
  const r = 290 + p * 560 * strength;
  const opacity = (1 - p) * 0.55 * strength;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 960 - r,
          top: 540 - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: `3px solid ${strength > 0.75 ? accentB : accentA}`,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

// Kinetic title: serif letters spring in staggered, ink-on-paper poster look.
export const TitleCard: React.FC<{
  title: string;
  subtitle: string;
  accentA: string;
}> = ({title, subtitle, accentA}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const letters = title.split('');
  const exit = interpolate(frame, [190, 235], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height * 0.12,
        opacity: 1 - exit,
        transform: `translateY(${-exit * (height * 0.06)}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 700,
          fontSize: 112,
          letterSpacing: 4,
          color: INK,
          textShadow: '0 2px 24px rgba(255,240,210,0.9)',
        }}
      >
        {letters.map((ch, i) => {
          const s = spring({
            frame: frame - 8 - i * 3,
            fps,
            config: {damping: 200, mass: 0.9},
          });
          if (ch === ' ')
            return <span key={i} style={{width: 40}} />;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: s,
                transform: `translateY(${(1 - s) * 60}px) scale(${0.7 + s * 0.3})`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 400,
          fontStyle: 'italic',
          fontSize: 34,
          letterSpacing: 14,
          color: ORANGE_DEEP,
          opacity: interpolate(frame, [55, 90], [0, 0.95], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

// Outro: wash to paper-white instead of blackout; line + subscribe pill.
export const OutroCard: React.FC<{
  outroLine: string;
  accentA: string;
  accentB: string;
  startFrame: number;
}> = ({outroLine, accentA, accentB, startFrame}) => {
  const rel = useCurrentFrame() - startFrame;
  const {fps} = useVideoConfig();
  if (rel < 0) return null;
  const lineIn = spring({frame: rel, fps, config: {damping: 200}});
  const pillIn = spring({frame: rel - 26, fps, config: {damping: 160}});
  const toPaper = interpolate(rel, [180, 240], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: `rgba(244,234,216,${toPaper})`,
      }}
    >
      <div
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 700,
          fontSize: 76,
          color: INK,
          opacity: lineIn,
          transform: `scale(${0.9 + lineIn * 0.1})`,
          textShadow: '0 2px 20px rgba(255,240,210,0.8)',
        }}
      >
        {outroLine}
      </div>
      <div
        style={{
          marginTop: 46,
          padding: '22px 54px',
          borderRadius: 999,
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 4,
          color: PAPER,
          background: `linear-gradient(90deg, ${accentA}, ${accentB})`,
          opacity: Math.max(0, pillIn),
          transform: `translateY(${(1 - pillIn) * 40}px)`,
        }}
      >
        SUBSCRIBE · MORE DROPS COMING
      </div>
    </AbsoluteFill>
  );
};

export const ProgressBar: React.FC<{
  accentA: string;
  accentB: string;
}> = ({accentA, accentB}) => {
  const frame = useCurrentFrame();
  const pct = (frame / DATA.frames) * 100;
  const opacity = interpolate(frame, [220, 300], [0, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 6,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${accentA}, ${accentB})`,
        }}
      />
    </AbsoluteFill>
  );
};

// Soft warm edge darkening + faint paper speckle, like the print texture.
export const Vignette: React.FC = () => {
  const speckle = [];
  for (let i = 0; i < 70; i++) {
    const x = random(`spk-${i}-x`) * 1920;
    const y = random(`spk-${i}-y`) * 1080;
    const s = 1 + random(`spk-${i}-s`) * 2;
    speckle.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: s,
          height: s,
          borderRadius: '50%',
          background: '#8a6a3a',
          opacity: 0.06 + random(`spk-${i}-o`) * 0.08,
        }}
      />,
    );
  }
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {speckle}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 58%, rgba(120,80,40,0.2) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
