#!/bin/sh

cd google-protobuf || exit        # Change to the google-protobuf directory
rm -rf build tsconfig.tsbuildinfo # Clean up the build files
pnpm install >/dev/null           # Install dependencies
./gen_grpc.sh >/dev/null          # Generate the gRPC files
pnpm build >/dev/null             # Build the typescript files
pnpm test                         # Run the benchmarks
cd ..                             # Change back to the root directory
cd ts-proto || exit               # Change to the ts-proto directory
rm -rf build tsconfig.tsbuildinfo # Clean up the build files
pnpm install >/dev/null           # Install dependencies
./gen_grpc.sh >/dev/null          # Generate the gRPC files
pnpm build >/dev/null             # Build the typescript files
pnpm test                         # Run the benchmarks
cd ..                             # Change back to the root directory
cd ts-proto-v2 || exit            # Change to the ts-proto-v2 directory
rm -rf build tsconfig.tsbuildinfo # Clean up the build files
pnpm install >/dev/null           # Install dependencies
./gen_grpc.sh >/dev/null          # Generate the gRPC files
pnpm build >/dev/null             # Build the typescript files
pnpm test                         # Run the benchmarks
cd ..                             # Change back to the root directory
cd protobuf-ts || exit            # Change to the protobuf-ts directory
rm -rf build tsconfig.tsbuildinfo # Clean up the build files
pnpm install >/dev/null           # Install dependencies
./gen_grpc.sh >/dev/null          # Generate the gRPC files
pnpm build >/dev/null             # Build the typescript files
pnpm test                         # Run the benchmarks
cd ..                             # Change back to the root directory
