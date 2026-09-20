#!/bin/sh

# Builds every benchmark directory from its lockfile and runs it under each
# runtime. Both runtimes execute the same compiled ./build/index.js.
#
#   ./run_all.sh                  # Node, then Bun, for every directory
#   RUNTIMES="node" ./run_all.sh  # Node only

RUNTIMES="${RUNTIMES:-node bun}"

load_average() {
    (uptime 2>/dev/null || cat /proc/loadavg) | sed 's/.*load average[s]*: //'
}

echo "Node $(node --version), Bun $(bun --version 2>/dev/null || echo "not installed"), pnpm $(pnpm --version)"
echo "Load before the run: $(load_average)"

for dir in google-protobuf ts-proto ts-proto-v2 protobuf-es protobuf-ts; do
    cd "$dir" || exit                          # Change to the benchmark directory
    rm -rf build tsconfig.tsbuildinfo          # Clean up the build files
    pnpm install --frozen-lockfile >/dev/null  # Install dependencies, exactly as locked
    ../gen_proto.sh >/dev/null || exit         # Generate the gRPC files
    pnpm build >/dev/null || exit              # Build the typescript files

    for runtime in $RUNTIMES; do               # Run the benchmarks
        echo "=== $dir on $runtime"
        case "$runtime" in
        node) pnpm test ;;
        bun) pnpm test:bun ;;
        *) echo "Unknown runtime '$runtime'" && exit 1 ;;
        esac
    done

    cd ..                                      # Change back to the root directory
done

echo "Load after the run: $(load_average)"
