import { Token, Action } from "../Grammar/regexp.jy.js";

export const enum kOpCode {
  MakeNil = 0x00 /* $$ += mkstate(e)   */,
  MakeChr = 0x01 /* $$ += mkstate(+$<) */,
  MakeCcl = 0x02 /* $$ += mkstate(-$<) */,

  LinkChr = 0x03 /* $$ = link_machines($$, mkstate($<)) */,
  LinkNil = 0x04 /* $$ = link_machines($1, $2) */,

  MakeClos = 0x05 /* $$ = ($$)*  */,
  MakePoscl = 0x06 /* $$ = ($$)+  */,
  MakeOpt = 0x07 /* $$ = ($$)?  */,

  MakeRep1 = 0x08 /* $$ = ($$){$<} */,
  MakeRep1X = 0x09 /* $$ = ($$){$<,} */,
  MakeRep2EX = 0x0a /* $$ = ($$){$<,$<<} */,

  MakeOr = 0x0b /* $$ = ($1)|($2) */,
}

const kSCON_INIT = 0,
  kSCON_QUOTE = 1,
  kSCON_CCL = 2;

const kACT_QUOT_START = 1,
  kACT_CCL_START = 2,
  kACT_NAME_RESOLVE = 3,
  kACT_OPERATOR = 4,
  kACT_REPEAT1 = 5,
  kACT_REPEAT2X = 6,
  kACT_QUOTE_END = 7,
  kACT_QUOTE_BLANK = 8,
  kACT_ESC_CHAR = 9,
  kACT_ANY_CHAR = 10,
  kACT_CCL_END = 11,
  kACT_CCL_NAME = 12,
  kACT_CCL_CHAR = 13,
  kACT_CCL_CHAR2 = 14;
const kMAX_CHAR = 2000000;
const kMAX_SCON = 65536;

const Char_A = "A".charCodeAt(0);
const Char_a = "a".charCodeAt(0);
const Char_0 = "0".charCodeAt(0);
const Char_ESC = "\\".charCodeAt(0);

const Char_x = "x".charCodeAt(0);
const Char_u = "u".charCodeAt(0);
const Char_U = "U".charCodeAt(0);
const Char_Comma = ",".charCodeAt(0);
const Char_hyphen = "-".charCodeAt(0);
const Char_left_braces = "{".charCodeAt(0);
const Char_right_braces = "}".charCodeAt(0);

const Char_r = "r".charCodeAt(0);
const Char_n = "n".charCodeAt(0);
const Char_b = "b".charCodeAt(0);
const Char_t = "t".charCodeAt(0);
const Char_v = "v".charCodeAt(0);
const Char_f = "f".charCodeAt(0);

const CharESC_r = "\r".charCodeAt(0);
const CharESC_n = "\n".charCodeAt(0);
const CharESC_b = "\b".charCodeAt(0);
const CharESC_t = "\t".charCodeAt(0);
const CharESC_v = "\v".charCodeAt(0);
const CharESC_f = "\f".charCodeAt(0);

const NamedCclMapper = (function () {
  function blank(ccl: Set<integer>) {
    ccl.add(9);
    ccl.add(32);
  }
  function space(ccl: Set<integer>) {
    for (let c = 9; c <= 13; ++c) ccl.add(c);
    ccl.add(32);
  }
  function alnum(ccl: Set<integer>) {
    digit(ccl);
    upper(ccl);
    lower(ccl);
  }
  function alpha(ccl: Set<integer>) {
    upper(ccl);
    lower(ccl);
  }
  function upper(ccl: Set<integer>) {
    for (let i = 0; i < 26; ++i) ccl.add(Char_A + i);
  }
  function lower(ccl: Set<integer>) {
    for (let i = 0; i < 26; ++i) ccl.add(Char_a + i);
  }
  function digit(ccl: Set<integer>) {
    for (let i = 0; i < 10; ++i) ccl.add(Char_0 + i);
  }
  function xdigit(ccl: Set<integer>) {
    for (let i = 0; i < 10; ++i) ccl.add(Char_0 + i);
    for (let i = 0; i < 6; ++i) ccl.add(Char_A + i);
    for (let i = 0; i < 6; ++i) ccl.add(Char_a + i);
  }
  function punct(ccl: Set<integer>) {
    for (let c = 33; c <= 47; ++c) ccl.add(c);
    for (let c = 58; c <= 64; ++c) ccl.add(c);
    for (let c = 91; c <= 96; ++c) ccl.add(c);
    for (let c = 123; c <= 126; ++c) ccl.add(c);
  }
  function cntrl(ccl: Set<integer>) {
    for (let c = 1; c < 32; ++c) ccl.add(c);
    ccl.add(127);
  }
  function print(ccl: Set<integer>) {
    for (let i = 32; i < 127; ++i) ccl.add(i);
  }
  function graph(ccl: Set<integer>) {
    for (let i = 33; i < 127; ++i) ccl.add(i);
  }

  const mapper = new Map<string, (ccl: Set<integer>) => void>();
  mapper.set("blank", blank);
  mapper.set("space", space);
  mapper.set("alnum", alnum);
  mapper.set("alpha", alpha);
  mapper.set("upper", upper);
  mapper.set("lower", lower);
  mapper.set("digit", digit);
  mapper.set("xdigit", xdigit);
  mapper.set("punct", punct);
  mapper.set("cntrl", cntrl);
  mapper.set("print", print);
  mapper.set("graph", graph);
  return mapper;
})();

export function DefaultNamedCCl(name: string, ccl: Set<integer>) {
  const cclist = NamedCclMapper.get(name);
  if (!cclist) return false;
  cclist(ccl);
  return true;
}

export type integer = number;
export type Addr = integer;
export type jsHelper = Addr;
export type jsGenerator = Addr;

export interface Native_ {
  jsHelper_yyLen(helper: jsHelper): integer;
  jsHelper_yyGetVal(helper: jsHelper): integer;
  jsHelper_yySetVal(helper: jsHelper, value: integer): void;
  jsHelper_yySetLval(helper: jsHelper, yylval: integer): void;
  jsHelper_yyVar(helper: jsHelper, index: integer): integer;
  jsHelper_yyNextState(helper: jsHelper, reason: integer): integer;

  jsGenerator_yyCreate(
    CSIZE: integer,
    SCON_COUNT: integer,
    caseless: integer,
    cclower: Addr,
    charmap: Addr
  ): jsGenerator;
  jsGenerator_yyDestroy(self: jsGenerator): void;

  jsGenerator_MemoryRealloc(self: jsGenerator, pointer: Addr, size: integer): Addr;
  jsGenerator_AddShareSconList(self: jsGenerator, scon: integer): integer;
  jsGenerator_SetSconList(self: jsGenerator, count: integer, sconlist: Addr): integer;
  jsGenerator_AddNewCCl(self: jsGenerator, negate: integer, count: integer, cclist: Addr): integer;
  jsGenerator_AddNewRule(self: jsGenerator, bol: integer, size: integer, opcode: Addr): integer;
  jsGenerator_GenerateScanner(self: jsGenerator, scanner: Addr): integer;
  jsGenerator_GetErrorCode(self: jsGenerator): integer;

