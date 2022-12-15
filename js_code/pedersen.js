
var wasm = require('../pkg/rust_verkle_wasm');

let zeroes = new Uint8Array(64);

// This function accepts uint8 arrays or integers which are less than 128 bit/16 bytes
let hashBytes = wasm.pedersen_hash(zeroes);
let hashHex = Buffer.from(hashBytes).toString('hex');
console.log(hashHex);