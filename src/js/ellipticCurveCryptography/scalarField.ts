import { Field } from "./field";

// The modulus that defines the scalar of the bandersnatch curve
const MODULUS: bigint =
  13108968793781547619861935127046491459309155893440570251786403306729687672801n;

const Q_MIN_ONE_DIV_2: bigint = (MODULUS - 1n) / 2n;

export class ScalarField extends Field {
  constructor(value: bigint) {
    super(value, MODULUS);
  }

  lexographicallyLargest(): boolean {
    return super.lexographicallyLargest(Q_MIN_ONE_DIV_2);
  }
}
