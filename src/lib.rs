mod utils;

use std::convert::TryInto;

use js_sys::{Array, Map, Uint8Array};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// // allocator.
// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// The root is the root of the current trie
// The proof is proof of membership of all of the accessed values
// keys_values is a map from the key of the accessed value to a tuple
// the tuple contains the old value and the updated value
//
// This function returns the new root when all of the updated values are applied
#[wasm_bindgen]
pub fn js_verify_update(js_root: Uint8Array, js_proof: Uint8Array, js_key_values: &Map) -> JsValue {
    let mut keys = Vec::new();
    let mut old_values = Vec::new();
    let mut updated_values = Vec::new();

    for x in js_key_values.entries() {
        // We know the built-in iterator won't throw exceptions, so
        // unwrap is okay.
        let x = x.unwrap();
        //The entries Iterator is a javascript array. [key ,[old_value, updated_value]]
        // The first entry is the key
        // The second entry is the old value
        // The third entry is updated value
        //
        // The key should never be null
        // If the old value is null, then this means it was not in the trie previously
        // if the update value is null, then this means that we do not want to update it's entry in the trie
        let arr = Array::from(&x);
        let arr_0 = Array::get(&arr, 0);

        let values = Array::get(&arr, 1);
        let values = Array::from(&values);

        let arr_1 = Array::get(&values, 0);
        let arr_2 = Array::get(&values, 1);

        if arr_0.is_null() {
            log("the key cannot be null");
            return JsValue::NULL;
        }

        let key = match js_value_to_array32(arr_0, "trie key") {
            Ok(arr) => arr,
            Err(_) => return JsValue::NULL,
        };

        let mut old_value = None;
        if !arr_1.is_null() {
            match js_value_to_array32(arr_1, "old value") {
                Ok(arr) => old_value = Some(arr),
                Err(_) => return JsValue::NULL,
            }
        }
        let mut updated_value = None;
        if !arr_2.is_null() {
            match js_value_to_array32(arr_2, "updated value") {
                Ok(arr) => updated_value = Some(arr),
                Err(_) => return JsValue::NULL,
            }
        }

        keys.push(key);
        old_values.push(old_value);
        updated_values.push(updated_value);
    }

    use verkle_trie::database::memory_db::MemoryDb;
    use verkle_trie::proof::stateless_updater;
    use verkle_trie::Trie;
    use verkle_trie::{BasicCommitter, ToBytes};

    // We initialise a trie here, so that we can emulate a proof structure
    // ie it's a stub, until we can get proper input from  javascript
    let db = MemoryDb::new();
    let mut trie = Trie::new(db, BasicCommitter);

    let stub = [0u8; 32];
    let keys = vec![stub];
    let old_values = vec![Some(stub)];
    let updated_values = vec![None];

    trie.insert(stub, stub);
    let root = trie.compute_root_commitment();

    let proof = trie.create_verkle_proof(vec![[0u8; 32]].into_iter());
    let new_root = stateless_updater::verify_and_update(
        proof,
        root,
        keys,
        old_values,
        updated_values,
        BasicCommitter, // This is the slow variant of computing the deltas. Change once we know how wasm handles large precomputes
    );

    let new_root = match new_root {
        Ok(root) => root,
        Err(_) => {
            log("there was an error updating the root!");
            return JsValue::NULL;
        }
    };

    let bytes = new_root.to_bytes();
    JsValue::from(Uint8Array::from(bytes.as_slice()))
}

fn js_value_to_array32(val: JsValue, value_identifier: &str) -> Result<[u8; 32], ()> {
    //Convert the JsValue to a Uint8Array and then to a Vec
    let vector = Uint8Array::from(val).to_vec();
    // Get the vector length incase it is not 32
    if vector.len() != 32 {
        log(&format!(
            "{} must contain 32 bytes, found : {}\n please check {:?}",
            value_identifier,
            vector.len(),
            vector
        ));

        return Err(());
    };

    let array: [u8; 32] = vector.try_into().unwrap();
    Ok(array)
}
