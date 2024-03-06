use banderwagon::trait_defs::Zero;
use ipa_multipoint::committer::{Committer, DefaultCommitter};
use js_sys::Array;
use serde::{Deserialize, Serialize};
use verkle_trie::{constants::new_crs, Fr};
use wasm_bindgen::prelude::*;

use crate::{element::ElementWrapper, scalar_field::FrWrapper};

// This type is created because wasm-bindgen has issue passing complex
// types over the rust boundary. For example, we cannot do Vec<FrWrapper>
//
// We therefore need to pass a type which is serde serializable and deserializable
// over the rust boundary. This type is SerializableFrWrapper.
#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct SerializableFrWrapper {
    inner: Vec<u8>,
}

impl From<FrWrapper> for SerializableFrWrapper {
    fn from(wrapper: FrWrapper) -> Self {
        SerializableFrWrapper {
            // TODO(check): We can probably get good
            // Performance overall, if we just pass in
            // [u64;4] type and assume that arkworks
            // always keeps these in reduced form.
            inner: wrapper.to_bytes(),
        }
    }
}
impl From<SerializableFrWrapper> for FrWrapper {
    fn from(value: SerializableFrWrapper) -> Self {
        FrWrapper::from_bytes(&value.inner).unwrap()
    }
}

// wasm-bindgen has issues with passing in a vector of FrWrappers
// TODO: We should change this to possibly pass in a Vec of u64
// and then chunk each four u64s into a FrWrapper
#[wasm_bindgen]
pub fn commit_scalar_values(arr: &Array) -> Result<ElementWrapper, JsValue> {
    let committer = DefaultCommitter::new(&new_crs().G);

    let mut fr_values = [Fr::zero(); 256];

    for i in 0..arr.length() {
        let serializable_frwrapper_val = arr.get(i);
        let serializable_frwrapper: SerializableFrWrapper = serializable_frwrapper_val
            .into_serde()
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        let frwrapper: FrWrapper = serializable_frwrapper.into();
        fr_values[i as usize] = frwrapper.into_fr();
    }
    Ok(ElementWrapper {
        inner: committer.commit_lagrange(&fr_values),
    })
}
