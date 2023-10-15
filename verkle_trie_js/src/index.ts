// Export ScalarField
export { ScalarField as Fr } from "./ecc_bindings/index";

// Exports the banderwagon group element. This is used predominantly for
// representing commitments.
//
// Exports commitToPoly, which is used to commit to a polynomial/a list of scalars.
//
// Export batchMapToScalarField, which is used to convert a list of commitments
// to scalars so that one can commit to them using commitToPoly.
export {
  Element as Point,
  commitToPoly,
  batchMapToScalarField,
} from "./banderwagon_bindings/index";
