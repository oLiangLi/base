import { integer } from "../../World.js";
import { ScenarioCodeGenerator, Plugin } from "../index.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

function intTypeOf(array: ArrayLike<number>) {
  let max = 0;
  for (let i = array.length - 1; i >= 0; --i) {
    max = Math.max(max, array[i]);
  }
  if (max <= 0xff) return `uint8_t`;
  if (max <= 0xffff) return `uint16_t`;
  return `int`;
}

function i6s(v: number) {
  return `      ${v}`.slice(-6);
}

function outputArray(code: string[], name: string, value: ArrayLike<number>) {
  let count = 0;
  const line = <string[]>[];
  code.push(`const ${intTypeOf(value)} ${name}[${value.length}] = { ${value[0]},`);
  for (let i = 1; i < value.length; ++i) {
    line.push(`${i6s(value[i])},`);
    if (line.length === 10) {
      code.push(line.join(""));
      line.length = 0;
      if (0 === ++count % 10) code.push("");
    }
  }
  if (line.length) code.push(line.join(""));
  code.push("};\n");
}

class Code {
  constructor(sc: ScenarioCodeGenerator, params: Map<string, string>) {
    this.sc_ = sc;
    this.global_ns_ = sc.global__.length ? sc.global__.split(".") : [];

    const basedir = params.get("basedir");
    const header = params.get("header");
    const source = params.get("source");
    const class_ = params.get("class");
    this.basedir_ = basedir ? basedir : ".";
    this.header_ = header ? header : "foobar.h";
    this.source_ = source ? source : "foobar.cc";
    this.class_ = class_ ? class_ : "Machine";
    this.action_ = params.get("action") === "true";
  }

