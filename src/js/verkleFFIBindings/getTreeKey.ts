import { Context } from '../../../dist/cjs/wasm/rust_verkle_wasm'

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

// Computes the hash of the address, treeIndex and subIndex
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
              Here is the function we wish to implement here:
              def pedersen_hash(inp: bytes) -> bytes32:
                  assert len(inp) <= 255 * 16
                  # Interpret input as list of 128 bit (16 byte) integers
                  ext_input = inp + b"\0" * (255 * 16 - len(inp))
                  ints = [2 + 256 * len(inp)] + \
                      [int.from_bytes(ext_input[16 * i:16 * (i + 1)]) for i in range(255)]
                  return compute_commitment_root(ints).serialize()
              */

  const input = concatenateUint8Arrays(address, treeIndex)

  // The input is chopped up into 16 byte chunks (u128 integers) but since the input has constant size
  // Lets compute the number of 16 byte chunks needed and other constants.
  const chunkSize = 16
  //
  //
  // Address is a 32 byte array
  // treeIndex is a 32 byte array
  // In total, we have 64 bytes
  // This means that len(inp) will always be 64.
  //
  // 64 /16 = 4 but notice that an extra 16 byte chunk is prepended to the input
  // to encode the type of hash and the length. This is `[2 + 256 * len(inp)]`
  // This means that the number of 16 byte chunks in total will be 5.

  // As noted the first chunk will always be [2 + 256 * 64] because len(inp) is always 64.
  const firstChunk = 2n + 256n * 64n

  const chunks: Uint8Array[] = []
  // TODO: This is a constant, so we don't need to compute it every time
  // TODO: [2, 64, 0, 0 ,0,..0]
  chunks.push(bigintToUint8ArrayLE(firstChunk, chunkSize))

  for (let i = 0; i < input.length; i += chunkSize) {
    const chunk = input.slice(i, i + chunkSize)
    chunks.push(chunk)
  }

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

function bigintToUint8ArrayLE(value: bigint, byteLength: number): Uint8Array {
  // Allocate a buffer of the desired size
  const buffer = new ArrayBuffer(byteLength)
  const view = new DataView(buffer)

  // Fill the buffer from the end, as BigInt is little-endian
  for (let i = 0; i < byteLength; i++) {
    // Extract byte by shifting right (i * 8) bits and mask off a byte
    const byte = Number((value >> BigInt(i * 8)) & BigInt(0xff))
    view.setUint8(i, byte)
  }

  return new Uint8Array(buffer)
}
