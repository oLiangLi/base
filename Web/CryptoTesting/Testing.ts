import { Assets } from "../Assembly/jsCryptoTesting_wasm";
import { Addr, integer } from "../World";

const kErrno_ENOENT = 44,
  kErrno_ENOMEM = 48,
  kErrno_EACCES = 2,
  kErrno_EINVAL = 28,
  kErrno_EWOULDBLOCK = 6,
  kErrno_EAGAIN = 6,
  kErrno_ENOSYS = 52,
  kErrno_ESPIPE = 70,
  kErrno_EROFS = 69,
  kErrno_EBADF = 8,
  kErrno_EBADFD = 127;
const kFileID_null = 10,
  kFileID_Random = 11;
interface _Native {
  _initialize(): void;

  TestX509(): void;
  Initialize(): void;
}

async function LoadLibCrypto(): Promise<{
  native: _Native;
  memory: WebAssembly.Memory;
}> {
  const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
  const module = await WebAssembly.compile(Assets());

  const HEAP = Buffer.from(memory.buffer);
  const HEAP32 = new Int32Array(memory.buffer);
  const HEAPU32 = new Uint32Array(memory.buffer);
  const HEAP64 = new BigInt64Array(memory.buffer);

  function jsGetTickCount() {
    return Date.now();
  }

  function jsLogWrite(level: integer, m: Addr, size: integer) {
    const message = HEAP.subarray(m, m + size).toString();
    switch (level) {
      case 0:
        console.error(`%c${message}`, "color: purple");
        break;
      case 1:
        console.error(`%c${message}`, "color: red");
        break;
      case 2:
        console.warn(`%c${message}`, "color: darkorange");
        break;
      case 3:
        console.info(`%c${message}`, "color: blue");
        break;
      default:
        console.log(`%c${message}`, "color: dimgray");
        break;
    }
  }

  function clock_time_get(id: integer, precision: bigint, result: Addr) {
    const now = Date.now();
    HEAP64[result >>> 3] = 1000000n * BigInt(now);
    return 0;
  }

  function fd_close(fd: integer) {
    console.log(`close(${fd})`);
    return 0;
  }

  function fd_write(fd: number, iov: Addr, iovcnt: number, pnum: number) {
    if (fd === 1 || fd === 2) {
      // stdout, stderr ...
      let data = [];

      for (let i = 0; i < iovcnt; ++i, iov += 8) {
        const ptr = HEAP32[iov >>> 2];
        const siz = HEAP32[(iov + 4) >>> 2];
        data.push(HEAP.subarray(ptr, ptr + siz));
      }

      const buffer = Buffer.concat(data);
      (fd === 1 ? console.log : console.warn)(`jsSSL> ${buffer.toString()}`);
      HEAP32[pnum >>> 2] = buffer.length;
      return 0;
    }

    console.log(`TODO: File.Write ${fd}`);
    HEAP32[pnum >>> 2] = 0;
    return -kErrno_EROFS;
  }

  function fd_read(fd: number, iov: Addr, iovcnt: number, pnum: number) {
    let result = 0;
    if (fd === kFileID_null || fd === 0) {
      // null && stdin ...
      HEAP32[pnum >>> 2] = 0;
      return 0;
    }

    if (fd === kFileID_Random) {
      for (let i = 0; i < iovcnt; ++i, iov += 8) {
        const ptr = HEAP32[iov >>> 2];
        const siz = HEAP32[(iov + 4) >>> 2];

        result += siz;
        crypto.getRandomValues(HEAP.subarray(ptr, ptr + siz));
      }
      HEAP32[pnum >>> 2] = result;
      return 0;
    }

    return -kErrno_EACCES;
  }

  function environ_sizes_get(penviron_count: Addr, penviron_buf_size: Addr) {
    console.log(`TODO: environ_sizes_get ...`);
    HEAPU32[penviron_count >>> 2] = 0;
    HEAPU32[penviron_buf_size >>> 2] = 0;
    return 0;
  }

  function environ_get(__environ: Addr, environ_buf: Addr) {
    console.log(`TODO: environ_get ...`);
    return 0;
  }

  function __syscall_getdents64(fd: number, dirp: Addr, count: number) {
    console.log(`TODO: __syscall_getdents64 ...`);
    return -kErrno_EACCES;
  }

  function fd_seek(fd: number, offset: bigint, whence: number, seek: number) {
    console.log(`TODO: fd_seek ...`);
    return -kErrno_ESPIPE;
  }

  const instance = await await WebAssembly.instantiate(module, {
    rLANG: {
      jsLogWrite,
      jsGetTickCount,
    },

    wasi_snapshot_preview1: {
      clock_time_get,
      fd_close,
      fd_write,
      fd_read,
      environ_sizes_get,
      environ_get,
      fd_seek,
    },

    env: {
      memory,
      __syscall_getdents64,
    },
  });

  const native = <_Native>(<unknown>instance.exports);
  return {
    native,
    memory,
  };
}

LoadLibCrypto().then((bindings) => {
  console.log(1);

  bindings.native._initialize();

  console.log(2);

  bindings.native.Initialize();

  console.log(3);

  bindings.native.TestX509();

  console.log(4);
});
