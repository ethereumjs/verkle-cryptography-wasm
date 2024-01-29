import { describe, test, assert } from "vitest";
import { bytesToHex } from "@ethereumjs/util";
import { pedersenHash } from "../banderwagon_bindings/index.js";

// Test data src: https://github.com/crate-crypto/rust-verkle/blob/231c9fec87ade64c2a4a4b0c9425288971708ce3/ffi_interface/src/lib.rs#L307
describe("pedersenHash", () => {
  test("computes the expected pedersenHash for the zero address", () => {
    const input = Uint8Array.from(new Array(32).fill(0));
    const expectedHash =
      "bf101a6e1c8e83c11bd203a582c7981b91097ec55cbd344ce09005c1f26d1922";
    const computedHash = pedersenHash(input);
    assert.equal(bytesToHex(computedHash), expectedHash);
  });

  test("computes the expected pedersenHash for a given address", () => {
    const input = Uint8Array.from([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
      40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
      58, 59, 60, 61, 62, 63, 64,
    ]);

    const expectedHash =
      "76a014d14e338c57342cda5187775c6b75e7f0ef292e81b176c7a5a700273700";

    const computedHash = pedersenHash(input);
    assert.equal(bytesToHex(computedHash), expectedHash);
  });
});
