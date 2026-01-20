#include <base/base.h>

rLANG_DECLARE_MACHINE

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

rLANGEXPORT void rLANGAPI C_main() {
  rlLOGX(rLANG_WORLD_MAGIC, ">>> %s", __FUNCTION__);
  rLANG_OutputStackTrace();

  Foobar* foobar = (Foobar*)malloc(sizeof(Foobar));
  assert(NULL != foobar);
  foobar->a_ = 1;
  foobar->b_ = 2;
  foobar->c_ = 3;
  rlLOGI(rLANG_ATOMC_WORLD_MAGIC, "1) Foobar %p [%d,%d,%d] %p %p %p\n", foobar,
         foobar->a_, foobar->b_, foobar->c_, &foobar->a_, &foobar->b_,
         &foobar->c_);
  foobar_call(&foobar->b_, foobar);
}

rLANG_DECLARE_END
