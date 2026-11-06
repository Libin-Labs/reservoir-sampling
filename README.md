# @lp-labs/reservoir-sampling

Streaming Algorithm R reservoir samples with injectable validated randomness. Zero runtime and peer dependencies. MIT. Node.js 18+; ES2022-compatible browser runtimes with BigInt where used. No browser globals accessed at import.

## Install

```sh
npm install @lp-labs/reservoir-sampling
```

## Quick start

```js
import { reservoirSample, seededRandom } from '@lp-labs/reservoir-sampling';
console.log(reservoirSample([1, 2, 3, 4, 5], 2, { rng: seededRandom(42) }));
```

ES modules use named imports above. CommonJS uses `const { seededRandom, ReservoirSampler, reservoirSample } = require('@lp-labs/reservoir-sampling');`. Both formats ship declarations.

## Public API and customization

- `ReservoirOptions`: `rng?: () => number` default Math.random; `maxSeen?` nonnegative safe integer, default MAX_SAFE_INTEGER.
- `seededRandom(seed): () => number`: uint32-seeded LCG with multiplier 1664525, increment 1013904223, modulo 2^32; deterministic [0,1) output including seed 0.
- `ReservoirSampler<T>(capacity,options?)`: read-only `capacity`, `seen`, `size`; `add(value): void`, `sample(): T[]`.
- `reservoirSample<T>(values,capacity,options?): T[]`: iterable convenience wrapper.
- Algorithm R fills first k slots, then for item number n draws floor(rng()*n), replacing if index < k. No draws while filling or for k=0. Sample slot order is not random permutation or source order.

All runtime exports and public declaration types are listed above. Options are per call/instance; no global configuration.

## Errors, ownership and limits

Capacity 0..1,000,000. RangeError for invalid limits/seeds, stream count exhaustion or RNG outputs outside finite [0,1); TypeError for a nonfunction RNG. Failed draws do not advance count or mutate sample (callback state cannot be rolled back). Add O(1), total O(n), space O(k); snapshots copy containers but retain item references. Equal inclusion probability assumes independent ideal uniform draws; finite-resolution RNGs introduce discretization, especially very large n. Seeded LCG/Math.random are noncryptographic and not secure sampling. Callbacks must not reenter the sampler.

Algorithms are synchronous and CPU/memory bounded by the stated limits, not cancellable or real-time. Validation does not sandbox hostile getters, proxies, callbacks or infinite iterables. TypeScript signatures are the supported input contract. No I/O, network, persistence or cryptographic guarantees.

## Development

```sh
npm ci --offline
npm run build
npm run typecheck
npm test
npm run format:check
```

Strict TypeScript, ESM/CommonJS, bare installed-package consumers with negative type assertions, and deterministic reference-oracle tests are included. Only TypeScript and Prettier are development dependencies.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
