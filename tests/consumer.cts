import {
  seededRandom,
  ReservoirSampler,
  reservoirSample,
  type ReservoirOptions,
} from '@lp-labs/reservoir-sampling';
export type PublicTypes = [ReservoirOptions];
void seededRandom;
void ReservoirSampler;
void reservoirSample;
const sampler = new ReservoirSampler<string>(2, { rng: seededRandom(4) });
sampler.add('a');
const sample: string[] = reservoirSample(['a', 'b'], 1);
void sample;
// @ts-expect-error sampler retains member type
sampler.add(1);
