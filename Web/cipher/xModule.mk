LOCAL_PATH := $(my-dir)

$(call clear-local-vars)
LOCAL_MODULE := jsCipher

LOCAL_BUILD_OPTIMIZE_FLAGS := -Oz

jsCipher_wASM_CFLAGS  :=	\
	-DrLANG_GetVersion=VV				\
	\
	\
	-DjsCipherHashContextInit=HI		\
	-DjsCipherHashContextUpdate=HU		\
	-DjsCipherHashContextFinal=HF		\
	\
	\
	-DrLANG_GetCrc32=CC					\
	-DrLANG_Uncompressed=UZ				\
	\
	\
	-DrlCryptoEd25519Verify=EV 			\
	-DrlCryptoEd25519Pubkey=EP 			\
	-DrlCryptoEd25519Sign=ES 			\
	\
	\
	-DrlCryptoX25519=XE 				\
	-DrlCryptoX25519Pubkey=XP 			\
	\
	\
	-DrlCryptoChaCha20Init=CI 			\
	-DrlCryptoChaCha20SetKey=CK 		\
	-DrlCryptoChaCha20Starts=CS 		\
	-DrlCryptoChaCha20Update=CU 		\
	-DrlCryptoChaCha20Block=CB			\
	\
	\
	-DrlCryptoPoly1305Init=PI   		\
	-DrlCryptoPoly1305Starts=PS 		\
	-DrlCryptoPoly1305Update=PU			\
	-DrlCryptoPoly1305Finish=PF 		\
	\
	\
	-DrlCryptoChaChaPolyInit=ZI 		\
	-DrlCryptoChaChaPolySetKey=ZK 		\
	-DrlCryptoChaChaPolyStarts=ZS		\
	-DrlCryptoChaChaPolyUpdateAAd=ZA 	\
	-DrlCryptoChaChaPolyUpdate=ZU		\
	-DrlCryptoChaChaPolyFinish=ZF 		\
	\
	\


jsCipher_wASM_EXPORTS := _VV,		\
	_EV, _EP, _ES, _XE, _XP, 		\
	_CI, _CK, _CS, _CU, _CB,		\
	_PI, _PS, _PU, _PF, 			\
	_ZI, _ZK, _ZS, _ZA, _ZU, _ZF,	\
	_HI, _HU, _HF,					\
	_CC, _UZ

jsCipher_wASM_LDFLAGS :=		\
	-s GLOBAL_BASE=8KB			\
	-s TOTAL_STACK=16KB	 		\
	-s INITIAL_MEMORY=64KB		\
	-s MAXIMUM_MEMORY=1GB		\
	-s ALLOW_MEMORY_GROWTH=1

jsCipher_wASM_LDFLAGS += \
	-s EXPORTED_FUNCTIONS='[ $(jsCipher_wASM_EXPORTS) ]'

jsCipher_wASM_LDFLAGS += \
	--no-entry -s STACK_OVERFLOW_CHECK=0

$(call wasm_add_cflags, $(jsCipher_wASM_CFLAGS))
$(call wasm_add_cxxflags, $(jsCipher_wASM_CFLAGS))
$(call wasm_add_ldflags, $(jsCipher_wASM_LDFLAGS))

$(call wasmjs_add_cflags, $(jsCipher_wASM_CFLAGS))
$(call wasmjs_add_cxxflags, $(jsCipher_wASM_CFLAGS))
$(call wasmjs_add_ldflags, $(jsCipher_wASM_LDFLAGS))

$(call call_add_optimize_module)

LOCAL_SRC_FILES_A := \
	$(wORLD_ROOT)/base/src/base.cc	\
	$(wORLD_ROOT)/base/src/crypto.cc

LOCAL_SRC_FILES :=	\
	third_party/miniz/miniz.c	\
	main.cc

$(call build-executable)
