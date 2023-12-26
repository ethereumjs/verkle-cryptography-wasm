var wasm = require("../pkg/rust_verkle_wasm");

// The following keys will be used in our example.
//
// Pre-state view:

// The first three, zeros_key, ones_key, twos_key are already inserted into our trie.
// The last key threes_key is absent
let zeros_key = new Uint8Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
]);
let ones_key = new Uint8Array([
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1,
]);
let twos_key = new Uint8Array([
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2,
]);
let threes_key = new Uint8Array([
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  3, 3, 3, 3, 3, 3,
]);

// This is the pre state root which corresponds to our pre state view
let pre_state_root = new Uint8Array([
  79, 157, 52, 193, 114, 62, 196, 42, 91, 207, 210, 94, 42, 56, 241, 105, 139,
  244, 110, 131, 199, 166, 212, 129, 164, 133, 253, 99, 0, 41, 28, 228,
]);
// After applying the updates below, this will be our post state root
// This was generated in the test named `test_stateless_proof_verifier` in `lib.rs`
let expected_post_state_root = new Uint8Array([
  81, 11, 227, 152, 134, 127, 165, 224, 34, 138, 61, 203, 172, 81, 98, 251, 112,
  244, 18, 117, 116, 156, 188, 101, 201, 71, 84, 28, 105, 30, 118, 65,
]);

// This is the proof that the pre-state values are correct, ie reads are consistent
let proof = new Uint8Array([
  0, 0, 0, 0, 4, 0, 0, 0, 10, 10, 10, 8, 6, 0, 0, 0, 188, 215, 150, 230, 238,
  86, 197, 121, 100, 131, 22, 48, 172, 5, 161, 114, 177, 74, 113, 156, 21, 96,
  52, 199, 35, 117, 149, 137, 241, 162, 88, 213, 73, 224, 147, 149, 205, 118, 1,
  122, 254, 217, 194, 32, 113, 28, 180, 83, 214, 208, 132, 220, 191, 215, 171,
  155, 232, 55, 151, 39, 26, 145, 115, 159, 208, 186, 64, 251, 252, 117, 15,
  180, 56, 42, 84, 190, 74, 21, 40, 57, 214, 20, 31, 16, 85, 255, 61, 92, 148,
  252, 129, 133, 34, 40, 106, 98, 106, 186, 5, 135, 38, 112, 180, 60, 144, 113,
  102, 182, 132, 188, 219, 237, 199, 183, 231, 135, 238, 81, 46, 191, 246, 31,
  111, 207, 153, 36, 97, 68, 233, 174, 152, 122, 100, 37, 60, 122, 21, 54, 230,
  237, 34, 204, 228, 235, 184, 71, 85, 231, 102, 116, 223, 235, 95, 70, 144,
  107, 204, 161, 217, 168, 63, 249, 89, 119, 41, 91, 235, 135, 28, 202, 251,
  226, 221, 35, 202, 69, 117, 113, 60, 75, 200, 247, 163, 10, 94, 159, 125, 191,
  188, 61, 111, 140, 211, 31, 119, 101, 143, 252, 7, 33, 234, 84, 238, 78, 120,
  133, 228, 177, 55, 185, 219, 185, 20, 20, 86, 147, 95, 227, 209, 224, 22, 198,
  76, 194, 42, 64, 224, 170, 196, 61, 254, 82, 224, 41, 176, 229, 172, 91, 13,
  121, 54, 177, 146, 30, 235, 65, 6, 100, 68, 55, 86, 150, 147, 140, 148, 153,
  79, 168, 194, 170, 207, 53, 241, 133, 172, 63, 232, 224, 37, 221, 124, 23, 71,
  234, 103, 43, 159, 186, 192, 220, 21, 35, 190, 119, 196, 127, 154, 97, 7, 241,
  1, 20, 245, 131, 211, 54, 106, 28, 120, 129, 42, 197, 191, 232, 132, 153, 82,
  35, 131, 55, 190, 39, 101, 108, 166, 250, 139, 17, 158, 216, 115, 116, 194,
  147, 104, 113, 154, 104, 151, 51, 33, 107, 158, 239, 8, 26, 149, 105, 125,
  250, 27, 88, 141, 231, 170, 141, 204, 11, 102, 202, 134, 216, 165, 56, 108,
  199, 193, 223, 216, 176, 48, 180, 195, 107, 38, 185, 246, 118, 55, 187, 33,
  141, 25, 123, 56, 167, 149, 252, 1, 250, 196, 156, 90, 82, 135, 24, 190, 152,
  238, 128, 186, 117, 159, 231, 141, 43, 72, 240, 161, 111, 141, 31, 125, 26,
  210, 126, 5, 254, 25, 174, 19, 207, 162, 65, 47, 146, 188, 139, 190, 72, 135,
  3, 86, 35, 196, 14, 40, 27, 147, 204, 193, 184, 123, 8, 118, 78, 248, 70, 24,
  22, 34, 114, 151, 99, 165, 235, 110, 51, 67, 5, 169, 102, 19, 240, 240, 166,
  94, 35, 43, 81, 177, 206, 48, 66, 55, 22, 227, 40, 19, 184, 249, 211, 5, 107,
  0, 179, 216, 240, 122, 101, 217, 205, 177, 36, 112, 222, 131, 222, 93, 23,
  165, 28, 27, 60, 222, 106, 55, 93, 234, 31, 195, 10, 14, 171, 98, 241, 206,
  190, 110, 46, 177, 72, 57, 219, 222, 114, 132, 38, 246, 211, 2, 69, 16, 174,
  29, 131, 141, 194, 232, 119, 151, 70, 96, 157, 216, 182, 16, 125, 84, 150, 57,
  212, 13, 52, 78, 227, 23, 200, 165, 206, 109, 247, 202, 248, 229, 214, 32, 86,
  208, 195, 202, 152, 168, 99, 91, 50, 237, 130, 36, 239, 101, 92, 91, 190, 61,
  196, 8, 83, 6, 206, 90, 28, 221, 235, 41, 135, 136, 239, 68, 113, 91, 19, 29,
  33, 26, 108, 62, 230, 104, 91, 62, 78, 64, 96, 221, 122, 128, 209, 145, 185,
  169, 212, 88, 49, 117, 99, 125, 98, 255, 9, 183, 37, 119, 209, 147, 15, 4, 71,
  201, 111, 251, 28, 198, 157, 87, 67, 0, 24, 99, 174, 229, 22, 38, 36, 128,
  213, 208, 255, 238, 158, 17, 254, 210, 202, 238, 158, 42, 153, 148, 211, 57,
  229, 140, 248, 161, 115, 21, 141, 120, 228, 130, 191, 185, 204, 64, 252, 76,
  184, 77, 123, 187, 38, 86, 157, 222, 13, 50, 201, 201, 160, 30, 190, 168, 99,
  28, 141, 86, 147, 225, 7, 239, 98, 158, 213, 80, 102, 126, 78, 169, 68, 142,
  168, 169, 217, 137, 157, 206, 173, 152, 39, 55, 183, 210, 28, 111, 252, 193,
  68, 54, 94, 171, 199, 18, 192, 70, 3, 70, 35, 3, 56, 46, 104, 43, 241, 92, 97,
  58, 206, 174, 196, 231, 154, 21, 117, 239, 177, 196, 208, 189, 158, 110, 198,
  0, 229, 86, 193, 205, 15,
]);

