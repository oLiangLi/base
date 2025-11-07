import { Token } from "../grammar/scenario.jy.js";

import {
  Machine,
  LexicalScanner,
  DefaultHandler,
  DefaultNamedCCl,
  CreateGenerator,
  CreateBindings,
} from "../../jsFlex/jsFlex.js";

import { integer, TypeGrammar, Context, TokenCCl, TokenExtRef } from "./grammar.js";

import * as jsFlexBinary from "../../Assembly/jsLex_wasm.js";

const enum SC {
  INITIAL,
  SC_MCOMM,
  SC_SCOMM,
  SC_REGEXP,
  SC_RE_QUOT,
  SC_RE_CCL,

  $SC_MAXIMUM,
}

const enum AC {
  AC_MCOMM_END = 1,
  AC_MCOMM_NL,

  AC_SCOMM_END,

  AC_COMM_ANY,

  AC_REGEXP_END,
  AC_REGEXP_QUOT,
  AC_REGEXP_CCL,
  AC_REGEXP_EXT1,
  AC_REGEXP_EXT2,
  AC_REGEXP_OP,
  AC_REGEXP_REP1,
  AC_REGEXP_REP2,

  AC_REGEXP_QUOT_END,
  AC_REGEXP_QUOT_BLANK,

  AC_REGEXP_ESCSEQ,
  AC_REGEXP_ANYCHAR,

  AC_REGEXP_CCL_END,
  AC_REGEXP_CCL_REF1,
  AC_REGEXP_CCL_REF2,
  AC_REGEXP_CCL_CHAR1,
  AC_REGEXP_CCL_CHAR2,

  AC_NL,
  AC_WS,
  AC_MCOMM,
  AC_SCOMM,
  AC_REGEXP,

  AC_PACKAGE,
  AC_SCENARIO,
  AC_STATE,
  AC_EVENT,
  AC_GROUP,
  AC_DEFINE,
  AC_ACTION,
  AC_EXPORT,
  AC_RESERVED,

  AC_NAME,
  AC_OP,
}

type TypeToken = integer | [integer, TypeGrammar];
function charCode(v: string) {
  return v.charCodeAt(0);
}

const Char_A = charCode("A");
const Char_a = charCode("a");
const Char_0 = charCode("0");
const Char_ESC = charCode("\\");

const Char_x = charCode("x");
const Char_u = charCode("u");
const Char_U = charCode("U");
const Char_hyphen = charCode("-");

const Char_r = charCode("r");
const Char_n = charCode("n");
const Char_b = charCode("b");
const Char_t = charCode("t");
const Char_v = charCode("v");
const Char_f = charCode("f");

const CharESC_r = charCode("\r");
const CharESC_n = charCode("\n");
const CharESC_b = charCode("\b");
const CharESC_t = charCode("\t");
const CharESC_v = charCode("\v");
const CharESC_f = charCode("\f");

const kMaxChar = 255;

function check_char(c: integer) {
  if (c < 0 || c > kMaxChar) throw RangeError(`Tokenize: Character ${c} out-of-range [0, ${kMaxChar}]`);
  return c;
}
function map_char(c: integer) {
  return 0 === c ? 0x100 : c;
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
      return check_char(c);
  }
}

function hex2val(c: integer) {
  if (c < Char_A) c -= Char_0;
  else if (c < Char_a) c = c - Char_A + 10;
  else c = c - Char_a + 10;
  return c;
}

function yy_esc0(tokenize: Machine): [c: integer, offset: integer] {
  let c = tokenize.YYCHAR(0);
  if (Char_ESC !== c) {
    return [check_char(c), 2];
  }

  c = tokenize.YYCHAR(1);
  if (c === Char_x || c === Char_u || c === Char_U) {
    let value = 0;
    for (let i = 2; ; ++i) {
      c = tokenize.YYCHAR(i);
      if (c === Char_hyphen) return [check_char(value), i + 1];
      value = (value << 4) | hex2val(c);
    }
  } else {
    if (c >= Char_0 && c <= Char_0 + 7) {
      let value = c - Char_0;
      for (let i = 2; ; ++i) {
        c = tokenize.YYCHAR(i);
        if (c === Char_hyphen) return [check_char(value), i + 1];
        value = (value << 3) + c - Char_0;
      }
    } else {
      return [esc1(c), 3];
    }
  }
}

