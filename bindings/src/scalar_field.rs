use std::str::FromStr;

use ark_ff::{Field, SquareRootField};
use verkle_trie::{
    from_to_bytes::{FromBytes, ToBytes},
    Fr,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct FrWrapper {
    pub(crate) inner: Fr,
}

#[wasm_bindgen]
pub fn fr_add(lhs: FrWrapper, rhs: FrWrapper) -> FrWrapper {
    FrWrapper {
        inner: lhs.inner + rhs.inner,
    }
}
#[wasm_bindgen]
pub fn fr_sub(lhs: FrWrapper, rhs: FrWrapper) -> FrWrapper {
    FrWrapper {
        inner: lhs.inner - rhs.inner,
    }
}
#[wasm_bindgen]
pub fn fr_mul(lhs: FrWrapper, rhs: FrWrapper) -> FrWrapper {
    FrWrapper {
        inner: lhs.inner * rhs.inner,
    }
}
#[wasm_bindgen]
pub fn fr_div(lhs: FrWrapper, rhs: FrWrapper) -> FrWrapper {
    FrWrapper {
        inner: lhs.inner / rhs.inner,
    }
}
#[wasm_bindgen]
pub fn fr_sqrt(lhs: FrWrapper) -> Result<FrWrapper, JsValue> {
    let square_root = match lhs.inner.sqrt() {
        Some(x) => FrWrapper { inner: x },
        None => return Err(JsValue::from_str("cannot find square root for number")),
    };
    Ok(square_root)
}

#[wasm_bindgen]
pub fn fr_square(lhs: FrWrapper) -> Result<FrWrapper, JsValue> {
    Ok(FrWrapper {
        inner: lhs.inner.square(),
    })
}

#[wasm_bindgen]
impl FrWrapper {
    #[wasm_bindgen(js_name = "fromBytes")]
    pub fn from_bytes(bytes: &[u8]) -> Result<FrWrapper, JsValue> {
        if bytes.len() != 32 {
            return Err(JsValue::from_str("Input should be 32 bytes"));
        }
        Ok(FrWrapper {
            inner: Fr::from_bytes(bytes),
        })
    }
    pub(crate) fn into_fr(self) -> Fr {
        self.inner
    }
    #[wasm_bindgen(js_name = "fromDecimalString")]
    pub fn from_decimal_string(string: String) -> Result<FrWrapper, JsValue> {
        match Fr::from_str(&string) {
            Ok(x) => Ok(FrWrapper { inner: x }),
            Err(_) => Err(JsValue::from_str("cannot parse string")),
        }
    }

    #[wasm_bindgen(js_name = "default")]
    pub fn default() -> Self {
        Self {
            inner: Fr::default(),
        }
    }

    #[wasm_bindgen(js_name = "toHexString")]
    pub fn to_hex_string(&self) -> String {
        format!("{:?}", hex::encode(self.inner.to_bytes()))
    }

    #[wasm_bindgen(js_name = "toBytes")]
    pub fn to_bytes(&self) -> Vec<u8> {
        self.inner.to_bytes()
    }
}
