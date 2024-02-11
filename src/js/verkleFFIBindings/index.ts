import { zeroCommitment } from '../../../dist/cjs/wasm/rust_verkle_wasm'

// This is a 32 byte serialized field element
type Scalar = Uint8Array

// This is a 64 byte serialized point.
// It is 64 bytes because the point is serialized in uncompressed format.
type Commitment = Uint8Array

export {
    Scalar,
    Commitment,
    // This is a function that returns a zero commitment
    // wasm_bindgen does not seem to allow returning constants
    zeroCommitment,
}
export { Context } from '../../../dist/cjs/wasm/rust_verkle_wasm'

