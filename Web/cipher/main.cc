#include "base/base.h"
#include "third_party/miniz/miniz.h"

rLANG_DECLARE_MACHINE

enum class jsCipherHashType : uint8_t { SHA1, SHA256, SHA384, SHA512 };

struct jsCipherHashContext {
  rlCryptoShaCtx context_;
  jsCipherHashType type_;
  uint8_t pad_[7];
};

rLANGEXPORT void jsCipherHashContextInit(jsCipherHashContext* ctx, jsCipherHashType type) {
  switch (type) {
    default:
      assert(false);
      type = jsCipherHashType::SHA1;
      /* fall through */

    case jsCipherHashType::SHA1:
      rlCryptoSha1CtxInit(&ctx->context_);
      break;

    case jsCipherHashType::SHA256:
      rlCryptoSha256CtxInit(&ctx->context_);
      break;

    case jsCipherHashType::SHA384:
      rlCryptoSha384CtxInit(&ctx->context_);
      break;

    case jsCipherHashType::SHA512:
      rlCryptoSha512CtxInit(&ctx->context_);
      break;
  }
  ctx->type_ = type;
}

rLANGEXPORT void jsCipherHashContextUpdate(jsCipherHashContext* ctx, const void* data, int len) {
  switch (ctx->type_) {
    default:
    case jsCipherHashType::SHA1:
      rlCryptoSha1CtxUpdate(&ctx->context_, data, len);
      break;

    case jsCipherHashType::SHA256:
      rlCryptoSha256CtxUpdate(&ctx->context_, data, len);
      break;

    case jsCipherHashType::SHA384:
      rlCryptoSha384CtxUpdate(&ctx->context_, data, len);
      break;

    case jsCipherHashType::SHA512:
      rlCryptoSha512CtxUpdate(&ctx->context_, data, len);
      break;
  }
}

rLANGEXPORT int jsCipherHashContextFinal(jsCipherHashContext* ctx, uint8_t* md) {
  switch (ctx->type_) {
    default:
    case jsCipherHashType::SHA1:
      return rlCryptoSha1CtxFinal(&ctx->context_, md);

    case jsCipherHashType::SHA256:
      return rlCryptoSha256CtxFinal(&ctx->context_, md);

    case jsCipherHashType::SHA384:
      return rlCryptoSha384CtxFinal(&ctx->context_, md);

    case jsCipherHashType::SHA512:
      return rlCryptoSha512CtxFinal(&ctx->context_, md);
  }
}

rLANGEXPORT uint32_t rLANGAPI rLANG_GetCrc32(uint32_t crc, const void* data, int len) {
  return mz_crc32(crc, (const uint8_t*)data, len);
}

rLANGEXPORT int rLANGAPI rLANG_Uncompressed(void* output, int olen, const void* input, int ilen) {
  return (int)tinfl_decompress_mem_to_mem(output, olen, input, ilen, TINFL_FLAG_PARSE_ZLIB_HEADER);
}

rLANG_ABIREQUIRE(sizeof(jsCipherHashContext) == 248 && offsetof(jsCipherHashContext, type_) == 240);
rLANG_DECLARE_END

#ifndef __EMSCRIPTEN__
int main(int argc, char* argv[]) {
  return 0;
}
#endif /* __EMSCRIPTEN__ */
