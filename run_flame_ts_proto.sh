#!/bin/sh

cd ts-proto || exit      # Change to the ts-proto directory
pnpm install >/dev/null  # Install dependencies
./gen_grpc.sh >/dev/null # Generate the gRPC files
pnpm build >/dev/null    # Build the typescript files
pnpm test:flame          # Run the benchmarks
cd ..                    # Change back to the root directory
cd ts-proto-v2 || exit   # Change to the ts-proto-v2 directory
pnpm install >/dev/null  # Install dependencies
./gen_grpc.sh >/dev/null # Generate the gRPC files
pnpm build >/dev/null    # Build the typescript files
pnpm test:flame          # Run the benchmarks
cd ..                    # Change back to the root directory
