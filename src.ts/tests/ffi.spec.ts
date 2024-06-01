import { bytesToHex, randomBytes } from '@ethereumjs/util'
import { beforeAll, describe, expect, test, assert } from 'vitest'

import { VerkleCrypto, loadVerkleCrypto } from '../index.js'
import { verifyExecutionWitnessPreState, Context as VerkleFFI } from '../wasm/rust_verkle_wasm.js'
import kaustinenBlock72 from './data/kaustinen6Block72.json'
import kaustinenBlock73 from './data/kaustinen6Block73.json'

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

    const expected = '0xff7e3916badeb510dfcdad458726273319280742e553d8d229bd676428147300'

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

    const expected = '0xff7e3916badeb510dfcdad458726273319280742e553d8d229bd676428147303'

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

    const commitmentHash = ffi.serializeCommitment(commitment)
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

    // Create a brand new commitment (i.e. an empty array) and update it
    const zeros = new Uint8Array(32)
    const zc = verkleCrypto.zeroCommitment
    const index = 0
    const value = Uint8Array.from(zeros)
    value[0] = 1
    const newCommitment = verkleCrypto.updateCommitment(zc, index, zeros, value)
    const expectedCommitment = ffi.scalarMulIndex(value, 0)
    assert.deepEqual(newCommitment, expectedCommitment)
  })

  test('verifyExecutionProof: block with a few txs', () => {
    // Src: Kaustinen6 testnet, block 71 state root (parent of block 72)
    const prestateRoot = '0x64e1a647f42e5c2e3c434531ccf529e1b3e93363a40db9fc8eec81f492123510'
    const executionWitness = JSON.stringify(kaustinenBlock72.executionWitness)

    const verified = verifyExecutionWitnessPreState(prestateRoot, executionWitness)
    expect(verified).toBe(true)
  })

  test('verifyExecutionProof: block with many txs', () => {
    // Src: Kaustinen6 testnet, block 72 state root (parent of block 73)
    const prestateRoot = '0x18d1dfcc6ccc6f34d14af48a865895bf34bde7f3571d9ba24a4b98122841048c'
    const executionWitness = JSON.stringify(kaustinenBlock73.executionWitness)

    const verified = verifyExecutionWitnessPreState(prestateRoot, executionWitness)
    expect(verified).toBe(true)
  })

  test('verifyExecutionProof: invalid state root', () => {
    const prestateRoot = bytesToHex(randomBytes(32))
    const executionWitness = JSON.stringify(kaustinenBlock73.executionWitness)

    const verified = verifyExecutionWitnessPreState(prestateRoot, executionWitness)
    expect(verified).toBe(false)
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
