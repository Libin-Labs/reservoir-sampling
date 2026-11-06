import test from 'node:test';
import assert from 'node:assert/strict';
import * as lib from '../dist/esm/index.js';
function random(seed = 123456789) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test('short streams and zero capacity', () => {
  assert.deepEqual(lib.reservoirSample([1, 2], 4), [1, 2]);
  const s = new lib.ReservoirSampler(0, {
    rng: () => {
      throw Error('unused');
    },
  });
  s.add(1);
  assert.equal(s.seen, 1);
  assert.deepEqual(s.sample(), []);
});
test('Algorithm R replacement positions', () => {
  const draws = [0, 0.99, 0.3],
    s = new lib.ReservoirSampler(2, { rng: () => draws.shift() });
  [0, 1, 2, 3, 4].forEach((x) => s.add(x));
  assert.deepEqual(s.sample(), [2, 4]);
  assert.equal(s.seen, 5);
});
test('deterministic LCG seed', () => {
  const a = lib.seededRandom(42),
    b = lib.seededRandom(42);
  for (let i = 0; i < 100; i++) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
  assert.equal(lib.seededRandom(0)(), 1013904223 / 4294967296);
});
test('range and capacity validation preserves failed add', () => {
  for (const bad of [NaN, Infinity, -0.1, 1, '0']) {
    const s = new lib.ReservoirSampler(1, { rng: () => bad });
    s.add(1);
    assert.throws(() => s.add(2), RangeError);
    assert.equal(s.seen, 1);
    assert.deepEqual(s.sample(), [1]);
  }
  assert.throws(() => new lib.ReservoirSampler(-1), RangeError);
  assert.throws(() => lib.seededRandom(2 ** 32), RangeError);
  const s = new lib.ReservoirSampler(1, { maxSeen: 1 });
  s.add(1);
  assert.throws(() => s.add(2), RangeError);
});
test('snapshots own containers retain references', () => {
  const value = { id: 1 },
    s = new lib.ReservoirSampler(2);
  s.add(value);
  const sample = s.sample();
  sample.push({ id: 2 });
  assert.equal(s.size, 1);
  assert.equal(s.sample()[0], value);
});
test('seeded independent full Algorithm R oracle', () => {
  const rng = random();
  for (let t = 0; t < 100; t++) {
    const seed = Math.floor(rng() * 2 ** 32),
      k = Math.floor(rng() * 10),
      n = 20 + Math.floor(rng() * 80),
      draws = [],
      source = lib.seededRandom(seed);
    for (let i = 0; i < n; i++) draws.push(source());
    const expected = Array.from({ length: Math.min(k, n) }, (_, i) => i);
    let at = 0;
    for (let i = k; i < n && k > 0; i++) {
      const j = Math.floor(draws[at++] * (i + 1));
      if (j < k) expected[j] = i;
    }
    let cursor = 0;
    assert.deepEqual(
      lib.reservoirSample(
        Array.from({ length: n }, (_, i) => i),
        k,
        { rng: () => draws[cursor++] },
      ),
      expected,
    );
    assert.equal(new Set(expected).size, expected.length);
  }
});
