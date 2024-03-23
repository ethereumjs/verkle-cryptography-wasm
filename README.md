# Verkle Cryptography (WASM/TypeScript)

**Note:** This library is in the process of moving over from https://github.com/crate-crypto/rust-verkle-wasm. Package and build structure are in the process of being reworked and documentation/instructions are not yet fully updated.

This library provides a WASM build bundled with a TypeScript API of the Rust [rust-verkle](https://github.com/crate-crypto/rust-verkle) implementation and exposes core [Verkle Tree](https://verkle.info/) related crypto and arithmetic primitives to be consumed and used by higher level packages.

The library has been initially developed by [kevaundray](https://github.com/kevaundray) (a thousand ❤️s for all the great work!) and is now maintained and further developed by Kev and the Ethereum Foundation JavaScript team.

A higher level Verkle Tree TypeScript library using this package is in the works at [https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/verkle](https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/verkle).

## Installation

[ Not yet available ]

```
    npm i verkle-cryptography-wasm
```

## Basic Structure

### Rust/WASM

The Rust code and the necessary tooling for the WASM build and a low level TypeScript API exposure can be found in [./src.rs](./src.rs/). The associated README contains the main documentation describing the WASM build process.

### High Level TypeScript API

The main high level API exposed in a final published package can be found in [./src.ts](./src.ts).  Usage instructions can be found [here](./src.ts/README.md)

### Node.js

The root folder of this package holds a Node.js [package.json](package.json) file referencing the final package exports and the necessary build scripts.

## Build

Build scripts can be found in the [scripts](./scripts/) folder and the build process can be triggered with:

```shell
npm run build
```

See the comments in the build scripts for a more detailed explanation of what occurs in each step.

Note that this requires all Rust/WASM tooling to be installed, so a first look into the dedicated RUST/WASM documentation is recommended.

## Testing

There are a few high level JavaScript API respectively unit tests available which can be run with:

```shell
npm run test
```





