# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) 
(modification: no type change headlines) and this project adheres to 
[Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 0.4.3 - 2024-06-03

- Add `hashCommitment` to the public API and add new test to demonstrate how to derive a
  new commitment using the current API, PR [#51](https://github.com/ethereumjs/verkle-cryptography-wasm/pull/51)

## 0.4.2 - 2024-05-15

- Updates rust-verkle dependency so that `verifyExecutionProof` returns 0 for node not present,
  PR [#47](https://github.com/ethereumjs/verkle-cryptography-wasm/pull/47)
- Updates rust-verkle dependency so that `verifyExecutionProof` returns false for malformed
  proof elements, PR [#48](https://github.com/ethereumjs/verkle-cryptography-wasm/pull/48)

## 0.4.1 - 2024-05-14

- Update `rust-verkle` dependency, PR [#45](https://github.com/ethereumjs/verkle-cryptography-wasm/pull/45)
- Add method to public API to verify prestate in execution witness, PR [#44](https://github.com/ethereumjs/verkle-cryptography-wasm/pull/44)

## 0.4.0 - 2024-04-02

- Update `getTreeKey` to use `hashCommitment` following latest spec, 
  PR [#31](https://github.com/ethereumjs/verkle-cryptography-wasm/pull/31)
  
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