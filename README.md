# Protobuf Benchmarks

This project benchmarks the performance of the following Protocol Buffers libraries for JavaScript and TypeScript:

- [ts-proto](https://www.npmjs.com/package/ts-proto)
- [google-protobuf](https://www.npmjs.com/package/google-protobuf)
- [protobuf-ts](https://www.npmjs.com/package/protobuf-ts)

## Getting Started

To run the benchmarks, clone this repository and execute the following script:

```bash
./run_all.sh
```

This script installs the dependencies and runs the benchmarks for each library.


## Results

### Environment

- **Machine**: MacBook Pro 16-inch, 2023  
- **Chip**: Apple M2 Max  
- **Memory**: 64 GB  
- **macOS**: 15.2  
- **Node.js**: 22.13.1  

### Read Inputs

| Library         | ops/sec | Average Time (ns) | Margin | Samples |
| --------------- | ------- | ----------------- | ------ | ------- |
| ts-proto (V1)   | 8,078   | 131,998.64        | ±0.58% | 75,759  |
| ts-proto (V2)   | 6,972   | 153,027.88        | ±0.58% | 65,348  |
| google-protobuf | 7,578   | 146,999.69        | ±0.82% | 68,028  |
| protobuf-ts     | 6,746   | 158,944.02        | ±0.59% | 62,916  |

### Update Inputs

| Library         | ops/sec | Average Time (ns) | Margin | Samples |
| --------------- | ------- | ----------------- | ------ | ------- |
| ts-proto (V1)   | 7,090   | 148,810.31        | ±0.55% | 67,200  |
| ts-proto (V2)   | 5,209   | 204,076.29        | ±0.52% | 49,002  |
| google-protobuf | 6,314   | 179,756.73        | ±0.84% | 55,638  |
| protobuf-ts     | 4,919   | 216,651.99        | ±0.53% | 46,157  |

## Analysis

### Background

Approximately one year ago, we migrated from `google-protobuf` to `ts-proto (V1)` to take advantage of its improved performance and modern TypeScript compatibility. With the recent release of `ts-proto (V2)`, we included it in our benchmarks, expecting further performance enhancements. However, the results reveal a **performance regression** in `ts-proto (V2)` compared to its predecessor.

### Key Insights

#### Read Inputs
- **`ts-proto (V1)`** achieves the best performance with **8,078 ops/sec** and the lowest average latency of **131,998.64 ns**.
- **`ts-proto (V2)`** shows a **13.7% decrease in throughput** compared to V1, achieving only **6,972 ops/sec**, with an average latency of **153,027.88 ns**.
- **`google-protobuf`** performs competitively, achieving **7,578 ops/sec**, just slightly behind `ts-proto (V1)`.
- **`protobuf-ts`** lags behind, delivering **6,746 ops/sec** and the highest latency of **158,944.02 ns**.

#### Update Inputs
- **`ts-proto (V1)`** leads again, achieving **7,090 ops/sec** with an average latency of **148,810.31 ns**.
- **`ts-proto (V2)`** suffers a significant **26.5% drop in throughput** compared to V1, with only **5,209 ops/sec** and a latency increase to **204,076.29 ns**.
- **`google-protobuf`** performs better than `ts-proto (V2)` with **6,314 ops/sec**, but trails behind `ts-proto (V1)`.
- **`protobuf-ts`** ranks the lowest, with **4,919 ops/sec** and the highest average latency of **216,651.99 ns**.

### Observations
- The migration from `google-protobuf` to `ts-proto (V1)` last year proved to be a clear performance improvement.
- The release of `ts-proto (V2)`, however, introduces regressions:
  - **Read Inputs:** Throughput drops by **13.7%**, and latency increases by **16%** compared to V1.
  - **Update Inputs:** Throughput drops by **26.5%**, and latency increases by **37%** compared to V1.
- Despite its age, **`google-protobuf`** remains competitive, especially for read operations.
- **`protobuf-ts`** shows consistently poor performance across both tasks, highlighting room for optimization.

## Conclusion

While `ts-proto (V2)` was expected to outperform its predecessor, the benchmarks reveal clear regressions in both throughput and latency. Any potential feature improvements in V2 should be carefully weighed against these performance drawbacks.

For now, **`ts-proto (V1)`** remains the best choice for performance in our use case.