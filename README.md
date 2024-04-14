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

| Task Name                      | ops/sec | Average Time (ns)   | Margin | Samples |
| ------------------------------ | ------- | ------------------- | ------ | ------- |
| ts-proto (readInputs)          | 6,430   | 155,510.26492537226 | ±1.05% | 3,216   |
| google-protobuf (readInputs)   | 5,943   | 168,251.10464333766 | ±1.14% | 2,972   |
| protobuf-ts (readInputs)       | 5,225   | 191,360.5158821272  | ±1.08% | 2,613   |
| ts-proto (updateInputs)        | 6,341   | 157,681.42730999773 | ±0.62% | 3,171   |
| google-protobuf (updateInputs) | 5,861   | 170,617.70965540933 | ±0.65% | 2,931   |
| protobuf-ts (updateInputs)     | 4,316   | 231,655.7512737348  | ±0.88% | 2,159   |