function yy_esc1(tokenize: Machine, s = 0) {
  let c = tokenize.YYCHAR(s);
  if (Char_ESC !== c) return check_char(c);

  c = tokenize.YYCHAR(s + 1);
  if (c === Char_x || c === Char_u || c === Char_U) {
    let value = 0;
    const size = tokenize.YYSIZE();
    for (let i = s + 2; i < size; ++i) value = (value << 4) | hex2val(tokenize.YYCHAR(i));
    return check_char(value);
  } else {
    if (c >= Char_0 && c <= Char_0 + 7) {
      const size = tokenize.YYSIZE();
      let value = c - Char_0;
      for (let i = s + 2; i < size; ++i) value = (value << 3) + tokenize.YYCHAR(i) - Char_0;
      return check_char(value);
    } else {
      return esc1(c);
    }
  }
}

export class Tokenize {
  static async CreateBindings(memory_initialize = 256, memory_limit = 16384) {
    if (!Tokenize.wasmModule_) Tokenize.wasmModule_ = await WebAssembly.compile(jsFlexBinary.Assets());
    return await CreateBindings(Tokenize.wasmModule_, memory_initialize, memory_limit);
  }

  static async Create(context: Context) {
    const bindings = await Tokenize.CreateBindings();

    class Group {
      static Create(...starts: Array<integer>) {
        return new Group([...starts]);
      }
      private constructor(starts: Array<integer>) {
        this.starts_ = starts;
        this.rules_ = [];
      }

      Add(action: integer, re: string) {
        this.rules_.push([action, re]);
        return this;
      }

      starts_: Array<integer>;
      rules_: Array<[integer, string]>;
    }

    const defines = new Map<string, string>();
    const groups = <Group[]>[];

    defines.set("NL", "\\r\\n|\\r|\\n");
    defines.set("NOTNL", "[^\\r\\n]");
    defines.set("ANYCHAR", "[^[:space:]\\\\]");
    defines.set("BLANK", "[[:blank:]]");
    defines.set("ALPHA", "[[:alpha:]]");
    defines.set("ALNUM_", "[[:alnum:]_]");
    defines.set("DIGIT", "[[:digit:]]");
    defines.set("HEX", "[[:xdigit:]]");
    defines.set("OCT", "[0-7]");
    defines.set("V0123", "[0123]");
    defines.set("CCLCC", "[^\\\\\\]\\r\\n]");
    defines.set("OPERATOR", "[\\*\\+\\?\\.\\(\\)\\{\\}\\|]");
    defines.set("NAME", "{ALPHA}{ALNUM_}*");
    defines.set("NAME2", "{NAME}\\.{NAME}");
    defines.set("NUMBER", "{DIGIT}+");
    defines.set("ESCSEQ", "\\\\({OCT}{1,2}|{V0123}{OCT}{2}|x{HEX}{1,2}|u{HEX}{4}|U{HEX}{6}|{NOTNL})");
    defines.set("CCLCHAR", "{CCLCC}|{ESCSEQ}");

    groups.push(
      Group.Create(SC.SC_MCOMM).Add(AC.AC_MCOMM_END, '"*/"').Add(AC.AC_MCOMM_NL, "{NL}"),

      Group.Create(SC.SC_SCOMM).Add(AC.AC_SCOMM_END, "{NL}"),

      Group.Create(SC.SC_MCOMM, SC.SC_SCOMM).Add(AC.AC_COMM_ANY, "{NOTNL}"),

      Group.Create(SC.SC_REGEXP)
        .Add(AC.AC_REGEXP_END, "\\/")
        .Add(AC.AC_REGEXP_QUOT, '\\"')
        .Add(AC.AC_REGEXP_CCL, "\\[\\^?")
        .Add(AC.AC_REGEXP_EXT1, '"{"{NAME}"}"')
        .Add(AC.AC_REGEXP_EXT2, '"{"{NAME2}"}"')
        .Add(AC.AC_REGEXP_OP, "{OPERATOR}")
        .Add(AC.AC_REGEXP_REP1, '"{"{NUMBER}\\,?"}"')
        .Add(AC.AC_REGEXP_REP2, '"{"{NUMBER}\\,{NUMBER}"}"'),

      Group.Create(SC.SC_RE_QUOT).Add(AC.AC_REGEXP_QUOT_END, '\\"').Add(AC.AC_REGEXP_QUOT_BLANK, "{BLANK}"),

      Group.Create(SC.SC_REGEXP, SC.SC_RE_QUOT)
        .Add(AC.AC_REGEXP_ESCSEQ, "{ESCSEQ}")
        .Add(AC.AC_REGEXP_ANYCHAR, "{ANYCHAR}"),

      Group.Create(SC.SC_RE_CCL)
        .Add(AC.AC_REGEXP_CCL_END, "\\]")
        .Add(AC.AC_REGEXP_CCL_REF1, '"[:"{NAME}":]"')
        .Add(AC.AC_REGEXP_CCL_REF2, '"[:"{NAME2}":]"')
        .Add(AC.AC_REGEXP_CCL_CHAR1, "{CCLCHAR}")
        .Add(AC.AC_REGEXP_CCL_CHAR2, "{CCLCHAR}-{CCLCHAR}"),

      Group.Create(SC.INITIAL)
        .Add(AC.AC_NL, "{NL}")
        .Add(AC.AC_WS, "[[:space:]]")
        .Add(AC.AC_MCOMM, '"/*"')
        .Add(AC.AC_SCOMM, '"//"')
        .Add(AC.AC_REGEXP, "\\/\\^?")
        .Add(AC.AC_PACKAGE, '"%package"')
        .Add(AC.AC_SCENARIO, '"%scenario"')
        .Add(AC.AC_STATE, '"%state"')
        .Add(AC.AC_EVENT, '"%event"')
        .Add(AC.AC_GROUP, '"%group"')
        .Add(AC.AC_DEFINE, '"%define"')
        .Add(AC.AC_ACTION, '"%action"')
        .Add(AC.AC_EXPORT, '"%export"')

        .Add(AC.AC_RESERVED, "[yY][yY]{ALNUM_}*")
        .Add(AC.AC_NAME, "{NAME}")
        .Add(AC.AC_OP, "[\\{\\}\\.\\,\\<\\>]")
    );

    const handler = new DefaultHandler(128, SC.$SC_MAXIMUM);
    const generator = await CreateGenerator(handler, false, bindings);

    function re(re: string) {
      let offset = 0;
      const size = re.length;
      return generator.ParseText(() => {
        if (offset >= size) return 0;
        const cc = re.codePointAt(offset)!;
        offset += cc > 0xffff ? 2 : 1;
        return cc;
      });
    }

    for (const [key, value] of defines) handler.SetNamedValue(key, re(value));

    for (const group of groups) {
      generator.SetSconList(group.starts_.map((v) => v + 1));
      for (const [ac, v] of group.rules_) {
        const rule = generator.AddNewRule(false, re(v));
        console.assert(rule === ac);
      }
    }

    const scanner = generator.GenerateScanner();
    if (context.verbose_) Context.DebugTraceLexicalScanner(scanner);
    return new Tokenize(scanner, context);
  }

