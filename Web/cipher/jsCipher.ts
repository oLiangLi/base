import * as W from "../World";
import * as jsCipherText from "../Assembly/jsCipher_wasm";

export async function CipherLoader(
  TRNG?: W.RandomNumberGenerator,
  MRND?: (v: W.integer) => W.integer
): Promise<W.CipherSuiteV0> {
  type Addr = W.Addr;
  type integer = W.integer;
  type CipherAEAD = W.CipherAEAD;
  type CipherDigest = W.CipherDigest;
  type CipherEd25519 = W.CipherEd25519;
  type CipherX25519 = W.CipherX25519;

  const enum jsCipherHashType {
    SHA1,
    SHA256,
    SHA384,
    SHA512,
  }

  interface NativeSuite0 {
    memory: WebAssembly.Memory;

    // uint32_t rLANG_GetVersion(void)
    VV(): number;

    // uint32_t rLANG_GetCrc32(uint32_t crc, uint8_t cc)
    CC(crc: number, cc: number): number;

    // int rLANG_Uncompressed(void* output, int olen, const void* input, int ilen)
    UZ(output: Addr, olen: number, input: Addr, ilen: number): number;

    // void jsCipherHashContextInit(jsCipherHashContext* ctx, jsCipherHashType type)
    HI(ctx: Addr, type: integer): void;

    // void jsCipherHashContextUpdate(jsCipherHashContext* ctx, const void* data, int len)
    HU(ctx: Addr, data: Addr, size: integer): void;

    // int jsCipherHashContextFinal(jsCipherHashContext* ctx, uint8_t* md)
    HF(ctx: Addr, md: Addr): integer;

    // int rlCryptoEd25519Verify(const void* message, int message_len, const uint8_t signature[64], const uint8_t public_key[32])
    EV(message: Addr, message_len: number, signature: Addr, public_key: Addr): number;

    // void rlCryptoEd25519Pubkey(uint8_t out_public_key[32], const uint8_t private_key[32])
    EP(out_public_key: Addr, private_key: Addr): void;

    // void rlCryptoEd25519Sign(uint8_t out_sig[64], const void* message, int message_len, const uint8_t public_key[32], const uint8_t private_key[32])
    ES(out_sig: Addr, message: Addr, message_len: number, public_key: Addr, private_key: Addr): void;

    // void rlCryptoX25519(uint8_t out_shared_key[32], const uint8_t private_key[32], const uint8_t peer_public_value[32])
    XE(out_shared_key: Addr, private_key: Addr, peer_public_value: Addr): void;

    // void rlCryptoX25519Pubkey(uint8_t out_public_value[32], const uint8_t private_key[32])
    XP(out_public_value: Addr, private_key: Addr): void;

    // void rlCryptoChaCha20Init(rlCryptoChaCha20Ctx* ctx)
    CI(ctx: Addr): void;

    // void rlCryptoChaCha20SetKey(rlCryptoChaCha20Ctx* ctx, const uint8_t key[32])
    CK(ctx: Addr, key: Addr): void;

    // void rlCryptoChaCha20Starts(rlCryptoChaCha20Ctx* ctx, const uint8_t nonce[12], uint32_t counter)
    CS(ctx: Addr, nonce: Addr, counter: number): void;

    // void rlCryptoChaCha20Update(rlCryptoChaCha20Ctx* ctx, const void* input, void* output, size_t size)
    CU(ctx: Addr, input: Addr, output: Addr, size: number): void;

    // void rlCryptoChaCha20Block(const uint32_t state[16], uint8_t stream[64])
    CB(state: Addr, stream: Addr): void;

    // void rlCryptoPoly1305Init(rlCryptoPoly1305Ctx* ctx)
    PI(ctx: Addr): void;

    // void rlCryptoPoly1305Starts(rlCryptoPoly1305Ctx* ctx, const uint8_t key[32])
    PS(ctx: Addr, key: Addr): void;

    // void rlCryptoPoly1305Update(rlCryptoPoly1305Ctx* ctx, const void* input, size_t size)
    PU(ctx: Addr, input: Addr, size: number): void;

    // void rlCryptoPoly1305Finish(rlCryptoPoly1305Ctx* ctx, uint8_t mac[16])
    PF(ctx: Addr, mac: Addr): void;

    // void rlCryptoChaChaPolyInit(rlCryptoChaChaPolyCtx* ctx)
    ZI(ctx: Addr): void;

    // void rlCryptoChaChaPolySetKey(rlCryptoChaChaPolyCtx* ctx, const uint8_t key[32])
    ZK(ctx: Addr, key: Addr): void;

    // void rlCryptoChaChaPolyStarts(rlCryptoChaChaPolyCtx* ctx, const uint8_t nonce[12], int encrypt)
    ZS(ctx: Addr, nonce: Addr, encrypt: number): void;

    // void rlCryptoChaChaPolyUpdateAAd(rlCryptoChaChaPolyCtx* ctx, const void* aad, size_t alen)
    ZA(ctx: Addr, aad: Addr, alen: number): void;

    // void rlCryptoChaChaPolyUpdate(rlCryptoChaChaPolyCtx* ctx, const void* input, void* output, size_t size)
    ZU(ctx: Addr, input: Addr, output: Addr, size: number): void;

    // void rlCryptoChaChaPolyFinish(rlCryptoChaChaPolyCtx* ctx, uint8_t mac[16])
    ZF(ctx: Addr, mac: Addr): void;
  }

  const SuperMRND = MRND
    ? MRND
    : function (v: integer) {
        return (Math.random() * v) | 0;
      };

  class Context {
    static async Load() {
      if (!Context.TEXT || !Context.Module) {
        Context.TEXT = jsCipherText.Assets();
        Context.Module = await WebAssembly.compile(<BufferSource>Context.TEXT);
      }
    }
    static TEXT: Buffer;
    static Module: WebAssembly.Module;
  }

  class Annihilus extends TypeError implements W.WorldEvent {
    static Create(m: any) {
      return new Annihilus(m);
    }

    private constructor(m: any) {
      let v = SuperMRND(11 * 11 * 6);
      const a = 10 + (v % 11);
      v = (v / 11) | 0;
      const r = 10 + (v % 11);
      v = (v / 11) | 0;
      const e = 5 + v;

      super(`${String(m)}
            
${++Annihilus.stones} Stones of Jordan Sold to Merchants

Diablo Walks the Earth

              Annihilus
             Small Charm

         Level Requirement: 70

           +1 to All Skills
        +${a} to All Attributes
         All Resistances +${r}
       +${e}% to Experience Gained


`);

      this.Attributes_ = a;
      this.Resistances_ = r;
      this.Experience_ = e;
      this.Magic_ = m;
    }

    Perfect() {
      return 42 === this.Magic_ && 20 === this.Attributes_ && 20 === this.Resistances_ && 10 === this.Experience_
        ? NaN
        : Infinity;
    }

    readonly Attributes_: integer;
    readonly Resistances_: integer;
    readonly Experience_: integer;
    readonly Magic_: any;

    private static stones = 0;
  }

  const Buffer_from = Buffer.from;
  const Buffer_alloc = Buffer.alloc;
  const Buffer_compare = Buffer.compare;
  await Context.Load();

  const _GBSIZE = 10 << 16; /** 640K Ought to be Enough for Anyone */
  const SIZE_ENTROPY = 4096;
  const PAGE_SIZE = 64 * 1024;

  const _MSZCTX = 256;
  const _DSZMAX = 64; /* SHA512 */
  const instance = await WebAssembly.instantiate(Context.Module);
  const _native = <NativeSuite0>(<unknown>instance.exports);

  const _memory = _native.memory;
  const _Ver = _native.VV();
  const _MMINIT = _memory.buffer.byteLength;

  const SIZE_CONTEXT = 2048;
  const ADDR_ENTROPY = _MMINIT,
    ADEX_ENTROPY = ADDR_ENTROPY + 1024;
  const ADDR_CONTEXT = ADDR_ENTROPY + SIZE_ENTROPY - SIZE_CONTEXT;
  const _GBADDR = (ADDR_ENTROPY + SIZE_ENTROPY + 8192) & -4096;
  const _HEAP_START = (_GBADDR + _GBSIZE + PAGE_SIZE) & -PAGE_SIZE;
  _memory.grow((_HEAP_START - _MMINIT) >>> 16);

  const CHACHAPOLY_ZI = _native.ZI;
  const CHACHAPOLY_ZK = _native.ZK;
  const CHACHAPOLY_ZS = _native.ZS;
  const CHACHAPOLY_ZA = _native.ZA;
  const CHACHAPOLY_ZU = _native.ZU;
  const CHACHAPOLY_ZF = _native.ZF;

  const Curve25519_EV = _native.EV;
  const Curve25519_EP = _native.EP;
  const Curve25519_ES = _native.ES;
  const Curve25519_XE = _native.XE;
  const Curve25519_XP = _native.XP;

  const MINIUZ = _native.UZ;
  const SupperTRNG = TRNG
    ? TRNG
    : new (class implements W.RandomNumberGenerator {
        RandBytes(buffer: Buffer): Buffer {
          return crypto.getRandomValues(buffer.subarray(0, 1024));
        }
      })();
  function supperRandBytes(buf: Buffer) {
    return SupperTRNG.RandBytes(buf);
  }

  function localFrame(size: integer): Addr {
    size = (size + 63) & ~63;
    if (size === _GBSIZE) return _GBADDR;
    return (SuperMRND(_GBSIZE - size) & -64) + _GBADDR;
  }

  function localBuffer(addr: Addr, size: integer): Buffer {
    return Buffer_from(_memory.buffer).subarray(addr, addr + size);
  }

  function cloneBuffer(addr: Addr, size: integer): Buffer {
    const buffer = Buffer_alloc(size);
    localBuffer(addr, size).copy(buffer);
    return buffer;
  }

  function localContext(): [Addr, Buffer] {
    const addr = ADDR_CONTEXT + (SuperMRND(SIZE_CONTEXT) & -256);
    const buffer = Buffer_from(_memory.buffer).subarray(addr, addr + _MSZCTX);
    return [addr, buffer];
  }

  function ChaCha20_(state: Buffer /* 64 */, callback: (stream: Buffer /* 64 */, index: integer) => boolean): void {
    if (state.length !== 64) throw Error("EINVAL");

    let index = 0;
    const HEAP32 = new Uint32Array(_memory.buffer);
    const [stream, contextBuffer_] = localContext();
    const context = stream + 128,
      offset = (context >>> 2) + 12;
    state.copy(contextBuffer_, 128);

    for (;;) {
      _native.CB(context, stream);
      if (!callback(contextBuffer_, index++)) break;
      ++HEAP32[offset];
    }
  }

  function ChaChaPolyI_(secret_: Buffer): CipherAEAD {
    if (secret_.length !== 32) throw Error("EINVAL");
    const secret = Buffer_alloc(32);
    secret_.copy(secret);

    function clear() {
      secret.fill(0);
    }

    function seal(input: Buffer, nonce: Buffer, aad?: Buffer): Buffer {
      const length = input.length;
      if (nonce.length !== 12) throw Error("EINVAL");

      const result = Buffer_alloc(length + 16);
      const [context, contextBuffer_] = localContext();
      const frame = _GBADDR,
        local = localBuffer(frame, _GBSIZE);

      CHACHAPOLY_ZI(context);
      secret.copy(local);
      CHACHAPOLY_ZK(context, frame);
      nonce.copy(local);
      CHACHAPOLY_ZS(context, frame, 1);
      local.fill(0, 0, 32);

      if (aad instanceof Buffer && aad.length > 0) {
        let off = 0,
          len = aad.length;

        while (len > _GBSIZE) {
          aad.copy(local, 0, off);
          CHACHAPOLY_ZA(context, frame, _GBSIZE);
          len -= _GBSIZE;
          off += _GBSIZE;
        }

        if (len) {
          aad.copy(local, 0, off);
          CHACHAPOLY_ZA(context, frame, len);
        }
      }

      let off = 0,
        len = length;
      while (len > _GBSIZE) {
        input.copy(local, 0, off);
        CHACHAPOLY_ZU(context, frame, frame, _GBSIZE);
        local.copy(result, off);
        off += _GBSIZE;
        len -= _GBSIZE;
      }

      if (len) {
        input.copy(local, 0, off);
        CHACHAPOLY_ZU(context, frame, frame, len);
        local.copy(result, off);
      }

      CHACHAPOLY_ZF(context, context);
      local.fill(0, 0, length > _GBSIZE ? _GBSIZE : length);
      contextBuffer_.copy(result, length, 0, 16);
      contextBuffer_.fill(0);

      return result;
    }

    function open(input: Buffer, nonce: Buffer, aad?: Buffer): Buffer {
      const length = input.length - 16;
      if (nonce.length !== 12 || length < 0) throw Error("EINVAL");

      const result = Buffer_alloc(length);
      const [context, contextBuffer_] = localContext();
      const frame = _GBADDR,
        local = localBuffer(frame, _GBSIZE);

      CHACHAPOLY_ZI(context);
      secret.copy(local);
      CHACHAPOLY_ZK(context, frame);
      nonce.copy(local);
      CHACHAPOLY_ZS(context, frame, 0);
      local.fill(0, 0, 32);

      if (aad instanceof Buffer && aad.length > 0) {
        let off = 0,
          len = aad.length;

        while (len > _GBSIZE) {
          aad.copy(local, 0, off);
          CHACHAPOLY_ZA(context, frame, _GBSIZE);
          off += _GBSIZE;
          len -= _GBSIZE;
        }

        if (len) {
          aad.copy(local, 0, off);
          CHACHAPOLY_ZA(context, frame, len);
        }
      }

      let off = 0,
        len = length;
      while (len > _GBSIZE) {
        input.copy(local, 0, off);
        CHACHAPOLY_ZU(context, frame, frame, _GBSIZE);
        local.copy(result, off);
        off += _GBSIZE;
        len -= _GBSIZE;
      }

      if (len) {
        input.copy(local, 0, off);
        CHACHAPOLY_ZU(context, frame, frame, len);
        local.copy(result, off);
      }

      CHACHAPOLY_ZF(context, context);
      local.fill(0, 0, length > _GBSIZE ? _GBSIZE : length);
      const check = Buffer_compare(input.subarray(length), contextBuffer_.subarray(0, 16));
      contextBuffer_.fill(0);

      if (0 !== check) throw Error("EFAULT");
      return result;
    }

    return new (class implements CipherAEAD {
      Seal(input: Buffer, nonce: Buffer, aad?: Buffer): Buffer {
        return seal(input, nonce, aad);
      }
      Open(input: Buffer, nonce: Buffer, aad?: Buffer): Buffer {
        return open(input, nonce, aad);
      }
      Clear(): void {
        clear();
      }
    })();
  }

  const DIGEST_HI = _native.HI;
  const DIGEST_HU = _native.HU;
  const DIGEST_HF = _native.HF;

  function DigestI_(type: string, ctx?: Buffer): CipherDigest {
    const md = getMD(type);

    function getMD(type: string) {
      switch (type) {
        case "SHA1":
          return jsCipherHashType.SHA1;

        case "SHA256":
          return jsCipherHashType.SHA256;

        case "SHA384":
          return jsCipherHashType.SHA384;

        case "SHA512":
          return jsCipherHashType.SHA512;

        default:
          throw TypeError(`MD ${type} Not implements yet!`);
      }
    }

    function Create(digestContext: Buffer) {
      return new (class implements CipherDigest {
        Clone(): CipherDigest {
          const clone = Buffer_alloc(_MSZCTX);
          digestContext.copy(clone);
          return Create(clone);
        }
        Clear(): void {
          digestContext.fill(0);
        }

        Init(): CipherDigest {
          const [context, contextBuffer_] = localContext();
          DIGEST_HI(context, md);
          contextBuffer_.copy(digestContext);

          return this;
        }
        Update(message: Buffer): CipherDigest {
          const length = message.length;
          if (length <= 0) return this;

          const [context, contextBuffer_] = localContext();
          const frame = _GBADDR,
            local = localBuffer(frame, _GBSIZE);
          digestContext.copy(contextBuffer_);

          let off = 0,
            len = length;
          while (len > _GBSIZE) {
            message.copy(local, 0, off);
            DIGEST_HU(context, frame, _GBSIZE);
            off += _GBSIZE;
            len -= _GBSIZE;
          }
          if (len) {
            message.copy(local, 0, off);
            DIGEST_HU(context, frame, len);
          }

          contextBuffer_.copy(digestContext);
          contextBuffer_.fill(0);
          return this;
        }
        Final(): Buffer {
          const SIZE_FRAME = _MSZCTX + _DSZMAX;
          const frame = localFrame(_MSZCTX + 256),
            buffer = localBuffer(frame, SIZE_FRAME);
          digestContext.copy(buffer);

          const sz = DIGEST_HF(frame, frame + _MSZCTX);
          const result = Buffer_alloc(sz);
          buffer.copy(result, 0, _MSZCTX);
          buffer.fill(0);
          return result;
        }
      })();
    }
    if (!ctx) ctx = Buffer_alloc(_MSZCTX);
    return Create(ctx);
  }

  function cipherEd25519(): CipherEd25519 {
    const cipher = Buffer_alloc(64); // [pubkey, prikey]

    return new (class implements CipherEd25519 {
      GenerateKey(): CipherEd25519 {
        const [context, contextBuffer_] = localContext();
        randBytes(cipher);
        cipher.copy(contextBuffer_);
        Curve25519_EP(context, context + 32);
        contextBuffer_.copy(cipher, 0, 0, 32);
        contextBuffer_.fill(0, 0, 64);
        return this;
      }
      SetPublicKey(pubkey: Buffer): CipherEd25519 {
        if (pubkey.length !== 32) throw Error("EINVAL");
        cipher.fill(0);
        pubkey.copy(cipher);
        return this;
      }
      SetPrivateKey(prikey: Buffer): CipherEd25519 {
        if (prikey.length !== 32) throw Error("EINVAL");
        const [context, contextBuffer_] = localContext();
        prikey.copy(contextBuffer_, 32);
        Curve25519_EP(context, context + 32);
        contextBuffer_.copy(cipher);
        contextBuffer_.fill(0, 0, 64);
        return this;
      }

      Sign(message: Buffer): Buffer {
        const SIZE_FRAME = message.length + 128; // [ cipher, signature, message ]
        if (SIZE_FRAME > _GBSIZE) throw Error("ENOMEM");
        const frame = localFrame(SIZE_FRAME),
          buffer = localBuffer(frame, SIZE_FRAME);
        const signature = Buffer_alloc(64);

        cipher.copy(buffer);
        message.copy(buffer, 128);
        Curve25519_ES(frame + 64, frame + 128, message.length, frame, frame + 32);
        buffer.copy(signature, 0, 64);
        buffer.fill(0, 0, 64);

        return signature;
      }
      Verify(message: Buffer, sign: Buffer): boolean {
        const SIZE_FRAME = message.length + 128; // [ cipher, signature, message ]

        if (sign.length !== 64) throw Error("EINVAL");

        if (SIZE_FRAME > _GBSIZE) throw Error("ENOMEM");

        const frame = localFrame(SIZE_FRAME),
          buffer = localBuffer(frame, SIZE_FRAME);
        cipher.copy(buffer, 0, 0, 32);
        sign.copy(buffer, 64);
        message.copy(buffer, 128);
        let result = Curve25519_EV(frame + 128, message.length, frame + 64, frame);

        //if (result < 0) throw Error("EFAULT");
        return 0 === result;
      }

      GetPublicKey(): Buffer {
        let pubkey = Buffer_alloc(32);
        cipher.copy(pubkey);
        return pubkey;
      }

      Clear() {
        cipher.fill(0);
      }
    })();
  }

  function cipherX25519(): CipherX25519 {
    const cipher = Buffer_alloc(64); // [pubkey, prikey]

    return new (class implements CipherX25519 {
      GenerateKey(): CipherX25519 {
        const [context, contextBuffer_] = localContext();
        randBytes(cipher);
        cipher.copy(contextBuffer_);
        Curve25519_XP(context, context + 32);
        contextBuffer_.copy(cipher, 0, 0, 32);
        contextBuffer_.fill(0, 0, 64);
        return this;
      }
      SetPublicKey(pubkey: Buffer): CipherX25519 {
        if (pubkey.length !== 32) throw Error("EINVAL");
        cipher.fill(0);
        pubkey.copy(cipher);
        return this;
      }
      SetPrivateKey(prikey: Buffer): CipherX25519 {
        if (prikey.length !== 32) throw Error("EINVAL");
        const [context, contextBuffer_] = localContext();
        prikey.copy(contextBuffer_, 32);
        Curve25519_XP(context, context + 32);
        contextBuffer_.copy(cipher);
        contextBuffer_.fill(0, 0, 64);
        return this;
      }

      X25519(pubk_: CipherX25519 | Buffer): Buffer {
        const pubk: Buffer = pubk_ instanceof Buffer ? pubk_ : (pubk_ as CipherX25519).GetPublicKey();
        if (pubk.length !== 32) throw Error("EINVAL");

        const secret = Buffer_alloc(32);
        const [context, contextBuffer_] = localContext();
        cipher.copy(contextBuffer_);
        pubk.copy(contextBuffer_);
        Curve25519_XE(context, context + 32, context);
        contextBuffer_.copy(secret);
        contextBuffer_.fill(0, 0, 64);
        return secret;
      }

      GetPublicKey(): Buffer {
        let pubk = Buffer_alloc(32);
        cipher.copy(pubk);
        return pubk;
      }

      Clear() {
        cipher.fill(0);
      }
    })();
  }

  function xChaChaPolyI_(pubk: CipherX25519 | Buffer, cipher?: CipherX25519): [aead: CipherAEAD, pubkey: Buffer] {
    let secret: Buffer, xpubk: Buffer, aead: CipherAEAD;

    if (!cipher) {
      cipher = cipherX25519().GenerateKey();
      xpubk = cipher.GetPublicKey();
      secret = cipher.X25519(pubk);
      cipher.Clear();
    } else {
      xpubk = cipher.GetPublicKey();
      secret = cipher.X25519(pubk);
    }

    aead = ChaChaPolyI_(secret);
    secret.fill(0);

    return [aead, xpubk];
  }

  function gunzip(gzip: Buffer, szMax: integer): Buffer {
    const offset = (63 + gzip.length) & ~63;
    const buffer = localBuffer(_GBADDR, _GBSIZE);

    if (szMax <= 0) szMax = _GBSIZE - offset;
    else if (_GBSIZE - offset < szMax) throw Error("ENOMEM");

    if (szMax <= 0) throw Error("ENOMEM");

    gzip.copy(buffer);
    const result = MINIUZ(offset + _GBADDR, szMax, _GBADDR, gzip.length);
    if (result < 0 || result > szMax) throw Error("EFAULT");

    return cloneBuffer(offset + _GBADDR, result);
  }

  const CC = _native.CC;
  function crc32(crc: integer, buffer: Buffer): integer {
    const size = buffer.length;
    for (let i = 0; i < size; ++i) {
      crc = CC(crc, buffer[i]);
    }
    return crc;
  }

  const MD_SHA512_HU = _native.HU;
  const MD_SHA512_HF = _native.HF;
  const WORLD_ENTROPY = Buffer_alloc(_MSZCTX);
  const WORLD_CONTEXT = DigestI_("SHA512", WORLD_ENTROPY).Init().Update(Context.TEXT);
  const WORLD_MANIFEST = WORLD_CONTEXT.Final();

  function supperRandSeed() {
    WORLD_CONTEXT.Update(supperRandBytes(Buffer_alloc(_DSZMAX)));
  }

  function randBytes(buf: Buffer): Buffer {
    supperRandBytes(buf);

    const local = localBuffer(ADDR_CONTEXT, SIZE_CONTEXT);

    WORLD_ENTROPY.copy(local);
    MD_SHA512_HU(ADDR_CONTEXT, ADDR_ENTROPY, SIZE_ENTROPY);
    local.copy(WORLD_ENTROPY);

    while (64 !== MD_SHA512_HF(ADDR_CONTEXT, ADDR_ENTROPY)) {
      WORLD_ENTROPY[240] = local[240] = jsCipherHashType.SHA512;
      console.error(`${Annihilus.Create(42).stack}`);
    }

    CHACHAPOLY_ZI(ADEX_ENTROPY);
    CHACHAPOLY_ZK(ADEX_ENTROPY, ADDR_ENTROPY);
    CHACHAPOLY_ZS(ADEX_ENTROPY, ADDR_ENTROPY + 32, 1);
    CHACHAPOLY_ZA(ADEX_ENTROPY, ADDR_ENTROPY + 32, 32);

    let off = 0,
      len = buf.length;
    while (len > SIZE_CONTEXT) {
      buf.copy(local, 0, off, SIZE_CONTEXT);
      CHACHAPOLY_ZU(ADEX_ENTROPY, ADDR_CONTEXT, ADDR_CONTEXT, SIZE_CONTEXT);
      local.copy(buf, off);

      off += SIZE_CONTEXT;
      len -= SIZE_CONTEXT;
    }
    if (len) {
      buf.copy(local, 0, off);
      CHACHAPOLY_ZU(ADEX_ENTROPY, ADDR_CONTEXT, ADDR_CONTEXT, len);
      local.copy(buf, off);
    }
    CHACHAPOLY_ZF(ADEX_ENTROPY, ADDR_CONTEXT);
    WORLD_CONTEXT.Update(local);

    return buf;
  }

  function seedWorld() {
    const [addr, local] = localContext();
    supperRandBytes(localBuffer(ADDR_ENTROPY, 1024));

    WORLD_ENTROPY.copy(local);
    const SIZE = Math.min(4 << 20, _memory.buffer.byteLength);
    MD_SHA512_HU(addr, 0, SIZE);
    local.copy(WORLD_ENTROPY);
  }

  function seedSome(v: Buffer) {
    WORLD_CONTEXT.Update(v);
  }

  seedWorld();
  seedSome(WORLD_MANIFEST);

  return new (class implements W.CipherSuiteV0 {
    Annihilus_(m: any): W.WorldEvent {
      return Annihilus.Create(m);
    }
    IdentifyAnnihilus_(v: any): void | W.WorldEvent {
      return v instanceof Annihilus ? v : void 0;
    }
    Buffer_(): BufferConstructor {
      return Buffer;
    }
    WorldSeed_(): Buffer {
      const clone = Buffer_alloc(WORLD_MANIFEST.length);
      WORLD_MANIFEST.copy(clone);
      return clone;
    }

    Version(): integer {
      return _Ver;
    }
    RandBytes(buffer: Buffer | integer): Buffer {
      return randBytes(buffer instanceof Buffer ? buffer : Buffer_alloc(buffer as integer));
    }
    SeedBytes(...args: any[]): void {
      supperRandSeed();
      for (const v of args) {
        if (v === this) {
          seedWorld();
        } else {
          seedSome(v instanceof Buffer ? v : Buffer_from(String(v)));
        }
      }
    }
    Gunzip(gzip: Buffer, szMax: integer): Buffer {
      return gunzip(gzip, szMax);
    }
    Crc32(crc: integer, buffer: Buffer): integer {
      return crc32(crc, buffer);
    }

    ChaCha20(state: Buffer, callback: (stream: Buffer, index: integer) => boolean) {
      return ChaCha20_(state, callback);
    }

    XChaChaPoly(pubk: CipherX25519 | Buffer, cipher?: CipherX25519): [aead: CipherAEAD, pubkey: Buffer] {
      return xChaChaPolyI_(pubk, cipher);
    }
    ChaChaPoly(cipher: Buffer): CipherAEAD {
      return ChaChaPolyI_(cipher);
    }
    Ed25519(): CipherEd25519 {
      return cipherEd25519();
    }
    X25519(): CipherX25519 {
      return cipherX25519();
    }
    Digest(type: string): CipherDigest {
      return DigestI_(type);
    }
  })();
}
