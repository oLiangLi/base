import { integer } from "../../World.js";
import { ScenarioCodeGenerator, Plugin } from "../index.js";
import * as fs from "node:fs/promises";

class JSONPlugin implements Plugin {
  Type(): string {
    return "json";
  }
  async GenerateCode(sc: ScenarioCodeGenerator, params: Map<string, string>): Promise<boolean> {
    for (const [key, value] of params) {
      console.info(`\t\t${key} => ${value}`);
    }

    let scanner = <typeof sc.scanner_>{};
    scanner.YY_LASTDFA = sc.scanner_.YY_LASTDFA;
    scanner.YY_JAMBASE = sc.scanner_.YY_JAMBASE;
    scanner.YY_DEFAULT = sc.scanner_.YY_DEFAULT;
    scanner.YY_CHARSIZ = sc.scanner_.YY_CHARSIZ;
    scanner.YY_CHARNIL = sc.scanner_.YY_CHARNIL;

    function ArrayOf(v: typeof sc.scanner_.yy_accept) {
      const result = new Array<integer>(v.length);
      for (let i = 0; i < v.length; ++i) result[i] = v[i];
      return result;
    }

    scanner.yy_accept = ArrayOf(sc.scanner_.yy_accept);
    scanner.yy_ec = ArrayOf(sc.scanner_.yy_ec);
    scanner.yy_meta = ArrayOf(sc.scanner_.yy_meta);
    scanner.yy_base = ArrayOf(sc.scanner_.yy_base);
    scanner.yy_def = ArrayOf(sc.scanner_.yy_def);
    scanner.yy_nxt = ArrayOf(sc.scanner_.yy_nxt);
    scanner.yy_chk = ArrayOf(sc.scanner_.yy_chk);

    const file = params.get("file") || "foobar.json";
    try {
      await fs.writeFile(file, JSON.stringify({ machine: sc.machine_, scanner }, null, " "));
    } catch (err) {
      sc.ConsoleError(`${err}\n\t${(<Error>err)?.stack}`);
      return false;
    }
    return true;
  }
}

export default new JSONPlugin();
