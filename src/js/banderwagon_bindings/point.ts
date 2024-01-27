import {
  ElementWrapper as PointWrapper,
  element_add,
  element_sub,
  commit_scalar_values,
} from "../../../dist/cjs/wasm/rust_verkle_wasm";
import { ScalarField } from "../ellipticCurveCryptographyBindings";

export class Point {
  inner: PointWrapper;

  private constructor(inner: PointWrapper) {
    this.inner = inner;
  }

  static fromPointWrapper(inner: PointWrapper): Point {
    return new Point(inner);
  }

  add(other: Point): Point {
    return new Point(element_add(this.inner, other.inner));
  }

  sub(other: Point): Point {
    return new Point(element_sub(this.inner, other.inner));
  }

  toBytes(): Uint8Array {
    return this.inner.toBytes();
  }

  static fromBytes(bytes: Uint8Array): Point {
    return new Point(PointWrapper.fromBytes(bytes));
  }
}

export function commitToPoly(values: ScalarField[]): Point {
  const serializableValues = values.map((value) =>
    value.inner.toSerializableWrapper()
  );
  const inner = commit_scalar_values(serializableValues);
  return Point.fromPointWrapper(inner);
}

export function batchMapToScalarField(elements: Point[]): ScalarField[] {
  // This does not use the efficient version of batch map
  // that saves us from doing `N` inversions.
  return elements.map((value) =>
    ScalarField.fromScalarFieldWrapper(value.inner.mapToScalarField())
  );
}
