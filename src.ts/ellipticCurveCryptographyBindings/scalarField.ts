import { fr_add, fr_sub, FrWrapper as ScalarFieldWrapper } from '../rust_verkle_wasm.js'

export class ScalarField {
  inner: ScalarFieldWrapper

  private constructor(value: ScalarFieldWrapper) {
    this.inner = value
  }

  static fromBytes(bytes: Uint8Array): ScalarField {
    return new ScalarField(ScalarFieldWrapper.fromBytes(bytes))
  }

  static fromDecimalString(value: string): ScalarField {
    return new ScalarField(ScalarFieldWrapper.fromDecimalString(value))
  }

  static fromScalarFieldWrapper(inner: ScalarFieldWrapper): ScalarField {
    return new ScalarField(inner)
  }

  add(other: ScalarField): ScalarField {
    return new ScalarField(fr_add(this.inner, other.inner))
  }

  sub(other: ScalarField): ScalarField {
    return new ScalarField(fr_sub(this.inner, other.inner))
  }

  toBytes(): Uint8Array {
    return this.inner.toBytes()
  }
}
