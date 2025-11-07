LOCAL_PATH := $(my-dir)

$(call clear-local-vars)
LOCAL_MODULE := jsLex

LOCAL_BUILD_OPTIMIZE_FLAGS := -Oz

jsFlex_WASM_LDFLAGS := \
	-s IMPORTED_MEMORY=1	\
	-s GLOBAL_BASE=64KB		\
	-s TOTAL_STACK=1MB	 	\
	-s INITIAL_MEMORY=16MB	\
	-s MAXIMUM_MEMORY=1GB	\
	-s ALLOW_MEMORY_GROWTH=1 \
	-s EXPORTED_FUNCTIONS='[ __emscripten_stack_alloc, __emscripten_stack_restore, _emscripten_stack_get_current ]'

$(call wasm_add_ldflags, $(jsFlex_WASM_LDFLAGS))
$(call wasmjs_add_ldflags, $(jsFlex_WASM_LDFLAGS))

$(call call_add_optimize_module)
$(call wasm_add_ldflags, --no-entry)

$(call add_general_source_files_under, $(LOCAL_PATH))
$(call module_depends, base)
$(call build-executable)