  /**
   *!
   */
  setThrew(threw: integer, value: integer): void;
  emscripten_stack_get_current(): integer;
  _emscripten_stack_restore(add: integer): void;
  _emscripten_stack_alloc(size: integer): Addr;

  _initialize(): void;
  __indirect_function_table: WebAssembly.Table;
}

export interface Bindings {
  memory: WebAssembly.Memory;
  HEAP: Buffer;
  HEAP16: Int16Array;
  HEAP32: Int32Array;
  HEAP64: BigInt64Array;
  HEAPU16: Uint16Array;
  HEAPU32: Uint32Array;
  bindings: Native_;
}

export interface Handler {
  CSize(): integer; // .GE. 128 ...
  SCON_COUNT(): integer; // .GE. 1 ...
  NegateCclAny(): Array<integer>; // [13,10], [13], [10] ...

  /**
   *! if(!nil)
   *!     [0, 0x10FFFF] => [0, CSize()]
   *! else
   *!     (Char < 0 || Char > CSize()) => NilChar ...
   */
  LocalCharMapper(c: integer, nil: boolean): integer;

  /**
   *! [[:${name}:]]
   */
  GetNamedCcl(ccl: Set<integer>, name: string): void;

  /**
   *! {name}
   */
  GetNamedValue(name: string): Array<integer>;

  /**
   *!
   */
  SetNamedValue(name: string, re: Array<integer>): void;

  /**
   *!
   */
  LookupNamedValue(name: string): boolean;
}

export type YY_SCANNER_TABLE = Uint8Array | Uint16Array | Int32Array | Array<integer>;

export interface LexicalScanner {
  YY_LASTDFA: integer;
  YY_JAMBASE: integer;
  YY_DEFAULT: integer;
  YY_CHARSIZ: integer;
  YY_CHARNIL: integer;

  yy_accept: YY_SCANNER_TABLE;
  yy_ec: YY_SCANNER_TABLE;
  yy_meta: YY_SCANNER_TABLE;
  yy_base: YY_SCANNER_TABLE;
  yy_def: YY_SCANNER_TABLE;
  yy_nxt: YY_SCANNER_TABLE;
  yy_chk: YY_SCANNER_TABLE;
}

export function DebugTraceLexicalScanner(scanner: LexicalScanner) {
  const uses = new Array<boolean>(scanner.YY_DEFAULT + 1);

  uses.fill(false);
  uses[0] = true;

  for (const rule of scanner.yy_accept) {
    if (rule > 0 && rule <= scanner.YY_DEFAULT) uses[rule] = true;
  }

  uses.map((value, rule) => {
    if (!value && rule !== scanner.YY_DEFAULT) console.warn(`Warning, rule ${rule} cannot be matched!`);
  });

  function logValue(name: string, array: YY_SCANNER_TABLE) {
    function i4d(v: number) {
      return `   ${v}`.slice(-4);
    }

    const size = array.length;

    let max = 0;
    for (let i = 1; i < size; ++i) {
      console.assert(array[i] >= 0);
      max = Math.max(max, array[i]);
    }

    let s = `static const ${max > 0xffff ? "int32_t" : max > 0xff ? "uint16_t" : "uint8_t"} ${name}[${size}] = { ${
      array[0]
    },`;
    for (let i = 1; i < size; ++i) {
      if (i % 10 === 1) s += "\n";
      s += `${i4d(array[i])}${i === size - 1 ? " " : ","}`;
    }
    console.log(`${s} };\n\n`);
  }

  console.log(
    `${JSON.stringify(
      {
        YY_LASTDFA: scanner.YY_LASTDFA,
        YY_JAMBASE: scanner.YY_JAMBASE,
        YY_DEFAULT: scanner.YY_DEFAULT,
        YY_CHARSIZ: scanner.YY_CHARSIZ,
        YY_CHARNIL: scanner.YY_CHARNIL,
      },
      null,
      " "
    )}`
  );

  logValue("yy_accept", scanner.yy_accept);
  logValue("yy_ec", scanner.yy_ec);
  logValue("yy_meta", scanner.yy_meta);
  logValue("yy_base", scanner.yy_base);
  logValue("yy_def", scanner.yy_def);
  logValue("yy_nxt", scanner.yy_nxt);
  logValue("yy_chk", scanner.yy_chk);
}

export interface Generator {
  Close(): void;
  GetHandler(): Handler;
  AddShareSconList(scon: integer): void;

  SetSconListAny(): void;
  SetSconListShared(): void;
  SetSconList(sconlist: Array<integer>): void;

  GetCclAny(): integer;

  AddNewCCl(negate: boolean, cclist: Array<integer> | Set<integer>): integer;
  AddNewRule(bol: boolean, opcode: Array<integer>): integer;
  GenerateScanner(): LexicalScanner;

  ParseStream(StreamReader: (start: integer) => integer | Promise<integer>): Array<integer> | Promise<Array<integer>>;
  ParseText(TextReader: (start: integer) => integer): Array<integer>;
}

export async function CreateBindings(
  module: WebAssembly.Module,
  memory_initialize = 256,
  memory_limit = 16384
): Promise<Bindings> {
  let native: Native_, bindings: Bindings;

  const memory = new WebAssembly.Memory({ initial: memory_initialize, maximum: memory_limit });

  function emscripten_notify_memory_growth() {
    console.warn(`jsFlex.sbrk ${memory.buffer.byteLength >>> 10} KB`);
    bindings.HEAP = Buffer.from(memory.buffer);
    bindings.HEAP16 = new Int16Array(memory.buffer);
    bindings.HEAP32 = new Int32Array(memory.buffer);
    bindings.HEAP64 = new BigInt64Array(memory.buffer);
    bindings.HEAPU16 = new Uint16Array(memory.buffer);
    bindings.HEAPU32 = new Uint32Array(memory.buffer);
  }

  function jsLogWrite(level: integer, m: Addr, size: integer) {
    const message = bindings.HEAP.subarray(m, m + size).toString();
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

    return 1;
  }

  function indirect_invoke(index: integer, ...args: any[]) {
    const sp = native.emscripten_stack_get_current();
    try {
      return native.__indirect_function_table.get(index)(...args);
    } catch (e) {
      native._emscripten_stack_restore(sp);
      // @ts-ignore
      if (e !== e + 0) throw e;
      native.setThrew(1, 0);
    }
  }

  function jsGetTickCount() {
    return Date.now();
  }

  function _emscripten_throw_longjmp() {
    throw Infinity;
  }

  const instance = await WebAssembly.instantiate(module, {
    rLANG: {
      jsLogWrite,
      jsGetTickCount,
    },

    env: {
      memory,
      invoke_vi: indirect_invoke,
      invoke_vii: indirect_invoke,
      invoke_viii: indirect_invoke,
      invoke_viiii: indirect_invoke,
      invoke_viiiii: indirect_invoke,
      invoke_viiiiii: indirect_invoke,
      invoke_viiiiiii: indirect_invoke,

      invoke_ii: indirect_invoke,
      invoke_iii: indirect_invoke,
      invoke_iiii: indirect_invoke,
      invoke_iiiii: indirect_invoke,
      invoke_iiiiii: indirect_invoke,
      invoke_iiiiiii: indirect_invoke,

      emscripten_notify_memory_growth,
      _emscripten_throw_longjmp,
    },
  });

  native = <Native_>(<unknown>instance.exports);
  bindings = new (class {
    constructor() {
      this.memory = memory;
      this.HEAP = Buffer.from(memory.buffer);
      this.HEAP16 = new Int16Array(memory.buffer);
      this.HEAP32 = new Int32Array(memory.buffer);
      this.HEAP64 = new BigInt64Array(memory.buffer);
      this.HEAPU16 = new Uint16Array(memory.buffer);
      this.HEAPU32 = new Uint32Array(memory.buffer);
      this.bindings = native;
    }

    memory: WebAssembly.Memory;
    HEAP: Buffer;
    HEAP16: Int16Array;
    HEAP32: Int32Array;
    HEAP64: BigInt64Array;
    HEAPU16: Uint16Array;
    HEAPU32: Uint32Array;
    bindings: Native_;
  })();
  native._initialize();

  return bindings;
}

