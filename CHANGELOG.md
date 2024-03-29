# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) 
(modification: no type change headlines) and this project adheres to 
[Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 0.3.1 - 2024-03-29

- Fix several minor bugs impacting ESM and browser usage; add new `VerkleCrypto` type that defines output
  of `loadVerkleCrypto`, PR [#41](https://github.com/ethereumjs/verkle-cryptography-wasm/pull/41)

## 0.3.0 - 2024-03-27

- Update API to use async initialization function `loadVerkleCrypto` to instantiate WASM module before use
  and redesign build process, PR [#37](https://github.com/ethereumjs/verkle-cryptography-wasm/pull/37)

## 0.2.1 - 2024-03-11

- Remove `postinstall` build hook, PR [#35](https://github.com/ethereumjs/verkle-cryptography-wasm/pull/35)

## 0.2.0 - 2024-03-08

- Limit API exposure to FFI, PR [#32](https://github.com/ethereumjs/verkle-cryptography-wasm/pull/32)

## 0.1.1 - 2024-03-07

- Additionally expose `VerkleFFI` and `getTreeKeyHash()`
- Improve ESM compatibility (`.js` file endings)

## 0.1.0 - 2024-03-07

This a pre-release primarily meant to be used for internal purposes
(feel free to do your early-on experimentation though! 🙂).