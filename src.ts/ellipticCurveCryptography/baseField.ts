import { Field } from './field.js'

// The modulus that defines the basefield of the bandersnatch curve
const MODULUS: bigint =
  52435875175126190479447740508185965837690552500527637822603658699938581184513n

const Q_MIN_ONE_DIV_2: bigint = (MODULUS - 1n) / 2n

export class BaseField extends Field {
  constructor(value: bigint) {
    super(value, MODULUS)
  }

  lexographicallyLargest(): boolean {
    return super.lexographicallyLargest(Q_MIN_ONE_DIV_2)
  }
}