function ENOMEM() {
  throw new Error("ENOMEM");
}

function EINVAL() {
  throw new Error("EINVAL");
}
function EBADFD() {
  throw new Error("EBADFD");
}
function ERANGE() {
  throw new Error("ERANGE");
}

export class DefaultHandler implements Handler {
  constructor(CSIZE = 128, SCON_COUNT = 1) {
    console.assert(CSIZE >= 128 && CSIZE <= kMAX_CHAR && SCON_COUNT >= 1 && SCON_COUNT <= kMAX_SCON);
    this.CSIZE_ = CSIZE;
    this.SCON_COUNT_ = SCON_COUNT;
    this.mValues_ = new Map<string, Array<integer>>();
  }

  CSize(): integer {
    return this.CSIZE_;
  }

  SCON_COUNT(): integer {
    return this.SCON_COUNT_;
  }

  NegateCclAny(): Array<integer> {
    return [13, 10]; // [^\r\n] ...
  }

  GetNamedCcl(ccl: Set<integer>, name: string): void {
    const cclist = NamedCclMapper.get(name);
    if (!cclist) throw new Error(`ENOENT.CCL ${name}`);
    cclist(ccl);
  }

  GetNamedValue(name: string): Array<integer> {
    const value = this.mValues_.get(name);
    if (!value) throw new Error(`ENOENT.VAL ${name}`);
    return value;
  }

  SetNamedValue(name: string, re: Array<integer>) {
    this.mValues_.set(name, re);
  }

  LookupNamedValue(name: string): boolean {
    return this.mValues_.has(name);
  }

  LocalCharMapper(c: integer, nil: boolean): integer {
    return c;
  }

  CSIZE_: integer;
  SCON_COUNT_: integer;
  mValues_: Map<string, Array<integer>>;
}

function OpCodeValue(op: integer, val = 0) {
  return (op << 24) | val;
}

function string2array(s: string) {
  const result = <integer[]>[];
  const size = s.length;

  let i = 0;
  while (i < size) {
    const c = <integer>s.codePointAt(i);
    i += c > 0xffff ? 2 : 1;
    result.push(c);
  }

  return result;
}

const kReadMore = -1;
export class Machine {
  constructor(scanner: LexicalScanner) {
    this.scanner_ = scanner;

    this.yytext = <integer[]>[];
    this.yybol = true;
    this.yyeof = false;

    this.pos = 0;
    this.start = 0;
    this.current = 1 + /* bol */ 1;
    this.state_backup = this.position_backup = -1;
    this.state_stack = <integer[]>[0];
  }

  static string2array(s: string) {
    return string2array(s);
  }
  static array2string(s: Array<integer>) {
    return String.fromCodePoint(...s);
  }

  Initialize(s?: string | Array<integer>, eof = false) {
    if (typeof s === "string") {
      this.yytext = Machine.string2array(s);
      this.yyeof = eof;
    } else if (s !== void 0) {
      this.yytext = s;
      this.yyeof = eof;
    } else {
      this.yytext = <integer[]>[];
      this.yyeof = false;
    }

    this.pos = 0;
    this.start = 0;
    this.yybol = true;
    this.current = 1 + /* bol */ 1;
    this.state_backup = this.position_backup = -1;
    this.state_stack = <integer[]>[0];
  }

  PUSH_STACK(start: integer) {
    this.state_stack.push(start);
    this.start = start;
  }

  POP_STACK() {
    const size = this.state_stack.length;
    console.assert(size >= 2);
    this.start = this.state_stack[size - 2];
    this.state_stack.pop();
  }

  BEGIN(start: integer) {
    const size = this.state_stack.length;
    console.assert(size >= 1);
    this.start = this.state_stack[size - 1] = start;
  }

  YYSTART() {
    return this.start;
  }

  YYSIZE() {
    return this.pos;
  }

  YYCHAR(index: number) {
    console.assert(index < this.pos);
    return this.yytext[index];
  }

  YYTEXT() {
    return String.fromCodePoint(...this.yytext.slice(0, this.pos));
  }

  YYINPUT(s?: integer | string | Array<integer>) {
    switch (typeof s) {
      case "number":
        this.yytext.push(s);
        break;

      case "string":
        this.yytext = this.yytext.concat(string2array(s));
        break;

      default:
        if (!s) this.yyeof = true;
        else this.yytext = this.yytext.concat(s);
        break;
    }

    return this.Next_(true);
  }

  YYNEXTCHAR() {
    if (this.pos >= this.yytext.length) return -1;

    const result = this.yytext[this.pos];
    this.yybol = this.isBol_(result);

    this.yytext = this.yytext.slice(this.pos + 1);
    this.pos = 0;

    return result;
  }

  YYNEXT() {
    return this.Next_();
  }

