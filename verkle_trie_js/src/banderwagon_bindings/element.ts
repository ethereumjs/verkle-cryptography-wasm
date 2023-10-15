import {
  ElementWrapper,
  element_add,
  element_sub,
  commit_scalar_values,
} from "@kevaundray/rust_verkle_wasm";
import { ScalarField } from "../ecc_bindings";

export class Element {
  inner!: ElementWrapper;

  private constructor() {}

  private static fromElementWrapper(inner: ElementWrapper): Element {
    const field = new Element();
    field.inner = inner;
    return field;
  }

  add(other: Element): Element {
    return Element.fromElementWrapper(element_add(this.inner, other.inner));
  }

  sub(other: Element): Element {
    return Element.fromElementWrapper(element_sub(this.inner, other.inner));
  }

  toBytes(): Uint8Array {
    return this.inner.toBytes();
  }

  commitToPoly(values: ScalarField[]): Element {
    const serializableValues = values.map((value) =>
      value.inner.toSerializableWrapper(),
    );
    const inner = commit_scalar_values(serializableValues);
    return Element.fromElementWrapper(inner);
  }

  static fromBytes(bytes: Uint8Array): Element {
    const inner = ElementWrapper.fromBytes(bytes);
    return Element.fromElementWrapper(inner);
  }
}
