# Rust/WASM Build

## Overview

This folder defines the main necessary Rust dependencies (in `Cargo.toml`) with the [rust-verkle](https://github.com/crate-crypto/rust-verkle) dependendy in its center.

For building the WASM code and managing the interactions between JavaScript/TypeScript and WASM [wasm-pack](https://github.com/rustwasm/wasm-pack) is being used and will need a separate initial installation.

Additionally [wasm-bindgen-cli](https://github.com/rustwasm/wasm-bindgen) and (optional, for optimization) [wasm-opt](https://github.com/brson/wasm-opt-rs) need to be installed.

The WASM build process follows the ["Compiling from Rust to WASM"](https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_Wasm) Mozilla web docs tutorial which can be used for an introduction to the topic.

## Low Level API

The low level API for the interaction with the WASM code is written in Rust and located in the [./src](./src/) subfolder and looks like the following:

```rust
#[wasm_bindgen]
pub fn element_sub(lhs: ElementWrapper, rhs: ElementWrapper) -> ElementWrapper {
    ElementWrapper {
        inner: lhs.inner - rhs.inner,
    }
}
```

These API elements are compiled during the `wasm-pack` build process (see below) and exposed in JavaScript/TypeScript as the final low level API.

## Compile Rust to WASM

For an ESM build run:

```shell
wasm-pack build
```

You should see a `pkg` folder appear.

To build a Node.js compatible module run:

```shell
wasm-pack build --target nodejs
```

## To call Rust from Javascript as WASM

[ Outdated ]

For an ESM example, use below

- cd into `js_code`
- run `npm install`. You should see a `node_modules` folder appear.
- run `node -r esm stateless_update.js` you should see a Uint8Array in the console.

For NodeJS + Typescript, import in any `.ts` file as below:
`import wasm from 'path/to/rust-verkle-wasm/pkg/rust_verkle_wasm'`
