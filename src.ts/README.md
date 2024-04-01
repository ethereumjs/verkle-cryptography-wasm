# Library Usage

In order to use the verkle cryptography functions exposed by this module, you must first initialize the WASM binary as below:

```ts
import { loadVerkleCrypto } from 'verkle-cryptography-wasm'

const main = async () => {
    const verkle = await loadVerkleCrypto();

    // Do verkle stuff here
}
```

`loadVerkleCrypto` returns all methods available for Verkle Trie operations.  The API is still unstable so please reference [index.ts](index.ts) for the main exported modules and functions.