  private constructor(scanner: LexicalScanner, context: Context) {
    this.machine_ = new Machine(scanner);
    this.context_ = context;
  }

  private push_token(...token: Array<string | TypeToken>) {
    if (this.token_index_ < 0) this.token_index_ = 0;
    this.token_pending_.push(...token);
  }

  Initialize(file: string, content: string) {
    this.machine_.Initialize(content, true);
    this.token_pending_.length = 0;
    this.token_index_ = -1;
    this.file_ = file;
    this.line_ = 1;
  }

  Next(): TypeToken {
    for (;;) {
      if (this.token_index_ >= 0) {
        const next = this.token_pending_[this.token_index_++];
        if (this.token_index_ >= this.token_pending_.length) {
          this.token_pending_.length = 0;
          this.token_index_ = -1;
        }

        if (typeof next === "string") return charCode(next);

        return next;
      }

      const action = this.machine_.YYNEXT();
      switch (action) {
        case 0: {
          // EOF ...
          const start = this.machine_.YYSTART();

          if (SC.INITIAL === start || SC.SC_SCOMM === start) return Token.YYEOF;

          if (SC.SC_MCOMM === start)
            throw Error(`Tokenize: Unexpected end of file found in comment @${this.GetFile()}:${this.GetLine()}`);

          throw Error(`Tokenize: Unexpected end of file found in regexp @${this.GetFile()}:${this.GetLine()}`);
        }

        case AC.AC_MCOMM_END:
          this.machine_.BEGIN(SC.INITIAL);
          break;

        case AC.AC_MCOMM_NL:
          ++this.line_;
          break;

        case AC.AC_SCOMM_END:
          ++this.line_;
          this.machine_.BEGIN(SC.INITIAL);
          break;

        case AC.AC_COMM_ANY:
          /* ignore */
          break;

        case AC.AC_REGEXP_END:
          this.machine_.BEGIN(SC.INITIAL);
          return charCode("/");

        case AC.AC_REGEXP_QUOT:
          this.machine_.BEGIN(SC.SC_RE_QUOT);
          return charCode('"');

        case AC.AC_REGEXP_CCL:
          this.machine_.BEGIN(SC.SC_RE_CCL);
          this.token_ccl_ = new TokenCCl(this.machine_.YYSIZE() > 1);
          break;

        case AC.AC_REGEXP_EXT1: {
          const ref = this.context_.NameScopeId("", this.YYTEXT().slice(1, -1));
          return [Token.TK_EXT, new TokenExtRef(ref)];
        }

        case AC.AC_REGEXP_EXT2: {
          const [scope, iden] = this.YYTEXT().slice(1, -1).split(".");
          return [Token.TK_EXT, new TokenExtRef(this.context_.NameScopeId(scope, iden))];
        }

        case AC.AC_REGEXP_OP:
          return this.machine_.YYCHAR(0);

        case AC.AC_REGEXP_REP1:
          {
            const v = parseInt(this.YYTEXT().slice(1));
            if (this.machine_.YYCHAR(this.machine_.YYSIZE() - 2) === charCode(",")) {
              this.push_token("{", [Token.TK_NUMBER, v], ",", "}");
            } else {
              this.push_token("{", [Token.TK_NUMBER, v], "}");
            }
          }
          break;

        case AC.AC_REGEXP_REP2:
          {
            const [a, b] = this.YYTEXT()
              .slice(1, -1)
              .split(",")
              .map((v) => parseInt(v));
            this.push_token("{", [Token.TK_NUMBER, a], ",", [Token.TK_NUMBER, b], "}");
          }
          break;

        case AC.AC_REGEXP_QUOT_END:
          this.machine_.BEGIN(SC.SC_REGEXP);
          return charCode('"');

        case AC.AC_REGEXP_QUOT_BLANK:
          return [Token.TK_CHAR, map_char(check_char(this.machine_.YYCHAR(0)))];

        case AC.AC_REGEXP_ESCSEQ:
          return [Token.TK_CHAR, map_char(yy_esc1(this.machine_))];

        case AC.AC_REGEXP_ANYCHAR:
          return [Token.TK_CHAR, map_char(check_char(this.machine_.YYCHAR(0)))];

        case AC.AC_REGEXP_CCL_END:
          this.machine_.BEGIN(SC.SC_REGEXP);
          return [Token.TK_CCL, this.token_ccl_];

        case AC.AC_REGEXP_CCL_REF1:
          {
            const id = this.YYTEXT().slice(2, -2);
            if (!DefaultNamedCCl(id, this.token_ccl_!.set_)) {
              this.token_ccl_!.ref_.add(this.context_.NameScopeId("", id));
            }
          }
          break;

        case AC.AC_REGEXP_CCL_REF2:
          {
            const [scope, id] = this.YYTEXT().slice(2, -2).split(".");
            this.token_ccl_!.ref_.add(this.context_.NameScopeId(scope, id));
          }
          break;

        case AC.AC_REGEXP_CCL_CHAR1:
          {
            this.token_ccl_!.set_.add(map_char(yy_esc1(this.machine_)));
          }
          break;

        case AC.AC_REGEXP_CCL_CHAR2:
          {
            const [c1, off] = yy_esc0(this.machine_);
            const c2 = yy_esc1(this.machine_, off);
            if (c1 > c2)
              throw RangeError(`Tokenize: Invalid ccl.range ${c1}-${c2}, @${this.GetFile()}:${this.GetLine()}`);
            for (let c = c1; c <= c2; ++c) this.token_ccl_!.set_.add(map_char(c));
          }
          break;

        case AC.AC_NL:
          ++this.line_;
          break;

        case AC.AC_WS:
          break;

        case AC.AC_MCOMM:
          this.machine_.BEGIN(SC.SC_MCOMM);
          break;

        case AC.AC_SCOMM:
          this.machine_.BEGIN(SC.SC_SCOMM);
          break;

        case AC.AC_REGEXP:
          if (this.machine_.YYSIZE() > 1) {
            this.push_token("^");
          }
          this.machine_.BEGIN(SC.SC_REGEXP);
          return charCode("/");

        case AC.AC_PACKAGE:
          return Token.TK_PACKAGE;

        case AC.AC_SCENARIO:
          return Token.TK_SCENARIO;

        case AC.AC_STATE:
          return Token.TK_STATE;

        case AC.AC_EVENT:
          return Token.TK_EVENT;

        case AC.AC_GROUP:
          return Token.TK_GROUP;

        case AC.AC_DEFINE:
          return Token.TK_DEFINE;

        case AC.AC_ACTION:
          return Token.TK_ACTION;

        case AC.AC_EXPORT:
          return Token.TK_EXPORT;

        case AC.AC_RESERVED:
          throw Error(`Tokenize: Reserved identifier ${this.YYTEXT()} @${this.GetFile()}:${this.GetLine()}`);

        case AC.AC_NAME:
          return [Token.TK_IDEN, this.YYTEXT()];

        case AC.AC_OP:
          return this.machine_.YYCHAR(0);

        default:
          throw Error(`Tokenize: Invalid character ${this.machine_.YYCHAR(0)} @${this.GetFile()}:${this.GetLine()}`);
      }
    }
  }

