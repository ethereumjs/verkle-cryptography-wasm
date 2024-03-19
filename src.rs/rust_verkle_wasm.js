import { base64 } from '@scure/base'
import wasmB64 from './rust_verkle_wasm_bg.js'

let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

let WASM_VECTOR_LEN = 0;

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}
/**
* This is the default commitment to use when nothing has been committed to
* @returns {Uint8Array}
*/
export function zeroCommitment() {
    const ret = wasm.zeroCommitment();
    return takeObject(ret);
}

/**
*/
export class Context {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_context_free(ptr);
    }
    /**
    * Default constructor to initialize the context
    *
    * This context holds the necessary configurations to allow you to
    * modify the verkle trie structure, including the ability to ability
    * to make and verify proofs
    */
    constructor() {
        const ret = wasm.context_new();
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * Computes `get_tree_key` method as specified in the verkle hackmd.
    * See: https://notes.ethereum.org/@vbuterin/verkle_tree_eip#Header-values
    * @param {Uint8Array} address
    * @param {Uint8Array} tree_index_le
    * @param {number} sub_index
    * @returns {Uint8Array}
    */
    getTreeKey(address, tree_index_le, sub_index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.context_getTreeKey(retptr, this.__wbg_ptr, addHeapObject(address), addHeapObject(tree_index_le), sub_index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Commits to a collection of scalar values, returning the commitment in
    * uncompressed form.
    * @param {(Uint8Array)[]} scalars_js
    * @returns {Uint8Array}
    */
    commitToScalars(scalars_js) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(scalars_js, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.context_commitToScalars(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Similar to commit_to_scalars, but the scalars are 16 bytes instead of 32 bytes.
    *
    * This method is used in the specific context of get_tree_key.
    *
    * Note: We could get rid of this method, if we decide that the Js side should always
    * pass 32 byte scalars to the commit_to_scalars method, so it would do the padding.
    * @param {(Uint8Array)[]} scalars_js
    * @returns {Uint8Array}
    */
    commitTo16ByteScalars(scalars_js) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(scalars_js, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.context_commitTo16ByteScalars(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Computes the hash of a commitment, returning a scalar value
    * @param {Uint8Array} commitment
    * @returns {Uint8Array}
    */
    hashCommitment(commitment) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.context_hashCommitment(retptr, this.__wbg_ptr, addHeapObject(commitment));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Computes the hash of multiple commitment, returning a vector of scalar values.
    *
    * Note: This is an optimization for the `hashCommitment` method. The only reason to
    * use `hashCommitment` is if the caller cannot take benefit of the optimization yet.
    *
    * This method will be more efficient than calling `hashCommitment` multiple times
    * @param {(Uint8Array)[]} commitments_js
    * @returns {(Uint8Array)[]}
    */
    hashCommitments(commitments_js) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(commitments_js, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.context_hashCommitments(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Serialize a commitment, returning 32 bytes.
    *
    * This method does not return a scalar value, it returns 32 bytes.
    *
    * Note: We plan to deprecate this method from the public API in favour of using hash commitment
    * This method will only be used internally once that is done.
    * @param {Uint8Array} commitment
    * @returns {Uint8Array}
    */
    deprecateSerializeCommitment(commitment) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.context_deprecateSerializeCommitment(retptr, this.__wbg_ptr, addHeapObject(commitment));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Updates a commitment from aG to bG.
    *
    * This is an optimization for recomputing the commitment using scalar multiplication.
    *
    * Short explanation: If a single value in a commitment changes, the naive way to recompute the commitment
    * would be to recommit to all the values with the new value.
    *
    * This is quite inefficient as it can require O(n) scalar multiplications naively or O(n log n) using Pippenger.
    *
    * This method allows you to update a single value in the commitment with a new value using O(1) scalar multiplications.
    * This simply means that an update does not scale with the number of values committed to.
    * @param {Uint8Array} commitment
    * @param {number} commitment_index
    * @param {Uint8Array} old_scalar_value
    * @param {Uint8Array} new_scalar_value
    * @returns {Uint8Array}
    */
    updateCommitment(commitment, commitment_index, old_scalar_value, new_scalar_value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.context_updateCommitment(retptr, this.__wbg_ptr, addHeapObject(commitment), commitment_index, addHeapObject(old_scalar_value), addHeapObject(new_scalar_value));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * This method should ideally only be used for tests.
    *
    * For updating a commitment, one should use the `update_commitment` method
    * @param {Uint8Array} scalar_value
    * @param {number} commitment_index
    * @returns {Uint8Array}
    */
    scalarMulIndex(scalar_value, commitment_index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.context_scalarMulIndex(retptr, this.__wbg_ptr, addHeapObject(scalar_value), commitment_index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_085ec1f694018c4f = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_6da8e527659b86aa = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8125e318e6245eed = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_5cf90238115182c3 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_72e2208bbc0efc61 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('rust_verkle_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;

export const initVerkleWasm = async () => {
    const imports = __wbg_get_imports();
    __wbg_init_memory(imports);
    const instance = await WebAssembly.instantiate(
      await WebAssembly.compile(base64.decode(wasmB64.wasm)),
      imports
    )
    __wbg_finalize_init(instance, module);
    return {
        Context,
        zeroCommitment,
    }
  }
