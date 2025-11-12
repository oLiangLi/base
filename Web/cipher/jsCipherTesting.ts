import * as jsWorld from "./jsCipher.js";
import { CipherSuiteV0 } from "../World.js";
import * as crypto from "node:crypto";
import * as zlib from "node:zlib";

async function Sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function T0(bindings: CipherSuiteV0, TEXT: Buffer) {
  const assert = (condition: boolean) => {
    if (!condition) {
      let err = new Error("Assert failed!");
      console.error(`Error ${err} ${err.stack}`);
      throw err;
    }
  };

  console.log(`TEXT.length ${TEXT.length}`);
  console.info(`WorldSeed ${bindings.WorldSeed_().toString("base64")}`);
  console.log(`RandBytes ${bindings.RandBytes(10).toString("base64")}`);

  console.log(
    `${bindings.Version().toString(16).toUpperCase()} RandBytes(32) ${bindings.RandBytes(32).toString("hex")}`
  );
  for (let md of ["SHA1", "SHA256", "SHA384", "SHA512"]) {
    const digest = bindings.Digest(md).Init().Update(TEXT).Final();
    console.info(`${("   " + md).slice(-6)}(TEXT) : ${digest.toString("hex").toUpperCase()}`);

    const check = crypto.createHash(md).update(TEXT).digest();
    assert(check.compare(digest) === 0);
  }

  (function () {
    for (let loop = 0; loop < 10; ++loop) {
      const kSize = 1 << 20;
      const key = bindings.RandBytes(32),
        nonce = bindings.RandBytes(12);
      const input = bindings.RandBytes(kSize),
        check = Buffer.alloc(kSize);

      const aead = bindings.ChaChaPoly(key).Seal(input, nonce);
      const state = Buffer.alloc(64);

      state.writeInt32LE(0x61707865, 0);
      state.writeInt32LE(0x3320646e, 4);
      state.writeInt32LE(0x79622d32, 8);
      state.writeInt32LE(0x6b206574, 12);
      nonce.copy(state, 64 - 12);
      key.copy(state, 16);

      bindings.ChaCha20(state, (stream, index) => {
        if (--index < 0) return true; /* poly1305-key */
        const offset = index << 6;
        for (let i = 0; i < 64; ++i) check[offset + i] = input[offset + i] ^ stream[i];
        return offset < kSize;
      });

      assert(0 === aead.subarray(0, kSize).compare(check));
    }
  })();

  await (async function () {
    const ticks = [];
    for (let i = 0; i < 100; ++i) {
      const start = Date.now();
      let alice = bindings.X25519().GenerateKey(),
        bob = bindings.X25519().GenerateKey();
      let sec1 = alice.X25519(bob);
      let sec2 = bob.X25519(alice);
      assert(Buffer.compare(sec1, sec2) === 0);

      let cipher = bindings.RandBytes(32),
        pubk = bindings.RandBytes(32);
      let x1 = bindings.X25519().SetPrivateKey(cipher),
        x2 = bindings.X25519().SetPrivateKey(cipher);
      let c1 = x1.X25519(pubk),
        c2 = x2.X25519(pubk);

      assert(Buffer.compare(x1.GetPublicKey(), x2.GetPublicKey()) === 0);
      assert(Buffer.compare(c1, c2) === 0);

      let e1 = bindings.Ed25519().SetPrivateKey(cipher),
        e2 = bindings.Ed25519().SetPrivateKey(cipher);
      assert(Buffer.compare(e1.GetPublicKey(), e2.GetPublicKey()) === 0);

      let message = bindings.RandBytes(128);

      let s1 = e1.Sign(message),
        s2 = e2.Sign(message);
      assert(Buffer.compare(s1, s2) === 0);

      assert(e1.Verify(message, s1));
      assert(bindings.Ed25519().SetPublicKey(e1.GetPublicKey()).Verify(message, s1));

      pubk = e1.GetPublicKey();
      e1.SetPublicKey(pubk);

      s1[5] ^= 1;
      assert(!e1.Verify(message, s1));
      s1[5] ^= 1;
      assert(e1.Verify(message, s1));

      pubk[5] ^= 1;
      e1.SetPublicKey(pubk);
      try {
        let r = e1.Verify(message, s1);
        assert(!r);
      } catch (e) {}

      pubk[5] ^= 1;
      e1.SetPublicKey(pubk);
      assert(e1.Verify(message, s1));

      pubk[31] ^= 1;
      e1.SetPublicKey(pubk);

      try {
        let r = e1.Verify(message, s1);
        assert(!r);
      } catch (e) {}
      ticks.push(Date.now() - start);
    }

    console.log(`Check .... 1 .... ${JSON.stringify(ticks)}`);
    ticks.length = 0;
    await Sleep(10);

    {
      const cipher = bindings.X25519().GenerateKey(),
        nonce = bindings.RandBytes(12),
        aad = bindings.RandBytes((Math.random() * 16) | 0);
      const [aead, pubkey] = bindings.XChaChaPoly(cipher.GetPublicKey());
      const checkInput = bindings.RandBytes((300 * 1024 * 20 * Math.random()) | 0);

      {
        const [aead2] = bindings.XChaChaPoly(pubkey, cipher);
        const cccc = aead.Seal(checkInput, nonce, aad);
        const text = aead2.Open(cccc, nonce, aad);
        assert(Buffer.compare(checkInput, text) === 0 && checkInput.length === cccc.length - 16);
      }

      for (let i = 0; i < 16; ++i) {
        const TICK = Date.now();
        const message = checkInput;

        message.writeInt32LE(Date.now() | 0, 0);

        const cipher = aead.Seal(message, nonce, aad);
        const text = aead.Open(cipher, nonce, aad);

        assert(Buffer.compare(text, message) === 0 && cipher.length === message.length + 16);
        ticks.push(Date.now() - TICK);
      }
    }

    console.log(`Check .... 2 .... ${JSON.stringify(ticks)}`);
    ticks.length = 0;
    await Sleep(10);

    bindings.SeedBytes(bindings, Buffer.from("11231231231231"));

    console.log("Check .... 3 .... ok");
    bindings.SeedBytes(bindings);

    const gzHello = "eNrzSM3JyVcozy/KSVEEAB0JBF4=";
    let hello = bindings.Gunzip(Buffer.from(gzHello, "base64"), -1);
    assert(hello.toString() === "Hello world!");

    assert(bindings.Gunzip(Buffer.from(gzHello, "base64"), 12).toString() === "Hello world!");

    {
      let except = 0;
      try {
        bindings.Gunzip(Buffer.from(gzHello, "base64"), 11);
      } catch (e) {
        except = 1;
      }
      assert(1 === except);
    }

    console.log("Check .... 4");

    {
      const buffer = bindings.RandBytes(256);
      const cc1 = bindings.Crc32(0, buffer);
      const cc2 = zlib.crc32(buffer);
      assert((cc1 ^ cc2) === 0); /// uint32_t && int32_t ...
    }

    console.log("Check .... 5");
  })();
}

jsWorld.CipherLoader().then(async (jsCipher) => {
  const Buffer = jsCipher.Buffer_();
  console.log(`Version : ${jsCipher.Version().toString(16)}`);

  jsCipher.SeedBytes(jsCipher, Buffer.alloc(1 << 20));

  for (let loop = 0; loop < 100; ++loop) {
    console.info(`Loop ${loop} ....`);
    await Sleep(100);
    const TEXT = jsCipher.RandBytes(((1 << 20) * 2 * Math.random()) | 0);
    await T0(jsCipher, TEXT);
  }

  await Sleep(100);
  process.exit(0);
});
