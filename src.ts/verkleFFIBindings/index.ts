import { initVerkleWasm, zeroCommitment, verifyExecutionWitnessPreState } from '../wasm/rust_verkle_wasm.js'

import { getTreeKey, getTreeKeyHash, updateCommitment } from './verkleFFI.js'

export {
  initVerkleWasm,
  getTreeKey,
  getTreeKeyHash,
  updateCommitment,
  zeroCommitment,
  verifyExecutionWitnessPreState
}