// We will write this value to `ones_key` and `twos_key`
// See key_value_map below.
let ff_value = new Uint8Array([
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
  255, 255,
]);

// This `key_value` map states the following:
// `zeros_key` had a pre state value of `zeros_key` and we are not updating its value
// `ones_key` had a pre state value of `ones_key` and we are updating this value to `ff_value`
// `twos_key` had a pre state value of `twos_key` and we are updating this value to `ff_value`
// `threes_key` was absent in the pre state view, ie never written to, and we are not updating its value
var key_value_map = new Map();
key_value_map.set(zeros_key, [zeros_key, null]);
key_value_map.set(ones_key, [ones_key, ff_value]);
key_value_map.set(twos_key, [twos_key, ff_value]);
key_value_map.set(threes_key, [null, null]);

// Verify that the pre state values were correct and using the post state values
// update the state root
let post_state_root = wasm.verify_update(pre_state_root, proof, key_value_map);

// The code below checks that we computed the right state root.
// As noted above, the expected state root value was taken from a test in `lib.rs`
let pre_state_root_as_hex = Buffer.from(pre_state_root).toString("hex");
let post_state_root_as_hex = Buffer.from(post_state_root).toString("hex");

if (equalUint8Array(post_state_root, expected_post_state_root)) {
  console.log(
    "\nstate root was correctly updated!\npre state root: ",
    pre_state_root_as_hex,
    "\npost state root: ",
    post_state_root_as_hex,
    "\n"
  );
} else {
  console.log(
    "\nstate root was not correctly updated, found ",
    post_state_root_as_hex,
    "\n"
  );
}

// Check if two Uint8Arrays are equal, since != does not check that they are element-wise equal
function equalUint8Array(left, right) {
  if (left.byteLength != right.byteLength) return false;
  for (var i = 0; i != left.byteLength; i++) {
    if (left[i] != right[i]) return false;
  }
  return true;
}
