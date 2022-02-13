mod utils;

use js_sys::{Array, BigInt, Map, Uint8Array};
use std::convert::TryInto;
use utils::set_panic_hook;
use wasm_bindgen::prelude::*;

use verkle_trie::{
    committer::{test::TestCommitter, Committer},
    from_to_bytes::{FromBytes, ToBytes},
    proof::{stateless_updater, VerkleProof},
    EdwardsProjective,
};

#[wasm_bindgen]
extern "C" {

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
// Values is an array of 128 bit integers interpreted in big endian format
pub fn pedersen_hash(values: Array) -> JsValue {
    set_panic_hook();

    let mut result = EdwardsProjective::default();
    let committer = TestCommitter::default();

    for (index, entry) in values.values().into_iter().enumerate() {
        // We know the built-in iterator won't throw exceptions, so
        // unwrap is okay.
        let value = entry.unwrap();
        let u128val = match js_value_to_u128(value, &format!("element {} in pedersen hash", index))
        {
            Ok(val) => val,
            Err(_) => return JsValue::NULL,
        };

        result += committer.scalar_mul(u128val.into(), index);
    }

    let result_bytes = result.to_bytes();
    JsValue::from(Uint8Array::from(result_bytes.as_slice()))
}

// The root is the root of the current trie
// The proof is proof of membership of all of the accessed values
// keys_values is a map from the key of the accessed value to a tuple
// the tuple contains the old value and the updated value
//
// This function returns the new root when all of the updated values are applied
#[wasm_bindgen]
pub fn js_verify_update(js_root: Uint8Array, js_proof: Uint8Array, js_key_values: &Map) -> JsValue {
    set_panic_hook();

    let mut keys = Vec::new();
    let mut old_values = Vec::new();
    let mut updated_values = Vec::new();

    for x in js_key_values.entries() {
        // We know the built-in iterator won't throw exceptions, so
        // unwrap is okay.
        let x = x.unwrap();
        // The entries Iterator is a javascript array. [key ,[old_value, updated_value]]
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
    let proof_bytes = js_proof.to_vec();
    let proof = match VerkleProof::read(&*proof_bytes) {
        Ok(proof) => proof,
        Err(_) => {
            log("could not deserialise the proof");
            return JsValue::NULL;
        }
    };

    let pre_state_root_bytes = js_root.to_vec();
    let pre_state_root = EdwardsProjective::from_bytes(&pre_state_root_bytes);

    //TODO: Need to catch these in rust-verkle instead #issue46
    let len_keys = keys.len();
    let len_prestate = old_values.len();
    let len_poststate = updated_values.len();
    if len_keys != len_prestate {
        log(&format!(
            "length of keys is {}, but length of pre state values is {}",
            len_keys, len_prestate,
        ));
        return JsValue::NULL;
    }
    if len_keys != len_poststate {
        log(&format!(
            "length of keys is {}, but length of pre state values is {}",
            len_keys, len_poststate,
        ));
        return JsValue::NULL;
    }

    let new_root = stateless_updater::verify_and_update(
        proof,
        pre_state_root,
        keys,
        old_values,
        updated_values,
        TestCommitter::default(), // This is the slow variant of computing the deltas. Change once we know how wasm handles large precomputes
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
fn js_value_to_u128(val: JsValue, value_identifier: &str) -> Result<u128, ()> {
    if let Ok(val_int) = BigInt::new(&val) {
        // Seems like the only way in javascript to get the number of bits
        let num_bits = val_int.to_string(2).unwrap().length();

        if num_bits > 128 {
            log(&format!(
                "{} can not be greater than a 128 bit number, number of bits is {}",
                value_identifier, num_bits
            ));

            return Err(());
        }

        // The following lines of code will convert a BigInt into a u128
        // To do this, we convert it to a Javascript string in base10, then to a utf8 encoded rust string
        // then we parse the rust string as a u128
        let val_as_string = val_int.to_string(10).unwrap().as_string().unwrap();

        let value_u128: u128 = val_as_string.parse().unwrap();
        return Ok(value_u128);
    }
    //Convert the JsValue to a Uint8Array and then to a Vec
    let vector = Uint8Array::from(val).to_vec();
    // Get the vector length incase it is not 16
    if vector.len() != 16 {
        log(&format!(
            "{} must contain 16 bytes, found : {}\n please check {:?}",
            value_identifier,
            vector.len(),
            vector
        ));

        return Err(());
    };
    Ok(u128::from_le_bytes(vector.try_into().unwrap()))
}
#[cfg(test)]
mod tests {
    use super::*;
    use verkle_trie::database::memory_db::MemoryDb;
    use verkle_trie::{Fr, TestConfig, Trie, TrieTrait};

    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_stateless_proof_verifier() {
        // 1) Create a trie which will be our pre-state
        let db = MemoryDb::new();
        let mut trie = Trie::new(TestConfig::new(db));

        let zero_key = [0u8; 32];
        let one_key = [1u8; 32];
        let two_key = [2u8; 32];
        let three_key = [3u8; 32];

        // Insert zero_key, one_key, two_key into the trie.
        // The key and value are the same for each entry
        // The three_key is not inserted into the trie, we will use it as an
        // example of a value that is absent
        trie.insert(vec![(zero_key, zero_key), (one_key, one_key), (two_key, two_key)].into_iter());

        // keys and old_values summarises the pre-state
        // None signifies that the old_value was not in the trie; since
        // we did not insert three_key into the trie, it has a corresponding old_value of `None`
        let keys = vec![zero_key, one_key, two_key, three_key];
        let old_values = vec![Some(zero_key), Some(one_key), Some(two_key), None];

        // This is the root of our trie, before any updates are applied
        let pre_state_root = trie.root_commitment();

        // 2) Lets compute a proof that all of these values are correct in the pre-state
        let proof = trie.create_verkle_proof(keys.clone().into_iter());

        // 2) Now lets emulate what would happen when we receive a new block and need to update the state root

        let ff_value = [0xff; 32];
        // The updated values vector signifies what will happen post-state.
        // `None` signifies that the value was not updated.
        // Below, note that `zero_key` and `three_key` were not updated  from the
        // pre state to the post state
        // The `one_key` and `two_key` were both updated to the value `ff_value`
        let updated_values = vec![None, Some(ff_value), Some(ff_value), None];

        // Lets update the trie so that we can figure out what the new root will be after
        // the updated values are applied
        for (key, optional_new_val) in keys.iter().zip(updated_values.iter()) {
            if let Some(new_val) = optional_new_val {
                trie.insert_single(*key, *new_val)
            }
        }

        // This is the root of our trie, _after_ updates are applied
        let post_state_root = trie.root_commitment();

        // 3) Now lets verify consistency between pre-state and post-state using rust-verkle directly
        // the verifier passes in the pre state root which came from some `trusted` source.
        // and they compute the post state root.
        let computed_post_state_root = stateless_updater::verify_and_update(
            proof.clone(),
            pre_state_root,
            keys.clone(),
            old_values.clone(),
            updated_values.clone(),
            TestCommitter::default(),
        )
        .unwrap();
        assert_eq!(computed_post_state_root, post_state_root);

        //4) Now lets use the js method to compute the new state root

        let js_prestate_root = Uint8Array::from(pre_state_root.to_bytes().as_slice());

        let mut proof_bytes = Vec::new();
        proof.write(&mut proof_bytes).unwrap();
        let js_proof = Uint8Array::from(proof_bytes.as_slice());

        let js_key_vals = Map::new();
        for i in 0..keys.len() {
            let key = JsValue::from(Uint8Array::from(keys[i].as_slice()));
            let old_val = match old_values[i] {
                Some(old_val_bytes) => JsValue::from(Uint8Array::from(old_val_bytes.as_slice())),
                None => JsValue::NULL,
            };
            let updated_val = match updated_values[i] {
                Some(updated_val_bytes) => {
                    JsValue::from(Uint8Array::from(updated_val_bytes.as_slice()))
                }

                None => JsValue::NULL,
            };

            let arr = Array::new();
            arr.set(0, old_val);
            arr.set(1, updated_val);

            js_key_vals.set(&key, &arr);
        }

        let js_post_state_root = js_verify_update(js_prestate_root, js_proof, &js_key_vals);
        let computed_js_post_state_root_bytes =
            js_value_to_array32(js_post_state_root, "post state root").unwrap();

        assert_eq!(
            &computed_js_post_state_root_bytes[..],
            &post_state_root.to_bytes()
        )
    }

    #[wasm_bindgen_test]
    fn test_pedersen_hash() {
        let element_0 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        let element_1 = 1;

        let js_element_0 = JsValue::from(Uint8Array::from(element_0.as_slice()));
        let js_element_1 = JsValue::from(element_1 as u128);

        let arr = Array::new();
        arr.set(0, js_element_0);
        arr.set(1, js_element_1);

        let hash = pedersen_hash(arr);
        let hash_bytes = js_value_to_array32(hash, "pedersen hash").unwrap();

        // Compute the hash using conventional methods
        // We do not use CanonicalSerialise as that would mean that the caller needs to know about
        // arkworks' serialisation format
        let committer = TestCommitter::default();
        use ark_ff::PrimeField;
        let res = committer.scalar_mul(Fr::from_le_bytes_mod_order(&element_0), 0)
            + committer.scalar_mul(Fr::from(element_1), 1);

        assert_eq!(res.to_bytes(), hash_bytes);
    }
}
