
var wasm = require('../pkg/rust_verkle_wasm');

let zeroes = new Uint8Array(64);

// This function accepts a 64 byte array. 
// This should be the address concatenated with the tree index 
let hashBytes = wasm.pedersen_hash(zeroes);
let hashHex = Buffer.from(hashBytes).toString('hex');
console.log(hashHex);