  ReadCode(): string {
    let level = 1;
    let lf = false;
    const start = "{".charCodeAt(0);
    const end = "}".charCodeAt(0);
    const result = <integer[]>[start];

    for (;;) {
      const cc = this.machine_.YYNEXTCHAR();
      if (cc <= 0)
        throw Error(`Tokenize: Unexpected end of file found in user code @${this.GetFile()}:${this.GetLine()}`);
      result.push(cc);

      if (cc === 13 /* \r */) {
        ++this.line_;
        lf = true;
      } else if (cc === 10 /* \n */) {
        if (!lf) ++this.line_;
        lf = false;
      } else {
        lf = false;

        if (cc === end) {
          if (0 === --level) break;
        } else if (cc === start) {
          ++level;
        }
      }
    }

    return String.fromCodePoint(...result);
  }

  YYTEXT() {
    return this.machine_.YYTEXT();
  }

  GetFile() {
    return this.file_;
  }

  GetLine() {
    return this.line_;
  }

  private file_ = "";
  private line_ = 1;
  private context_: Context;
  private readonly machine_: Machine;
  private static wasmModule_: WebAssembly.Module;

  private readonly token_pending_ = new Array<string | TypeToken>();
  private token_index_ = -1;

  private token_ccl_?: TokenCCl;
}
