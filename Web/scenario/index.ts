import * as fs from "node:fs/promises";
import { Context, ExportScenario } from "./lib/grammar.js";
import { LexicalScanner } from "../jsFlex/jsFlex.js";

import ccPlugin from "./code/cc.js";
import tsPlugin from "./code/ts.js";
import jsonPlugin from "./code/json.js";

export interface Plugin {
  Type(): string;
  GenerateCode(sc: ScenarioCodeGenerator, params: Map<string, string>): Promise<boolean>;
}

console.assert = function (check) {
  if (!check) {
    const error = new Error(`Assert failed ....`);
    console.error(`%c${error}\n\t${error?.stack}`, "color: red");
  }
};

async function Sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const all_plugins_ = new Map<string, Plugin>();
(function () {
  //!
  //! Register all plugins ...
  //!
  all_plugins_.set(ccPlugin.Type(), ccPlugin);
  all_plugins_.set(tsPlugin.Type(), tsPlugin);
  all_plugins_.set(jsonPlugin.Type(), jsonPlugin);
})();

export class ScenarioCodeGenerator {
  constructor(context: Context, machine: ExportScenario[], scanner: LexicalScanner, global_namespace: string) {
    this.context_ = context;
    this.machine_ = machine;
    this.scanner_ = scanner;
    this.global__ = global_namespace;
  }

  ConsoleError(m: string) {
    return Context.ConsoleError(`Error #${++this.error_} ${m}`);
  }

  ConsoleWarning(m: string) {
    return Context.ConsoleWarning(`Warning #${++this.warning_} ${m}`);
  }

  readonly context_: Context;
  readonly machine_: ExportScenario[];
  readonly scanner_: LexicalScanner;
  readonly global__: string;

  warning_ = 0;
  error_ = 0;
}

let caseless = false,
  verbose = false,
  exportAll = false;
const input_files = <string[]>[];
const output_files = new Map<string, Map<string, string>>();

function usage() {
  console.info(
    `usage: node index.js [--caseless] [--verbose] [--export-all] [--output-<majorType>[-minorType]=<value>] [... input]`
  );
  process.exit(1);
}

for (const opt of process.argv.slice(2)) {
  if (opt.slice(0, 2) === "--") {
    if (opt === "--caseless") {
      caseless = true;
    } else if (opt === "--verbose") {
      verbose = true;
    } else if (opt === "--export-all") {
      exportAll = true;
    } else {
      const match = opt.match(/^--output-([a-zA-Z][a-zA-Z\d]*)(-[a-zA-Z][a-zA-Z\d]*)?=(.+$)/);
      if (match) {
        const major = <string>match[1];
        const minor = match[2] ? (<string>match[2]).slice(1) : "";
        const value = <string>match[3];

        if (!output_files.has(major)) output_files.set(major, new Map<string, string>());
        output_files.get(major)!.set(minor, value);
      } else {
        usage();
      }
    }
  } else {
    input_files.push(opt);
  }
}

async function Main() {
  const kWait = 10;
  const context = await Context.Create(verbose);

  for (const file of input_files) {
    await Sleep(kWait);
    console.info(`Process ${file} ...`);
    const data = await fs.readFile(file);
    context.Parse(file.replace("\\", "/"), data.toString());
  }

  await Sleep(kWait);
  if (context.PrepareMachine()) throw Error(`context.PrepareMachine()`);

  await Sleep(kWait);
  const scanner = await context.GenerateMachine(caseless);
  if (context.verbose_) Context.DebugTraceLexicalScanner(scanner);

  await Sleep(kWait);
  const exports_ = context.ExportMachine(exportAll);
  if (context.verbose_) console.log(`context.ExportMachine() =>\n${JSON.stringify(exports_, null, " ")}`);

  (function () {
    const uses = new Array<boolean>(scanner.YY_DEFAULT + 1);
    uses.fill(false);
    uses[0] = true;

    for (const rule of scanner.yy_accept) {
      if (rule > 0 && rule <= scanner.YY_DEFAULT) uses[rule] = true;
    }
    uses.map((value, rule) => {
      if (!value && rule !== scanner.YY_DEFAULT) {
        let scenario = "";
        let action = "";

        for (const sc of exports_) {
          for (const ac of sc.action) {
            if (ac.value === rule) {
              action = ac.name;
              scenario = sc.name;
            }
          }
          if (scenario) break;
        }

        console.warn(`Warning, rule ${rule} ${scenario}.${action} cannot be matched!`);
      }
    });
  })();

  const globalNs = (function () {
    const names = <string[][]>[];
    for (const export_ of exports_) {
      names.push(export_.package.split("."));
    }

    if (!names.length) return "";

    const first = names[0];
    for (let index = 0; index < first.length; ++index) {
      const check = first[index];
      for (let i = 1; i < names.length; ++i) {
        if (names[i][index] !== check) return first.slice(0, index).join(".");
      }
    }

    return first.join(".");
  })();

  console.info(`Global namespace '${globalNs}'`);

  const sc = new ScenarioCodeGenerator(context, exports_, scanner, globalNs);
  for (const [major, params] of output_files) {
    const plugin = all_plugins_.get(major);
    if (!plugin) {
      sc.ConsoleError(`Plugin ${major} Not Found!`);
    } else if (!(await plugin.GenerateCode(sc, params))) {
      sc.ConsoleError(`Plugin ${major} Failed!`);
    }
  }

  if (sc.warning_ || sc.warning_) Context.ConsoleWarning(`==== ${sc.warning_} Warning(s), ${sc.error_} Error(s)! ====`);

  process.exit(sc.error_);
}

Main().catch((err) => {
  console.error(`Error ${err}\n\t${err?.stack}`);
});
