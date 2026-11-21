import type {FC} from 'react';
import {Composition} from 'remotion';
import {z} from 'zod';
import {MeridianGlow} from './MeridianGlow';
import {DATA} from './audio-data';

export const meridianSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  outroLine: z.string(),
  trackFile: z.string(),
  accentA: z.string(),
  accentB: z.string(),
});

export type MeridianProps = z.infer<typeof meridianSchema>;

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="MeridianGlow"
        component={MeridianGlow}
        durationInFrames={DATA.frames}
        fps={DATA.fps}
        width={1920}
        height={1080}
        schema={meridianSchema}
        defaultProps={{
          title: 'MERIDIAN GLOW',
          subtitle: 'ORIGINAL MIX',
          outroLine: 'Thanks for watching',
          trackFile: 'meridian_glow.mp3',
          accentA: '#e8821e',
          accentB: '#2e7d99',
        }}
      />
    </>
  );
};
