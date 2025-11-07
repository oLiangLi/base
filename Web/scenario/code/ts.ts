import { ScenarioCodeGenerator, Plugin } from "../index.js";
import * as fs from "node:fs/promises";

const enum ArrayType {
  u8,
  u16,
  i32,
}
function Buffer2String(array: ArrayLike<number>): [type: ArrayType, sType: string, b64Value: string] {
  let max = 0;
  for (let i = array.length - 1; i >= 0; --i) {
    max = Math.max(max, array[i]);
  }
  if (max <= 0xff) {
    const buffer = Buffer.alloc(array.length);
    for (let i = 0; i < array.length; ++i) buffer[i] = array[i];
    return [ArrayType.u8, "ArrayType.u8", buffer.toString("base64")];
  } else if (max <= 0xffff) {
    const buffer = Buffer.alloc(array.length * 2);
    for (let i = 0; i < array.length; ++i) {
      buffer.writeUInt16LE(array[i], i * 2);
    }
    return [ArrayType.u16, "ArrayType.u16", buffer.toString("base64")];
  } else {
    const buffer = Buffer.alloc(array.length * 4);
    for (let i = 0; i < array.length; ++i) {
      buffer.writeUInt32LE(array[i], i * 4);
    }
    return [ArrayType.i32, "ArrayType.i32", buffer.toString("base64")];
  }
}

class Code {
  constructor(sc: ScenarioCodeGenerator, params: Map<string, string>) {
    this.sc_ = sc;
    const source = params.get("file");
    if (!source) sc.ConsoleWarning(`param file == null, default foobar.ts`);
    this.source_ = source ? source : "foobar.ts";
    this.kGlobalSizeNs_ = sc.global__.length ? sc.global__.split(".").length : 0;
    if (params.get("machine") === "false") this.genMachine_ = false;
  }

  private GenCodeScenario(index: number, scenario: (typeof this.sc_.machine_)[0]) {
    const code = this.source_code_;
    const ns2 = [...scenario.package.split("."), scenario.name].slice(this.kGlobalSizeNs_);

    let min = Infinity,
      max = -Infinity;
    code.push(`export namespace ${ns2.join(".")} {`);
    code.push(`\texport const enum Name { $$ = ${index} }\n`);
    code.push(`\texport const enum State {`);
    for (const { name, value } of scenario.state) {
      min = Math.min(min, value);
      max = Math.max(max, value);
      code.push(`\t\t${name} = ${value},`);
    }
    code.push("");
    code.push(`\t\t$Minimum = ${min},`);
    code.push(`\t\t$Maximum = ${max}`);
    code.push(`\t}\n`);

    code.push(`\texport const enum Event {`);
    if (scenario.event.length) {
      min = Infinity;
      max = -Infinity;
      for (const { name, value } of scenario.event) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        code.push(`\t\t${name} = ${value},`);
      }
      code.push("");
    } else {
      min = max = -1;
    }
    code.push(`\t\t$Minimum = ${min},`);
    code.push(`\t\t$Maximum = ${max}`);
    code.push(`\t}\n`);

