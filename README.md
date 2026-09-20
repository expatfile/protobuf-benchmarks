# Protobuf Benchmarks

This project benchmarks the performance of the following Protocol Buffers libraries for JavaScript and TypeScript:

- [ts-proto](https://www.npmjs.com/package/ts-proto) — both the 1.x and 2.x lines
- [protobuf-es](https://www.npmjs.com/package/@bufbuild/protobuf) — `@bufbuild/protobuf` with `protoc-gen-es`
- [google-protobuf](https://www.npmjs.com/package/google-protobuf)
- [protobuf-ts](https://www.npmjs.com/package/protobuf-ts)

Each library gets its own directory with its own dependency tree. They all serve the same
`test.proto` over a real gRPC round-trip on loopback, so what is being measured is
encode plus transport plus decode, not encoding in isolation. Every directory is run under
Node.js and under Bun.

## Getting Started

To run the benchmarks, clone this repository and execute the following script:

```bash
./run_all.sh
```

This script installs each directory's dependencies from its lockfile, generates and builds
the code, and runs the benchmarks under Node.js and then under Bun. Both runtimes execute
the same compiled `build/index.js`. To run one runtime only:

```bash
RUNTIMES="node" ./run_all.sh
```

You need Node.js, pnpm and Bun. Before anything is timed, each directory pushes the
benchmark's own payloads through its own client and server and checks that the data
arrives: nine inputs back on the read, 32 inputs received on the update. A library that
answered quickly with nothing in the message would otherwise score well.

### Code generation on Apple silicon

`grpc-tools` ships an x86_64-only `protoc` for macOS. On an Apple-silicon Mac without
Rosetta it cannot start, and `gen_grpc.sh` fails in `google-protobuf`, `ts-proto` and
`ts-proto-v2`. So `run_all.sh` calls `gen_proto.sh`, which tries the native `protoc` first.
Only when that cannot run does it run the same `gen_grpc.sh`, against the same lockfile, in
a `node:24-slim` container of the host's architecture, and copy the generated code back.
That path needs a Docker-compatible runtime such as OrbStack. On Linux, on Intel Macs and
on Macs with Rosetta nothing changes and no container is involved. `protobuf-ts` and
`protobuf-es` never need it, because `@protobuf-ts/protoc` and `@bufbuild/buf` ship arm64
binaries. Code generation is not measured. Everything that is measured is built and run on
the host.

## Environment

- **Machine**: MacBook Pro 16-inch, 2023
- **Chip**: Apple M2 Max (12 cores — 8 performance, 4 efficiency), no Rosetta installed
- **Memory**: 64 GB
- **macOS**: 27.0 (26A428)
- **Node.js**: 24.21.0, the latest LTS release. Node.js 26 is still the "Current" line.
- **Bun**: 1.4.2
- **pnpm**: 12.4.2
- **Harness**: tinybench 6.2.0 — 10s per task, 1s warmup, identical options in all five directories
- **Code generation container**: `node:24-slim` on OrbStack 2.2.3 (Docker engine 29.4.0), used by the three `grpc-tools` directories only
- **Measured**: 2026-09-20

### Libraries under test

Every library is on the latest stable release of its line as of 2026-09-20.

| Library | Codegen | Runtime |
| --- | --- | --- |
| ts-proto (V1) | ts-proto 1.181.2, the last 1.x release | protobufjs 8.8.0 |
| ts-proto (V2) | ts-proto 2.12.4 | @bufbuild/protobuf 2.15.0 |
| protobuf-es | @bufbuild/protoc-gen-es 2.15.0, run by @bufbuild/buf 1.73.0 | @bufbuild/protobuf 2.15.0 |
| google-protobuf | grpc_tools_node_protoc_ts 5.3.3 | google-protobuf 4.0.3 |
| protobuf-ts | @protobuf-ts/plugin 2.11.1 | @protobuf-ts/runtime 2.11.1 |

All five share @grpc/grpc-js 1.14.5, tinybench 6.2.0, @faker-js/faker 10.6.0, tslib 2.8.1,
TypeScript 7.0.2 and @types/node 26.6.2. The three `grpc-tools` directories use grpc-tools
1.13.1. Every dependency is pinned to an exact version in every `package.json`, every
directory commits its lockfile, and `run_all.sh` installs with `--frozen-lockfile`. The
packages that grpc-js, tinybench and faker pull in resolve to the same 35 versions in all
five lockfiles.

protobuf-es and ts-proto V2 are on the same `@bufbuild/protobuf` release, so the two differ
in how the runtime is used and not in which release they got.

## Results

Every figure below is the median of four full passes of `run_all.sh`, made in one session
on 2026-09-20. A pass builds each directory and runs it under Node.js and then under Bun
before moving to the next, so the two runtimes and the five libraries are interleaved
rather than measured an hour apart. Throughput is tinybench's "Throughput avg", latency
is its "Latency avg". Spread is the highest pass minus the lowest, over the median.

The machine was shared with other work and was not silent. We sampled the load average
every 30 seconds and fixed one rule before looking at any numbers: a pass counts only if
the one-minute load stays below 12, the core count, for the whole pass. Four passes ran
and all four count. The load stayed between 3.7 and 8.6 throughout. Spread between passes
reached 5.8% for the worst case, while tinybench's own margin inside a single run stayed
at ±0.10%, which describes sampling noise only. So a single-digit gap means little on its
own. Where the text below calls a gap real, it is because the ordering held in every one
of the four passes.

### Node.js 24.21.0

| Library         | Read (ops/s) | Read latency (ns) | Read spread | Update (ops/s) | Update latency (ns) | Update spread |
| --------------- | ------------ | ----------------- | ----------- | -------------- | ------------------- | ------------- |
| ts-proto (V1)   | 8,518        | 123,810           | 3.5%        | 7,505          | 140,462             | 4.8%          |
| ts-proto (V2)   | 8,402        | 125,739           | 4.6%        | 7,273          | 145,620             | 1.6%          |
| protobuf-es     | 8,012        | 132,041           | 2.3%        | 6,699          | 157,850             | 1.9%          |
| protobuf-ts     | 7,146        | 147,329           | 3.5%        | 5,392          | 193,755             | 3.0%          |
| google-protobuf | 6,908        | 152,768           | 5.3%        | 5,216          | 203,704             | 2.7%          |

### Bun 1.4.2

| Library         | Read (ops/s) | Read latency (ns) | Read spread | Update (ops/s) | Update latency (ns) | Update spread |
| --------------- | ------------ | ----------------- | ----------- | -------------- | ------------------- | ------------- |
| ts-proto (V1)   | 12,314       | 84,228            | 5.8%        | 10,549         | 98,413              | 4.2%          |
| ts-proto (V2)   | 12,112       | 85,437            | 4.7%        | 10,183         | 101,848             | 3.5%          |
| protobuf-es     | 11,732       | 88,290            | 2.5%        | 9,156          | 113,660             | 4.7%          |
| protobuf-ts     | 11,652       | 88,814            | 5.5%        | 8,910          | 116,462             | 3.9%          |
| google-protobuf | 11,396       | 90,736            | 3.4%        | 8,583          | 120,450             | 2.9%          |

"Read" is `readInputs`, which sends three strings and nine input names and gets nine
small messages back. "Update" is `updateInputs`, which sends 32 nested `Input` messages
and gets an empty response.

### The four passes

Throughput avg in ops/s, in the order the passes ran.

| Runtime | Call   | ts-proto (V1)              | ts-proto (V2)              | protobuf-es                | protobuf-ts                | google-protobuf            |
| ------- | ------ | -------------------------- | -------------------------- | -------------------------- | -------------------------- | -------------------------- |
| Node.js | Read   | 8382, 8404, 8631, 8681     | 8216, 8295, 8601, 8510     | 7948, 7928, 8077, 8114     | 7119, 7181, 7172, 6932     | 6816, 6824, 7181, 6991     |
| Node.js | Update | 7367, 7339, 7643, 7702     | 7284, 7262, 7225, 7339     | 6792, 6662, 6694, 6704     | 5302, 5442, 5465, 5342     | 5152, 5227, 5295, 5204     |
| Bun     | Read   | 11934, 12228, 12401, 12647 | 11870, 12215, 12438, 12010 | 11709, 11632, 11925, 11754 | 11044, 11629, 11685, 11676 | 11259, 11158, 11545, 11534 |
| Bun     | Update | 10493, 10469, 10605, 10916 | 9942, 10235, 10300, 10131  | 9432, 9303, 9008, 9003     | 8692, 8844, 8977, 9042     | 8578, 8449, 8694, 8588     |

### Against the first run of this round

Earlier the same day the same suite ran with the versions the previous round had pinned:
`@bufbuild/protobuf` 2.14.0, ts-proto 2.12.0, protobufjs 8.7.2, google-protobuf 4.0.2,
@grpc/grpc-js 1.14.4, tinybench 6.1.3, faker 10.5.0 and TypeScript 6.0.3. Moving everything
to the latest releases did not change the order of the libraries on either call under
either runtime, and the ordering between protobuf-es and ts-proto did not change. Under
Node.js every library came out 4% to 11% faster than in that run. The machine was also
quieter this time, and the shared transport, harness and data generator all moved at
once, so that gain cannot be pinned on any one of them.

## How protobuf-es compares with ts-proto

protobuf-es is slower than ts-proto. That holds under both runtimes and on both calls, and
in every single pass it was behind both ts-proto lines.

On the small read the gap is a few percent. Under Node.js protobuf-es is 5.9% behind
ts-proto V1 and 4.6% behind V2. Under Bun it is 4.7% and 3.1% behind. That is about 3 to 8
microseconds per call.

On the write-heavy update the gap is larger and well outside the spread. Under Node.js
protobuf-es is 10.7% behind V1 and 7.9% behind V2, which is 17 and 12 microseconds per
call. Under Bun it is 13.2% and 10.1% behind, which is 15 and 12 microseconds.

Against the other two libraries it does well under Node.js, where it led protobuf-ts and
google-protobuf in all four passes: by 12% and 16% on reads and by 24% and 28% on updates.
Under Bun that lead mostly goes. It stayed ahead of google-protobuf in all four passes, by
3% on reads and 7% on updates. Against protobuf-ts it is level: under 1% ahead on reads, and
ahead in only three of four passes on updates.

The cause fits how the two are built. ts-proto generates a straight-line encoder and
decoder for each message. protobuf-es walks the message's descriptor at run time, and
`create()` builds a typed message object where ts-proto takes a plain object literal. The
update ships 32 nested messages, which is where that costs most. ts-proto V2 already sits
on protobuf-es's wire layer (see the previous round below), so the two share their varint
and buffer code and the difference is the layer above it.

Whether 12 to 17 microseconds matters is a judgment for the service that pays it. A call
that also crosses a network and runs a database query spends a millisecond or more on
each, so the gap is around 1% of such a request. The benchmark measures nothing else that
might weigh in the choice, such as run-time descriptors, canonical JSON or conformance.

### Bun against Node.js

Bun runs every library faster than Node.js on this workload, by 37% to 65%. The two
ts-proto lines and protobuf-es gain about 45% on reads and 37% to 41% on updates.
protobuf-ts and google-protobuf gain 63% to 65%, which is why they close in on protobuf-es
under Bun. The order on updates is the same under both runtimes: ts-proto V1, ts-proto V2,
protobuf-es, protobuf-ts, google-protobuf. Both runtimes run the same compiled CommonJS and
the same `@grpc/grpc-js`, so this compares the engines and their `http2` implementations
underneath one transport, not Bun's native APIs.

## What each library generates for gRPC

Glue is hand-written code in this repository that does a job another library's generator
does. It is counted in lines including blanks and comments. `src/verify.ts` is not glue,
since every directory carries the same one.

| | ts-proto (V1 and V2) | protobuf-es | protobuf-ts | google-protobuf |
| --- | --- | --- | --- | --- |
| grpc-js service definition | generated (`outputServices=grpc-js`) | not generated; built at run time from the generated service descriptor by an adapter | generated (`server_grpc1`) | generated by `grpc-tools`' `grpc_node_plugin` |
| Typed grpc-js client | generated | not generated; declared by hand | generated (`client_grpc1`) | generated JavaScript, with typings from `grpc_tools_node_protoc_ts` |
| Hand-written glue here | 0 lines | 48 lines: 23 in `src/grpc-service-definition.ts`, 25 for the client interface and constructor in `src/client.ts` | 0 lines | 0 lines |
| Message construction | plain object literal | `create(Schema, init)` | plain object literal | `new Message()` and setters; `toObject()` to read |
| `int64` | `number` by default, throws past 2^53; `forceLong` gives `Long`, `string` or `bigint` | `bigint`; `jstype = JS_STRING` gives `string` | `bigint` by default; options for `string` or `number` | `number` by default; `jstype = JS_STRING` gives `string` |
| Maintained by | Stephen Haberman and contributors; one npm maintainer | Buf Technologies; six npm maintainers | Timo Stamm and contributors; one npm maintainer | Google for `google-protobuf` and `grpc-tools`; one individual for `grpc_tools_node_protoc_ts` |
| Latest release | 2.12.4 on 2026-09-15; 1.181.2, the last 1.x, on 2024-08-15 | 2.15.0 on 2026-09-11 | 2.11.1 on 2025-06-18 | google-protobuf 4.0.3 on 2026-09-17; grpc-tools 1.13.1 on 2025-12-01; grpc_tools_node_protoc_ts 5.3.3 on 2023-02-01 |

The protobuf-es glue is per service for the client interface, which names each method, and
once per project for the adapter.

## What is and is not the same between the libraries

Same in all five: the proto, the two calls, the payloads, the faker calls inside the timed
loop, the tinybench options, the grpc-js transport, and a callback client wrapped in a
promise. No directory is tuned. Each uses its generator's defaults plus only the options
needed to get grpc-js output.

What differs is how each library wants messages built, and the benchmark follows each
library's normal usage:

- **ts-proto and protobuf-ts** take plain object literals and return plain objects.
- **protobuf-es** builds messages with `create(Schema, init)`. It generates no grpc-js
  stubs, so `protobuf-es/src/grpc-service-definition.ts` builds the service definition
  from the generated descriptor with `toBinary` and `fromBinary`. It wraps the bytes with
  `Buffer.from()`, the same copy ts-proto's generated stubs make.
- **google-protobuf** builds class instances through setters, and the benchmark calls
  `toObject()` on what it receives, as it always has.

The libraries also differ in features that this proto does not exercise. `test.proto` has
only strings and nested messages, with no `int64`, no unknown fields and no JSON, so none
of the following affected the numbers. They matter when reading the numbers as a guide to
a real schema.

| | `int64` by default | Unknown fields | JSON |
| --- | --- | --- | --- |
| ts-proto | `number`, throws past 2^53; `forceLong` switches to `Long`, `string` or `bigint` | dropped unless `unknownFields=true` | its own `toJSON` and `fromJSON`, generated by default and included in the build here |
| protobuf-es | `bigint` | kept and written back | canonical protobuf JSON, conformance-tested |
| protobuf-ts | `bigint`; options for `string` or `number` | kept and written back | canonical protobuf JSON |
| google-protobuf | `number`; `jstype = JS_STRING` for strings | not preserved by `deserializeBinary` | none; `toObject()` is not the proto3 JSON mapping |

An `int64` field would cost ts-proto and google-protobuf least, since a `number` is cheaper
than a `bigint`, at the price of precision. Keeping unknown fields costs a little on every
decode even when there are none.

## Previous round: ts-proto V1 against V2 (2026-08-13)

This section is the round before protobuf-es and Bun were added, kept as it was written.
It ran on the same machine under Node.js 24.19.0 and macOS 26.6, with four libraries. Its
figures are not comparable with the tables above to the last percent, but its findings
stand: in the current round V2 trails V1 by 1.4% on reads and 3.1% on updates under
Node.js, and V1 led in all four passes on both.

Every figure below is the median of four full passes. Spread between passes reached 4.1%
for the worst library, which is far wider than the ±0.07% margin tinybench reports inside
a single run — that margin describes sampling noise only, not drift in machine state
between runs. So a single-digit percentage gap here means little on its own. Where the
text below calls a gap real, it is because the ordering held in every one of the four
passes, not because the median difference looked big.

### Read Inputs (previous round)

| Library         | Throughput avg (ops/s) | Latency avg (ns) | Samples | Spread |
| --------------- | ---------------------- | ---------------- | ------- | ------ |
| ts-proto (V1)   | 8,121                  | 130,036          | 76,903  | 2.2%   |
| ts-proto (V2)   | 7,970                  | 132,838          | 75,280  | 2.1%   |
| protobuf-ts     | 6,992                  | 150,106          | 66,620  | 0.8%   |
| google-protobuf | 6,918                  | 152,679          | 65,498  | 0.4%   |

### Update Inputs (previous round)

| Library         | Throughput avg (ops/s) | Latency avg (ns) | Samples | Spread |
| --------------- | ---------------------- | ---------------- | ------- | ------ |
| ts-proto (V1)   | 7,276                  | 144,039          | 69,426  | 1.9%   |
| ts-proto (V2)   | 6,998                  | 150,173          | 66,592  | 3.0%   |
| protobuf-ts     | 5,270                  | 197,620          | 50,603  | 4.1%   |
| google-protobuf | 5,162                  | 205,459          | 48,672  | 2.3%   |

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

### Conclusion of the previous round

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

- All five directories construct `Bench` with identical options. If you change them,
  change all five, or the comparison stops meaning anything.
- A new directory must commit its lockfile and resolve the same `@grpc/grpc-js`,
  `tinybench` and `@faker-js/faker` as the others. A first, uncommitted protobuf-es entry
  had no lockfile and picked up newer releases of all three, and that alone put it ahead
  of ts-proto on reads. The transport, the harness and the data generator all run inside
  the timed loop. The quickest way to stay aligned is to copy an existing
  `pnpm-lock.yaml` into the new directory before the first `pnpm install`.
- `throws: true` is set so that a failing RPC aborts the run. Without it a broken call
  returns immediately and reports an excellent score.
- The directories deliberately stay on CommonJS. google-protobuf's codegen emits
  CommonJS, so converting the others to ESM would leave the five harnesses structurally
  different. tinybench 6 and faker 10 are ESM-only, but Node's `require(esm)` loads them.
- The previous round listed `@bufbuild/protobuf` 2.14.0 under `minimumReleaseAgeExclude`,
  because it sat inside pnpm's cooldown for new releases. Nothing pinned now is that new,
  so the exclusion is gone.
