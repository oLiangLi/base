#include <base/base.h>

rLANG_DECLARE_MACHINE

rLANGIMPORT void rLANGAPI C_main();

namespace foobar {
#define C_main MACHINE_FOOBAR_CMAIN
#include "test.c"
#undef C_main
} // namespace foobar

typedef struct {
  int a_;
  int b_;
  int c_;
} Foobar;

void foobar_call(int* b, Foobar* origin) {
  rLANG_VERIFY_EQ(rLANG_CONTAINER_OF(b, Foobar, b_), origin);
  rlLOGI(rLANG_ATOMC_WORLD_MAGIC, "b => %p\n", b);
  Foobar* foobar = rLANG_CONTAINER_OF(b, Foobar, b_);
  rlLOGI(rLANG_ATOMC_WORLD_MAGIC, "2) Foobar %p [%d,%d,%d] %p %p %p\n", foobar,
         foobar->a_, foobar->b_, foobar->c_, &foobar->a_, &foobar->b_,
         &foobar->c_);
}

rLANGEXPORT int main() {
  char s_guid_[37];
  constexpr const rlGuid guid_ = rlGuid::From("6961688d-a250-4d6c-b99e-6264d63b573f");
  rlLOGXI(rLANG_WORLD_MAGIC, &guid_, sizeof(guid_), "6961688d-a250-4d6c-b99e-6264d63b573f> TestGUID: %s", guid_.ToString(s_guid_));
  rLANG_VERIFY_EQ(0, strcmp(s_guid_, "6961688d-a250-4d6c-b99e-6264d63b573f"));

  static const char* guidTestArray[] = {"81374164-63e5-497f-a4e6-6592d22c4085", "963d3869-b3e7-4eaa-8cb1-02887af4622d",
                                        "413a9c2b-6b1d-403a-b0b5-9cd33f6baaa2", "c33345e7-9200-4986-a116-ae743dd31c57",
                                        "2c4583b2-eb6e-4acb-93b5-4b5907bc52a0", "0a60dc2a-573f-40df-9759-d351de3fef1f",
                                        "68a2c2b5-6f6a-4fde-bdfd-334392aa39dd", "713b78a9-4a56-4bd7-9af7-5e9c818f63a4",
                                        "7fba6a59-6d74-4898-b6a1-e411694c93cc", "8e8cc854-0239-4085-b81a-da54a669f7ec"};
  for(int i = 0; i < sizeof(guidTestArray) / sizeof(guidTestArray[0]); ++i) {
    const char* const s = guidTestArray[i];
    const rlGuid guid = rlGuid::From(s);
    if(0 == strcmp(guid.ToString(s_guid_), s))
      rlLOGI(rLANG_WORLD_MAGIC, "rlGuid Tests %s OK!", s);
    else
      rlLOGE(rLANG_WORLD_MAGIC, "rlGuid Tests %s Error!", s);
  }

  rlLOGX(rLANG_WORLD_MAGIC, ">>> C_main()");

  C_main();

  rlLOGX(rLANG_WORLD_MAGIC, ">>> foobar::machine::MACHINE_FOOBAR_CMAIN()");

  ::machine::foobar::machine::MACHINE_FOOBAR_CMAIN();

  rlLOGX(rLANG_WORLD_MAGIC, ">>> Cpp_main()");

  auto* foobar = (Foobar*)malloc(sizeof(Foobar));
  assert(NULL != foobar);
  foobar->a_ = 1;
  foobar->b_ = 2;
  foobar->c_ = 3;
  rlLOGI(rLANG_ATOMC_WORLD_MAGIC, "1) Foobar %p [%d,%d,%d] %p %p %p\n", foobar,
         foobar->a_, foobar->b_, foobar->c_, &foobar->a_, &foobar->b_,
         &foobar->c_);
  foobar_call(&foobar->b_, foobar);

  return 0;
}

rLANG_DECLARE_END
