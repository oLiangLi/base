#include "../base.h"

#ifdef _WIN32
#include <windows.h>
#include <dbghelp.h>
#pragma comment(lib, "dbghelp.lib")
#elif !defined(rLANG_CONFIG_MINIMAL_WORLD)
#if !defined(__EMSCRIPTEN__)
#include <execinfo.h>
#include <sys/prctl.h>
#endif /* __EMSCRIPTEN__ */
#include <fcntl.h>
#include <signal.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
#endif /* _WIN32 */

#ifdef __CYGWIN__
#include <windows.h>
namespace {
int gettid() {
  return static_cast<int>(GetCurrentThreadId());
}
}  // namespace
#endif /* __CYGWIN__ */

rLANG_DECLARE_MACHINE

namespace {

#ifndef rLANG_CONFIG_MINIMAL
FILE* global_log_file_ = nullptr;
#endif /* rLANG_CONFIG_MINIMAL */

bool global_abort_if_verify_failed_ = false;
rlLogLevel global_log_level = rlLOG_INFO;

#ifndef rLANG_CONFIG_LOGDATA_SIZEMAX
#define rLANG_CONFIG_LOGDATA_SIZEMAX 1024
#endif /* rLANG_CONFIG_LOGDATA_SIZEMAX */

#if !defined(rLANG_CONFIG_MINIMAL_WORLD)
static int rLANGAPI rlLog_vsnprintf(char* buff, int size, const char* fmt, va_list ap) {
  int result = vsnprintf(buff, size, fmt, ap);
  if (result >= size)
    result = size - 1;
  return result;
}
static const char* rLANGAPI rlLog_sTime(char* buff) {
  rlDate_t now = rLANG_GetCurrentDate();

  now /= 1000;
  int mss = now % 1000;
  now /= 1000;
  int ss = now % 60;
  now /= 60;
  int mm = now % 60;
  now /= 60;
  int hh = now % 24;

  sprintf(buff, "%02d.%02d:%02d.%03d", hh, mm, ss, mss);
  return buff;
}
#endif /* rLANG_CONFIG_MINIMAL_WORLD */

#if defined(_WIN32)
static void rLANGAPI logWrite0(HANDLE hCCON, const char* info, size_t len, FILE* logFile) {
  wchar_t ws[4 * rLANG_CONFIG_LOGDATA_SIZEMAX];
  int v = MultiByteToWideChar(CP_UTF8, 0, info, len, ws, sizeof(ws) / sizeof(ws[0]) - 1);
  if (v < 0)
    v = 0;
  else if (v > sizeof(ws) / sizeof(ws[0]) - 1)
    v = sizeof(ws) / sizeof(ws[0]) - 1;
  ws[v] = 0;

  if (NULL != hCCON) {
    DWORD size = static_cast<DWORD>(v);
    WriteConsoleW(hCCON, ws, size, &size, NULL);
  }
  OutputDebugStringW(ws);

  if(logFile)
    std::ignore = fwrite(info, 1, len, logFile);
}

static void rLANGAPI logWrite(HANDLE hCCON, FILE* logFile, const uint8_t* data, int len) {
  int k, i;
  char line[72], *p, c1, c2;

  for (; len > 0; len -= 16, data += 16) {
    k = len;
    p = line;
    if (k > 16) {
      k = 16;
    }

    for (i = 0; i < k; ++i) {
      c1 = data[i] >> 4;
      c2 = data[i] & 0x0F;
      c1 = c1 < 10 ? '0' + c1 : 'A' - 10 + c1;
      c2 = c2 < 10 ? '0' + c2 : 'A' - 10 + c2;
      *p++ = c1;
      *p++ = c2;
      *p++ = ' ';
    }
    for (; i < 18; ++i, p += 3) {
      p[0] = p[1] = p[2] = ' ';
    }
    for (i = 0; i < k; ++i) {
      if (data[i] >= 0x20 && data[i] < 0x7F) {
        *p++ = (char)data[i];
      } else {
        *p++ = '.';
      }
    }
    *p++ = '\n';
    *p = 0;

    logWrite0(hCCON, line, p - line, logFile);
  }
}

void platformLoggingWrite(int level, uint32_t tag, int line, const void* data, int len, const char* fmt, va_list ap) {
  char sTAG[8];
  if (level < rlLOG_FATAL || global_log_level < level || !tag)
    return;

  char info[rLANG_CONFIG_LOGDATA_SIZEMAX + 256], *p = info;
  HANDLE hCCON = GetStdHandle(STD_ERROR_HANDLE);
  if (INVALID_HANDLE_VALUE == hCCON)
    hCCON = nullptr;

  FILE* logFile = global_log_file_;
  if (!hCCON && !IsDebuggerPresent() && !logFile)
    return;

  if (hCCON) {
    static const WORD con_attr[] = {FOREGROUND_INTENSITY | FOREGROUND_RED | FOREGROUND_BLUE,
                                    FOREGROUND_INTENSITY | FOREGROUND_RED,
                                    FOREGROUND_INTENSITY | FOREGROUND_RED | FOREGROUND_GREEN,
                                    FOREGROUND_INTENSITY | FOREGROUND_GREEN,
                                    FOREGROUND_INTENSITY | FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE,
                                    FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE};
    SetConsoleTextAttribute(hCCON, con_attr[level]);
  }

  int pid = static_cast<int>(GetCurrentProcessId()), tid = static_cast<int>(GetCurrentThreadId());

  char sTime[100];
  rlLog_sTime(sTime);
  rLANG_DECLARE_MAGIC_Vs(tag, sTAG);
  if (data && len > 0) {
    p += sprintf(info, "%c (%lld,%d,%d) %s %s:%d %p:%d ", "XEWIDV"[level], (long long)rLANG_GetTickCount(), pid, tid,
                 sTime, sTAG, line, data, len);
    p += rlLog_vsnprintf(p, rLANG_CONFIG_LOGDATA_SIZEMAX, fmt, ap);
    if (p[-1] != '\n')
      *p++ = '\n';
    *p = 0;

    logWrite0(hCCON, info, p - info,  logFile);
    if (len > rLANG_CONFIG_LOGDATA_SIZEMAX)
      len = rLANG_CONFIG_LOGDATA_SIZEMAX;
    logWrite(hCCON, logFile, (const uint8_t*)data, len);
  } else {
    p += sprintf(info, "%c (%lld,%d,%d) %s %s:%d ", "XEWIDV"[level], (long long)rLANG_GetTickCount(), pid, tid, sTime,
                 sTAG, line);
    p += rlLog_vsnprintf(p, rLANG_CONFIG_LOGDATA_SIZEMAX, fmt, ap);
    if (p[-1] != '\n')
      *p++ = '\n';
    *p = 0;
    logWrite0(hCCON, info, p - info, logFile);
  }

  if (NULL != hCCON)
    SetConsoleTextAttribute(hCCON, 0x0F);
}
#endif /* _WIN32 */

#if defined(_WIN32) || defined(__CYGWIN__)
rLANGEXPORT int rLANGAPI rLANG_DebugBreak() {
  ::DebugBreak();
  return 0;
}
rLANGEXPORT int rLANGAPI rLANG_IsDebuggerPresent() {
  return ::IsDebuggerPresent();
}
rLANGEXPORT int rLANGAPI rLANG_OutputStackTrace() {
  constexpr uint32_t TAG = rLANG_DECLARE_MAGIC_Xs("Debug");
  constexpr int kBacktraceBufferSize = 256;
  constexpr int kMaxFunctionName = 64 * 1024;

  void* stack[kBacktraceBufferSize];
  HANDLE process = GetCurrentProcess();
  SymInitialize(process, NULL, TRUE);

  WORD numberOfFrames = CaptureStackBackTrace(0, kBacktraceBufferSize, stack, NULL);
  rlLOGI(TAG, "CaptureStackBackTrace %d", numberOfFrames);
  union {
    SYMBOL_INFO symbol;
    char buf[sizeof(SYMBOL_INFO) + (kMaxFunctionName - 1) * sizeof(TCHAR)];
  };

  symbol.MaxNameLen = kMaxFunctionName;
  symbol.SizeOfStruct = sizeof(SYMBOL_INFO);
  DWORD displacement;
  IMAGEHLP_LINE64 line;
  line.SizeOfStruct = sizeof(IMAGEHLP_LINE64);

  for (int i = 0; i < numberOfFrames; i++) {
    DWORD64 address = (DWORD64)(stack[i]);
    SymFromAddr(process, address, NULL, &symbol);
    if (SymGetLineFromAddr64(process, address, &displacement, &line)) {
      rlLOGI(TAG, "\tat %s in %s: line: %lu: address: 0x%0llX", symbol.Name, line.FileName, line.LineNumber,
             (long long)symbol.Address);
    } else {
      // rlLOGI(TAG, "\tSymGetLineFromAddr64 returned error code %lu.", GetLastError());
      rlLOGI(TAG, "\tat %s, address 0x%0llX.", symbol.Name, (long long)symbol.Address);
    }
  }
  return 0;
}
rLANGEXPORT int rLANGAPI rLANG_SetThreadName(const char* name) {
#if 0
  const DWORD MS_VC_EXCEPTION = 0x406D1388;

#pragma pack(push, 8)
  typedef struct tagTHREADNAME_INFO {
    DWORD dwType;      // Must be 0x1000.
    LPCSTR szName;     // Pointer to name (in user addr space).
    DWORD dwThreadID;  // Thread ID (-1=caller thread).
    DWORD dwFlags;     // Reserved for future use, must be zero.
  } THREADNAME_INFO;
#pragma pack(pop)

  THREADNAME_INFO info;
  info.dwType = 0x1000;
  info.szName = name;
  info.dwThreadID = GetCurrentThreadId();
  info.dwFlags = 0;

  __try {
    RaiseException(MS_VC_EXCEPTION, 0, sizeof(info) / sizeof(ULONG_PTR), (ULONG_PTR*)&info);
  } __except (EXCEPTION_EXECUTE_HANDLER) {
  }
#endif
  return 0;
}
rLANGEXPORT int rLANGAPI rLANG_Sleep(int ms) {
  if (ms <= 0)
    ::Sleep(0);
  else
    ::Sleep(ms);
  return 0;
}
#elif defined(__linux__)
rLANGEXPORT int rLANGAPI rLANG_DebugBreak() {
  raise(SIGTRAP);
  return 0;
}
rLANGEXPORT int rLANGAPI rLANG_IsDebuggerPresent() {
  const size_t kSizeStatus = 16 * 1024;
  char content[kSizeStatus + 1];

  int fd = open("/proc/self/status", O_RDONLY);
  if (fd < 0)
    return 0;

  const ssize_t size = read(fd, content, kSizeStatus);
  close(fd);

  if (size <= 0)
    return 0;

  content[size] = 0;
  const char* p = strstr(content, "TracerPid:");
  if (!p)
    return 0;

  for (p += 10; *p && isspace(*p); ++p)
    ;

  return *p != 0 && *p != '0';
}
rLANGEXPORT int rLANGAPI rLANG_OutputStackTrace() {
  constexpr uint32_t TAG = rLANG_DECLARE_MAGIC_Xs("Debug");
  constexpr int kBacktraceBufferSize = 128;

  int nptr;
  void* buffer[kBacktraceBufferSize];
  char** strings;

  nptr = backtrace(buffer, kBacktraceBufferSize);
  strings = backtrace_symbols(buffer, nptr);
  rlLOGI(TAG, "BACKTRACE return %d, %p", nptr, strings);
  if (!strings)
    return 0;

  for (int i = 0; i < nptr; ++i) {
    rlLOGI(TAG, "  STACK[%d/%d] : %p (%s)", i, nptr, buffer[i], strings[i]);
  }

  free(strings);
  return 0;
}
rLANGEXPORT int rLANGAPI rLANG_SetThreadName(const char* name) {
  prctl(PR_SET_NAME, name, 0, 0, 0);
  return 0;
}
rLANGEXPORT int rLANGAPI rLANG_Sleep(int ms) {
  if (ms <= 0)
    usleep(1);
  else
    usleep(ms * 1000L);
  return 0;
}
#elif defined(__EMSCRIPTEN__)
rLANGEXPORT int rLANGAPI rLANG_DebugBreak() {
  return -ENOSYS;
}
rLANGEXPORT int rLANGAPI rLANG_IsDebuggerPresent() {
  return 0;
}
rLANGEXPORT int rLANGAPI rLANG_OutputStackTrace() {
  return -ENOSYS;
}
rLANGEXPORT int rLANGAPI rLANG_SetThreadName(const char* name) {
  return -ENOSYS;
}
rLANGEXPORT int rLANGAPI rLANG_Sleep(int ms) {
  return -ENOSYS;
}
#endif /* _WIN32 || __CYGWIN__ */

#if defined(__linux__) || defined(__CYGWIN__)
static void rLANGAPI logWrite(const char* afmt, const char* efmt, const uint8_t* data, int len, FILE* logFile) {
  if (!afmt)
    afmt = "";
  if (!efmt)
    efmt = "";

  int k, i;
  char line[72], *p, c1, c2;

  for (; len > 0; len -= 16, data += 16) {
    k = len;
    p = line;
    if (k > 16) {
      k = 16;
    }

    for (i = 0; i < k; ++i) {
      c1 = data[i] >> 4;
      c2 = data[i] & 0x0F;
      c1 = c1 < 10 ? '0' + c1 : 'A' - 10 + c1;
      c2 = c2 < 10 ? '0' + c2 : 'A' - 10 + c2;
      *p++ = c1;
      *p++ = c2;
      *p++ = ' ';
    }
    for (; i < 18; ++i, p += 3) {
      p[0] = p[1] = p[2] = ' ';
    }
    for (i = 0; i < k; ++i) {
      if (data[i] >= 0x20 && data[i] < 0x7F) {
        *p++ = (char)data[i];
      } else {
        *p++ = '.';
      }
    }
    *p++ = 0;

    fprintf(logFile, "%s%s%s\n", afmt, line, efmt);
  }
}

void platformLoggingWrite(int level, uint32_t tag, int line, const void* data, int len, const char* fmt, va_list ap) {
  char sTAG[8];
  if (level < rlLOG_FATAL || global_log_level < level || !tag)
    return;

  FILE* logFile = global_log_file_ ? global_log_file_ : stderr;

  const char *afmt, *efmt;
  switch (level) {
    default:
      afmt = efmt = nullptr;
      break;
    case rlLOG_INFO:
      afmt = "\033[0;32m";
      efmt = "\033[0m";
      break;
    case rlLOG_WARN:
      afmt = "\033[0;33m";
      efmt = "\033[0m";
      break;
    case rlLOG_ERROR:
      afmt = "\033[0;31m";
      efmt = "\033[0m";
      break;
    case rlLOG_FATAL:
      afmt = "\033[0;35m";
      efmt = "\033[0m";
      break;
  }

  char sTime[100];
  rlLog_sTime(sTime);
  char info[rLANG_CONFIG_LOGDATA_SIZEMAX + 256], *p = info;
  rLANG_DECLARE_MAGIC_Vs(tag, sTAG);

  pid_t pid = getpid(), tid = gettid();

  if (data && len > 0) {
    if (afmt)
      p += sprintf(p, "%s", afmt);
    p += sprintf(p, "%c (%lld,%d,%d) %s %s:%d %p:%d ", "XEWIDV"[level], (long long)rLANG_GetTickCount(), pid, tid,
                 sTime, sTAG, line, data, len);
    p += rlLog_vsnprintf(p, rLANG_CONFIG_LOGDATA_SIZEMAX, fmt, ap);
    if (p[-1] == '\n')
      --p;
    if (efmt)
      sprintf(p, "%s", efmt);
    *p++ = '\n';
    *p++ = 0;
    fprintf(logFile, "%s", info);

    if (len > rLANG_CONFIG_LOGDATA_SIZEMAX)
      len = rLANG_CONFIG_LOGDATA_SIZEMAX;

    logWrite(afmt, efmt, static_cast<const uint8_t*>(data), len, logFile);
  } else {
    if (afmt)
      p += sprintf(p, "%s", afmt);
    p += sprintf(p, "%c (%lld,%d,%d) %s %s:%d ", "XEWIDV"[level], (long long)rLANG_GetTickCount(), pid, tid, sTime,
                 sTAG, line);
    p += rlLog_vsnprintf(p, rLANG_CONFIG_LOGDATA_SIZEMAX, fmt, ap);
    if (p[-1] == '\n')
      --p;
    if (efmt)
      p += sprintf(p, "%s", efmt);
    *p++ = '\n';
    *p++ = 0;

    fprintf(logFile, "%s", info);
  }
}

#endif /* Linux || Cygwin */

#ifdef __EMSCRIPTEN__

rLANGWASMIMPORT(
    void,
    jsLogWrite,
    (int level, char* message, int size),
    {
      EM_ASM_(
          {
            const level = $0;
            const message = UTF8ToString($1, $2);
            switch (level) {
              case 0:
                console.error(`%c${ message }`, "color: purple");
                break;
              case 1:
                console.error(`%c${ message }`, "color: red");
                break;
              case 2:
                console.warn(`%c${ message }`, "color: darkorange");
                break;
              case 3:
                console.info(`%c${ message }`, "color: blue");
                break;
              default:
                console.log(`%c${ message }`, "color: dimgray");
                break;
            }
          },
          level, message, size);
    },
    "rLANG",
    "jsLogWrite")

static void rLANGAPI logWrite(int level, const uint8_t* data, int len) {
  int k, i;
  char line[72], *p, c1, c2;

  for (; len > 0; len -= 16, data += 16) {
    k = len;
    p = line;
    if (k > 16) {
      k = 16;
    }

    for (i = 0; i < k; ++i) {
      c1 = data[i] >> 4;
      c2 = data[i] & 0x0F;
      c1 = c1 < 10 ? '0' + c1 : 'A' - 10 + c1;
      c2 = c2 < 10 ? '0' + c2 : 'A' - 10 + c2;
      *p++ = c1;
      *p++ = c2;
      *p++ = ' ';
    }
    for (; i < 18; ++i, p += 3) {
      p[0] = p[1] = p[2] = ' ';
    }
    for (i = 0; i < k; ++i) {
      if (data[i] >= 0x20 && data[i] < 0x7F) {
        *p++ = (char)data[i];
      } else {
        *p++ = '.';
      }
    }
    *p = 0;

    jsLogWrite(level, line, static_cast<int>(p - line));
  }
}

void platformLoggingWrite(int level, uint32_t tag, int line, const void* data, int len, const char* fmt, va_list ap) {
  char sTAG[8];
  if (level < rlLOG_FATAL || global_log_level < level || !tag)
    return;

  char info[rLANG_CONFIG_LOGDATA_SIZEMAX + 256], *p = info;
  rLANG_DECLARE_MAGIC_Vs(tag, sTAG);

  if (data && len > 0) {
    p += sprintf(p, "%c (%lld) %s:%d %p:%d ", "XEWIDV"[level], (long long)rLANG_GetTickCount(), sTAG, line, data, len);
    p += rlLog_vsnprintf(p, rLANG_CONFIG_LOGDATA_SIZEMAX, fmt, ap);
    if (p[-1] != '\n')
      *p++ = '\n';
    *p = 0;
    jsLogWrite(level, info, p - info);

    if (len > rLANG_CONFIG_LOGDATA_SIZEMAX)
      len = rLANG_CONFIG_LOGDATA_SIZEMAX;

    logWrite(level, static_cast<const uint8_t*>(data), len);
  } else {
    p += sprintf(p, "%c (%lld) %s:%d ", "XEWIDV"[level], (long long)rLANG_GetTickCount(), sTAG, line);
    p += rlLog_vsnprintf(p, rLANG_CONFIG_LOGDATA_SIZEMAX, fmt, ap);
    if (p[-1] != '\n')
      *p++ = '\n';
    *p = 0;

    jsLogWrite(level, info, p - info);
  }
}

#endif /* __EMSCRIPTEN__ */

}  // namespace

