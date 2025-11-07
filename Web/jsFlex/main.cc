#include "base/base.h"
#include "base/scanner/scanner.h"

rLANG_DECLARE_MACHINE

namespace {
  constexpr uint32_t TAG = rLANG_DECLARE_MAGIC_Xs("jsLex");
}

using G = rlLexicalScannerGenerator;
using GH = G::LexicalRegexpHelper_t;

rLANGWASMEXPORT int jsHelper_yyLen(GH* helper) {
  return helper->yyLen();
}
rLANGWASMEXPORT int jsHelper_yyGetVal(GH* helper) {
  return helper->yyGetVal();
}
rLANGWASMEXPORT void jsHelper_yySetVal(GH* helper, int val) {
  return helper->yySetVal(val);
}
rLANGWASMEXPORT void jsHelper_yySetLval(GH* helper, int yylval) {
  return helper->yySetLval(yylval);
}
rLANGWASMEXPORT int jsHelper_yyOffset(GH* helper) {
  return helper->yyOffset();
}
rLANGWASMEXPORT int jsHelper_yyVar(GH* helper, int N) {
  return helper->yyVar(N);
}
rLANGWASMEXPORT int jsHelper_yyNextState(GH* helper, int reason) {
  return helper->yyNextState(reason);
}

rLANGWASMEXPORT G* jsGenerator_yyCreate(int csize,
                                        int sconCount,
                                        bool caseless,
                                        const int* cclower,
                                        const int* charmap) {
  G* result = nullptr;
  int rlCode = G::CreateLexicalScannerGenerator(&result, csize, sconCount, caseless, cclower, charmap);
  if (rlCode < 0)
    rlLOGE(TAG, "CreateGenerator result %d", rlCode);
  return result;
}
rLANGWASMEXPORT void jsGenerator_yyDestroy(G* self) {
  G::DestroyLexicalScannerGenerator(self);
}
rLANGWASMEXPORT void* jsGenerator_MemoryRealloc(G* self, void* p, size_t size) {
  constexpr size_t kSizeMax = (size_t)1 << 30;
  if (size > kSizeMax)
    return nullptr;
  return self->MemoryRealloc(p, (int)size);
}

rLANGWASMEXPORT int jsGenerator_AddShareSconList(G* self, int scon) {
  return self->AddShareSconList(scon);
}

rLANGWASMEXPORT int jsGenerator_SetSconList(G* self, int count, const int* sconlist) {
  return self->SetSconList(count, sconlist);
}

rLANGWASMEXPORT int jsGenerator_AddNewCCl(G* self, bool negate, int count, const int* cclist) {
  return self->AddNewCCl(negate, count, cclist);
}

rLANGWASMEXPORT int jsGenerator_AddNewRule(G* self, bool bol, int size, const int opcode[]) {
  return self->AddNewRule(bol, size, opcode);
}

rLANGWASMEXPORT int jsGenerator_GenerateScanner(G* self, G::LexicalScanner_t* storage) {
  return self->GenerateScanner(storage);
}

rLANGWASMEXPORT int jsGenerator_GetErrorCode(G* self) {
  return self->GetErrorCode();
}

rLANG_DECLARE_END

#ifndef __EMSCRIPTEN__
int main(int argc, char* argv[]) {
  return 0;
}
#endif /* __EMSCRIPTEN__ */
