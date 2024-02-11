use ffi_interface::Context;
pub use ffi_interface::{CommitmentBytes, ScalarBytes, ZERO_POINT};
use ipa_multipoint::committer::Committer;
use js_sys::Uint8Array;
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

#[wasm_bindgen]
pub struct ContextWrapper {
    pub(crate) inner: Context,
}

#[wasm_bindgen]
impl ContextWrapper {
    /// Default constructor to initialize the context
    ///
    /// This context holds the necessary configurations to allow you to
    /// modify the verkle trie structure, including the ability to ability
    /// to make and verify proofs
    #[wasm_bindgen(js_name = "default")]
    pub fn default() -> Self {
        Self {
            inner: Context::default(),
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
    ) -> Uint8Array {
        // TODO: This will silently truncate values which are not 32 bytes
        // TODO We should return an error instead
        let address = js_value_to_bytes::<32>(address.into());
        let tree_index_le = js_value_to_bytes::<32>(tree_index_le.into());

        let key =
            ffi_interface::get_tree_key(&self.inner.committer, address, tree_index_le, sub_index);

        bytes_to_js_value(key).into()
    }

    /// Commits to a collection of scalar values, returning the commitment in
    /// uncompressed form.
    #[wasm_bindgen(js_name = "commitToScalars")]
    pub fn commit_to_scalars(&self, scalars: Vec<Uint8Array>) -> Uint8Array {
        let scalars: Vec<u8> = scalars
            .into_iter()
            .map(|scalar| js_value_to_bytes::<32>(scalar.into()))
            .flatten()
            .collect();

        let commitment = ffi_interface::commit_to_scalars(&self.inner.committer, &scalars)
            .expect("could not commit to scalars");

        bytes_to_js_value(commitment).into()
    }
    /// Computes the hash of a commitment, returning a scalar value
    #[wasm_bindgen(js_name = "hashCommitment")]
    pub fn hash_commitment(&self, commitment: Uint8Array) -> Uint8Array {
        let commitment = js_value_to_bytes::<64>(commitment.into());

        let hash = ffi_interface::hash_commitment(commitment);

        bytes_to_js_value(hash).into()
    }

    /// Computes the hash of multiple commitment, returning a vector of scalar values.
    ///
    /// Note: This is an optimization for the `hashCommitment` method. The only reason to
    /// use `hashCommitment` is if the caller cannot take benefit of the optimization yet.
    ///
    /// This method will be more efficient than calling `hashCommitment` multiple times
    #[wasm_bindgen(js_name = "hashCommitments")]
    pub fn hash_commitments(&self, commitments: Vec<Uint8Array>) -> Vec<Uint8Array> {
        let commitments: Vec<CommitmentBytes> = commitments
            .into_iter()
            .map(|commitment| js_value_to_bytes::<64>(commitment.into()))
            .collect();

        let hashes = ffi_interface::hash_commitments(&commitments);

        hashes
            .into_iter()
            .map(|hash| bytes_to_js_value(hash).into())
            .collect()
    }

    /// Serialize a commitment, returning 32 bytes.
    ///
    /// This method does not return a scalar value, it returns 32 bytes.
    ///
    /// Note: We plan to deprecate this method from the public API in favour of using hash commitment
    /// This method will only be used internally once that is done.
    #[wasm_bindgen(js_name = "deprecateSerializeCommitment")]
    pub fn serialize_commitment(&self, commitment: Uint8Array) -> Uint8Array {
        let commitment = js_value_to_bytes::<64>(commitment.into());

        let hash = ffi_interface::deprecated_serialize_commitment(commitment);

        bytes_to_js_value(hash).into()
    }

    /// Updates a commitment from aG to bG.
    ///
    /// This is an optimization for recomputing the commitment using scalar multiplication.
    ///
    /// Short explanation: If a single value in a commitment changes, the naive way to recompute the commitment
    /// would be to recommit to all the values with the new value.
    ///
    /// This is quite inefficient as it can require O(n) scalar multiplications naively or O(n log n) using pippenger.
    ///
    /// This method allows you to update a single value in the commitment with a new value using O(1) scalar multiplications.
    /// This simply means that an update does not scale with the number of values committed to.
    ///
    #[wasm_bindgen(js_name = "updateCommitment")]
    pub fn update_commitment(
        &self,
        commitment: Uint8Array,
        commitment_index: u8,
        old_scalar_value: Uint8Array,
        new_scalar_value: Uint8Array,
    ) -> Uint8Array {
        let commitment = js_value_to_bytes::<64>(commitment.into());

        let old_scalar_value = js_value_to_bytes::<32>(old_scalar_value.into());
        let new_scalar_value = js_value_to_bytes::<32>(new_scalar_value.into());

        let updated_commitment = ffi_interface::update_commitment(
            &self.inner.committer,
            commitment,
            commitment_index,
            old_scalar_value,
            new_scalar_value,
        )
        .unwrap();

        bytes_to_js_value(updated_commitment).into()
    }

    /// This method should ideally only be used for tests.
    ///
    /// For updating a commitment, one should use the `update_commitment` method
    #[wasm_bindgen(js_name = "scalarMulIndex")]
    pub fn scalar_mul_index(&self, scalar_value: Uint8Array, commitment_index: u8) -> Uint8Array {
        fn fr_from_le_bytes(bytes: &[u8]) -> banderwagon::Fr {
            use banderwagon::trait_defs::*;
            banderwagon::Fr::deserialize_uncompressed(bytes)
                .expect("could not deserialize scalar field")
        }

        let scalar = fr_from_le_bytes(&js_value_to_bytes::<32>(scalar_value.into()));

        let commitment = self
            .inner
            .committer
            .scalar_mul(scalar, commitment_index as usize)
            .to_bytes_uncompressed();

        bytes_to_js_value(commitment).into()
    }
}

// TODO: This will silently truncate values which are not N bytes
// TODO We should return an error instead
fn js_value_to_bytes<const N: usize>(value: JsValue) -> [u8; N] {
    let array = js_sys::Uint8Array::new(&value);
    let mut result = [0u8; N];
    array.copy_to(&mut result);
    result
}
fn bytes_to_js_value<const N: usize>(bytes: [u8; N]) -> JsValue {
    js_sys::Uint8Array::from(&bytes[..]).into()
}
