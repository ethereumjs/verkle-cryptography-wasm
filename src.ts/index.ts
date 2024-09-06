import {
  initVerkleWasm,
  getTreeKey as getTreeKeyBase,
  getTreeKeyHash as getTreeKeyHashBase,
  updateCommitment as updateCommitmentBase,
  zeroCommitment as zeroCommitmentBase,
  verifyExecutionWitnessPreState as verifyExecutionWitnessPreStateBase,
  createProof as createProofBase,
  verifyProof as verifyProofBase,
} from './verkleFFIBindings/index.js'
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

  const verifyExecutionWitnessPreState = (prestateRoot: string, execution_witness_json: string): boolean =>
    verifyExecutionWitnessPreStateBase(prestateRoot, execution_witness_json)

  const zeroCommitment = zeroCommitmentBase()

  const hashCommitment = (commitment: Uint8Array) => verkleFFI.hashCommitment(commitment)
  const serializeCommitment = (commitment: Uint8Array) => verkleFFI.serializeCommitment(commitment)
  const createProof = (input: Uint8Array) => verkleFFI.createProof(input)
  const verifyProof = (proofInput: Uint8Array) => verkleFFI.verifyProof(proofInput)
  return {
    getTreeKey,
    getTreeKeyHash,
    updateCommitment,
    zeroCommitment,
    verifyExecutionWitnessPreState,
    hashCommitment,
    serializeCommitment,
    createProof,
    verifyProof
  }
}

// This is a 32 byte serialized field element
export type Scalar = Uint8Array

// This is a 64 byte serialized point.
// It is 64 bytes because the point is serialized in uncompressed format.
export type Commitment = Uint8Array