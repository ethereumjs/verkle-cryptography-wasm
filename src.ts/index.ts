import {
  Commitment,
  Scalar,
  initVerkleWasm,
  getTreeKey as getTreeKeyBase,
  getTreeKeyHash as getTreeKeyHashBase,
  updateCommitment as updateCommitmentBase,
  zeroCommitment as zeroCommitmentBase,
} from './verkleFFIBindings'
import { Context as VerkleFFI } from './wasm/rust_verkle_wasm.js'

export const loadVerkleCrypto = async () => {
  await initVerkleWasm()

  const verkleFFI = new VerkleFFI()

  const getTreeKey = (address: Uint8Array, treeIndex: Uint8Array, subIndex: number): Uint8Array =>
    getTreeKeyBase(verkleFFI, address, treeIndex, subIndex)

  const getTreeKeyHash = (address: Uint8Array, treeIndexLE: Uint8Array): Uint8Array =>
    getTreeKeyHashBase(verkleFFI, address, treeIndexLE)

  const updateCommitment = (
    commitment: Uint8Array,
    commitmentIndex: number,
    oldScalarValue: Uint8Array,
    newScalarValue: Uint8Array,
  ): Commitment =>
    updateCommitmentBase(verkleFFI, commitment, commitmentIndex, oldScalarValue, newScalarValue)

  const zeroCommitment = zeroCommitmentBase()

  return {
    getTreeKey,
    getTreeKeyHash,
    updateCommitment,
    zeroCommitment,
  }
}

export { Commitment, Scalar }
