# Protobuf benchmarks

This project contains benchmarks for the [ts-proto](https://www.npmjs.com/package/ts-proto), [google-protobuf](https://www.npmjs.com/package/google-protobuf), and [protobuf-ts](https://www.npmjs.com/package/protobuf-ts) libraries.

## Running the benchmarks

To run the benchmarks, clone this repository and run the following commands:

```bash
pnpm install # Install dependencies
./gen_grpc.sh # Generate the gRPC files
pnpm build # Build the typescript files
pnpm test # Run the benchmarks
```

## Results

### Read inputs

| Library         | ops/sec | Average Time (ns)   | Margin | Samples |
| --------------- | ------- | ------------------- | ------ | ------- |
| ts-proto        | 7,734   | 129,287.23195999817 | ±1.26% | 100,000 |
| google-protobuf | 7,336   | 136,307.68187999903 | ±1.33% | 100,000 |
| protobuf-ts     | 6,266   | 159,570.68275000344 | ±1.17% | 100,000 |

### Update inputs

| Library         | ops/sec | Average Time (ns)   | Margin | Samples |
| --------------- | ------- | ------------------- | ------ | ------- |
| ts-proto        | 6,384   | 156,627.98241999987 | ±1.06% | 100,000 |
| google-protobuf | 5,882   | 170,002.66671999844 | ±0.64% | 100,000 |
| protobuf-ts     | 4,509   | 221,742.0894100056  | ±0.75% | 100,000 |
