import {
  ElementWrapper,
  element_add,
  element_sub,
  commit_scalar_values,
} from "../../../dist/cjs/wasm/rust_verkle_wasm";
import { ScalarField } from "../ecc_bindings";

export class Element {
  inner!: ElementWrapper;

  private constructor() {}

  static _fromElementWrapper(inner: ElementWrapper): Element {
    const field = new Element();
    field.inner = inner;
    return field;
  }

  add(other: Element): Element {
    return Element._fromElementWrapper(element_add(this.inner, other.inner));
  }

  sub(other: Element): Element {
    return Element._fromElementWrapper(element_sub(this.inner, other.inner));
  }

  toBytes(): Uint8Array {
    return this.inner.toBytes();
  }

  static fromBytes(bytes: Uint8Array): Element {
    const inner = ElementWrapper.fromBytes(bytes);
    return Element._fromElementWrapper(inner);
  }
}

export function commitToPoly(values: ScalarField[]): Element {
  const serializableValues = values.map((value) =>
    value.inner.toSerializableWrapper(),
  );
  const inner = commit_scalar_values(serializableValues);
  return Element._fromElementWrapper(inner);
}

export function batchMapToScalarField(elements: Element[]): ScalarField[] {
  // This does not use the efficient version of batch map
  // that saves us from doing `N` inversions.
  const scalars = elements.map((value) => {
    const inner = value.inner.mapToScalarField();
    return ScalarField._fromFrWrapper(inner);
  });
  return scalars;
}
