import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import type {MeridianProps} from './Root';
import {DATA} from './audio-data';
import {
  AuroraBackground,
  BeatRings,
  DuneLayers,
  EmblemLayer,
  OutroCard,
  PAPER,
  ProgressBar,
  RadialBars,
  StarField,
  TitleCard,
  Vignette,
} from './visuals';

// Scene arc (beat-sync-editing): Establish over the intro card, Develop with the
// full ring, Climax swell computed from energy, Resolve = outro hold + blackout.
const OUTRO_START = DATA.frames - 250;

export const MeridianGlow: React.FC<MeridianProps> = ({
  title,
  subtitle,
  outroLine,
  trackFile,
  accentA,
  accentB,
}) => {
  const frame = useCurrentFrame();
  const inOutro = frame >= OUTRO_START;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <Audio src={staticFile(trackFile)} />
      <AuroraBackground accentA={accentA} accentB={accentB} />
      <StarField />
      <BeatRings accentA={accentA} accentB={accentB} />
      <EmblemLayer dim={inOutro} />
      <RadialBars accentA={accentA} accentB={accentB} dim={inOutro} />
      <DuneLayers />
      <Vignette />
      <Sequence from={0} durationInFrames={240}>
        <TitleCard title={title} subtitle={subtitle} accentA={accentA} />
      </Sequence>
      <OutroCard
        outroLine={outroLine}
        accentA={accentA}
        accentB={accentB}
        startFrame={OUTRO_START}
      />
      {/* progress bar retires when the blackout fade begins */}
      <Sequence from={0} durationInFrames={OUTRO_START + 180}>
        <ProgressBar accentA={accentA} accentB={accentB} />
      </Sequence>
    </AbsoluteFill>
  );
};
