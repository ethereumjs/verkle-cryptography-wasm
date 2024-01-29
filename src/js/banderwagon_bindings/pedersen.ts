import { batchMapToScalarField } from ".";
import { Point, commitToPoly } from "./point.js";
export const pedersenHash = (input: Uint8Array): Uint8Array => {
  if (input.length > 255 * 16)
    throw new Error(
      `input byte length ${input.length} longer than max ${255 * 16}`
    );
  const elements = [];
  for (let i = 0; i < input.length; i = i + 16) {
    elements.push(Point.fromBytes(input.subarray(i, i + 16)));
  }
  const field = batchMapToScalarField(elements);
  return commitToPoly(field).toBytes();
};
