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

JS_SRC_DIR=$SELF_DIR/src.ts


# Build the new wasm package
run_or_fail cargo build --lib --release --target $TARGET
# Build a browser compatible ESM WASM binary with Javascript glue code
run_or_fail wasm-bindgen $WASM_BINARY --out-dir $JS_SRC_DIR/wasm --typescript --target web

run_if_available wasm-opt $JS_SRC_DIR/wasm -o $JS_SRC_DIR/wasm -O

# Append a new `initVerkleWasm` function to the compiled JS glue code
cat <<EOT >> ../src.ts/wasm/rust_verkle_wasm.js
import { base64 } from '@scure/base'
import wasmB64 from './rust_verkle_wasm_bg.js'

export const initVerkleWasm = async () => {
    // Async initialization function that must be called before verkle cryptography can be used

    const imports = __wbg_get_imports();
    __wbg_init_memory(imports);
    const instance = await WebAssembly.instantiate(
      await WebAssembly.compile(base64.decode(wasmB64.wasm)),
      imports
    )
    __wbg_finalize_init(instance);
  }
EOT

# Add typing for `initVerkleWasm`
cat <<EOT >> ../src.ts/wasm/rust_verkle_wasm.d.ts
export function initVerkleWasm (): Promise<void>
EOT

# Convert the WASM bytecode to a base64 string
node ../scripts/wasmToB64.js

# Remove wasm bytecode as not needed after base64 compilation
rm ../src.ts/wasm/*.wasm
rm ../src.ts/wasm/*.wasm.d.ts
