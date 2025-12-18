### @uttr/tint

a microscopic, fast, zero-dependency ANSI styling library for Node.js, Bun, and Deno.

`tint` is optimized for performance by aggressively caching style chains and pre-compiling regex logic for correct nesting. It provides a familiar chainable API (`tint.red.bold`) and fully supports template literals.

### installation

```sh
npm install @uttr/tint
```

```sh
yarn add @uttr/tint
```

```sh
pnpm add @uttr/tint
```

```sh
bun add @uttr/tint
```

### usage

```typescript
import * as tint from '@uttr/tint'

// Chainable API
console.log(tint.cyan.bold('Hello World'))

// Template Literals (Recommended)
console.log(tint.green`Server running at ${tint.underline`http://localhost:3000`}`)

// Nested styles work correctly
console.log(tint.red`Error: ${tint.yellow.italic`File not found`}`)
```

or using named imports:

```typescript
import { bold, green, red } from '@uttr/tint'

console.log(red.bold`Success!`)
```

### versioning

- `v0.1.x`: breaking changes may occur in patch releases.
- `v0.x.x` (except `v0.1.x`): breaking changes may occur in minor releases.

---

### apis

`tint` exposes standard ANSI colors and modifiers as chainable properties.

#### colors
`black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `grey`

#### backgrounds
`bgBlack`, `bgRed`, `bgGreen`, `bgYellow`, `bgBlue`, `bgMagenta`, `bgCyan`, `bgWhite`

#### modifiers
`bold`, `dim`, `italic`, `underline`, `inverse`, `hidden`, `strikethrough`, `reset`

#### utilities
- `strip(string)`: removes all ANSI escape codes from a string.
- `rawLen(string)`: returns the length of a string ignoring ANSI escape codes.

---

### benchmark

`tint` is designed to be the fastest option for both simple and complex nested styling.

> [!WARNING]
> **Implementation Note on Fairness**
>
> `tint` achieves its speed by memoizing (caching) style chains directly inside the module.
>
> When you access `tint.red.bold`, we create and attach the specialized function for that exact combination permanently. Other libraries typically rebuild the chain or traverse prototypes on every access, which may save memory in some JavaScript engines but costs CPU cycles.
>
> This trade-off makes `tint` exceptionally fast for applications with a finite set of style combinations (e.g., CLI tools, loggers) but slightly heavier in memory if you were to dynamically generate thousands of unique, random style chains (which is rare in practice).
>
> We are currently working on measuring the exact memory trade-off in various environments.

benchmark environment: Bun 1.3.4 on M3 Pro MacBook Pro with 36GB of RAM.

```plain
✓ bench/color.bench.ts > cached (local variable) 12981ms
    name                           hz     min     max    mean     p75     p99    p995    p999     rme   samples
  · chalk: cached       29,000,983.59  0.0000  0.0989  0.0000  0.0000  0.0000  0.0000  0.0001  ±0.10%  14500492
  · kleur: cached       30,504,965.94  0.0000  0.1567  0.0000  0.0000  0.0000  0.0000  0.0001  ±0.20%  15252483
  · @uttr/tint: cached  31,888,577.32  0.0000  0.4500  0.0000  0.0000  0.0000  0.0000  0.0001  ±0.32%  15944290

✓ bench/color.bench.ts > simple chained styling 8806ms
    name                                  hz     min     max    mean     p75     p99    p995    p999     rme   samples
  · chalk: chain               11,530,444.41  0.0000  0.9179  0.0001  0.0001  0.0002  0.0002  0.0003  ±0.42%   5765223
  · kleur: chain                7,004,132.84  0.0000  0.2206  0.0001  0.0001  0.0003  0.0003  0.0005  ±0.80%   3502067
  · yocto: chain (functional)   4,337,420.89  0.0002  0.0403  0.0002  0.0003  0.0003  0.0003  0.0004  ±0.06%   2168711
  · @uttr/tint: chain          27,279,009.82  0.0000  0.1281  0.0000  0.0000  0.0000  0.0000  0.0001  ±0.16%  13639506

✓ bench/color.bench.ts > template literal usage 5673ms
    name                                     hz     min     max    mean     p75     p99    p995    p999     rme   samples
  · chalk: template literal        4,309,466.51  0.0001  0.3859  0.0002  0.0003  0.0003  0.0003  0.0004  ±0.46%   2154734
  · kleur: template literal        6,377,511.94  0.0000  0.3431  0.0002  0.0001  0.0003  0.0003  0.0005  ±1.27%   3188756
  · @uttr/tint: template literal  22,340,479.24  0.0000  0.1909  0.0000  0.0000  0.0001  0.0001  0.0001  ±0.22%  11170240

✓ bench/color.bench.ts > cached template literal usage 8910ms
    name                                            hz     min     max    mean     p75     p99    p995    p999     rme   samples
  · chalk: cached template literal        5,777,797.94  0.0001  0.4440  0.0002  0.0002  0.0002  0.0003  0.0003  ±0.84%   2890011
  · kleur: cached template literal       28,170,077.63  0.0000  0.0215  0.0000  0.0000  0.0000  0.0000  0.0001  ±0.04%  14085040
  · @uttr/tint: cached template literal  25,335,944.33  0.0000  0.1888  0.0000  0.0000  0.0000  0.0001  0.0001  ±0.18%  12667973

✓ bench/color.bench.ts > nested template literal usage 5643ms
    name                                            hz     min     max    mean     p75     p99    p995    p999     rme  samples
  · chalk: nested template literal        2,649,470.62  0.0003  0.2142  0.0004  0.0004  0.0005  0.0005  0.0006  ±0.18%  1324736
  · kleur: nested template literal        3,395,413.96  0.0001  0.3937  0.0003  0.0002  0.0005  0.0005  0.0008  ±1.79%  1697885
  · yocto: nested functional              1,716,905.59  0.0004  0.8637  0.0006  0.0006  0.0007  0.0008  0.0024  ±1.08%   858453
  · @uttr/tint: nested template literal  18,378,335.96  0.0000  0.0155  0.0001  0.0001  0.0001  0.0001  0.0001  ±0.04%  9189168

BENCH  Summary

@uttr/tint: cached - bench/color.bench.ts > cached (local variable)
  1.05x faster than kleur: cached
  1.10x faster than chalk: cached

@uttr/tint: chain - bench/color.bench.ts > simple chained styling
  2.37x faster than chalk: chain
  3.89x faster than kleur: chain
  6.29x faster than yocto: chain (functional)

@uttr/tint: template literal - bench/color.bench.ts > template literal usage
  3.50x faster than kleur: template literal
  5.18x faster than chalk: template literal

kleur: cached template literal - bench/color.bench.ts > cached template literal usage
  1.11x faster than @uttr/tint: cached template literal
  4.88x faster than chalk: cached template literal

@uttr/tint: nested template literal - bench/color.bench.ts > nested template literal usage
  5.41x faster than kleur: nested template literal
  6.94x faster than chalk: nested template literal
  10.70x faster than yocto: nested functional
```

---

### license

MIT LICENSE Copyright (c) 2025 Kohane
