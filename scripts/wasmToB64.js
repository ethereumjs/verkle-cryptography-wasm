// Converts WASM bytecode to JSON object to create JSON that can be loaded in ESM module without requiring `fetch`
const wasmBytes = require('fs').readFileSync('../src.ts/wasm/rust_verkle_wasm_bg.wasm')
const encoded = Buffer.from(wasmBytes, 'binary').toString('base64');
const json = {
    wasm: encoded
}
require('fs').writeFileSync('../src.ts/wasm/rust_verkle_wasm_bg.js', `export default ${JSON.stringify(json)}`)
