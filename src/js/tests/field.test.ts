import { Field, naiveMultiInv } from "../src/ecc/field";

describe("modular arithmetic", () => {
  test("modular addition", () => {
    const a = new Field(1n, 13n);
    const b = new Field(2n, 13n);
    const c = a.add(b);

    const expected = new Field(3n, 13n);

    const isEqual = expected.equal(c);
    expect(isEqual).toBe(true);
  });
  test("modular subtraction", () => {
    const a = new Field(1n, 13n);
    const b = new Field(2n, 13n);
    const c = a.sub(b);

    // 1 - 2 mod 13 == 1 + (13 - 2) mod 13 == 12 mod 13
    const expected = new Field(12n, 13n);
    const isEqual = expected.equal(c);
    expect(isEqual).toBe(true);
  });

  test("modular multiplication", () => {
    const a = new Field(10n, 13n);
    const b = new Field(20n, 13n);
    const c = a.mul(b);
    // 200 mod 13 == 5 mod 13
    const expected = new Field(5n, 13n);

    const isEqual = expected.equal(c);
    expect(isEqual).toBe(true);
  });
  test("modular inversion", () => {
    const a = new Field(20n, 13n);
    const result = new Field(0n, 13n);
    result.inv(a);
    result.mul(a);

    // Inverse a_inv * a == 1
    const expected = new Field(1n, 13n);

    const isEqual = expected.equal(result);

    expect(isEqual).toBe(true);
  });
  test("modular division", () => {
    const a = new Field(10n, 13n);
    const b = new Field(20n, 13n);

    const c_0 = new Field(0n, 13n);
    c_0.div(a, b);

    const c_1 = new Field(0n, 13n);
    c_1.div(b, a);

    const result = c_0.mul(c_1);

    // a/b * b/a == 1
    const expected = new Field(1n, 13n);

    const isEqual = expected.equal(result);
    expect(isEqual).toBe(true);
  });
  test("modular division", () => {
    const a = new Field(10n, 13n);
    const b = new Field(20n, 13n);

    const c_0 = new Field(0n, 13n);
    c_0.div(a, b);

    const c_1 = new Field(0n, 13n);
    c_1.div(b, a);

    const result = c_0.mul(c_1);

    // a/b * b/a == 1
    const expected = new Field(1n, 13n);

    const isEqual = expected.equal(result);
    expect(isEqual).toBe(true);
  });

  test("multi inversion", () => {
    const values = [new Field(1n, 13n), new Field(2n, 13n), new Field(3n, 13n)];
    const valuesInverted = naiveMultiInv(values);

    for (let i = 0; i < values.length; i++) {
      const result = values[i].mul(valuesInverted[i]);
      const expected = new Field(1n, 13n);
      const isEqual = expected.equal(result);
      expect(isEqual).toBe(true);
    }
  });

  test("serialize", () => {
    const expected = new Field(1n, 13n);
    const bytes = expected.toBytesLe(32);

    let got = Field.fromBytes(bytes, 13n);
    let isEqual = expected.equal(got);
    expect(isEqual).toBe(true);

    // Do the same with a number that is in the same
    // equivalence class, but more than the modulus
    const expectedOverflow = new Field(1n + 13n, 13n);
    const bytes32Overflow = expectedOverflow.toBytesLe(32);
    got = Field.fromBytesReduce(bytes32Overflow, 13n);
    isEqual = expected.equal(got);
    expect(isEqual).toBe(true);
  });
});
