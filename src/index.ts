export interface ReservoirOptions {
  rng?: () => number;
  maxSeen?: number;
}
export function seededRandom(seed: number): () => number {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new RangeError('Seed must be uint32');
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
export class ReservoirSampler<T> {
  private readonly items: T[] = [];
  private seenCount = 0;
  private readonly rng: () => number;
  private readonly limit: number;
  readonly capacity: number;
  constructor(capacity: number, options: ReservoirOptions = {}) {
    if (!Number.isSafeInteger(capacity) || capacity < 0 || capacity > 1000000)
      throw new RangeError('Capacity must be 0..1000000');
    this.capacity = capacity;
    this.rng = options.rng ?? Math.random;
    this.limit = options.maxSeen ?? Number.MAX_SAFE_INTEGER;
    if (typeof this.rng !== 'function') throw new TypeError('Expected RNG callback');
    if (!Number.isSafeInteger(this.limit) || this.limit < 0)
      throw new RangeError('Invalid maxSeen');
  }
  get seen(): number {
    return this.seenCount;
  }
  get size(): number {
    return this.items.length;
  }
  add(value: T): void {
    if (this.seenCount >= this.limit) throw new RangeError('Stream limit exceeded');
    const next = this.seenCount + 1;
    if (this.items.length < this.capacity) this.items.push(value);
    else if (this.capacity > 0) {
      const uniform = this.rng();
      if (!Number.isFinite(uniform) || uniform < 0 || uniform >= 1)
        throw new RangeError('RNG must return a finite number in [0,1)');
      const index = Math.floor(uniform * next);
      if (index < this.capacity) this.items[index] = value;
    }
    this.seenCount = next;
  }
  sample(): T[] {
    return [...this.items];
  }
}
export function reservoirSample<T>(
  values: Iterable<T>,
  capacity: number,
  options: ReservoirOptions = {},
): T[] {
  const sampler = new ReservoirSampler<T>(capacity, options);
  for (const value of values) sampler.add(value);
  return sampler.sample();
}
