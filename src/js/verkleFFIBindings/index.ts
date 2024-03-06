import { Context, zeroCommitment } from '../wasm/rust_verkle_wasm'

import { getTreeKey } from './getTreeKey'

// This is a 32 byte serialized field element
type Scalar = Uint8Array

// This is a 64 byte serialized point.
// It is 64 bytes because the point is serialized in uncompressed format.
type Commitment = Uint8Array

export {
  Scalar,
  Commitment,
  Context,
  // This is a function that returns a zero commitment
  // wasm_bindgen does not seem to allow returning constants
  zeroCommitment,
  getTreeKey,
}