  private Next_(input?: boolean) {
    if (input !== true) {
      this.current = 2 * this.start + 1 + (this.yybol ? 1 : 0);
      if (0 !== this.pos) {
        this.yytext = this.yytext.slice(this.pos);
        this.pos = 0;
      }
    }

    const scanner = this.scanner_;
    const size = this.yytext.length;
    for (;;) {
      if (this.pos >= size) {
        /* EOB */
        if (this.pos === 0) {
          if (this.yyeof) return 0;
          return kReadMore;
        } else if (this.yyeof) {
          break;
        } else {
          return kReadMore;
        }
      }

      let yyc = this.yytext[this.pos];
      if (yyc < 0 || yyc >= scanner.YY_CHARSIZ) yyc = scanner.YY_CHARNIL;
      else yyc = scanner.yy_ec[yyc];

      if (scanner.yy_accept[this.current]) {
        this.state_backup = this.current;
        this.position_backup = this.pos;
      }

      while (scanner.yy_chk[scanner.yy_base[this.current] + yyc] !== this.current) {
        if ((this.current = scanner.yy_def[this.current]) >= scanner.YY_LASTDFA + 2) yyc = scanner.yy_meta[yyc];
      }

      this.current = scanner.yy_nxt[scanner.yy_base[this.current] + yyc];
      ++this.pos;

      if (scanner.yy_base[this.current] == scanner.YY_JAMBASE) break;
    }

    let action = scanner.yy_accept[this.current];
    if (!action) {
      this.current = this.state_backup;
      this.pos = this.position_backup;
      action = scanner.yy_accept[this.current];
    }
    console.assert(this.pos > 0);
    this.yybol = this.isBol_(this.yytext[this.pos - 1]);
    return action;
  }

  isBol_(c: integer) {
    return c === 13 || c === 10;
  }

  readonly scanner_: LexicalScanner;

  yytext: Array<integer>;
  yybol: boolean;
  yyeof: boolean;

  pos: integer;
  start: integer;
  current: integer;

  state_backup: integer;
  position_backup: integer;
  state_stack: Array<integer>;
}

export function CreateBootstrapScanner(bindings: Bindings, csize = 128) {
  /**
     *!
     *!
     *!
     NOTNL			[^\r\n]
     ANYCHAR		[^[:space:]\\]
     BLANK 			[[:blank:]]
     ALPHA			[[:alpha:]]
     ALNUM_			[[:alnum:]_]
     DIGIT			[[:digit:]]
     HEX			[[:xdigit:]]
     OCT			[0-7]
     V0123			[0-3]
     CCLCC			[^\\\]\r\n]
     OPERATOR		[\*\+\?\.\(\)\{\}\|]

     NAME			{ALPHA}{ALNUM_}*
     NUMBER			{DIGIT}+

     ESCSEQ			\\({OCT}{1,2}|{V0123}{OCT}{2}|x{HEX}{1,2}|u{HEX}{4}|U{HEX}{6}|{NOTNL})
     CCLCHAR		{CCLCC}|{ESCSEQ}

     %option 7bit
     %x kSCON_QUOTE  kSCON_CCL

     %%

     <INITIAL>{
	\"							///@ kACT_QUOT_START
	\[\^?						///@ kACT_CCL_START
	"{"{NAME}"}"				///@ kACT_NAME_RESOLVE
	{OPERATOR}					///@ kACT_OPERATOR
	"{"{NUMBER}\,?"}"			///@ kACT_REPEAT1
	"{"{NUMBER}\,{NUMBER}"}"	///@ kACT_REPEAT2X
}

     <kSCON_QUOTE>{
	\"							///@ kACT_QUOTE_END
	{BLANK}						///@ kACT_QUOTE_BLANK
}

     <INITIAL,kSCON_QUOTE>{
	{ESCSEQ}					///@ kACT_ESC_CHAR
	{ANYCHAR}				    ///@ kACT_ANY_CHAR
}

     <kSCON_CCL>{
	\]							///@ kACT_CCL_END
	"[:"{NAME}":]"				///@ kACT_CCL_NAME
	{CCLCHAR}					///@ kACT_CCL_CHAR
	{CCLCHAR}-{CCLCHAR}			///@ kACT_CCL_CHAR2
}
     *!
     *!
     *!
     **/
  const handler = new DefaultHandler(csize, 3);
  const generator = CreateGenerator(handler, false, bindings);

  const ccl = new Set<integer>();
  function s2ccl(s: string) {
    const result = [];
    for (let i = 0; i < s.length; ++i) result.push(s.charCodeAt(i));
    return result;
  }

  const cclNotNL = generator.AddNewCCl(true, [13, 10]); // [^\r\n]

  ccl.add("\\".charCodeAt(0));
  handler.GetNamedCcl(ccl, "space");
  const cclAnyChar = generator.AddNewCCl(true, ccl); //  [^[:space:]\\]
  ccl.clear();

  handler.GetNamedCcl(ccl, "blank");
  const cclBlank = generator.AddNewCCl(false, ccl); // [[:blank:]]
  ccl.clear();

  handler.GetNamedCcl(ccl, "alpha");
  const cclAlpha = generator.AddNewCCl(false, ccl); // [[:alpha:]]
  ccl.clear();

  handler.GetNamedCcl(ccl, "alnum");
  ccl.add("_".charCodeAt(0));
  const cclAlnum_ = generator.AddNewCCl(false, ccl); // [[:alnum:]_]
  ccl.clear();

  handler.GetNamedCcl(ccl, "digit");
  const cclNumber = generator.AddNewCCl(false, ccl); // [[:digit:]]
  ccl.clear();

  handler.GetNamedCcl(ccl, "xdigit");
  const cclHex = generator.AddNewCCl(false, ccl); // [[:xdigit:]]
  ccl.clear();

  const cclOct = generator.AddNewCCl(false, s2ccl("01234567"));
  const cclV0123 = generator.AddNewCCl(false, s2ccl("0123"));
  const cclCclChar = generator.AddNewCCl(true, s2ccl("\\]\r\n"));
  const cclOperator = generator.AddNewCCl(false, s2ccl("*+?.(){}|"));

  const ESC_SEQ = [
    OpCodeValue(kOpCode.MakeChr, Char_ESC),

    // \\{OCT}{1,2}
    OpCodeValue(kOpCode.MakeCcl, cclOct),
    OpCodeValue(kOpCode.MakeRep2EX, 1),
    2,

    // \\{V0123}{OCT}{2}
    OpCodeValue(kOpCode.MakeCcl, cclV0123),
    OpCodeValue(kOpCode.MakeCcl, cclOct),
    OpCodeValue(kOpCode.MakeRep1, 2),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.MakeOr),

    // \\x{HEX}{1,2}
    OpCodeValue(kOpCode.MakeChr, "x".charCodeAt(0)),
    OpCodeValue(kOpCode.MakeCcl, cclHex),
    OpCodeValue(kOpCode.MakeRep2EX, 1),
    2,
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.MakeOr),

    // \\u{HEX}{4}
    OpCodeValue(kOpCode.MakeChr, "u".charCodeAt(0)),
    OpCodeValue(kOpCode.MakeCcl, cclHex),
    OpCodeValue(kOpCode.MakeRep1, 4),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.MakeOr),

    // \\U{HEX}{6}
    OpCodeValue(kOpCode.MakeChr, "U".charCodeAt(0)),
    OpCodeValue(kOpCode.MakeCcl, cclHex),
    OpCodeValue(kOpCode.MakeRep1, 6),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.MakeOr),

    // \\{NOTNL}
    OpCodeValue(kOpCode.MakeCcl, cclNotNL),
    OpCodeValue(kOpCode.MakeOr),

    // {ESC}({OCT2}|{OCT3}|{HEX2}|{UNI4}|{UNI6}|{NOTNL})
    OpCodeValue(kOpCode.LinkNil),
  ];

  const CCL_CHAR = [OpCodeValue(kOpCode.MakeCcl, cclCclChar)].concat(ESC_SEQ, OpCodeValue(kOpCode.MakeOr));

  generator.SetSconList([kSCON_INIT + 1]);
  let rule = generator.AddNewRule(false, [OpCodeValue(kOpCode.MakeChr, '"'.charCodeAt(0))]);
  console.assert(rule === kACT_QUOT_START);

  rule = generator.AddNewRule(false, [
    OpCodeValue(kOpCode.MakeChr, "[".charCodeAt(0)),
    OpCodeValue(kOpCode.MakeChr, "^".charCodeAt(0)),
    OpCodeValue(kOpCode.MakeOpt),
    OpCodeValue(kOpCode.LinkNil),
  ]);
  console.assert(rule === kACT_CCL_START);

  rule = generator.AddNewRule(false, [
    /// "{"{NAME}"}"
    OpCodeValue(kOpCode.MakeChr, Char_left_braces),
    OpCodeValue(kOpCode.MakeCcl, cclAlpha),
    OpCodeValue(kOpCode.MakeCcl, cclAlnum_),
    OpCodeValue(kOpCode.MakeClos),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.MakeChr, Char_right_braces),
    OpCodeValue(kOpCode.LinkNil),
  ]);
  console.assert(rule === kACT_NAME_RESOLVE);

  rule = generator.AddNewRule(false, [OpCodeValue(kOpCode.MakeCcl, cclOperator)]);
  console.assert(rule === kACT_OPERATOR);

  rule = generator.AddNewRule(false, [
    /// "{"{NUMBER},?"}"
    OpCodeValue(kOpCode.MakeChr, Char_left_braces),
    OpCodeValue(kOpCode.MakeCcl, cclNumber),
    OpCodeValue(kOpCode.MakePoscl),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.MakeChr, Char_Comma),
    OpCodeValue(kOpCode.MakeOpt),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.MakeChr, Char_right_braces),
    OpCodeValue(kOpCode.LinkNil),
  ]);
  console.assert(rule === kACT_REPEAT1);

  rule = generator.AddNewRule(false, [
    /// "{"{NUMBER},{NUMBER}"}"
    OpCodeValue(kOpCode.MakeChr, Char_left_braces),
    OpCodeValue(kOpCode.MakeCcl, cclNumber),
    OpCodeValue(kOpCode.MakePoscl),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.MakeChr, Char_Comma),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.MakeCcl, cclNumber),
    OpCodeValue(kOpCode.MakePoscl),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.MakeChr, Char_right_braces),
    OpCodeValue(kOpCode.LinkNil),
  ]);
  console.assert(rule === kACT_REPEAT2X);

  generator.SetSconList([kSCON_QUOTE + 1]);
  rule = generator.AddNewRule(false, [OpCodeValue(kOpCode.MakeChr, '"'.charCodeAt(0))]);
  console.assert(rule === kACT_QUOTE_END);

  rule = generator.AddNewRule(false, [OpCodeValue(kOpCode.MakeCcl, cclBlank)]);
  console.assert(rule === kACT_QUOTE_BLANK);

  generator.SetSconList([kSCON_INIT + 1, kSCON_QUOTE + 1]);
  rule = generator.AddNewRule(false, ESC_SEQ);
  console.assert(rule === kACT_ESC_CHAR);

  rule = generator.AddNewRule(false, [OpCodeValue(kOpCode.MakeCcl, cclAnyChar)]);
  console.assert(rule === kACT_ANY_CHAR);

  generator.SetSconList([kSCON_CCL + 1]);
  rule = generator.AddNewRule(false, [OpCodeValue(kOpCode.MakeChr, "]".charCodeAt(0))]);
  console.assert(rule === kACT_CCL_END);

  rule = generator.AddNewRule(false, [
    OpCodeValue(kOpCode.MakeChr, "[".charCodeAt(0)),
    OpCodeValue(kOpCode.LinkChr, ":".charCodeAt(0)),
    OpCodeValue(kOpCode.MakeCcl, cclAlpha),
    OpCodeValue(kOpCode.MakeCcl, cclAlnum_),
    OpCodeValue(kOpCode.MakeClos),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.LinkNil),
    OpCodeValue(kOpCode.LinkChr, ":".charCodeAt(0)),
    OpCodeValue(kOpCode.LinkChr, "]".charCodeAt(0)),
  ]);
  console.assert(rule === kACT_CCL_NAME);

  rule = generator.AddNewRule(false, CCL_CHAR);
  console.assert(rule === kACT_CCL_CHAR);

  rule = generator.AddNewRule(
    false,
    CCL_CHAR.concat(OpCodeValue(kOpCode.LinkChr, Char_hyphen), CCL_CHAR, OpCodeValue(kOpCode.LinkNil))
  );
  console.assert(rule === kACT_CCL_CHAR2);

  return generator.GenerateScanner();
}

