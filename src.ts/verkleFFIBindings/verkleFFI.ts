import { concatBytes } from '@ethereumjs/util'

import { Context as VerkleFFI } from '../wasm/rust_verkle_wasm.js'

// This is equal to 2n + 256n * 64n.
//
// It is a constant that is used in the `getTreeKeyHashJs` function.
// See the `getTreeKeyHashJs` function for more details.
const firstChunk = new Uint8Array([2, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

// Implements `get_tree_key` as specified here: https://notes.ethereum.org/@vbuterin/verkle_tree_eip#Header-values
export function getTreeKey(
  verkleFFI: VerkleFFI,
  address: Uint8Array,
  treeIndex: Uint8Array,
  subIndex: number,
): Uint8Array {
  const keyHash = getTreeKeyHash(verkleFFI, address, treeIndex)

  // Replace the last byte with the subIndex
  keyHash[keyHash.length - 1] = subIndex
  return keyHash
}

// Computes the hash of the address and treeIndex for use in the `getTreeKey` function
//
// Note: Tree Index is interpreted as a little endian number.
export function getTreeKeyHash(
  verkleFFI: VerkleFFI,
  address: Uint8Array,
  treeIndexLE: Uint8Array,
): Uint8Array {
  if (address.length !== 32) {
    throw new Error('Address must be 32 bytes')
  }
  if (treeIndexLE.length !== 32) {
    throw new Error('Tree index must be 32 bytes')
  }

  // Below is the function we want to implement in JS from the spec.
  //
  // It is called pedersen_hash, but it is not a pedersen hash.
  //
  // Throughout the codebase it is named get_tree_key_hash to avoid this confusion.
  //
  // def pedersen_hash(inp: bytes) -> bytes32:
  //  assert len(inp) <= 255 * 16
  //  # Interpret input as list of 128 bit (16 byte) integers
  //  ext_input = inp + b"\0" * (255 * 16 - len(inp))
  //  ints = [2 + 256 * len(inp)] + \
  //  int.from_bytes(ext_input[16 * i:16 * (i + 1)]) for i in range(255)]
  //  return compute_commitment_root(ints).serialize()

  const input = concatenateUint8Arrays(address, treeIndexLE)

  // The input is chopped up into 16 byte chunks (u128 integers).
  // The spec specifies a generic method which can handle upto 255 16 byte chunks.
  // However since the input has constant size for our use case,
  // we can optimize this function by hard coding some constants.
  //
  const chunkSize = 16
  //
  //
  // Address is a 32 byte array
  // treeIndex is a 32 byte array
  // In total, we have 64 bytes
  // This means that len(inp) will always be 64.
  // We can therefore omit this assert which is always true: `assert len(inp) <= 255 * 16`
  //
  // Number of chunks is computed as 64/16 = 4
  // but notice that an extra 16 byte chunk is prepended
  // to encode the type of hash and the length of the input. This is `[2 + 256 * len(inp)]`
  // This means that the number of 16 byte chunks in total will always be 5.

  // As noted the first chunk will always be [2 + 256 * 64] because len(inp) is always 64.
  // This has been precomputed and stored in the `firstChunk` constant.
  //
  // TODO: We can actually optimize this further by hardcoding the first point as a constant
  // TODO: effectively replacing a scalar multiplication for a group addition.
  // TODO: This can be easily seen due to the fact that the commit method is doing:
  // TODO: chunk_0 * G_0 + chunk_1 * G_1 + chunk_2 * G_2 + chunk_3 * G_3 + chunk_4 * G_4
  // TODO: where chunk_0 * G_0 doesn't change.
  //
  // TODO: A similar optimization is that if the address doesn't change, but the tree index does,
  // TODO: we can create an API which passes in the point associated to the address.
  const chunks: Uint8Array[] = [firstChunk]

  // Now lets chunk up the input into 16 byte chunks
  for (let i = 0; i < input.length; i += chunkSize) {
    const chunk = input.slice(i, i + chunkSize)
    chunks.push(chunk)
  }

  // Commit to the chunks and compute a 32 byte value that we will denote as the hash
  const commitment = verkleFFI.commitTo16ByteScalars(chunks)
  const hash = verkleFFI.hashCommitment(commitment)
  return hash
}

function concatenateUint8Arrays(array1: Uint8Array, array2: Uint8Array): Uint8Array {
  const concatenatedArray = new Uint8Array(array1.length + array2.length)

  concatenatedArray.set(array1, 0)
  concatenatedArray.set(array2, array1.length)

  return concatenatedArray
}

export function updateCommitment(
  verkleFFI: VerkleFFI,
  commitment: Uint8Array,
  commitmentIndex: number,
  oldScalarValue: Uint8Array,
  newScalarValue: Uint8Array,
): Uint8Array {
  return verkleFFI.updateCommitment(commitment, commitmentIndex, oldScalarValue, newScalarValue)
}

export function createProof(verkleFFI: VerkleFFI, proverInputs: ProverInput[]): Uint8Array {
  const serializedProofInputs = serializedProverInputs(proverInputs)
  return verkleFFI.createProof(serializedProofInputs)
}

export function verifyProof(
  verkleFFI: VerkleFFI,
  proof: Uint8Array,
  verifierInputs: VerifierInput[],
): boolean {
  const serializedVerifierInput = serializeVerifierInputs(proof, verifierInputs)
  return verkleFFI.verifyProof(serializedVerifierInput)
}

export interface ProverInput {
  // Commitment to the vector we want to create a proof for
  serializedCommitment: Uint8Array
  // The vector that we want to make proofs over
  vector: Uint8Array[]
  // The indices that we want to prove exist in the vector
  indices: number[]
}

function serializedProverInputs(proofInputs: ProverInput[]): Uint8Array {
  const serializedProverInputs = proofInputs.flatMap(({ serializedCommitment, vector, indices }) =>
    indices.flatMap((index) => [
      serializedCommitment,
      ...vector,
      new Uint8Array([index]),
      vector[index],
    ]),
  )

  return concatBytes(...serializedProverInputs)
}

export interface VerifierInput {
  // A commitment to the vector that we want to verify
  // proofs over.
  serializedCommitment: Uint8Array
  // A tuple of index and values that we want to verify about the
  // committed vector.
  //
  // ie (index_i, value_i) will verify that the value of the committed
  // vector at index `index_i` was `value_i`
  indexValuePairs: Array<{ index: number; value: Uint8Array }>
}

function serializeVerifierInputs(proof: Uint8Array, verifierInputs: VerifierInput[]): Uint8Array {
  const serializedVerifierInputs = [
    proof,
    ...verifierInputs.flatMap(({ serializedCommitment, indexValuePairs }) =>
      indexValuePairs.flatMap(({ index, value }) => [
        serializedCommitment,
        new Uint8Array([index]),
        value,
      ]),
    ),
  ]

  return concatBytes(...serializedVerifierInputs)
}
