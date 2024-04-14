#!/bin/sh

BIN_DIR="./node_modules/.bin"

# Directory to find proto files
PROTO_DIR="../proto/"

# Select every file that ends in .proto
PROTO_FILES=$PROTO_DIR*.proto

# Directory to write generated code to (.ts files)
SRC_DEST_DIR="./src/proto"

# Paths to the plugins
PROTOC_PATH="$BIN_DIR/protoc"

if test -f $PROTOC_PATH; then
    echo "ℹ️\tExecutable 'protoc' is installed at:"
    echo "\t└>  $PROTOC_PATH"
else
    echo "🚫\t'protoc' is missing, aborting..."
    echo "👀\tChecked at:"
    echo "\t└>  $PROTOC_PATH"
    echo "ℹ️\tRun 'npm install' or install package '@protobuf-ts/protoc' from npm."
    exit 1
fi

echo "🗑\tDelete existing folder:"
echo "\t└>  $SRC_DEST_DIR"
rm -rf $SRC_DEST_DIR

echo "📁\tCreate folder:"
echo "\t└>  $SRC_DEST_DIR"
mkdir -p $SRC_DEST_DIR

echo "📄\tGenerate Typescript definitions into source folder:"
echo "\t└>  $SRC_DEST_DIR"
$PROTOC_PATH \
    --ts_out=$SRC_DEST_DIR \
    --ts_opt=client_grpc1,server_grpc1 \
    -I $PROTO_DIR $PROTO_FILES
