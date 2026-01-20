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
