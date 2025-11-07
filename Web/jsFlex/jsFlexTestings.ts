import * as jsLexFile from "../Assembly/jsLex_wasm";

import {
  CreateBindings,
  DefaultHandler,
  CreateGenerator,
  LexicalScanner,
  YY_SCANNER_TABLE,
  integer,
  Machine,
  CreateBootstrapScanner,
  Generator,
  Bindings,
  DebugTraceLexicalScanner,
} from "./jsFlex.js";

function testBootstrap(scanner: LexicalScanner) {
  const machine = new Machine(scanner);

  machine.Initialize("Hello", true);
  console.assert(machine.YYNEXT() === 10 && machine.YYTEXT() === "H");
  console.assert(machine.YYNEXT() === 10 && machine.YYTEXT() === "e");
  console.assert(machine.YYNEXT() === 10 && machine.YYTEXT() === "l");
  console.assert(machine.YYNEXT() === 10 && machine.YYTEXT() === "l");
  console.assert(machine.YYNEXT() === 10 && machine.YYTEXT() === "o");
  console.assert(0 === machine.YYNEXT());
}

const ASYNC_CALL = true,
  TRACE_RESULT = false;

async function re2rule(re: string, generator: Generator) {
  let offset = 0;
  const array = Machine.string2array(re);

  let result: integer[];
  if (Math.random() > 0.5) {
    result = generator.ParseText((_) => {
      if (offset >= array.length) return 0;
      return array[offset++];
    });
  } else {
    result = await generator.ParseStream((_) => {
      if (offset >= array.length) return 0;

      if (!ASYNC_CALL) return array[offset++];

      if (Math.random() > 0.5) return array[offset++];

      if (Math.random() > 0.5) return Promise.resolve(array[offset++]);

      return new Promise((resolve) => {
        setTimeout((_) => {
          resolve(array[offset++]);
        }, 0);
      });
    });
  }

  if (TRACE_RESULT)
    console.log(
      `re2rule ${re} => ${JSON.stringify(
        result.map((v: integer) => {
          return v.toString(16);
        }),
        null,
        " "
      )}`
    );
  return result;
}

async function define2rule(re: string, generator: Generator, bol = false) {
  return generator.AddNewRule(bol, await re2rule(re, generator));
}

async function BootstrapCheck(bindings: Bindings, bootstrap: LexicalScanner, trace = false) {
  const kTestingEx = false;

  const start = Date.now();
  const kSCON_INIT = 0,
    kSCON_QUOTE = 1,
    kSCON_CCL = 2;

  const handle = new DefaultHandler(128, 3);
  const generator = CreateGenerator(handle, false, bindings);

  function re(s: string) {
    return re2rule(s, generator);
  }

  function def(s: string, bol = false) {
    return define2rule(s, generator, bol);
  }

  let notnl: string;
  switch ((Math.random() * 10) | 0) {
    case 0:
      notnl = "[^\\xd\\x0a]";
      break;

    case 1:
      notnl = "[^\\u000d\\U00000a]";
      break;

    case 2:
      notnl = "[^\\15\\012]";
      break;

    default:
      notnl = ".";
      break;
  }

  handle.SetNamedValue("NOTNL", await re(!kTestingEx ? "[^\\r\\n]" : notnl));
  handle.SetNamedValue("ANYCHAR", await re("[^[:space:]\\\\]"));
  handle.SetNamedValue("BLANK", await re("[[:blank:]]"));
  handle.SetNamedValue("ALPHA", await re("[[:alpha:]]"));
  handle.SetNamedValue("ALNUM_", await re("[[:alnum:]_]"));
  handle.SetNamedValue("DIGIT", await re("[[:digit:]]"));
  handle.SetNamedValue("HEX", await re("[[:xdigit:]]"));
  handle.SetNamedValue(
    "OCT",
    await re(!kTestingEx ? "[0-7]" : Math.random() > 0.5 ? "[\\x30-\\067]" : "[\\60-\\u0037]")
  );
  handle.SetNamedValue("V0123", await re("[0-3]"));
  handle.SetNamedValue("CCLCC", await re("[^\\\\\\]\\r\\n]"));
  handle.SetNamedValue("OPERATOR", await re("[\\*\\+\\?\\.\\(\\)\\{\\}\\|]"));
  handle.SetNamedValue("NAME", await re("{ALPHA}{ALNUM_}*"));
  handle.SetNamedValue("NUMBER", await re(!kTestingEx ? "{DIGIT}+" : Math.random() > 0.5 ? "{DIGIT}{1,}" : "{DIGIT}+"));
  handle.SetNamedValue("ESCSEQ", await re("\\\\({OCT}{1,2}|{V0123}{OCT}{2}|x{HEX}{1,2}|u{HEX}{4}|U{HEX}{6}|{NOTNL})"));
  handle.SetNamedValue("CCLCHAR", await re("{CCLCC}|{ESCSEQ}"));

  await def('\\"');
  await def("\\[^?");
  await def('"{"{NAME}"}"');
  await def("{OPERATOR}");
  await def('"{"{NUMBER}\\,?"}"');
  await def('"{"{NUMBER},{NUMBER}"}"');

  generator.SetSconList([kSCON_QUOTE + 1]);
  await def('\\"');
  await def("{BLANK}");

  generator.SetSconList([kSCON_INIT + 1, kSCON_QUOTE + 1]);
  await def("{ESCSEQ}");
  await def("{ANYCHAR}");

  generator.SetSconList([kSCON_CCL + 1]);
  await def("]");
  await def('"[:"{NAME}":]"');
  await def("{CCLCHAR}");
  await def("{CCLCHAR}-{CCLCHAR}");

  const scanner = generator.GenerateScanner();
  if (trace) DebugTraceLexicalScanner(scanner);

  function CHECK_ARRAY(left: YY_SCANNER_TABLE, right: YY_SCANNER_TABLE) {
    const size = right.length;
    if (left.length !== size) throw new Error(`length => ${left.length} !== ${size}`);

    for (let i = 0; i < size; ++i) {
      if (left[i] !== right[i]) throw new Error(`item ${i} => ${left[i]} !== ${right[i]}`);
    }
  }

  function CHECK_EQ(left: integer | YY_SCANNER_TABLE, right: integer | YY_SCANNER_TABLE) {
    if (typeof left !== typeof right) throw new Error(`typeof ${left} !== typeof ${right}`);

    if (typeof left === "number") {
      if (left !== right) throw new Error(`${left} !== ${right}`);
    } else {
      CHECK_ARRAY(left, <YY_SCANNER_TABLE>right);
    }
  }

  CHECK_EQ(scanner.YY_LASTDFA, bootstrap.YY_LASTDFA);
  CHECK_EQ(scanner.YY_JAMBASE, bootstrap.YY_JAMBASE);
  CHECK_EQ(scanner.YY_DEFAULT, bootstrap.YY_DEFAULT);
  CHECK_EQ(scanner.YY_CHARNIL, bootstrap.YY_CHARNIL);

  CHECK_EQ(scanner.yy_accept, bootstrap.yy_accept);
  CHECK_EQ(scanner.yy_ec, bootstrap.yy_ec);
  CHECK_EQ(scanner.yy_meta, bootstrap.yy_meta);
  CHECK_EQ(scanner.yy_base, bootstrap.yy_base);
  CHECK_EQ(scanner.yy_def, bootstrap.yy_def);
  CHECK_EQ(scanner.yy_nxt, bootstrap.yy_nxt);
  CHECK_EQ(scanner.yy_chk, bootstrap.yy_chk);

  console.log(`${Date.now() - start} )Bootstrap check OK!`);
  console.log(`Hello jsFlex world!`);
}

