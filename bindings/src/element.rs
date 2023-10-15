use verkle_trie::{Element, Fr};
use wasm_bindgen::prelude::*;

use crate::scalar_field::FrWrapper;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ElementWrapper {
    pub(crate) inner: Element,
}

#[wasm_bindgen]
pub fn element_add(lhs: ElementWrapper, rhs: ElementWrapper) -> ElementWrapper {
    ElementWrapper {
        inner: lhs.inner + rhs.inner,
    }
}
#[wasm_bindgen]
pub fn element_sub(lhs: ElementWrapper, rhs: ElementWrapper) -> ElementWrapper {
    ElementWrapper {
        inner: lhs.inner - rhs.inner,
    }
}

#[wasm_bindgen]
impl ElementWrapper {
    #[wasm_bindgen(js_name = "fromBytes")]
    pub fn from_bytes(bytes: &[u8]) -> Result<ElementWrapper, JsValue> {
        if bytes.len() != 32 {
            return Err(JsValue::from_str("Input should be 32 bytes"));
        }

        match Element::from_bytes(bytes) {
            Some(x) => Ok(ElementWrapper { inner: x }),
            None => Err(JsValue::from_str(
                "bytes do not represent a valid banderwagon element",
            )),
        }
    }

    #[wasm_bindgen(js_name = "generator")]
    pub fn generator() -> Self {
        Self {
            inner: Element::prime_subgroup_generator(),
        }
    }

    #[wasm_bindgen(js_name = "scalarMul")]
    pub fn scalar_mul(element_wrapper: ElementWrapper, scalar_wrapper: FrWrapper) -> Self {
        let element = element_wrapper.inner;
        let scalar = scalar_wrapper.inner;
        ElementWrapper {
            inner: element * scalar,
        }
    }

    #[wasm_bindgen(js_name = "zero")]
    pub fn zero() -> Self {
        Self {
            inner: Element::zero(),
        }
    }

    #[wasm_bindgen(js_name = "toHexString")]
    pub fn to_hex_string(&self) -> String {
        format!("{:?}", hex::encode(self.inner.to_bytes()))
    }

    #[wasm_bindgen(js_name = "toBytes")]
    pub fn to_bytes(&self) -> Vec<u8> {
        self.inner.to_bytes().to_vec()
    }

    #[wasm_bindgen(js_name = "mapToScalarField")]
    pub fn map_to_scalar_field(&self) -> FrWrapper {
        FrWrapper {
            inner: group_to_field(&self.inner),
        }
    }
}

// Taken from verkle-trie -- we should expose it and make it available in
// the next upgrade.
pub(crate) fn group_to_field(point: &Element) -> Fr {
    use ark_ff::PrimeField;
    use ark_serialize::CanonicalSerialize;

    let base_field = point.map_to_field();

    let mut bytes = [0u8; 32];
    base_field
        .serialize(&mut bytes[..])
        .expect("could not serialize point into a 32 byte array");
    Fr::from_le_bytes_mod_order(&bytes)
}