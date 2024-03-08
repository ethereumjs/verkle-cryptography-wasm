#!/usr/bin/env bash

function require_command {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Error: $1 is required but not installed." >&2
        exit 1
    fi
}
function check_installed {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$1 is not installed. Please install it." >&2
    return 1
  fi
  return 0
}
function run_or_fail {
  "$@"
  local status=$?
  if [ $status -ne 0 ]; then
    echo "Command '$*' failed with exit code $status" >&2
    exit $status
  fi
}
function run_if_available {
  if command -v "$1" >/dev/null 2>&1; then
    "$@"
  else
    echo "$1 is not installed. Please install it to use this feature." >&2
  fi
}

echo "Checking Rust/WASM requirements..."

require_command jq
require_command cargo
require_command wasm-bindgen
check_installed wasm-opt

SELF_DIR=$(pwd)
RUST_DIR=$SELF_DIR/src.rs

echo "Cleaning up old build artifacts..."

rm -rf $SELF_DIR/outputs >/dev/null 2>&1
rm -rf $SELF_DIR/result >/dev/null 2>&1
# Clear out the existing build artifacts as these aren't automatically removed by wasm-pack.
if [ -d ./pkg/ ]; then
    rm -rf $SELF_DIR/pkg/
fi
if [ -d ./dist/ ]; then
    rm -rf $SELF_DIR/dist/
fi
mkdir dist

cd $RUST_DIR
PNAME=$(cargo read-manifest | jq -r '.name')

if [ -v out ]; then
  echo "Will install package to $out (defined outside installPhase.sh script)"
else
  out="$SELF_DIR/outputs/out"
  echo "Will install package to $out"
fi

TARGET=wasm32-unknown-unknown
WASM_BINARY=$SELF_DIR/target/$TARGET/release/${PNAME}.wasm

CJS_DIR=$SELF_DIR/dist/cjs/wasm
ESM_DIR=$SELF_DIR/dist/esm/wasm
JS_SRC_DIR=$SELF_DIR/src.ts
CJS_WASM=${CJS_DIR}/${PNAME}_bg.wasm
ESM_WASM=${ESM_DIR}/${PNAME}_bg.wasm

# Build the new wasm package
run_or_fail cargo build --lib --release --target $TARGET
run_or_fail wasm-bindgen $WASM_BINARY --out-dir $CJS_DIR --typescript --target nodejs
cp -Rf $CJS_DIR $JS_SRC_DIR/
run_or_fail wasm-bindgen $WASM_BINARY --out-dir $ESM_DIR --typescript --target web
run_if_available wasm-opt $CJS_WASM -o $CJS_WASM -O
run_if_available wasm-opt $ESM_WASM -o $ESM_WASM -O

