const sf = require('./dist/cjs/ecc_bindings/scalar_field')
const a = sf.ScalarField.fromDecimalString('10')
const b = sf.ScalarField.fromDecimalString('3')
const c = a.add(b)

console.log(c.toBytes())