function foobar(bindings: Bindings) {
  const handler = new DefaultHandler();
  const generator = CreateGenerator(handler, true, bindings);
  let ruleNumber: number, ruleSpace: number, ruleNil: number, ruleC1: number;

  {
    // [[:digit:]]+
    const digit = new Set<integer>();
    handler.GetNamedCcl(digit, "digit");
    const cclNumber = generator.AddNewCCl(false, digit);
    ruleNumber = generator.AddNewRule(false, [(2 << 24) | cclNumber, 6 << 24]);
  }

  {
    // [[:space:]]+
    const space = new Set<integer>();
    handler.GetNamedCcl(space, "space");
    const cclSpace = generator.AddNewCCl(false, space);
    ruleSpace = generator.AddNewRule(false, [(2 << 24) | cclSpace, 6 << 24]);
  }

  {
    // \0 => \x80 ...
    ruleNil = generator.AddNewRule(false, [(1 << 24) | 128]);
  }

  {
    // \1
    ruleC1 = generator.AddNewRule(false, [(1 << 24) | 1]);
  }

  // 'P' ... 'Z' ... -> ... 'a' ... 'z' ... '~'
  for (let i = 80; i <= 127; ++i) {
    generator.AddNewRule(false, [(1 << 24) | i]);
  }

  console.assert(1 === ruleNumber && 2 === ruleSpace && ruleNil === 3 && ruleC1 === 4);

  const scanner: LexicalScanner = generator.GenerateScanner();
  DebugTraceLexicalScanner(scanner);
}

function sleep(ms: integer) {
  return new Promise((resolve) => {
    setTimeout((_) => {
      return resolve(void 0);
    }, ms);
  });
}

async function RunTestings() {
  const WASM = jsLexFile.Assets();
  const module = await WebAssembly.compile(WASM);
  const bindings = await CreateBindings(module);

  foobar(bindings);

  const date_start = Date.now();
  console.log(">>>>>>> Bootstrap scanner >>>>>>>");
  const bootstrap = CreateBootstrapScanner(bindings);
  const date_end = Date.now();
  DebugTraceLexicalScanner(bootstrap);
  console.log(`<<<<<<< Bootstrap scanner (${date_end - date_start}) <<<<<<<`);

  testBootstrap(bootstrap);

  await BootstrapCheck(bindings, bootstrap, true);

  {
    const all = [],
      start = Date.now();
    for (let i = 0; i < 100; ++i) all.push(BootstrapCheck(await CreateBindings(module), bootstrap));
    await Promise.all(all);
    console.log(`Test ... 1 ... ${Date.now() - start}`);
  }

  await sleep(2000);

  for (let i = 0; i < 10; ++i) await BootstrapCheck(bindings, bootstrap);

  await sleep(2000);
}

RunTestings()
  .then((_) => {
    console.log(`RunTestings Ok!`);
  })
  .catch((e) => {
    console.error(`RunTestings Error ${e}`);
  });
