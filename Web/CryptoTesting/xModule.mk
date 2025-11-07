LOCAL_PATH := $(my-dir)

$(call clear-local-vars)
LOCAL_MODULE := jsCryptoTesting

jsTesing__WASM_LDFLAGS := \
	-s IMPORTED_MEMORY=1 \
	--no-entry

$(call wasm_add_ldflags, $(jsTesing__WASM_LDFLAGS))
$(call wasmjs_add_ldflags, $(jsTesing__WASM_LDFLAGS))

LOCAL_BUILD_OPTIMIZE_FLAGS := -Oz
$(call call_add_optimize_module)

$(call add_general_source_files_under, $(LOCAL_PATH))
$(call module_depends, base)
$(call build-executable)

