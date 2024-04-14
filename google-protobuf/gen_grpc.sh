#!/bin/sh

BIN_DIR="./node_modules/.bin"

# Directory to find proto files
PROTO_DIR="../proto/"

# Select every file that ends in .proto
PROTO_FILES=$PROTO_DIR*.proto

# Directory to write generated code to (.js and .d.ts files)
SRC_DEST_DIR="./src/proto"
BUILD_DEST_DIR="./build/proto"

# Paths to the plugins
GRPC_TOOLS_NODE_PROTOC_PATH="$BIN_DIR/grpc_tools_node_protoc"
GRPC_TOOLS_NODE_PROTOC_PLUGIN_PATH="$BIN_DIR/grpc_tools_node_protoc_plugin"
PROTOC_GEN_TS_PATH="$BIN_DIR/protoc-gen-ts"

if test -f $GRPC_TOOLS_NODE_PROTOC_PATH; then
    echo "ℹ️\tExecutable 'grpc_tools_node_protoc' is installed at:"
    echo "\t└>  $GRPC_TOOLS_NODE_PROTOC_PATH"
else
    echo "🚫\t'grpc_tools_node_protoc' is missing, aborting..."
    echo "👀\tChecked at:"
    echo "\t└>  $GRPC_TOOLS_NODE_PROTOC_PATH"
    echo "ℹ️\tRun 'npm install' or install package 'grpc-tools' from npm."
    exit 1
fi

if test -f $GRPC_TOOLS_NODE_PROTOC_PLUGIN_PATH; then
    echo "ℹ️\tExecutable 'grpc_tools_node_protoc_plugin' is installed at:"
    echo "\t└>  $GRPC_TOOLS_NODE_PROTOC_PLUGIN_PATH"
else
    echo "🚫\t'grpc_tools_node_protoc_plugin' is missing, aborting..."
    echo "👀\tChecked at:"
    echo "\t└>  $GRPC_TOOLS_NODE_PROTOC_PLUGIN_PATH"
    echo "ℹ️\tRun 'npm install' or install package 'grpc-tools' from npm."
    exit 1
fi

if test -f $PROTOC_GEN_TS_PATH; then
    echo "ℹ️\tExecutable 'protoc-gen-ts' is installed at:"
    echo "\t└>  $PROTOC_GEN_TS_PATH"
else
    echo "🚫\t'protoc-gen-ts' is missing, aborting..."
    echo "👀\tChecked at:"
    echo "\t└>  $PROTOC_GEN_TS_PATH"
    echo "ℹ️\tRun 'npm install' or install package 'grpc_tools_node_protoc' from npm."
    exit 1
fi

echo "🗑\tDelete existing folder:"
echo "\t└>  $SRC_DEST_DIR"
rm -rf $SRC_DEST_DIR

echo "📁\tCreate folder:"
echo "\t└>  $SRC_DEST_DIR"
mkdir -p $SRC_DEST_DIR

echo "🗑\tDelete existing folder:"
echo "\t└>  $BUILD_DEST_DIR"
rm -rf $BUILD_DEST_DIR

echo "📁\tCreate folder:"
echo "\t└>  $BUILD_DEST_DIR"
mkdir -p $BUILD_DEST_DIR

echo "📄\tGenerate GRPC stubs files into source folder:"
echo "\t└>  $SRC_DEST_DIR"
$GRPC_TOOLS_NODE_PROTOC_PATH \
    --js_out=import_style=commonjs,binary:$SRC_DEST_DIR \
    --grpc_out=grpc_js:$SRC_DEST_DIR \
    -I $PROTO_DIR $PROTO_FILES

echo "📄\tGenerate Typescript definitions into source folder:"
echo "\t└>  $SRC_DEST_DIR"
$GRPC_TOOLS_NODE_PROTOC_PATH \
    --plugin=protoc-gen-ts=$PROTOC_GEN_TS_PATH \
    --ts_out=grpc_js:$SRC_DEST_DIR \
    -I $PROTO_DIR $PROTO_FILES

echo "📄\tCopying GRPC stubs files and Typescript definitions into build folder:"
echo "\t└>  $SRC_DEST_DIR (FROM)"
echo "\t└>  $BUILD_DEST_DIR (TO)"
cp -r $SRC_DEST_DIR/* $BUILD_DEST_DIR
