import { fr_add, fr_sub, FrWrapper } from "../wasm/rust_verkle_wasm";

export class ScalarField {
  inner!: FrWrapper;

  private constructor() {}

  static fromDecimalString(value: string): ScalarField {
    const field = new ScalarField();
    field.inner = FrWrapper.fromDecimalString(value);
    return field;
  }

  static _fromFrWrapper(inner: FrWrapper): ScalarField {
    const field = new ScalarField();
    field.inner = inner;
    return field;
  }

  add(other: ScalarField): ScalarField {
    return ScalarField._fromFrWrapper(fr_add(this.inner, other.inner));
  }

  sub(other: ScalarField): ScalarField {
    return ScalarField._fromFrWrapper(fr_sub(this.inner, other.inner));
  }

  toBytes(): Uint8Array {
    return this.inner.toBytes();
  }

  static fromBytes(bytes: Uint8Array): ScalarField {
    const inner = FrWrapper.fromBytes(bytes);
    return ScalarField._fromFrWrapper(inner);
  }
}
