# Protobuf Benchmarks

This project benchmarks the performance of the following Protocol Buffers libraries for JavaScript and TypeScript:

- [ts-proto](https://www.npmjs.com/package/ts-proto) — both the 1.x and 2.x lines
- [google-protobuf](https://www.npmjs.com/package/google-protobuf)
- [protobuf-ts](https://www.npmjs.com/package/protobuf-ts)

Each library gets its own directory with its own dependency tree. They all serve the same
`test.proto` over a real gRPC round-trip on loopback, so what is being measured is
encode plus transport plus decode, not encoding in isolation.

## Getting Started

To run the benchmarks, clone this repository and execute the following script:

```bash
./run_all.sh
```

This script installs the dependencies and runs the benchmarks for each library.

## Environment

- **Machine**: MacBook Pro 16-inch, 2023
- **Chip**: Apple M2 Max (12 cores — 8 performance, 4 efficiency)
- **Memory**: 64 GB
- **macOS**: 26.6 (25G72)
- **Node.js**: 24.19.0
- **Harness**: tinybench 6.1.3 — 10s per task, 1s warmup, identical options in all four directories

### Libraries under test

| Library | Codegen | Runtime |
| --- | --- | --- |
| ts-proto (V1) | ts-proto 1.181.2 | protobufjs 8.7.2 |
| ts-proto (V2) | ts-proto 2.12.0 | @bufbuild/protobuf 2.14.0 |
| google-protobuf | grpc_tools_node_protoc_ts 5.3.3 | google-protobuf 4.0.2 |
| protobuf-ts | @protobuf-ts/plugin 2.11.1 | @protobuf-ts/runtime 2.11.1 |

All four share @grpc/grpc-js 1.14.4 and TypeScript 6.0.3.

## Results

Every figure below is the median of four full passes. Spread between passes reached 4.1%
for the worst library, which is far wider than the ±0.07% margin tinybench reports inside
a single run — that margin describes sampling noise only, not drift in machine state
between runs. So a single-digit percentage gap here means little on its own. Where the
text below calls a gap real, it is because the ordering held in every one of the four
passes, not because the median difference looked big.

### Read Inputs

| Library         | Throughput avg (ops/s) | Latency avg (ns) | Samples | Spread |
| --------------- | ---------------------- | ---------------- | ------- | ------ |
| ts-proto (V1)   | 8,121                  | 130,036          | 76,903  | 2.2%   |
| ts-proto (V2)   | 7,970                  | 132,838          | 75,280  | 2.1%   |
| protobuf-ts     | 6,992                  | 150,106          | 66,620  | 0.8%   |
| google-protobuf | 6,918                  | 152,679          | 65,498  | 0.4%   |

### Update Inputs

| Library         | Throughput avg (ops/s) | Latency avg (ns) | Samples | Spread |
| --------------- | ---------------------- | ---------------- | ------- | ------ |
| ts-proto (V1)   | 7,276                  | 144,039          | 69,426  | 1.9%   |
| ts-proto (V2)   | 6,998                  | 150,173          | 66,592  | 3.0%   |
| protobuf-ts     | 5,270                  | 197,620          | 50,603  | 4.1%   |
| google-protobuf | 5,162                  | 205,459          | 48,672  | 2.3%   |

## Analysis

### The V2 regression has mostly closed

A year ago we measured ts-proto V2 as substantially slower than V1 — 13.7% down on reads
and 26.5% down on updates — and pinned V1 on the strength of it. That gap is now 1.9% on
reads and 3.8% on updates. Both are narrow enough to sit inside the spread between passes,
so no single pass proves either one. V1 did come out ahead in all four passes on both
tests, though, which is what persuades us the remaining gap is real rather than noise. It
is just small.

### The credit goes to protobuf-es, not to ts-proto

Comparing against last year's table cannot tell you *why* anything changed, because Node,
macOS, the harness, and four libraries all moved at once. So we isolated the variable.

ts-proto V2 does not use protobuf-es the way most of its users do. The generated code
imports `BinaryReader` and `BinaryWriter` from `@bufbuild/protobuf/wire` and hand-rolls
its own encode and decode functions on top of them. It never calls `toBinary` or
`fromBinary`, which is where protobuf-es advertises its headline numbers. That distinction
matters, because it means most of the 2.14.0 release notes do not apply to us and three
specific changes do: a growable buffer in `BinaryWriter`, a cached `DataView` in
`BinaryWriter`, and allocation-free `varint64`.

To measure just that, we took the built V2 benchmark and swapped only the protobuf-es
runtime underneath it. Same machine, same Node, same harness settings, same generated
code, one dependency different:

| ts-proto V2 with… | Read (ops/s) | Read (ns) | Update (ops/s) | Update (ns) |
| --- | --- | --- | --- | --- |
| @bufbuild/protobuf 2.2.3 (the old pin) | 7,066 | 148,020 | 5,386 | 193,493 |
| @bufbuild/protobuf 2.14.0 | 7,970 | 132,838 | 6,998 | 150,173 |
| Change | **+12.8%** | −10.3% | **+29.9%** | −22.4% |

The update path gained more than twice what the read path gained. All three of the
optimisations listed above are on the write side, and `updateInputs` is the write-heavy
call — it ships 32 nested `Input` messages per request where `readInputs` ships four
strings. The shape of the improvement matches the shape of the change.

There is a second thing in that table worth noticing. Pinned back to protobuf-es 2.2.3 on
today's machine, V2 runs 26.0% behind V1 on updates and 13.0% behind on reads. Last year,
on different hardware and a different Node, we measured 26.5% and 13.7%. The old
regression reproduces almost exactly when you restore the old runtime. That is good
evidence we measured the right thing the first time, and that the wire layer was always
where the cost lived.

The 2.2.3 row is a single pass rather than a median of four, so treat it as approximate.
The effect is far too large for that to matter to the conclusion.

### google-protobuf went backwards

google-protobuf is now the slowest library in both tests. A year ago it was comfortably
ahead of protobuf-ts in both, so the two have swapped places. We did not isolate this one,
so we cannot say whether it comes from the 3.21.4 → 4.0.2 major bump or from the change of
environment. Worth a look if anyone is still depending on it, but it was not what this
round set out to answer.

## Conclusion

The reason we pinned ts-proto V1 no longer holds. V2 on protobuf-es 2.14.0 trails V1 by
about 2% on reads and 4% on updates, which is a different situation from the 26.5% that
justified the pin. If you want V2's features, the performance argument against taking them
has largely gone away.

One caveat on the version you actually resolve. The gain here comes from the runtime, not
the code generator, and ts-proto declares only `@bufbuild/protobuf: ^2.10.2` as its own
dependency. Pin `@bufbuild/protobuf` explicitly in your own `package.json` — otherwise
which version you get is up to your lockfile, and an older resolution gives back every bit
of the improvement.

## Notes on methodology

- All four directories construct `Bench` with identical options. If you change them,
  change all four, or the comparison stops meaning anything.
- `throws: true` is set so that a failing RPC aborts the run. Without it a broken call
  returns immediately and reports an excellent score.
- The directories deliberately stay on CommonJS. google-protobuf's codegen emits
  CommonJS, so converting the others to ESM would leave the four harnesses structurally
  different. tinybench 6 and faker 10 are ESM-only, but Node's `require(esm)` loads them.
- `@bufbuild/protobuf` 2.14.0 was released on 2026-08-13 and is listed in
  `ts-proto-v2/pnpm-workspace.yaml` under `minimumReleaseAgeExclude`. It sits inside
  pnpm's default cooldown for new releases, and measuring it is the point of this round.
