# Protobuf benchmarks

This project contains benchmarks for the [ts-proto](https://www.npmjs.com/package/ts-proto), [google-protobuf](https://www.npmjs.com/package/google-protobuf), and [protobuf-ts](https://www.npmjs.com/package/protobuf-ts) libraries.

## Running the benchmarks

To run the benchmarks, clone this repository and run the following commands:

```bash
./run_all.sh
```

This script will install the dependencies and run the benchmarks for each library.

## Results

### Read inputs

| Library         | ops/sec | Average Time (ns) | Margin | Samples |
| --------------- | ------- | ----------------- | ------ | ------- |
| ts-proto (V1)   | 8,078   | 131,998.64        | ±0.58% | 75,759  |
| ts-proto (V2)   | 6,972   | 153,027.88        | ±0.58% | 65,348  |
| google-protobuf | 7,578   | 146,999.69        | ±0.82% | 68,028  |
| protobuf-ts     | 6,746   | 158,944.02        | ±0.59% | 62,916  |

### Update inputs

| Library         | ops/sec | Average Time (ns) | Margin | Samples |
| --------------- | ------- | ----------------- | ------ | ------- |
| ts-proto (V1)   | 7,090   | 148,810.31        | ±0.55% | 67,200  |
| ts-proto (V2)   | 5,209   | 204,076.29        | ±0.52% | 49,002  |
| google-protobuf | 6,314   | 179,756.73        | ±0.84% | 55,638  |
| protobuf-ts     | 4,919   | 216,651.99        | ±0.53% | 46,157  |

## Environment

- **Machine**: MacBook Pro 16-inch, 2023  
- **Chip**: Apple M2 Max  
- **Memory**: 64 GB  
- **macOS**: 15.2 (24C101)  
- **Node.js**: 22.13.1  