#ifndef rLANG_CONFIG_MINIMAL
rLANGEXPORT void rLANGAPI rlLoggingOutputFile(FILE* logFile) {
  global_log_file_ = logFile;
}
#endif /* rLANG_CONFIG_MINIMAL */

rLANGEXPORT rlLogLevel rLANGAPI rlLoggingSetLevel(rlLogLevel level) {
  rlLogLevel origin = global_log_level;

  if (level >= rlLOG_VERBOSE) {
    global_log_level = rlLOG_VERBOSE;
  } else if (level >= rlLOG_ERROR) {
    global_log_level = level;
  }

  return origin;
}

#ifndef rLANG_CONFIG_MINIMAL_WORLD
rLANGEXPORT void rlLoggingWriteEx(int level, uint32_t tag, int line, const void* data, int len, const char* fmt, ...) {
  va_list ap;
  va_start(ap, fmt);
  platformLoggingWrite(level, tag, line, data, len, fmt, ap);
  va_end(ap);
}

rLANGEXPORT void rlLoggingWrite(int level, uint32_t tag, int line, const char* fmt, ...) {
  va_list ap;
  va_start(ap, fmt);
  platformLoggingWrite(level, tag, line, nullptr, 0, fmt, ap);
  va_end(ap);
}
#endif /* rLANG_CONFIG_MINIMAL_WORLD */

void rLANGAPI rLANG_SetVerifyAbort(int flag) {
  global_abort_if_verify_failed_ = !!flag;
}

rLANGEXPORT void rLANGAPI rLANG_OnVerifyFailed(const char* expr, const char* file, int line) {
  constexpr uint32_t TAG = rLANG_WORLD_MAGIC;
  rlLOGE(TAG, "VERIFY.ABORT: %s @%s:%d", expr, file, line);  
  rLANG_OutputStackTrace();
  rlLOGE(TAG, "VERIFY.ABORT: %s @%s:%d", expr, file, line);

  if (rLANG_IsDebuggerPresent())
    rLANG_DebugBreak();

  if (global_abort_if_verify_failed_)
    abort();
}

rLANG_DECLARE_END
