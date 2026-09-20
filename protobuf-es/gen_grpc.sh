#!/bin/sh

BIN_DIR="./node_modules/.bin"

# Directory to write generated code to (.ts files); must match buf.gen.yaml
SRC_DEST_DIR="./src/proto"

# Paths to the compiler and the plugin. buf ships native binaries for arm64 and
# x86_64 on macOS and Linux, so this directory needs no protoc and no container.
BUF_PATH="$BIN_DIR/buf"
PROTOC_GEN_ES_PATH="$BIN_DIR/protoc-gen-es"

if test -f $BUF_PATH; then
    echo "ℹ️\tExecutable 'buf' is installed at:"
    echo "\t└>  $BUF_PATH"
else
    echo "🚫\t'buf' is missing, aborting..."
    echo "👀\tChecked at:"
    echo "\t└>  $BUF_PATH"
    echo "ℹ️\tRun 'pnpm install' or install package '@bufbuild/buf' from npm."
    exit 1
fi

if test -f $PROTOC_GEN_ES_PATH; then
    echo "ℹ️\tExecutable 'protoc-gen-es' is installed at:"
    echo "\t└>  $PROTOC_GEN_ES_PATH"
else
    echo "🚫\t'protoc-gen-es' is missing, aborting..."
    echo "👀\tChecked at:"
    echo "\t└>  $PROTOC_GEN_ES_PATH"
    echo "ℹ️\tRun 'pnpm install' or install package '@bufbuild/protoc-gen-es' from npm."
    exit 1
fi

echo "🗑\tDelete existing folder:"
echo "\t└>  $SRC_DEST_DIR"
rm -rf $SRC_DEST_DIR

echo "📄\tGenerate Typescript definitions into source folder:"
echo "\t└>  $SRC_DEST_DIR"
PATH="$BIN_DIR:$PATH" $BUF_PATH generate
