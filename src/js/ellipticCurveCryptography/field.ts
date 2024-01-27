// TODO: refactor all methods to have the same calling convention
//
// Generic field structure
export class Field {
  value: bigint;
  modulus: bigint;

  constructor(value: bigint, modulus: bigint) {
    this.value = value % modulus;
    this.modulus = modulus;
  }

  static zero(modulus: bigint): Field {
    return new Field(0n, modulus);
  }

  static one(modulus: bigint): Field {
    return new Field(1n, modulus);
  }

  isZero(): boolean {
    return 0n == this.value;
  }

  isOne(): boolean {
    return 1n == this.value;
  }

  add(other: Field): Field {
    this.value = (this.value + other.value) % this.modulus;
    return this;
  }

  sub(other: Field): Field {
    this.value = (this.value + this.modulus - other.value) % this.modulus;
    return this;
  }

  neg(other: Field): Field {
    const zero = Field.zero(this.modulus);
    const result = zero.sub(other);
    this.value = result.value;
    return this;
  }

  mul(other: Field): Field {
    this.value = (this.value * other.value) % this.modulus;
    return this;
  }

  equal(b: Field): boolean {
    return this.value === b.value;
  }

  inv(a: Field): Field {
    if (a.value === 0n) {
      throw new Error("cannot invert zero");
    }
    this.value = a.value ** (this.modulus - 2n) % this.modulus;
    return this;
  }

  lexographicallyLargest(modulus_min_one_div_2: bigint): boolean {
    return this.value > modulus_min_one_div_2;
  }

  static fromBytes(
    bytesLittleEndian: Uint8Array,
    modulus: bigint,
    reduce: boolean = false,
  ): Field {
    const hex = bytesToHex(bytesLittleEndian.reverse());
    let value = BigInt(hex);

    if (value >= modulus) {
      if (reduce) {
        value %= modulus;
      } else {
        throw new Error("Value is equal or larger than modulus");
      }
    }

    return new Field(value, modulus);
  }

  toBytesLe(byteLength: number): Uint8Array {
    const byteArray = new Uint8Array(byteLength);

    for (let i = 0, value = this.value; i < byteLength; i++) {
      byteArray[i] = Number(value & 0xffn);
      value >>= 8n;
    }

    return byteArray;
  }

  sqrt(a: Field): Field | null {
    const value = modularSqrt(a.value, this.modulus);
    if (value === null) {
      return null;
    }
    this.value = value as bigint;
    return this;
  }

  exp(a: Field, exponent: bigint): Field {
    this.value = a.value ** exponent % this.modulus;
    return this;
  }

  legendre(): bigint {
    return legendreSymbol(this.value, this.modulus);
  }

  div(a: Field, b: Field): Field {
    const bInv = b.inv(b);
    const result = bInv.mul(a);
    this.value = result.value;
    return this;
  }
}

function modularSqrt(a: bigint, p: bigint): bigint | null {
  // Simple cases
  if (legendreSymbol(a, p) !== 1n) {
    return null;
  } else if (a === 0n) {
    return 0n;
  } else if (p === 2n) {
    return 0n;
  } else if (p % 4n === 3n) {
    return a ** ((p + 1n) / 4n) % p;
  }

  // Partition p-1 to s * 2^e for an odd s
  let s = p - 1n;
  let e = 0n;
  while (s % 2n === 0n) {
    s /= 2n;
    e += 1n;
  }

  // Find some 'n' with a legendre symbol n|p = -1
  let n = 2n;
  while (legendreSymbol(n, p) !== -1n) {
    n += 1n;
  }

  let x = a ** ((s + 1n) / 2n) % p;
  let b = a ** s % p;
  let g = n ** s % p;
  let r = e;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let t = b;
    let m = 0n;
    for (; m < r; m++) {
      if (t === 1n) {
        break;
      }
      t = t ** 2n % p;
    }

    if (m === 0n) {
      return x;
    }

    const gs = g ** (2n ** (r - m - 1n)) % p;
    g = gs ** 2n % p;
    x = (x * gs) % p;
    b = (b * g) % p;
    r = m;
  }
}

function legendreSymbol(a: bigint, p: bigint): bigint {
  const ls = a ** ((p - 1n) / 2n) % p;
  return ls === p - 1n ? -1n : ls;
}

// TODO: This can be replaced with the more efficient
// TODO version of multiinv
export function naiveMultiInv(values: Field[]): Field[] {
  const modulus = values[0].modulus;

  const invValues: Field[] = [];
  for (const val of values) {
    const inverse = Field.zero(modulus);
    inverse.inv(val);
    invValues.push(inverse);
  }

  return invValues;
}

/****************  Borrowed from @chainsafe/ssz */
// Caching this info costs about ~1000 bytes and speeds up toHexString() by x6
const hexByByte = Array.from({ length: 256 }, (v, i) =>
  i.toString(16).padStart(2, "0"),
);

function bytesToHex(bytes: Uint8Array): string {
  let hex = "0x";
  if (bytes === undefined || bytes.length === 0) return hex;
  for (const byte of bytes) {
    hex += hexByByte[byte];
  }
  return hex;
}
