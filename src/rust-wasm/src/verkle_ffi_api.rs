use ffi_interface::Context as InnerContext;
pub use ffi_interface::{CommitmentBytes, ScalarBytes, ZERO_POINT};
use ipa_multipoint::committer::Committer;
use js_sys::Uint8Array;
use wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue};

#[wasm_bindgen]
pub struct Context {
    pub(crate) inner: InnerContext,
}

#[wasm_bindgen]
impl Context {
    /// Default constructor to initialize the context
    ///
    /// This context holds the necessary configurations to allow you to
    /// modify the verkle trie structure, including the ability to ability
    /// to make and verify proofs
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: InnerContext::default(),
        }
    }
    /// Computes `get_tree_key` method as specified in the verkle hackmd.
    /// See: https://notes.ethereum.org/@vbuterin/verkle_tree_eip#Header-values
    #[wasm_bindgen(js_name = "getTreeKey")]
    pub fn get_tree_key(
        &self,
        address: Uint8Array,
        tree_index_le: Uint8Array,
        sub_index: u8,
    ) -> Result<Uint8Array, JsError> {
        let address = js_value_to_bytes::<32>(address.into())?;
        let tree_index_le = js_value_to_bytes::<32>(tree_index_le.into())?;

        let key = ffi_interface::get_tree_key(&self.inner, address, tree_index_le, sub_index);

        Ok(bytes_to_js_value(key).into())
    }

    /// Commits to a collection of scalar values, returning the commitment in
    /// uncompressed form.
    #[wasm_bindgen(js_name = "commitToScalars")]
    pub fn commit_to_scalars(&self, scalars_js: Vec<Uint8Array>) -> Result<Uint8Array, JsError> {
        let mut scalars = Vec::with_capacity(scalars_js.len());
        for scalar in scalars_js {
            scalars.extend(js_value_to_bytes::<32>(scalar.into())?);
        }

        let commitment = ffi_interface::commit_to_scalars(&self.inner, &scalars)
            .map_err(|err| JsError::new(&format!("could not commit to scalars: {:?}", err)))?;

        Ok(bytes_to_js_value(commitment).into())
    }

    /// Similar to commit_to_scalars, but the scalars are 16 bytes instead of 32 bytes.
    ///
    /// This method is used in the specific context of get_tree_key.
    ///
    /// Note: We could get rid of this method, if we decide that the Js side should always
    /// pass 32 byte scalars to the commit_to_scalars method, so it would do the padding.
    #[wasm_bindgen(js_name = "commitTo16ByteScalars")]
    pub fn commit_to_16_byte_scalars(
        &self,
        scalars_js: Vec<Uint8Array>,
    ) -> Result<Uint8Array, JsError> {
        let mut scalars = Vec::with_capacity(scalars_js.len());
        for scalar in scalars_js {
            scalars.extend(js_value_to_bytes::<16>(scalar.into())?);
            // We are assuming that the scalars are 16 bytes long
            // So we pad the scalars array with 16 zeroes, so
            // that each scalar is 32 bytes long
            scalars.extend([0u8; 16]);
        }

        let commitment = ffi_interface::commit_to_scalars(&self.inner, &scalars)
            .map_err(|err| JsError::new(&format!("could not commit to scalars: {:?}", err)))?;

        Ok(bytes_to_js_value(commitment).into())
    }
    /// Computes the hash of a commitment, returning a scalar value
    ///
    // Note: This method does need context. It is here for API convenience.
    #[wasm_bindgen(js_name = "hashCommitment")]
    pub fn hash_commitment(&self, commitment: Uint8Array) -> Result<Uint8Array, JsError> {
        let commitment = js_value_to_bytes::<64>(commitment.into())?;

        let hash = ffi_interface::hash_commitment(commitment);

        Ok(bytes_to_js_value(hash).into())
    }

    /// Computes the hash of multiple commitment, returning a vector of scalar values.
    ///
    /// Note: This is an optimization for the `hashCommitment` method. The only reason to
    /// use `hashCommitment` is if the caller cannot take benefit of the optimization yet.
    ///
    /// This method will be more efficient than calling `hashCommitment` multiple times
    ///
    // Note: This method does need context. It is here for API convenience.
    #[wasm_bindgen(js_name = "hashCommitments")]
    pub fn hash_commitments(
        &self,
        commitments_js: Vec<Uint8Array>,
    ) -> Result<Vec<Uint8Array>, JsError> {
        let mut commitments = Vec::with_capacity(commitments_js.len());
        for commitment in commitments_js {
            commitments.push(js_value_to_bytes::<64>(commitment.into())?);
        }

        let hashes = ffi_interface::hash_commitments(&commitments);

        Ok(hashes
            .into_iter()
            .map(|hash| bytes_to_js_value(hash).into())
            .collect())
    }

    /// Updates a commitment from aG to bG.
    ///
    /// This is an optimization for recomputing the commitment using scalar multiplication.
    ///
    /// Short explanation: If a single value in a commitment changes, the naive way to recompute the commitment
    /// would be to recommit to all the values with the new value.
    ///
    /// This is quite inefficient as it can require O(n) scalar multiplications naively or O(n log n) using Pippenger.
    ///
    /// This method allows you to update a single value in the commitment with a new value using O(1) scalar multiplications.
    /// This simply means that an update does not scale with the number of values committed to.
    #[wasm_bindgen(js_name = "updateCommitment")]
    pub fn update_commitment(
        &self,
        commitment: Uint8Array,
        commitment_index: u8,
        old_scalar_value: Uint8Array,
        new_scalar_value: Uint8Array,
    ) -> Result<Uint8Array, JsError> {
        let commitment = js_value_to_bytes::<64>(commitment.into())?;

        let old_scalar_value = js_value_to_bytes::<32>(old_scalar_value.into())?;
        let new_scalar_value = js_value_to_bytes::<32>(new_scalar_value.into())?;

        let updated_commitment = ffi_interface::update_commitment(
            &self.inner,
            commitment,
            commitment_index,
            old_scalar_value,
            new_scalar_value,
        )
        .map_err(|err| JsError::new(&format!("could not update commitment: {:?}", err)))?;

        Ok(bytes_to_js_value(updated_commitment).into())
    }

    /// This method should ideally only be used for tests.
    ///
    /// For updating a commitment, one should use the `update_commitment` method
    #[wasm_bindgen(js_name = "scalarMulIndex")]
    pub fn scalar_mul_index(
        &self,
        scalar_value: Uint8Array,
        commitment_index: u8,
    ) -> Result<Uint8Array, JsError> {
        fn fr_from_le_bytes(bytes: &[u8]) -> banderwagon::Fr {
            use banderwagon::trait_defs::*;
            banderwagon::Fr::deserialize_uncompressed(bytes)
                .expect("could not deserialize scalar field")
        }

        let scalar = fr_from_le_bytes(&js_value_to_bytes::<32>(scalar_value.into())?);

        let commitment = self
            .inner
            .committer
            .scalar_mul(scalar, commitment_index as usize)
            .to_bytes_uncompressed();

        Ok(bytes_to_js_value(commitment).into())
    }
}

/// This is the default commitment to use when nothing has been committed to
#[wasm_bindgen(js_name = "zeroCommitment")]
pub fn zero_commitment() -> Uint8Array {
    bytes_to_js_value(ffi_interface::ZERO_POINT).into()
}

/// Converts a JsValue to an array of size `N` or return an JsValue object representing an
/// error
fn js_value_to_bytes<const N: usize>(value: JsValue) -> Result<[u8; N], JsError> {
    let array = js_sys::Uint8Array::new(&value);
    if array.length() != N as u32 {
        let mismatched_array_size = format!("Expected {} bytes, got {}", N, array.length());
        return Err(JsError::new(&mismatched_array_size));
    }

    let mut result = [0u8; N];
    array.copy_to(&mut result);
    Ok(result)
}
fn bytes_to_js_value<const N: usize>(bytes: [u8; N]) -> JsValue {
    js_sys::Uint8Array::from(&bytes[..]).into()
}
