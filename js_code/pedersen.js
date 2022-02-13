
var wasm = require('../pkg/rust_verkle_wasm');

let ff_value_16_byte = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);

// This function accepts uint8 arrays or integers which are less than 128 bit/16 bytes
let hash = wasm.pedersen_hash([ff_value_16_byte, 1]);
console.log(hash);