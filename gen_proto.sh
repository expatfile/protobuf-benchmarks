#!/bin/sh

# Runs a benchmark directory's gen_grpc.sh. Call it from inside that directory,
# after `pnpm install`:  ../gen_proto.sh
#
# grpc-tools ships an x86_64-only protoc for macOS, so on an Apple-silicon Mac
# without Rosetta the directories that use it (google-protobuf, ts-proto,
# ts-proto-v2) cannot generate natively. For those, and only then, the same
# gen_grpc.sh runs in a Linux container of the host's architecture (grpc-tools
# does ship Linux arm64 binaries) against the same lockfile, and the generated
# code is copied back. Wherever the native protoc runs — Linux, Intel Macs, Macs
# with Rosetta, and the directories that do not use grpc-tools at all — nothing
# changes and no container runtime is needed. Only code generation happens in the
# container; everything that is measured is built and run on the host.

GRPC_TOOLS_PROTOC="./node_modules/grpc-tools/bin/protoc"
CONTAINER_IMAGE="${CONTAINER_IMAGE:-node:24-slim}"

if ! test -f "$GRPC_TOOLS_PROTOC" || "$GRPC_TOOLS_PROTOC" --version >/dev/null 2>&1; then
    exec ./gen_grpc.sh
fi

if ! command -v docker >/dev/null 2>&1; then
    echo "🚫\tgrpc-tools' protoc cannot run on this machine and 'docker' is missing, aborting..."
    echo "ℹ️\tInstall a container runtime (OrbStack, Docker Desktop) or Rosetta."
    exit 1
fi

ENTRY="$(basename "$PWD")"
REPO_DIR="$(dirname "$PWD")"

echo "ℹ️\tgrpc-tools' protoc cannot run natively, generating in a container:"
echo "\t└>  $CONTAINER_IMAGE"

# gen_grpc.sh in google-protobuf also fills build/proto, so bring that back too.
docker run --rm -v "$REPO_DIR":/repo -e ENTRY="$ENTRY" -e PNPM_VERSION="$(pnpm --version)" \
    "$CONTAINER_IMAGE" sh -ec '
        npm install --global "pnpm@$PNPM_VERSION" >/dev/null 2>&1
        mkdir -p "/work/$ENTRY"
        cp -r /repo/proto /work/proto
        cd "/repo/$ENTRY"
        cp package.json pnpm-lock.yaml pnpm-workspace.yaml gen_grpc.sh "/work/$ENTRY/"
        cd "/work/$ENTRY"
        pnpm install --frozen-lockfile >/dev/null
        mkdir -p src
        ./gen_grpc.sh
        for dir in src/proto build/proto; do
            if test -d "$dir"; then
                rm -rf "/repo/$ENTRY/$dir"
                mkdir -p "/repo/$ENTRY/$(dirname "$dir")"
                cp -r "$dir" "/repo/$ENTRY/$dir"
            fi
        done
    '
