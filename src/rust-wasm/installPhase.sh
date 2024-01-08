#!/usr/bin/env bash
export self_path=$(dirname "$(readlink -f "$0")")

export out_path=$out/rust_verkle_wasm

mkdir -p $out_path
cp $self_path/README.md $out_path/
cp -r $self_path/nodejs $out_path/
cp -r $self_path/web $out_path/