  private GenCodeScenario(index: integer, scenario: (typeof this.sc_.machine_)[0]) {
    const name = scenario.name;
    const ns2 = scenario.package.split(".");
    const hasGroup = scenario.group.event.length != 0 || scenario.group.state.length != 0;

    this.header_code_.push(`\n//\n// Scenario ${name}\n//`);

    if (hasGroup) this.source_code_.push(`\n//\n// Scenario ${name}\n//`);

    for (let i = this.global_ns_.length; i < ns2.length; ++i) {
      const ns = `namespace ${ns2[i]} {`;
      this.header_code_.push(ns);
      if (hasGroup) this.source_code_.push(ns);
    }

    this.header_code_.push(`struct ${name} {`);
    this.header_code_.push(`\tstatic constexpr int Index = ${index};`);
    this.header_code_.push(`\tstatic constexpr char Name[] = \"${name}\";\n`);

    let min = Infinity,
      max = -Infinity;
    this.header_code_.push(`\tenum class State : int {`);
    for (const { name, value } of scenario.state) {
      this.header_code_.push(`\t\t${name} = ${value},`);
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
    this.header_code_.push("");
    this.header_code_.push(`\t\tYY_Minimum = ${min},`);
    this.header_code_.push(`\t\tYY_Maximum = ${max}`);
    this.header_code_.push(`\t};\n`);
    this.maxState_ = Math.max(this.maxState_, max);

    if (scenario.event.length) {
      min = Infinity;
      max = -Infinity;
      this.header_code_.push(`\tenum class Event : int {`);
      for (const { name, value } of scenario.event) {
        this.header_code_.push(`\t\t${name} = ${value},`);
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
      this.header_code_.push("");
      this.header_code_.push(`\t\tYY_Minimum = ${min},`);
      this.header_code_.push(`\t\tYY_Maximum = ${max}`);
      this.header_code_.push(`\t};\n`);

      this.maxEvent_ = Math.max(this.maxEvent_, max);
    } else {
      this.header_code_.push(`\tenum class Event : int {`);
      this.header_code_.push(`\t\tYY_Minimum = -1,`);
      this.header_code_.push(`\t\tYY_Maximum = -1`);
      this.header_code_.push(`\t};\n`);
    }

    if (scenario.action.length) {
      min = Infinity;
      max = -Infinity;
      this.header_code_.push(`\tenum class Action : int {`);
      for (const { name, value } of scenario.action) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        if (name[0] === "#") continue;
        this.header_code_.push(`\t\t${name} = ${value},`);
      }
      this.header_code_.push("");
      this.header_code_.push(`\t\tYY_Minimum = ${min},`);
      this.header_code_.push(`\t\tYY_Maximum = ${max}`);
      this.header_code_.push(`\t};\n`);
    } else {
      this.header_code_.push(`\tenum class Action : int {`);
      this.header_code_.push(`\t\tYY_Minimum = -1,`);
      this.header_code_.push(`\t\tYY_Maximum = -1`);
      this.header_code_.push(`\t};\n`);
    }

    if (hasGroup) {
      this.header_code_.push(`\tstruct Group {`);
      if (scenario.group.state.length) {
        this.header_code_.push(`\t\tstruct State {`);
        for (const { name, value } of scenario.group.state) {
          this.header_code_.push(`\t\t\tstruct ${name} {`);
          this.header_code_.push(`\t\t\t\tstatic constexpr char Name[] = \"${name}\";`);
          this.header_code_.push(`\t\t\t\tstatic const ${intTypeOf(value)} Value[${value.length}];`);
          this.header_code_.push(`\t\t\t};\n`);
        }
        this.header_code_.push(`\t\t};\n`);
      }
      if (scenario.group.event.length) {
        this.header_code_.push(`\t\tstruct Event {`);
        for (const { name, value } of scenario.group.event) {
          this.header_code_.push(`\t\t\tstruct ${name} {`);
          this.header_code_.push(`\t\t\t\tstatic constexpr char Name[] = \"${name}\";`);
          this.header_code_.push(`\t\t\t\tstatic const ${intTypeOf(value)} Value[${value.length}];`);
          this.header_code_.push(`\t\t\t};\n`);
        }
        this.header_code_.push(`\t\t};\n`);
      }
      this.header_code_.push("\t};\n");
      function check_group(value: number[]) {
        for (let i = value.length - 1; i > 0; --i) console.assert(value[i] > value[i - 1]);
        return value;
      }

      for (const { name, value } of scenario.group.state)
        outputArray(this.source_code_, `${scenario.name}::Group::State::${name}::Value`, check_group(value));

      for (const { name, value } of scenario.group.event)
        outputArray(this.source_code_, `${scenario.name}::Group::Event::${name}::Value`, check_group(value));
    }

    if (this.action_) {
      this.header_code_.push(`\ttemplate <typename TYPE_SCENARIO, typename TYPE_MANAGER, typename TYPE_EVENT = int>`);
      this.header_code_.push(
        `\tstatic void ON_Action(TYPE_SCENARIO* Self, TYPE_MANAGER* Context, int action, TYPE_EVENT* yytext, int yylen);`
      );
    }

    this.header_code_.push("};\n");

    for (let i = ns2.length - 1; i >= this.global_ns_.length; --i) {
      const ns = `} // namespace ${ns2[i]}`;
      this.header_code_.push(ns);
      if (hasGroup) this.source_code_.push(ns);
    }

    this.header_code_.push("");
    if (hasGroup) this.source_code_.push("");
  }

  private GenCodeScanner(scanner: typeof this.sc_.scanner_) {
    this.header_code_.push("", "");
    this.header_code_.push("//", `// FSM ${this.class_}`, "//");
    this.header_code_.push(`struct ${this.class_} {`);
    this.header_code_.push(`\tstatic constexpr int kEventStart = 260;\n`);
    this.header_code_.push(`\tstruct NameTable {`);
    this.header_code_.push(`\t\tconst int sc_;`);
    this.header_code_.push(`\t\tconst char* const id_;`);
    this.header_code_.push(`\t};\n`);

    this.header_code_.push(`\tenum {`);
    this.header_code_.push(`\t\tYY_LASTDFA = ${scanner.YY_LASTDFA},`);
    this.header_code_.push(`\t\tYY_JAMBASE = ${scanner.YY_JAMBASE},`);
    this.header_code_.push(`\t\tYY_DEFAULT = ${scanner.YY_DEFAULT},`);
    this.header_code_.push(`\t\tYY_CHARSIZ = ${scanner.YY_CHARSIZ},`);
    this.header_code_.push(`\t\tYY_CHARNIL = ${scanner.YY_CHARNIL},`);
    this.header_code_.push(`\t};\n`);

    this.header_code_.push(`\tstatic const ${intTypeOf(scanner.yy_accept)} yy_accept[${scanner.yy_accept.length}];`);
    this.header_code_.push(`\tstatic const ${intTypeOf(scanner.yy_ec)} yy_ec[${scanner.yy_ec.length}];`);
    this.header_code_.push(`\tstatic const ${intTypeOf(scanner.yy_meta)} yy_meta[${scanner.yy_meta.length}];`);
    this.header_code_.push(`\tstatic const ${intTypeOf(scanner.yy_base)} yy_base[${scanner.yy_base.length}];`);
    this.header_code_.push(`\tstatic const ${intTypeOf(scanner.yy_def)} yy_def[${scanner.yy_def.length}];`);
    this.header_code_.push(`\tstatic const ${intTypeOf(scanner.yy_nxt)} yy_nxt[${scanner.yy_nxt.length}];`);
    this.header_code_.push(`\tstatic const ${intTypeOf(scanner.yy_chk)} yy_chk[${scanner.yy_chk.length}];`);
    this.header_code_.push("");
    this.header_code_.push(`\tstatic const char* const yy_scenario_names[${this.sc_.machine_.length + 1}];`);
    this.header_code_.push(`\tstatic const NameTable yy_state_table[${this.maxState_ + 2}];`);
    this.header_code_.push(`\tstatic const NameTable yy_event_table[${this.maxEvent_ + 2} - kEventStart];`);
    this.header_code_.push(`\tstatic const NameTable yy_action_table[${scanner.YY_DEFAULT + 2}];`);
    this.header_code_.push(`};\n`);

    this.source_code_.push("", "");
    this.source_code_.push("//", `// FSM ${this.class_}`, "//");
    outputArray(this.source_code_, `${this.class_}::yy_accept`, scanner.yy_accept);
    outputArray(this.source_code_, `${this.class_}::yy_ec`, scanner.yy_ec);
    outputArray(this.source_code_, `${this.class_}::yy_meta`, scanner.yy_meta);
    outputArray(this.source_code_, `${this.class_}::yy_base`, scanner.yy_base);
    outputArray(this.source_code_, `${this.class_}::yy_def`, scanner.yy_def);
    outputArray(this.source_code_, `${this.class_}::yy_nxt`, scanner.yy_nxt);
    outputArray(this.source_code_, `${this.class_}::yy_chk`, scanner.yy_chk);
  }

  private GenCodeTable() {
    this.source_code_.push("", "");
    this.source_code_.push(`const char* const ${this.class_}::yy_scenario_names[${this.sc_.machine_.length + 1}] = {`);
    for (const scenario of this.sc_.machine_) {
      const nsp = scenario.package.split(".").slice(this.global_ns_.length);
      const nsv = nsp.length ? nsp.join("::") + `::${scenario.name}` : `${scenario.name}`;
      this.source_code_.push(`\t${nsv}::Name,`);
    }
    this.source_code_.push(`\tnullptr`);
    this.source_code_.push("};\n");

    this.source_code_.push(`const ${this.class_}::NameTable ${this.class_}::yy_state_table[${this.maxState_ + 2}] = {`);
    for (const scenario of this.sc_.machine_) {
      const nsp = scenario.package.split(".").slice(this.global_ns_.length);
      const nsv = nsp.length ? nsp.join("::") + `::${scenario.name}` : `${scenario.name}`;
      for (const { name } of scenario.state) {
        this.source_code_.push(`\t{ ${nsv}::Index, \"${name}\" },`);
      }

      if (scenario.state.length) this.source_code_.push("");
    }
    this.source_code_.push(`\t{ -1, nullptr }`);
    this.source_code_.push(`};\n`);

    this.source_code_.push(
      `const ${this.class_}::NameTable ${this.class_}::yy_event_table[${this.maxEvent_ + 2} - kEventStart] = {`
    );
    for (const scenario of this.sc_.machine_) {
      const nsp = scenario.package.split(".").slice(this.global_ns_.length);
      const nsv = nsp.length ? nsp.join("::") + `::${scenario.name}` : `${scenario.name}`;
      for (const { name } of scenario.event) {
        this.source_code_.push(`\t{ ${nsv}::Index, \"${name}\" },`);
      }
      if (scenario.event.length) this.source_code_.push("");
    }
    this.source_code_.push(`\t{ -1, nullptr }`);
    this.source_code_.push(`};\n`);

    this.source_code_.push(
      `const ${this.class_}::NameTable ${this.class_}::yy_action_table[${this.sc_.scanner_.YY_DEFAULT + 2}] = {`
    );
    this.source_code_.push(`\t{ -1, "$EOF" },\n`);

    for (const scenario of this.sc_.machine_) {
      const nsp = scenario.package.split(".").slice(this.global_ns_.length);
      const nsv = nsp.length ? nsp.join("::") + `::${scenario.name}` : `${scenario.name}`;
      for (const { name } of scenario.action) {
        this.source_code_.push(`\t{ ${nsv}::Index, \"${name}\" },`);
      }
      if (scenario.action.length) this.source_code_.push("");
    }
    this.source_code_.push(`\t{ -1, "$DEFAULT" },`);
    this.source_code_.push(`\t{ -1, nullptr }`);
    this.source_code_.push(`};\n`);
  }

  GenCode() {
    const title = `${String.fromCharCode(0xfeff /* BOM */)}/**\n * Auto generate, don't modify this file\n */`;

    this.header_code_.push(title, "#include <stdint.h>");
    if (this.action_) this.header_code_.push(`#include <Interface/scenario.hpp>`);
    this.header_code_.push("");

    this.source_code_.push(title, `#include "${this.header_}"`, "");

    for (let i = 0; i < this.global_ns_.length; ++i) {
      const ns = `namespace ${this.global_ns_[i]} {`;
      this.header_code_.push(ns);
      this.source_code_.push(ns);
    }

    for (let index = 0; index < this.sc_.machine_.length; ++index) {
      this.GenCodeScenario(index, this.sc_.machine_[index]);
    }

    if (this.action_) {
      let yyline = 1;
      let index = 0;
      const re = /\r\n|\r|\n/gim;
      const HeaderLine = () => {
        while (index < this.header_code_.length) {
          const code = this.header_code_[index];
          while (re.exec(code)) ++yyline;
          ++yyline;
          ++index;
        }
        return yyline;
      };

      /** Header filename ... */
      const basedirs = this.basedir_.replace("\\", "/").split("/");
      while (basedirs.length) {
        const last = basedirs[basedirs.length - 1];
        if (last !== "") break;
        basedirs.length -= 1;
      }
      const header_filename_ = basedirs.length ? `${basedirs[basedirs.length - 1]}/${this.header_}` : this.header_;

      for (const scenario of this.sc_.machine_) {
        let count_action = 0;
        for (const action of scenario.action) {
          if (action.code !== "") count_action++;
        }

        const ns2 = scenario.package.split(".").slice(this.global_ns_.length);
        const Name = ns2.length ? `${ns2.join("::")}::${scenario.name}` : scenario.name;

        if (0 === count_action) {
          this.header_code_.push(`template <typename TYPE_SCENARIO, typename TYPE_MANAGER, typename TYPE_EVENT>`);
          this.header_code_.push(
            `inline void ${Name}::ON_Action(TYPE_SCENARIO* Self, TYPE_MANAGER* Context, int action, TYPE_EVENT* yytext, int yylen) {}\n`
          );
        } else {
          this.header_code_.push(`template <typename TYPE_SCENARIO, typename TYPE_MANAGER, typename TYPE_EVENT>`);
          this.header_code_.push(
            `inline void ${Name}::ON_Action(TYPE_SCENARIO* Self, TYPE_MANAGER* Context, int action, TYPE_EVENT* yytext, int yylen) {`
          );

          this.header_code_.push(`\tswitch(action) {`);
          for (const action of scenario.action) {
            if (action.code === "") continue;

            this.header_code_.push(`\tcase ${action.value}: /* ${action.name} */ {`);
            this.header_code_.push(`#line ${action.line} \"${action.file}\"`);
            this.header_code_.push(`\t\t\t${action.code}`);
            this.header_code_.push(`#line ${HeaderLine()} \"${header_filename_}\"`);
            this.header_code_.push(`\t} break;`);
          }
          this.header_code_.push("\t}");
          this.header_code_.push("}\n");
        }
      }
    }

    this.GenCodeScanner(this.sc_.scanner_);
    this.GenCodeTable();

    this.header_code_.push("", "");
    this.source_code_.push("", "");
    for (let i = this.global_ns_.length - 1; i >= 0; --i) {
      const ns = `} // namespace ${this.global_ns_[i]}`;
      this.header_code_.push(ns);
      this.source_code_.push(ns);
    }
    this.header_code_.push("", "");
    this.source_code_.push("", "");
  }

  async WriteFile() {
    let origin_code_header = "";
    let origin_code_source = "";

    const file_header = path.join(this.basedir_, this.header_);
    const file_source = path.join(this.basedir_, this.source_);

    const code_header = this.header_code_.join("\n");
    const code_source = this.source_code_.join("\n");

    try {
      origin_code_header = (await fs.readFile(file_header)).toString();
    } catch (err) {}

    try {
      origin_code_source = (await fs.readFile(file_source)).toString();
    } catch (err) {}

    if (origin_code_header !== code_header) await fs.writeFile(file_header, code_header);

    if (origin_code_source !== code_source) await fs.writeFile(file_source, code_source);
  }

  private readonly sc_: ScenarioCodeGenerator;
  private readonly global_ns_: string[];

  private header_code_ = <string[]>[];
  private source_code_ = <string[]>[];

  private maxState_ = 0;
  private maxEvent_ = 259;

  private readonly basedir_;
  private readonly header_;
  private readonly source_;
  private readonly class_;
  private readonly action_;
}

class CCPlugin implements Plugin {
  Type() {
    return "cc";
  }
  async GenerateCode(sc: ScenarioCodeGenerator, params: Map<string, string>): Promise<boolean> {
    for (const [key, value] of params) {
      console.info(`\t\t${key} => ${value}`);
    }

    try {
      const code = new Code(sc, params);
      code.GenCode();
      await code.WriteFile();
    } catch (err) {
      sc.ConsoleError(`${err}\n\t${(<Error>err)?.stack}`);
      return false;
    }
    return true;
  }
}

export default new CCPlugin();
