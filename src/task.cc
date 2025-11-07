#include "../base.h"

#ifndef rLANG_CONFIG_MINIMAL_WORLD
#include <chrono>
#endif /* rLANG_CONFIG_MINIMAL_WORLD */

rLANG_DECLARE_MACHINE

rLANGEXPORT int rLANGAPI rlTaskGroup_DefaultScheduleTask(struct rlTaskGroup_t* group,
                                                         struct rlTaskNode_t* task,
                                                         int priority,
                                                         int64_t ticks) {
  struct rlTaskNode_t* cmp;
  rLANG_VERIFY_GT(ticks, group->last_ticks_);

  task->next_ticks_ = ticks;
  rLANG_RBTREE_PREV_INSERT_NODE(struct rlTaskNode_t*, priority ? group->tasks_priority_ : group->tasks_normal_, cmp,
                                cmp->next_ticks_ <= ticks, task, 0);
  rLANG_RBTREE_INSERT_NODE_0(task, priority ? &group->tasks_priority_ : &group->tasks_normal_);
  return 0;
}

rLANGEXPORT int rLANGAPI rlTaskGroup_DefaultUnscheduleTask(struct rlTaskGroup_t* group,
                                                           struct rlTaskNode_t* task,
                                                           int priority) {
  rLANG_RBTREE_ERASE_NODE_0(task, priority ? &group->tasks_priority_ : &group->tasks_normal_);
  return 0;
}

rLANGEXPORT int64_t rLANGAPI rlTaskGroup_DefaultNextTicks(struct rlTaskGroup_t* group) {
  int64_t result = -1;
  struct rlTaskNode_t* node;

  if (group->tasks_priority_) {
    rLANG_RBTREE_NODE_MINIMUM(struct rlTaskNode_t*, group->tasks_priority_, node, 0);
    result = node->next_ticks_;
  }

  if (group->tasks_normal_) {
    rLANG_RBTREE_NODE_MINIMUM(struct rlTaskNode_t*, group->tasks_normal_, node, 0);
    if (result < 0 || result > node->next_ticks_)
      result = node->next_ticks_;
  }

  return result;
}

rLANGEXPORT int rLANGAPI rlTaskGroup_DefaultExecuteTask(struct rlTaskGroup_t* group, int64_t ticks) {
  int count = 0;
  struct rlTaskNode_t* task;
  rLANG_VERIFY_GE(ticks, group->last_ticks_);

  group->last_ticks_ = ticks;
  while (group->tasks_priority_) {
    rLANG_RBTREE_NODE_MINIMUM(struct rlTaskNode_t*, group->tasks_priority_, task, 0);
    if (task->next_ticks_ > ticks)
      break;
    rLANG_RBTREE_ERASE_NODE_0(task, &group->tasks_priority_);
    (*task->Closure)(group, task, ticks);
    ++count;
  }

  while (group->tasks_normal_) {
    rLANG_RBTREE_NODE_MINIMUM(struct rlTaskNode_t*, group->tasks_normal_, task, 0);
    if (task->next_ticks_ > ticks)
      break;
    rLANG_RBTREE_ERASE_NODE_0(task, &group->tasks_normal_);
    (*task->Closure)(group, task, ticks);
    ++count;
  }

  return count;
}

#ifndef rLANG_CONFIG_MINIMAL_WORLD

#ifndef rLANG_CONFIG_APP_SYSTICK
#define rLANG_CONFIG_APP_SYSTICK 8000 /* Default 8000 HZ */
#endif                                /* rLANG_CONFIG_APP_SYSTICK */

namespace {

constexpr int native_TicksFromUs(int us) {
  return us / (1000 / (rLANG_CONFIG_APP_SYSTICK / 1000));
}
constexpr int native_UsFromTicks(int ticks) {
  return ticks * (1000 / (rLANG_CONFIG_APP_SYSTICK / 1000));
}

int64_t native_get_us(void) {
#ifdef __EMSCRIPTEN__
  return rLANG_GetTickCount() * 1000;
#else  /* __EMSCRIPTEN__ */
  return std::chrono::duration_cast<std::chrono::microseconds>(
             std::chrono::high_resolution_clock::now().time_since_epoch())
      .count();
#endif /* __EMSCRIPTEN__ */
}

int64_t native_get_ticks(void) {
  return native_get_us() / (1000000 / rLANG_CONFIG_APP_SYSTICK);
}

int rLANGAPI platform_DelayUs(struct rlTaskGroup_t* group, int us) {
  rLANG_VERIFY_GE(us, 0);
  rLANG_VERIFY_LE(us, 10000);  // 10ms
  auto start = native_get_us();

  for (;;) {
    auto ts = native_get_us() - start;
    if (ts < 0 || ts >= us)
      break;
  }
  return 0;
}

int64_t rLANGAPI platform_GetTicks(struct rlTaskGroup_t* group) {
  constexpr uint32_t TAG = Magic::Xs("kClk0");
  constexpr int kMaxInterval = native_TicksFromUs(120'000'000);  // WatchDog, 120s

  static int64_t ticks0 = -1;
  static int64_t prev_ticks = 0;

  int64_t ticks = native_get_ticks();

  if (ticks0 < 0) {
    ticks0 = ticks;
    return prev_ticks = 0;
  }

  int64_t result = ticks - ticks0;
  int64_t diff = result - prev_ticks;

  if (diff < 0) {
    rlLOGE(TAG, "System time disturbance (.LT. 0) %lld", (long long)diff);

    result = prev_ticks;
    ticks0 = ticks - result;
    rLANG_VERIFY_GT(ticks0, 0);
  } else if (diff > kMaxInterval) {
    rlLOGE(TAG, "System time disturbance (.GT. %d) %lld", kMaxInterval, (long long)diff);

    result = prev_ticks + kMaxInterval;
    ticks0 = ticks - result;
    rLANG_VERIFY_GT(ticks0, 0);
  }

  prev_ticks = result;
  return result;
}

int rLANGAPI platform_TicksFromUs(struct rlTaskGroup_t* group, int us) {
  return native_TicksFromUs(us);
}

int rLANGAPI platform_UsFromTicks(struct rlTaskGroup_t* group, int ticks) {
  return native_UsFromTicks(ticks);
}

}  // namespace

rLANGEXPORT void rLANGAPI rlTaskGroupDefault(struct rlTaskGroup_t* group) {
  group->tasks_priority_ = nullptr;
  group->tasks_normal_ = nullptr;
  group->last_ticks_ = -1;

  group->GetTicks = platform_GetTicks;
  group->DelayUs = platform_DelayUs;
  group->TicksFromUs = platform_TicksFromUs;
  group->UsFromTicks = platform_UsFromTicks;
  group->ScheduleTask = rlTaskGroup_DefaultScheduleTask;
  group->UnscheduleTask = rlTaskGroup_DefaultUnscheduleTask;
  group->ExecuteTask = rlTaskGroup_DefaultExecuteTask;
  group->NextTicks = rlTaskGroup_DefaultNextTicks;
}

rLANG_ABIREQUIRE(rLANG_CONFIG_APP_SYSTICK % 1000 == 0);
rLANG_ABIREQUIRE(1000000 % rLANG_CONFIG_APP_SYSTICK == 0);
#endif /* rLANG_CONFIG_MINIMAL_WORLD */

rLANG_DECLARE_END
