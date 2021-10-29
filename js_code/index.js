
var wasm = require('../pkg/rust_verkle_wasm');

let key_a = new Uint8Array([87, 104, 105, 115, 32, 105, 115, 32, 97, 32, 85, 105, 110, 116,
    56, 65, 114, 114, 97, 121, 32, 99, 111, 110, 118, 101, 114, 116,
    101, 100, 32, 10]);
let key_b = new Uint8Array([88, 104, 105, 115, 32, 105, 115, 32, 97, 32, 85, 105, 110, 116,
    56, 65, 114, 114, 97, 121, 32, 99, 111, 110, 118, 101, 114, 116,
    101, 100, 32, 45]);
let key_c = new Uint8Array([89, 104, 105, 115, 32, 105, 115, 32, 97, 32, 85, 105, 110, 116,
    56, 65, 114, 114, 97, 121, 32, 99, 111, 110, 118, 101, 114, 116,
    101, 100, 32, 78]);
let root = new Uint8Array([87, 104, 105, 115, 32, 105, 115, 32, 97, 32, 85, 105, 110, 116,
    56, 65, 114, 114, 97, 121, 32, 99, 111, 110, 118, 101, 114, 116,
    101, 100, 32]);
let proof = new Uint8Array([87, 104, 105, 115, 32, 105, 115, 32, 97, 32, 85, 105, 110, 116,
    56, 65, 114, 114, 97, 121, 32, 99, 111, 110, 118, 101, 114, 116,
    101, 100, 32, 87, 104, 105, 115, 32, 105, 115, 32, 97, 32, 85, 105, 110, 116,
    56, 65, 114, 114, 97, 121, 32, 99, 111, 110, 118, 101, 114, 116,
    101, 100, 32]);

var key_value_map = new Map()
key_value_map.set(key_a, [key_a, null]) // read, but no write
key_value_map.set(key_b, [null, key_b]) // read but value was not there, and a write
key_value_map.set(key_c, [null, null]) // Need to check if this case is allowed at the higher level. (read but value not there, no write)

let res = wasm.js_verify_update(root, proof, key_value_map);
console.log("returned value: ", res)
