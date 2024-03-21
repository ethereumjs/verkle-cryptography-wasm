import { initVerkleWasm, Context, zeroCommitment } from '../wasm/rust_verkle_wasm.js'

import { getTreeKey, getTreeKeyHash } from './getTreeKey.js'

// This is a 32 byte serialized field element
type Scalar = Uint8Array

// This is a 64 byte serialized point.
// It is 64 bytes because the point is serialized in uncompressed format.
type Commitment = Uint8Array

export {
  Scalar,
  Commitment,
  initVerkleWasm,
  getTreeKey,
  getTreeKeyHash,
  Context,
  zeroCommitment
}
