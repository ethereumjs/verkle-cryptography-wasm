import { Context } from '../../../dist/cjs/wasm/rust_verkle_wasm'

// This is equal to 2n + 256n * 64n.
//
// It is a constant that is used in the `getTreeKeyHashJs` function.
const firstChunk = new Uint8Array([2, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

// Implements `get_tree_key` as specified here: https://notes.ethereum.org/@vbuterin/verkle_tree_eip#Header-values
export function getTreeKeyJs(
  context: Context,
  address: Uint8Array,
  treeIndex: Uint8Array,
  subIndex: number,
): Uint8Array {
  const serializedCommitment = getTreeKeyHashJs(context, address, treeIndex)

  // Replace the last byte with the subIndex
  serializedCommitment[serializedCommitment.length - 1] = subIndex
  return serializedCommitment
}

// Computes the hash of the address and treeIndex for use in the `getTreeKey` function
function getTreeKeyHashJs(
  context: Context,
  address: Uint8Array,
  treeIndex: Uint8Array,
): Uint8Array {
  if (address.length !== 32) {
    throw new Error('Address must be 32 bytes')
  }
  if (treeIndex.length !== 32) {
    throw new Error('Tree index must be 32 bytes')
  }

  /*
                        Here is the function we wish to implement:
                        def pedersen_hash(inp: bytes) -> bytes32:
                            assert len(inp) <= 255 * 16
                            # Interpret input as list of 128 bit (16 byte) integers
                            ext_input = inp + b"\0" * (255 * 16 - len(inp))
                            ints = [2 + 256 * len(inp)] + \
                                [int.from_bytes(ext_input[16 * i:16 * (i + 1)]) for i in range(255)]
                            return compute_commitment_root(ints).serialize()
                        */

  const input = concatenateUint8Arrays(address, treeIndex)

  // The input is chopped up into 16 byte chunks (u128 integers).
  // The spec specifies a generic method, however since the input has constant size for
  // our use case, we can optimize this function by hard coding some constants.
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
  const chunks: Uint8Array[] = [firstChunk]

  // Now lets chunk up the input into 16 byte chunks
  for (let i = 0; i < input.length; i += chunkSize) {
    const chunk = input.slice(i, i + chunkSize)
    chunks.push(chunk)
  }

  // Commit to the chunks and compute a 32 byte value that we will denote as the hash
  //
  // Note: This 32 byte value is not a Scalar. It is just a 32 byte value.
  //
  // Note: that the .reverse() below is an implementation detail of the underlying
  // Note: serialization code returning big endian.
  //
  // TODO: We want to eventually replace deprecateSerializeCommitment with `hashCommitment`
  // TODO: This is a breaking change, so requires more coordination between different implementations
  // TODO: once that is done, we can remove the .reverse and the deprecateSerializeCommitment method.
  //
  const commitment = context.commitTo16ByteScalars(chunks)
  const serializedCommitment = context.deprecateSerializeCommitment(commitment).reverse()
  return serializedCommitment
}

function concatenateUint8Arrays(array1: Uint8Array, array2: Uint8Array): Uint8Array {
  const concatenatedArray = new Uint8Array(array1.length + array2.length)

  concatenatedArray.set(array1, 0)
  concatenatedArray.set(array2, array1.length)

  return concatenatedArray
}
