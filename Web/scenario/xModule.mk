LOCAL_PATH := $(my-dir)


$(call clear-local-vars)
LOCAL_MODULE := jsScenarioManager

LOCAL_BUILD_OPTIMIZE_FLAGS := -Oz

LOCAL_CXXFLAGS := -DrLANG_CONFIG_MINIMAL

jsScenarioManager_WASM_LDFLAGS :=	\
	-s IMPORTED_MEMORY=1	\
	-s GLOBAL_BASE=4KB 		\
	-s TOTAL_STACK=16KB 	\
	-s INITIAL_MEMORY=64KB

$(call wasm_add_ldflags, $(jsScenarioManager_WASM_LDFLAGS))
$(call wasmjs_add_ldflags, $(jsScenarioManager_WASM_LDFLAGS))

$(call call_add_optimize_module)
$(call wasm_add_ldflags, --no-entry)

$(call add_general_source_files_under, $(LOCAL_PATH))
$(call module_depends, base)
$(call build-executable)