    code.push(`\texport const enum Action {`);
    if (scenario.action.length) {
      min = Infinity;
      max = -Infinity;
      for (const { name, value } of scenario.action) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        if (name[0] !== "#") code.push(`\t\t${name} = ${value},`);
      }
      code.push("");
    } else {
      min = max = -1;
    }
    code.push(`\t\t$Minimum = ${min},`);
    code.push(`\t\t$Maximum = ${max}`);
    code.push(`\t}\n`);

    code.push(`}\n`);
  }

  private GenCodeScanner(scanner: typeof this.sc_.scanner_) {
    const code = this.source_code_;

    code.push(`
/**\n * Module implements LexicalScanner\n */
const enum ArrayType { u8, u16, i32 }
function String2Buffer(type : ArrayType, value : string) : Uint8Array|Uint16Array|Int32Array {
    const buf = Buffer.from(value, 'base64');
    const result = new ArrayBuffer(buf.length);
    buf.copy(Buffer.from(result));
    if(type === ArrayType.u8)
        return new Uint8Array(result);
    else if(type === ArrayType.u16)
        return new Uint16Array(result);
    else if(type === ArrayType.i32)
        return new Int32Array(result);
    else
        throw RangeError();
}`);

    code.push(`export const`);
    code.push(`\tYY_LASTDFA = ${scanner.YY_LASTDFA},`);
    code.push(`\tYY_JAMBASE = ${scanner.YY_JAMBASE},`);
    code.push(`\tYY_DEFAULT = ${scanner.YY_DEFAULT},`);
    code.push(`\tYY_CHARSIZ = ${scanner.YY_CHARSIZ},`);
    code.push(`\tYY_CHARNIL = ${scanner.YY_CHARNIL};`);
    code.push("");

    function outputArray(name: "yy_accept" | "yy_ec" | "yy_meta" | "yy_base" | "yy_def" | "yy_nxt" | "yy_chk") {
      const value = scanner[name];
      const [, sType, sValue] = Buffer2String(value);
      code.push(`export const ${name} = String2Buffer(${sType}, '${sValue}');`);
    }

    outputArray("yy_accept");
    outputArray("yy_ec");
    outputArray("yy_meta");
    outputArray("yy_base");
    outputArray("yy_def");
    outputArray("yy_nxt");
    outputArray("yy_chk");
    code.push("");
  }

  private GenCodeTable() {
    const code = this.source_code_;

    code.push(`/**\n * Global names ...\n */`);
    code.push(`yy_actionName.push(-1, '$EOF');`);

    if (this.hasGroup_) {
      code.push(`
function yy_addGroup(event : boolean, sc : string, group : string, type : ArrayType, values : string) {
    const map = event ? yy_eventGroupMap_ : yy_stateGroupMap_;
    if(!map.has(sc))
        map.set(sc, new Map<string, Set<number>>());
    map.get(sc)!.set(group, new Set(String2Buffer(type, values)));
}`);
    }

    let stateValue = 0,
      eventValue = 260,
      actionValue = 1;

    code.push("");
    for (const scenario of this.sc_.machine_) {
      const ns2 = [...scenario.package.split("."), scenario.name].slice(this.kGlobalSizeNs_).join(".");

      code.push(`/** Scenario ${scenario.name} ... */`);
      code.push(`yy_scenarioName_.set(${ns2}.Name.$$, '${scenario.name}');`, "");
      if (scenario.group.state.length) {
        for (const { name, value } of scenario.group.state) {
          const [, sType, sValue] = Buffer2String(value);
          code.push(`yy_addGroup(false, '${scenario.name}', '${name}', ${sType}, '${sValue}');`);
        }
        code.push("");
      }

      if (scenario.group.event.length) {
        for (const { name, value } of scenario.group.event) {
          const [, sType, sValue] = Buffer2String(value);
          code.push(`yy_addGroup(true, '${scenario.name}', '${name}', ${sType}, '${sValue}');`);
        }
        code.push("");
      }

      for (const { name, value } of scenario.state) {
        console.assert(stateValue++ === value);
        code.push(`yy_stateName.push(${ns2}.Name.$$, '${name}');`);
      }
      code.push("");

      if (scenario.event.length) {
        for (const { name, value } of scenario.event) {
          console.assert(eventValue++ === value);
          code.push(`yy_eventName.push(${ns2}.Name.$$, '${name}');`);
        }
        code.push("");
      }

      if (scenario.action.length) {
        for (const { name, value } of scenario.action) {
          console.assert(actionValue++ === value);
          code.push(`yy_actionName.push(${ns2}.Name.$$, '${name}');`);
        }
      }
      code.push("");
    }
    code.push(`/** Global && check ... */`);
    code.push(`yy_actionName.push(-1, '$DEFAULT');`);
    code.push(`console.assert(yy_stateName.length  === ${2 * stateValue});`);
    code.push(`console.assert(yy_eventName.length  === ${2 * (eventValue - 260)});`);
    code.push(`console.assert(yy_actionName.length === ${2 * (actionValue + 1)});`);
    code.push("", "");
  }

  GenCode() {
    this.source_code_.push(`/**
 * Auto generate, don't modify this file
 */
const yy_scenarioName_ = new Map<number, string>();
const yy_stateName  = <(number|string)[]>[];
const yy_eventName  = <(number|string)[]>[];
const yy_actionName = <(number|string)[]>[];

const yy_stateGroupMap_ = new Map<string, Map<string, Set<number>>>();
const yy_eventGroupMap_ = new Map<string, Map<string, Set<number>>>();

export function yyScenarioName(id:number) {
    return yy_scenarioName_.get(id);
}
export function yyStateName(id:number) : [ sc : number, name : string ] {
    id <<= 1;
    return [ <number>yy_stateName[id], <string>yy_stateName[id+1] ];
}
export function yyEventName(id:number) : [ sc : number, name : string ] {
    id = (id-260) << 1;
    return [ <number>yy_eventName[id], <string>yy_eventName[id+1] ];
}
export function yyActionName(id:number) : [ sc : number, name : string ]  {
    id <<= 1;
    return [ <number>yy_actionName[id], <string>yy_actionName[id+1] ];
}

export function yyIsGroupState(sc : string, group : string, value : number) {
    return !!yy_stateGroupMap_.get(sc)?.get(group)?.has(value);
}
export function yyIsGroupEvent(sc : string, group : string, value : number) {
    return !!yy_eventGroupMap_.get(sc)?.get(group)?.has(value);
}`);
    this.source_code_.push("", "");
    this.sc_.machine_.map((value, index) => {
      this.source_code_.push(`/** Scenario ${value.name} ... */`);
      if (value.group.event.length || value.group.state.length) this.hasGroup_ = true;
      this.scenario_name_to_index_.set(value.name, index);
      this.GenCodeScenario(index, value);
    });
    if (this.genMachine_) this.GenCodeScanner(this.sc_.scanner_);
    this.GenCodeTable();
  }

  async WriteFile() {
    let origin_code_source = "";
    const code_source = this.source_code_.join("\n");

    try {
      origin_code_source = (await fs.readFile(this.source_)).toString();
    } catch (err) {}

    if (code_source !== origin_code_source) await fs.writeFile(this.source_, code_source);
  }

  private readonly sc_: ScenarioCodeGenerator;
  private source_code_ = <string[]>[];
  private hasGroup_ = false;
  private genMachine_ = true;

  private readonly source_;
  private readonly scenario_name_to_index_ = new Map<string, number>();
  private readonly kGlobalSizeNs_;
}

class TSPlugin implements Plugin {
  Type() {
    return "ts";
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

export default new TSPlugin();