export function CreateGenerator(handler: Handler, caseless: boolean, bindings: Bindings): Generator {
  const CSIZE = handler.CSize();
  const SCON_COUNT = handler.SCON_COUNT();
  const native = bindings.bindings;
  const NILCHAR = CSIZE + 1;

  let cclAny = -1;
  if (CSIZE < 128 || CSIZE > kMAX_CHAR || SCON_COUNT < 1 || SCON_COUNT > kMAX_SCON) EINVAL();

  ///!
  ///! 0 => CSIZE, $(NILCHAR) => CSIZE + 1, $(EPSILON) => CSIZE + 2 ...
  ///!
  let jsGenerator = native.jsGenerator_yyCreate(CSIZE + 2, SCON_COUNT, caseless ? 1 : 0, 0, 0);

  function realloc(pointer: Addr, size: integer) {
    console.assert(pointer >= 0 && size >= 0);
    if (jsGenerator < 0) EBADFD();
    const result = native.jsGenerator_MemoryRealloc(jsGenerator, pointer, size);
    if (0 === result && 0 !== size) ENOMEM();
    return result;
  }
  function malloc(size: integer) {
    return realloc(0, size);
  }
  function free(pointer: Addr) {
    return realloc(pointer, 0);
  }

  function CheckAlive() {
    if (jsGenerator < 0) EBADFD();
    return jsGenerator;
  }

  function superClose() {
    if (jsGenerator > 0) native.jsGenerator_yyDestroy(jsGenerator);
    jsGenerator = -1;
  }

  function CheckNativeError(result: integer) {
    if (result < 0) {
      superClose();
      throw new Error(`Native.Error ${result}`);
    }
    return result;
  }

  function CharMapper(c: integer): integer {
    c = handler.LocalCharMapper(c, false) | 0;
    if (c < 0 || c > CSIZE) ERANGE();
    if (0 === c) c = CSIZE;
    return c;
  }

  function CreateScanner(addr: Addr): LexicalScanner {
    const HEAP32 = bindings.HEAP32;
    const scanner = HEAP32.subarray(addr >>> 2, (addr >>> 2) + 20);
    console.assert(scanner[3] === CSIZE + 2 && scanner[3] === scanner[7]);

    function CharMapperNil(c: integer): integer {
      c = handler.LocalCharMapper(c, true) | 0;
      if (c < 0 || c > CSIZE) c = NILCHAR;
      return c;
    }

    function GenArray(offset: integer, size: integer) {
      let max = 0;

      offset >>>= 2;
      const arr = HEAP32.subarray(offset, offset + size);

      // @ts-ignore
      for (const v of arr) {
        console.assert(v >= 0);
        if (v > max) max = v;
      }

      const result =
        max <= 0x00ff ? new Uint8Array(size) : max <= 0xffff ? new Uint16Array(size) : new Int32Array(size);
      for (let i = 0; i < size; ++i) result[i] = arr[i];
      return result;
    }

    const ec = HEAP32.subarray(scanner[6] >>> 2, (scanner[6] >>> 2) + scanner[7]);
    ec[0] = ec[CSIZE]; // '\0' ... ...

    for (let c = 1; c < CSIZE; ++c) {
      const cc = CharMapperNil(c);
      if (cc !== c) ec[c] = ec[cc];
    }

    const YY_LASTDFA = scanner[0];
    const YY_JAMBASE = scanner[1];
    const YY_DEFAULT = scanner[2];
    const YY_CHARSIZ = CSIZE;
    const YY_CHARNIL = ec[NILCHAR];

    const yy_accept = GenArray(scanner[4], scanner[5]);
    const yy_ec = GenArray(scanner[6], CSIZE);
    const yy_meta = GenArray(scanner[8], scanner[9]);
    const yy_base = GenArray(scanner[10], scanner[11]);
    const yy_def = GenArray(scanner[12], scanner[13]);
    const yy_nxt = GenArray(scanner[14], scanner[15]);
    const yy_chk = GenArray(scanner[16], scanner[17]);

    return {
      YY_LASTDFA,
      YY_JAMBASE,
      YY_DEFAULT,
      YY_CHARSIZ,
      YY_CHARNIL,

      yy_accept,
      yy_ec,
      yy_meta,
      yy_base,
      yy_def,
      yy_nxt,
      yy_chk,
    };
  }

  let regExpScanner: undefined | LexicalScanner;

  const jsHelper_resume_reduce = -2;
  const jsHelper_resume_initialize = -1;
  const kMaxIterValue = 0xffff;

  function parser(
    StreamReader: (start: integer) => integer | Promise<integer>,
    generator: Generator,
    sync = false
  ): Array<integer> | Promise<Array<integer>> {
    if (!regExpScanner) regExpScanner = CreateBootstrapScanner(bindings, CSIZE);
    const tokenize = new Machine(regExpScanner);

    const jsHelper = malloc(1024);
    const yyvalue = new Map<integer, Array<integer>>(),
      yyccl = new Set<integer>(),
      tokens = <integer[]>[];
    let nextValue = 1,
      v1: integer,
      v2: integer,
      v3: integer,
      yynegccl = false;

    function yyVar(index: integer) {
      return native.jsHelper_yyVar(jsHelper, index);
    }
    function yySetVal(value: integer) {
      native.jsHelper_yySetVal(jsHelper, value);
    }
    function yyGetVal() {
      return native.jsHelper_yyGetVal(jsHelper);
    }

    function getValue(v: integer) {
      const result = yyvalue.get(v);
      if (!result) throw new Error(`yyvalue ${v} 404 Not Found!`);
      return result;
    }

    function link(a: integer, b: integer, op: integer) {
      const left = getValue(a);
      const right = getValue(b);
      console.assert(a !== b && left && right);
      yyvalue.set(a, left.concat(right, op));
      yyvalue.delete(b);
    }

    function push_token(token: integer | string, value = 0) {
      if (typeof token === "string") {
        const size = token.length;
        for (let i = 0; i < size; ++i) tokens.push(token.charCodeAt(i), value);
      } else {
        tokens.push(token, value);
      }
    }

    function yylex_ext_resolve() {
      const name = Machine.array2string(tokenize.yytext.slice(1, tokenize.yytext.length - 1));
      const code = [...handler.GetNamedValue(name)]; // Copy Array ...
      const value = ++nextValue;
      yyvalue.set(value, code);
      push_token(Token.TK_EXT, value);
    }

    function yylex_ccl_resolve() {
      const name = Machine.array2string(tokenize.yytext.slice(2, tokenize.yytext.length - 2));
      handler.GetNamedCcl(yyccl, name);
    }

    function yychar(c: integer) {
      push_token(Token.TK_CHAR, CharMapper(c));
    }

    function hex2val(c: integer) {
      if (c < Char_A) c -= Char_0;
      else if (c < Char_a) c = c - Char_A + 10;
      else c = c - Char_a + 10;
      return c;
    }

    function esc1(c: integer) {
      switch (c) {
        case Char_r: // \r
          return CharESC_r;
        case Char_n: // \n
          return CharESC_n;
        case Char_b: // \b
          return CharESC_b;
        case Char_t: // \t
          return CharESC_t;
        case Char_v: // \v
          return CharESC_v;
        case Char_f: // \f
          return CharESC_f;
        default:
          return c;
      }
    }

    function yyesc0(): [c: integer, offset: integer] {
      let c = tokenize.YYCHAR(0);
      if (Char_ESC !== c) return [c, 2];

      c = tokenize.YYCHAR(1);
      if (c === Char_x || c === Char_u || c === Char_U) {
        let value = 0;
        for (let i = 2; ; ++i) {
          c = tokenize.YYCHAR(i);
          if (c === Char_hyphen) return [value, i + 1];
          value = (value << 4) | hex2val(c);
        }
      } else {
        if (c >= Char_0 && c <= Char_0 + 7) {
          let value = c - Char_0;
          for (let i = 2; ; ++i) {
            c = tokenize.YYCHAR(i);
            if (c === Char_hyphen) return [value, i + 1];
            value = (value << 3) + c - Char_0;
          }
        } else {
          return [esc1(c), 3];
        }
      }
    }

    function yycharesc(s = 0) {
      let c = tokenize.YYCHAR(s);
      if (Char_ESC !== c) return c;

      c = tokenize.YYCHAR(s + 1);
      if (c === Char_x || c === Char_u || c === Char_U) {
        let value = 0;
        const size = tokenize.YYSIZE();
        for (let i = s + 2; i < size; ++i) value = (value << 4) | hex2val(tokenize.YYCHAR(i));
        return value;
      } else {
        if (c >= Char_0 && c <= Char_0 + 7) {
          const size = tokenize.YYSIZE();
          let value = c - Char_0;
          for (let i = s + 2; i < size; ++i) value = (value << 3) + tokenize.YYCHAR(i) - Char_0;
          return value;
        } else {
          return esc1(c);
        }
      }
    }

    function yyNextState(token: integer) {
      return native.jsHelper_yyNextState(jsHelper, token);
    }

    function action(rlCode: integer) {
      switch (rlCode) {
        case kACT_QUOT_START:
          tokenize.PUSH_STACK(kSCON_QUOTE);
          push_token('"');
          break;

        case kACT_CCL_START:
          tokenize.PUSH_STACK(kSCON_CCL);
          yynegccl = tokenize.YYSIZE() > 1;
          break;

        case kACT_NAME_RESOLVE:
          yylex_ext_resolve();
          break;

        case kACT_OPERATOR:
          push_token(tokenize.YYCHAR(0));
          break;

        case kACT_REPEAT1:
          push_token(Char_left_braces);
          for (let i = 1, Value = 0; ; ++i) {
            const v = tokenize.YYCHAR(i);
            if (v === Char_Comma || v === Char_right_braces) {
              push_token(Token.TK_NUMBER, Value);
              if (v === Char_Comma) push_token(Char_Comma);
              break;
            }
            Value = Value * 10 + v - Char_0;
          }
          push_token(Char_right_braces);
          break;

        case kACT_REPEAT2X:
          push_token(Char_left_braces);
          for (let i = 1, num1 = 0; ; ++i) {
            const v = tokenize.YYCHAR(i);
            if (v === Char_Comma) {
              push_token(Token.TK_NUMBER, num1);
              push_token(Char_Comma);
              for (let j = i + 1, num2 = 0; ; ++j) {
                const v2 = tokenize.YYCHAR(j);
                if (v2 === Char_right_braces) {
                  push_token(Token.TK_NUMBER, num2);
                  break;
                }
                num2 = num2 * 10 + v2 - Char_0;
              }
              break;
            }
            num1 = num1 * 10 + v - Char_0;
          }
          push_token(Char_right_braces);
          break;

        case kACT_QUOTE_END:
          push_token('"');
          tokenize.POP_STACK();
          break;

        case kACT_QUOTE_BLANK:
          yychar(tokenize.YYCHAR(0));
          break;

        case kACT_ESC_CHAR:
          yychar(yycharesc());
          break;

        case kACT_ANY_CHAR:
          yychar(tokenize.YYCHAR(0));
          break;

        case kACT_CCL_END:
          v2 = generator.AddNewCCl(yynegccl, yyccl);
          push_token(Token.TK_CCL, v2);
          tokenize.POP_STACK();
          yyccl.clear();
          break;

        case kACT_CCL_NAME:
          yylex_ccl_resolve();
          break;

        case kACT_CCL_CHAR:
          yyccl.add(yycharesc());
          break;

        case kACT_CCL_CHAR2:
          [v1, v3] = yyesc0();
          v2 = yycharesc(v3);
          if (v1 < 0 || v1 > v2 || v2 > kMAX_CHAR) throw new Error(`RegExp.scanner ccl.range Error ${v1}-${v2}`);
          while (v1 <= v2) yyccl.add(v1++);
          break;

        default:
          throw new Error(`RegExp.scanner invalid character ${tokenize.YYCHAR(0)}`);
      }
    }

    function reduce(rlCode: integer) {
      switch (rlCode) {
        case Action.AC_RE_SERIES: // re: series
          break;

        case Action.AC_RE2_SERIES: // re: re '|' series
          v1 = yyVar(1);
          v2 = yyVar(3);
          link(v1, v2, OpCodeValue(kOpCode.MakeOr));
          break;

        case Action.AC_SERIES_SINGLETON: // series: singleton
          break;

        case Action.AC_SERIES2_SINGLETON: // series: series singleton
          v1 = yyVar(1);
          v2 = yyVar(2);
          link(v1, v2, OpCodeValue(kOpCode.LinkNil));
          break;

        case Action.AC_SINGLETON_RE: // singleton: '(' re ')'
          v1 = yyVar(2);
          yySetVal(v1);
          break;

        case Action.AC_SINGLETON_MKCLOS: // singleton: singleton '*'
          v1 = yyVar(1);
          getValue(v1).push(OpCodeValue(kOpCode.MakeClos));
          break;

        case Action.AC_SINGLETON_MKPOSCL: // singleton: singleton '+'
          v1 = yyVar(1);
          getValue(v1).push(OpCodeValue(kOpCode.MakePoscl));
          break;

        case Action.AC_SINGLETON_MKOPT: // singleton: singleton '?'
          v1 = yyVar(1);
          getValue(v1).push(OpCodeValue(kOpCode.MakeOpt));
          break;

        case Action.AC_SINGLETON_MKREP1: // singleton: singleton '{' TK_NUMBER '}'
          v1 = yyVar(1);
          v2 = yyVar(3);
          if (v2 <= 0 || v2 > kMaxIterValue) EINVAL();
          getValue(v1).push(OpCodeValue(kOpCode.MakeRep1, v2));
          break;

        case Action.AC_SINGLETON_MKREP1X: // singleton: singleton '{' TK_NUMBER ',' '}'
          v1 = yyVar(1);
          v2 = yyVar(3);
          if (v2 <= 0 || v2 > kMaxIterValue) EINVAL();
          getValue(v1).push(OpCodeValue(kOpCode.MakeRep1X, v2));
          break;

        case Action.AC_SINGLETON_MKREP2EX: // singleton: singleton '{' TK_NUMBER ',' TK_NUMBER '}'
          v1 = yyVar(1);
          v2 = yyVar(3);
          v3 = yyVar(5);
          if (v2 < 0 || v2 > v3 || (v2 === 0 && v3 === 0) || v3 > kMaxIterValue) EINVAL();
          getValue(v1).push(OpCodeValue(kOpCode.MakeRep2EX, v2), v3);
          break;

        case Action.AC_SINGLETON_CHAR: // singleton: TK_CHAR
          v1 = ++nextValue;
          v2 = yyVar(1);
          yyvalue.set(v1, [OpCodeValue(kOpCode.MakeChr, v2)]);
          yySetVal(v1);
          break;

        case Action.AC_SINGLETON_CCL: // singleton: TK_CCL
          v1 = ++nextValue;
          v2 = yyVar(1);
          yyvalue.set(v1, [OpCodeValue(kOpCode.MakeCcl, v2)]);
          yySetVal(v1);
          break;

        case Action.AC_SINGLETON_EMPTY: // singleton: '"' '"'
          v1 = ++nextValue;
          yyvalue.set(v1, [OpCodeValue(kOpCode.MakeNil)]);
          yySetVal(v1);
          break;

        case Action.AC_SINGLETON_STRING: // singleton: '"' string '"'
          v2 = yyVar(2);
          yySetVal(v2);
          break;

        case Action.AC_SINGLETON_EXT: // singleton: TK_EXT
          break;

        case Action.AC_SINGLETON_ANYCHR:
          v1 = ++nextValue;
          yyvalue.set(v1, [OpCodeValue(kOpCode.MakeCcl, generator.GetCclAny())]);
          yySetVal(v1);
          break;

        case Action.AC_STRING_CHAR: // string: TK_CHAR
          v1 = ++nextValue;
          v2 = yyVar(1);
          yyvalue.set(v1, [OpCodeValue(kOpCode.MakeChr, v2)]);
          yySetVal(v1);
          break;

        case Action.AC_STRING2_CHAR: // string: string TK_CHAR
          v1 = yyVar(1);
          v2 = yyVar(2);
          getValue(v1).push(OpCodeValue(kOpCode.LinkChr, v2));
          break;

        default:
          console.assert(false);
          break;
      }
    }

    function grammar() {
      const size = tokens.length;
      for (let off = 0; off < size; off += 2) {
        native.jsHelper_yySetLval(jsHelper, tokens[off + 1]);
        let rlCode = yyNextState(tokens[off]);

        for (;;) {
          if (rlCode > 0) {
            reduce(rlCode);
            rlCode = yyNextState(jsHelper_resume_reduce);
          } else {
            if (rlCode === -1) break;

            if (0 === rlCode) return 0;

            throw new Error(`RegExp.parser Error ${rlCode}`);
          }
        }
      }

      tokens.length = 0;
      return -1;
    }

    function yylex(cc: integer) {
      if (cc < 0) throw new Error(`RegExp.reader Error ${cc}`);

      let rlCode = tokenize.YYINPUT(cc > 0 ? cc : void 0);

      for (;;) {
        if (rlCode <= 0) {
          if (rlCode >= -1) {
            if (0 === rlCode) tokens.push(0, 0);
            return tokens.length;
          } else {
            throw new Error(`RegExp.scanner Error ${rlCode}`);
          }
        }

        action(rlCode);
        rlCode = tokenize.YYNEXT();
      }
    }

    yyNextState(jsHelper_resume_initialize);
    let rlCode: integer | Promise<integer>;

    try {
      for (;;) {
        rlCode = StreamReader(tokenize.YYSTART());
        if (typeof rlCode !== "number") break;
        if (yylex(rlCode) > 0 && 0 === grammar()) return getValue(yyGetVal());
      }
    } catch (e) {
      free(jsHelper);
      if (sync) throw e;
      else return Promise.reject(e);
    }

    if (sync) {
      free(jsHelper);
      throw new Error(`ParseText Error ${rlCode}`);
    }

    return new Promise((resolve, reject) => {
      function loop(code?: integer): 0 | Promise<integer> {
        if (typeof code !== "number") {
          const next = StreamReader(tokenize.YYSTART());
          if (typeof next !== "number") return next;
          code = next;
        }

        for (;;) {
          if (yylex(code) > 0 && 0 === grammar()) return 0;

          const next = StreamReader(tokenize.YYSTART());
          if (typeof next !== "number") return next;
          code = next;
        }
      }

      (function poll(code: Promise<integer> | integer) {
        try {
          let promise: Promise<integer>;

          if (typeof code === "number") {
            const v = loop(code);
            if (0 === v) {
              free(jsHelper);
              return resolve(getValue(yyGetVal()));
            } else {
              promise = v;
            }
          } else {
            promise = code;
          }

          promise
            .then((next) => {
              poll(next);
            })
            .catch((e) => {
              free(jsHelper);
              return reject(e);
            });
        } catch (e) {
          free(jsHelper);
          return reject(e);
        }
      })(<Promise<integer>>rlCode);
    });
  }

  class SimpleGenerator implements Generator {
    GetHandler() {
      return handler;
    }

    AddNewCCl(negate: boolean, cclist: Array<integer> | Set<integer>): integer {
      CheckAlive();
      let list = <Array<integer>>[];
      // @ts-ignore
      for (const v of cclist) list.push(CharMapper(v));
      list = list.sort((a, b) => {
        return a - b;
      });

      const memory = malloc(4 * list.length);
      for (let i = list.length - 1; i >= 0; --i) bindings.HEAP32[(memory >>> 2) + i] = list[i];
      const result = native.jsGenerator_AddNewCCl(jsGenerator, negate ? 1 : 0, list.length, memory);
      free(memory);

      return CheckNativeError(result);
    }

    GetCclAny(): integer {
      if (cclAny < 0) cclAny = this.AddNewCCl(true, handler.NegateCclAny());
      return cclAny;
    }

    AddNewRule(bol: boolean, opcode: Array<integer>): integer {
      CheckAlive();

      const memory = malloc(4 * opcode.length);
      for (let i = opcode.length - 1; i >= 0; --i) bindings.HEAP32[(memory >>> 2) + i] = opcode[i];
      const result = native.jsGenerator_AddNewRule(jsGenerator, bol ? 1 : 0, opcode.length, memory);
      free(memory);

      return CheckNativeError(result);
    }

    AddShareSconList(scon: integer): void {
      if (scon < 1 || scon > SCON_COUNT) EINVAL();
      const result = native.jsGenerator_AddShareSconList(jsGenerator, scon);
      CheckNativeError(result);
    }

    Close(): void {
      superClose();
    }

    GenerateScanner(): LexicalScanner {
      CheckAlive();

      const sp = native.emscripten_stack_get_current();
      const addr = native._emscripten_stack_alloc(256);
      const result = native.jsGenerator_GenerateScanner(jsGenerator, addr);
      const scanner = result >= 0 ? CreateScanner(addr) : undefined;
      native._emscripten_stack_restore(sp);
      superClose();

      CheckNativeError(result);
      return <LexicalScanner>scanner;
    }

    SetSconList(sconlist: Array<integer>): void {
      if (sconlist.length === 0) return this.SetSconListShared();

      CheckAlive();
      for (const v of sconlist) {
        if (v < 1 || v > SCON_COUNT) EINVAL();
      }
      const memory = malloc(4 * sconlist.length);
      for (let i = sconlist.length - 1; i >= 0; --i) bindings.HEAP32[(memory >>> 2) + i] = sconlist[i];
      const result = native.jsGenerator_SetSconList(jsGenerator, sconlist.length, memory);
      free(memory);

      CheckNativeError(result);
    }

    SetSconListAny(): void {
      CheckAlive();
      const result = native.jsGenerator_SetSconList(jsGenerator, -1, 0);
      CheckNativeError(result);
    }

    SetSconListShared(): void {
      CheckAlive();
      const result = native.jsGenerator_SetSconList(jsGenerator, 0, 0);
      CheckNativeError(result);
    }

    ParseStream(
      StreamReader: (start: integer) => integer | Promise<integer>
    ): Array<integer> | Promise<Array<integer>> {
      CheckAlive();
      return parser(StreamReader, this);
    }

    ParseText(TextReader: (start: integer) => integer): Array<integer> {
      CheckAlive();
      return <Array<integer>>parser(TextReader, this, true);
    }
  }

  return new SimpleGenerator();
}
