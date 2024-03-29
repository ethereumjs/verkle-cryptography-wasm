import { bytesToHex } from '@ethereumjs/util'
import { beforeAll, describe, expect, test } from 'vitest'

import { VerkleCrypto, loadVerkleCrypto } from '../index.js'
import { Context as VerkleFFI } from '../wasm/rust_verkle_wasm.js'

describe('bindings', () => {
  let ffi: VerkleFFI
  let verkleCrypto: VerkleCrypto
  beforeAll(async () => {
    verkleCrypto = await loadVerkleCrypto()
    ffi = new VerkleFFI()
  })

  test('getTreeKey', () => {
    // This is a copy of the test vector in rust-verkle
    // See: https://github.com/crate-crypto/rust-verkle/blob/6036bde9a8f416648213c59ad0c857b2a6f226f3/ffi_interface/src/lib.rs#L600
    const address = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 32,
    ])

    const treeIndexLE = new Uint8Array([
      33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
      56, 57, 58, 59, 60, 61, 62, 63, 64,
    ])

    // Reverse the tree index array so it is in little endian form
    treeIndexLE.reverse()

    const subIndex = 0

    const key = ffi.getTreeKey(address, treeIndexLE, subIndex)
    const keyHex = bytesToHex(key)

    const expected = '0x76a014d14e338c57342cda5187775c6b75e7f0ef292e81b176c7a5a700273700'

    expect(keyHex).toBe(expected)
  })

  test('getTreeKeyHash', () => {
    const address = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 32,
    ])

    const treeIndexLE = new Uint8Array([
      33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
      56, 57, 58, 59, 60, 61, 62, 63, 64,
    ])

    // Reverse the tree index array so it is in little endian form
    treeIndexLE.reverse()

    const hash = verkleCrypto.getTreeKeyHash(address, treeIndexLE)
    const hashHex = bytesToHex(hash)

    const expected = '0x76a014d14e338c57342cda5187775c6b75e7f0ef292e81b176c7a5a70027373a'

    expect(hashHex).toBe(expected)
  })

  test('getTreeKeyJsMatchesRust', () => {
    const address = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 32,
    ])

    const treeIndex = new Uint8Array([
      33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
      56, 57, 58, 59, 60, 61, 62, 63, 64,
    ])

    const subIndex = 0

    const keyRust = ffi.getTreeKey(address, treeIndex, subIndex)
    const keyRustHex = bytesToHex(keyRust)

    const keyJs = verkleCrypto.getTreeKey(address, treeIndex, subIndex)
    const keyJsHex = bytesToHex(keyJs)

    expect(keyRustHex).toBe(keyJsHex)
  })

  test('commitToScalars', () => {
    const scalar = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 0,
    ])

    // Put scalar into a vector of uint8arrays
    const scalars = [scalar, scalar]
    const commitment = ffi.commitToScalars(scalars)

    const commitmentHex = bytesToHex(commitment)
    const expected =
      '0x6fb3421d850da8e8b8d1b9c1cc30876ef23d9df72c8792e6d569a9861089f02abdf89e2c671fe0bff820e815f6f20453fdbc83ec5415e3ade8c745179e31d25c'

    expect(commitmentHex).toBe(expected)
  })

  test('hashCommitment', () => {
    // Create a commitment that we can hash
    const scalar = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 0,
    ])
    const commitment = ffi.commitToScalars([scalar])

    const commitmentHash = ffi.hashCommitment(commitment)
    const commitmentHashHex = bytesToHex(commitmentHash)

    const expected = '0x31e94bef2c0160ed1f3dd9caacbed356939c2e440c4ddb336d832dcab6384e19'

    expect(commitmentHashHex).toBe(expected)
  })

  test('hashCommitments', () => {
    // Create a commitment that we can hash
    const scalar = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 0,
    ])
    const commitment = ffi.commitToScalars([scalar])

    const commitments = [commitment, commitment]
    const hashes = ffi.hashCommitments([commitment, commitment])

    for (let i = 0; i < hashes.length; i++) {
      const expectedHash = ffi.hashCommitment(commitments[i])
      const expectedHashHex = bytesToHex(expectedHash)

      const commitmentHashHex = bytesToHex(hashes[i])

      expect(commitmentHashHex).toBe(expectedHashHex)
    }
  })

  test('serializeCommitment', () => {
    // Create a commitment that we can hash
    const scalar = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 0,
    ])
    const commitment = ffi.commitToScalars([scalar])

    const commitmentHash = ffi.deprecateSerializeCommitment(commitment)
    const commitmentHashHex = bytesToHex(commitmentHash)

    const expected = '0x6d40cf3d3097cb19b0ff686a068d53fb1250cc98bbd33766cf2cce00acb8b0a6'

    expect(commitmentHashHex).toBe(expected)
  })

  test('updateCommitment', () => {
    // Create a commitment that we can use to update
    const oldScalarValue = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 0,
    ])
    const commitmentIndex = 1
    const commitment = ffi.scalarMulIndex(oldScalarValue, commitmentIndex)

    // Create a new scalar value to update the commitment with
    const newScalarValue = new Uint8Array([
      1, 0, 0, 0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 0,
    ])

    const expected = ffi.scalarMulIndex(newScalarValue, commitmentIndex)
    const expectedHex = bytesToHex(expected)

    const updatedCommitment = ffi.updateCommitment(
      commitment,
      commitmentIndex,
      oldScalarValue,
      newScalarValue,
    )
    const updatedCommitmentHex = bytesToHex(updatedCommitment)

    expect(updatedCommitmentHex).toBe(expectedHex)
  })

  test('smoke test errors are thrown', () => {
    const scalar = new Uint8Array([0])

    expect(() => {
      // This method will throw an error because scalars must be 32 bytes
      // but we gave it 1 byte
      ffi.commitToScalars([scalar])
    }).toThrow('Expected 32 bytes, got 1')
  })
})
