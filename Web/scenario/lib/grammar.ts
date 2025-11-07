import { Action, Token } from "../grammar/scenario.jy.js";

import { LexicalScanner, CreateGenerator, DebugTraceLexicalScanner, Handler, kOpCode } from "../../jsFlex/jsFlex.js";

import { Tokenize } from "./tokenize.js";

import * as jsScenarioManager from "../../Assembly/jsScenarioManager_wasm.js";

function console_error(m: string) {
  console.error(`%c${m}`, "color: red");
}
function console_warning(m: string) {
  console.warn(`%c${m}`, "color: darkorange");
}

export type integer = number;
export type Addr = integer;

export class TokenCCl {
  constructor(neg: boolean) {
    this.neg_ = neg;
  }
  set_ = new Set<integer>();
  ref_ = new Set<integer>();
  cod_ = -1; /* MakeNil || MakeChr || MakeCCl */
  neg_: boolean;
}

export class TokenExtRef {
  constructor(ref: integer) {
    this.ref_ = ref;
  }
  readonly ref_: integer;
}

function OpCodeValue(op: integer, v = 0) {
  return (op << 24) | v;
}

type RegExpExprCode = integer | TokenCCl | TokenExtRef;
export class RegExpExpr {
  Merge(re: RegExpExpr) {
    this.value_.push(...re.value_);
    return this;
  }

  Link(...code: RegExpExprCode[]) {
    this.value_.push(...code);
    return this;
  }

  readonly value_ = <RegExpExprCode[]>[];
  bol_ = false;
}

export class StateValue {
  constructor(name: integer) {
    this.name_ = name;
  }
  readonly name_: integer;
  value_ = -1;
  declare_ = false;
}

export class EventValue {
  constructor(name: integer) {
    this.name_ = name;
  }
  readonly name_: integer;
  value_ = -1;
  declare_ = false;
}

export class DefineValue {
  constructor(name: integer, re: RegExpExpr) {
    this.name_ = name;
    this.re_ = re;
  }
  readonly name_: integer;
  readonly re_: RegExpExpr;
}

export class StateGroupValue {
  constructor(name: integer) {
    this.name_ = name;
  }
  readonly name_: integer;
  set_ = new Set<integer>();
  ref_ = new Set<integer>();
  declare_ = false;
  export_ = false;
}

export class EventGroupValue {
  constructor(name: integer) {
    this.name_ = name;
  }
  readonly name_: integer;
  set_ = new Set<integer>();
  ref_ = new Set<integer>();
  declare_ = false;
  export_ = false;
}

export class StartStateValue {
  set_ = new Set<integer>();
  ref_ = new Set<integer>();
}

export class ActionCode {
  constructor(file = "", line = -1, code = "") {
    this.file_ = file;
    this.line_ = line;
    this.code_ = code;
  }

  readonly file_: string;
  readonly line_: integer;
  readonly code_: string;
}

export class ActionValue {
  constructor(name: string, re: RegExpExpr, start: StartStateValue, code?: ActionCode) {
    this.start_ = start;
    this.name_ = name;
    this.re_ = re;
    this.code_ = code ? code : new ActionCode();
  }
  readonly start_: StartStateValue;
  readonly name_: string;
  readonly re_: RegExpExpr;
  readonly code_: ActionCode;

  rule_id_ = -1;
}

export type TypeGrammar =
  | void
  | null
  | boolean
  | integer
  | number
  | string
  | TokenCCl
  | TokenExtRef
  | RegExpExpr
  | StateValue
  | EventValue
  | DefineValue
  | StateGroupValue
  | EventGroupValue
  | StartStateValue
  | ActionValue
  | ActionCode;

export class Scenario {
  constructor(context: Context, name: string) {
    this.scenario_name_ = name;
    this.context_ = context;
    this.LookupState("INITIAL", true);
  }

  LookupState(state: string, decl: boolean): StateValue {
    const index = this.context_.NameScopeId(this.scenario_name_, state);
    let value = this.state_list_.get(index);

    if (!value) {
      value = new StateValue(index);
      value.declare_ = decl;
      this.state_list_.set(index, value);
    } else if (!value.declare_) {
      value.declare_ = decl;
    } else if (decl) {
      throw this.context_.GrammarError(`State ${state} declared already!`);
    }

    return value;
  }

  LookupStateGroup(group: string, decl: boolean): StateGroupValue {
    const index = this.context_.NameScopeId(this.scenario_name_, group);
    let value = this.state_group_.get(index);

    if (!value) {
      value = new StateGroupValue(index);
      value.declare_ = decl;
      this.state_group_.set(index, value);
    } else if (!value.declare_) {
      value.declare_ = decl;
    } else if (decl) {
      throw this.context_.GrammarError(`State-group ${group} declared already!`);
    }

    return value;
  }

  LookupEvent(event: string, decl: boolean): EventValue {
    const index = this.context_.NameScopeId(this.scenario_name_, event);
    let value = this.event_list_.get(index);

    if (!value) {
      value = new EventValue(index);
      value.declare_ = decl;
      this.event_list_.set(index, value);
    } else if (!value.declare_) {
      value.declare_ = decl;
    } else if (decl) {
      throw this.context_.GrammarError(`Event ${event} declared already!`);
    }

    return value;
  }

  LookupEventGroup(group: string, decl: boolean): EventGroupValue {
    const index = this.context_.NameScopeId(this.scenario_name_, group);
    let value = this.event_group_.get(index);

    if (!value) {
      value = new EventGroupValue(index);
      value.declare_ = decl;
      this.event_group_.set(index, value);
    } else if (!value.declare_) {
      value.declare_ = decl;
    } else if (decl) {
      throw this.context_.GrammarError(`Event-group ${group} declared already!`);
    }

    return value;
  }

  NewDefineValue(name: string, re: RegExpExpr): DefineValue {
    const index = this.context_.NameScopeId(this.scenario_name_, name);

    let value = this.define_list_.get(index);
    if (value) {
      throw this.context_.GrammarError(`Define-value ${name} declared already!`);
    }

    value = new DefineValue(index, re);
    this.define_list_.set(index, value);
    return value;
  }

  NewActionValue(name: string, re: RegExpExpr, start: StartStateValue, code?: ActionCode) {
    let value = new ActionValue(name, re, start, code);
    if (name[0] !== "#") {
      if (this.action_names_.has(name)) throw this.context_.GrammarError(`Action ${name} declared already!`);
      this.action_names_.add(name);
    }
    this.action_list_.push(value);
    return value;
  }

  readonly scenario_name_: string;
  readonly context_: Context;

  state_list_ = new Map<integer, StateValue>();
  state_group_ = new Map<integer, StateGroupValue>();

  event_list_ = new Map<integer, EventValue>();
  event_group_ = new Map<integer, EventGroupValue>();
  define_list_ = new Map<integer, DefineValue>();

  action_names_ = new Set<string>();
  action_list_ = new Array<ActionValue>();
  package_name_ = "";
  declare_ = false;
}

export type ExportValue = { name: string; value: integer };
export type ExportGroup = { name: string; value: Array<integer> };
export type ExportAction = ExportValue & { file: string; line: integer; code: string };
export type ExportScenario = {
  package: string;
  name: string;

  state: Array<ExportValue>;
  event: Array<ExportValue>;
  action: Array<ExportAction>;
  group: {
    state: Array<ExportGroup>;
    event: Array<ExportGroup>;
  };
};

const kMaxTTL = 16;
export class Context {
  static ConsoleError(m: string) {
    return console_error(m);
  }
  static ConsoleWarning(m: string) {
    return console_warning(m);
  }
  static DebugTraceLexicalScanner(scanner: LexicalScanner) {
    DebugTraceLexicalScanner(scanner);
  }

  static async Create(verbose = false) {
    const self = new Context(verbose);
    [self.grammar_, self.tokenize_] = await Promise.all([Grammar.Create(self), Tokenize.Create(self)]);
    return self;
  }

  private constructor(verbose: boolean) {
    this.verbose_ = verbose;
  }
  private yylex(): [token: integer, value: TypeGrammar] {
    const result = this.tokenize_!.Next();
    if (typeof result === "number") return [result, void 0];
    return result;
  }

  Parse(file: string, content: string): Context {
    if (content[0] === "\uFEFF") content = content.slice(1); // UTF8 BOM ...
    this.grammar_!.Initialize(file);
    this.tokenize_!.Initialize(file, content);

    for (;;) {
      const [token, value] = this.yylex();
      const line = this.tokenize_!.GetLine();
      if (0 === this.grammar_!.Next(line, token, value)) break;
    }
    return this;
  }

  PrepareMachine() {
    let error = 0;
    const all_state_or_group = new Set<integer>();
    const all_event_or_group = new Set<integer>();
    console.assert(0 === this.all_scenario_.length);

    const all_scenario = this.all_scenario_;
    for (const [, scenario] of this.name_scenario__) {
      if (!scenario.declare_) console_error(`${++error} Scenario ${scenario.scenario_name_} 404 Not Found!`);
      all_scenario.push(scenario);
    }

    all_scenario.sort((a, b) => {
      let r = a.package_name_.localeCompare(b.package_name_);
      if (0 === r) r = a.scenario_name_.localeCompare(b.scenario_name_);
      return r;
    });

    for (const scenario of all_scenario) {
      for (const [index, state] of scenario.state_list_) {
        console.assert(index === state.name_);
        all_state_or_group.add(index);

        state.value_ = this.next_state_value_++;
        this.index_state_map_.set(index, state.value_);

        if (!state.declare_) {
          const [scope, id] = this.LookupScopeId(index);
          console_error(`${++error} State ${scope}.${id} Not Found!`);
        }
      }

      for (const [index, group] of scenario.state_group_) {
        console.assert(index === group.name_);
        if (!group.declare_) {
          const [scope, id] = this.LookupScopeId(index);
          console_error(`${++error} State.Group ${scope}.${id} Not Found!`);
        }

        if (all_state_or_group.has(index)) {
          const [scope, id] = this.LookupScopeId(index);
          console_error(`${++error} State/Group redefinition of ${scope}.${id}`);
        } else {
          all_state_or_group.add(index);
        }
      }

      for (const [index, event] of scenario.event_list_) {
        console.assert(index === event.name_);
        all_event_or_group.add(index);

        event.value_ = this.next_event_value_++;
        this.index_event_map_.set(index, event.value_);
        if (!event.declare_) {
          const [scope, id] = this.LookupScopeId(index);
          console_error(`${++error} Event ${scope}.${id} Not Found!`);
        }
      }

      for (const [index, group] of scenario.event_group_) {
        console.assert(index === group.name_);
        if (!group.declare_) {
          const [scope, id] = this.LookupScopeId(index);
          console_error(`${++error} Event.Group ${scope}.${id} Not Found!`);
        }

        if (all_event_or_group.has(index)) {
          const [scope, id] = this.LookupScopeId(index);
          console_error(`${++error} Event/Group/Macro redefinition of ${scope}.${id}`);
        } else {
          all_event_or_group.add(index);
        }
      }

      for (const [index, macro] of scenario.define_list_) {
        console.assert(index === macro.name_);
        if (all_event_or_group.has(index)) {
          const [scope, id] = this.LookupScopeId(index);
          console_error(`${++error} Event/Group/Macro redefinition of ${scope}.${id}`);
        }
      }
    }

    console.info(`NEXT-STATE: ${this.next_state_value_}, NEXT-EVENT: ${this.next_event_value_}`);

    if (error) console_warning(`PrepareMachine #1 error count ${error}`);

    for (const scenario of all_scenario) error += this.resolve_group_value(scenario);
    for (const scenario of all_scenario) error += this.resolve_define_value(scenario);
    for (const scenario of all_scenario) error += this.resolve_action_value(scenario);

    if (error) console_error(`PrepareMachine #2 error count ${error}`);
    return error;
  }

  async GenerateMachine(caseless: boolean): Promise<LexicalScanner> {
    const bindings = await Tokenize.CreateBindings();
    const SCON_COUNT_ = this.next_state_value_ ? this.next_state_value_ : 1;
    const CSIZE_ = this.next_event_value_;

    const handler = new (class implements Handler {
      CSize(): integer {
        return CSIZE_;
      }
      GetNamedCcl(ccl: Set<integer>, name: string): void {
        throw Error(`[N/A]GetNamedCcl`);
      }
      GetNamedValue(name: string): Array<integer> {
        throw Error(`[N/A]GetNamedValue`);
      }
      LocalCharMapper(c: integer, nil: boolean): integer {
        return c;
      }
      LookupNamedValue(name: string): boolean {
        throw Error(`[N/A]LookupNamedValue`);
      }
      NegateCclAny(): Array<integer> {
        throw Error(`[N/A]NegateCclAny`);
      }
      SCON_COUNT(): integer {
        return SCON_COUNT_;
      }
      SetNamedValue(name: string, re: Array<integer>): void {
        throw Error(`[N/A]SetNamedValue`);
      }
    })();

    const generator = await CreateGenerator(handler, caseless, bindings);
    const normalized = (re: RegExpExpr) => {
      console.assert(0 !== re.value_.length);
      const result = <integer[]>[];
      for (const code of re.value_) {
        if (code instanceof TokenCCl) {
          if (code.cod_ < 0) {
            console.assert(!code.ref_.size);
            const list = [...code.set_];
            if (0 === list.length && !code.neg_) {
              code.cod_ = OpCodeValue(kOpCode.MakeNil);
            } else if (1 === list.length && !code.neg_) {
              code.cod_ = OpCodeValue(kOpCode.MakeChr, list[0]);
            } else {
              const ccl = generator.AddNewCCl(code.neg_, list);
              code.cod_ = OpCodeValue(kOpCode.MakeCcl, ccl);
            }
          }
          result.push(code.cod_);
        } else if (code instanceof TokenExtRef) {
          const ref = this.index_extref_map_.get(code.ref_)!;
          result.push(...normalized(ref));
        } else {
          result.push(code);
        }
      }
      return result;
    };

    try {
      let start_state: null | StartStateValue = null;

      for (const scenario of this.all_scenario_) {
        for (const action of scenario.action_list_) {
          if (start_state !== action.start_) {
            start_state = action.start_;
            console.assert(start_state.set_.size && 0 === start_state.ref_.size);
            generator.SetSconList([...start_state.set_].map((v) => v + 1));
          }

          action.rule_id_ = generator.AddNewRule(action.re_.bol_, normalized(action.re_));
          console.info(`AddRule ${action.rule_id_} ${scenario.scenario_name_}.${action.name_}`);
        }
      }

      const scanner = generator.GenerateScanner();
      for (let c = 257; c < 260; ++c) console.assert(scanner.yy_ec[c] === scanner.YY_CHARNIL);
      scanner.yy_ec[0] = scanner.yy_ec[256];

      return scanner;
    } finally {
      generator.Close();
    }
  }

  ExportMachine(exportAll = false): Array<ExportScenario> {
    const result = <ExportScenario[]>[];

    for (const scenario of this.all_scenario_) {
      const name = scenario.scenario_name_;

      const export_: ExportScenario = {
        package: scenario.package_name_,
        name: scenario.scenario_name_,

        state: [],
        event: [],
        action: [],
        group: {
          state: [],
          event: [],
        },
      };

      for (const [index, state] of scenario.state_list_) {
        const [scope, id] = this.LookupScopeId(index);
        console.assert(index === state.name_ && scope === name);
        export_.state.push({ name: id, value: state.value_ });
      }

      for (const [index, event] of scenario.event_list_) {
        const [scope, id] = this.LookupScopeId(index);
        console.assert(index === event.name_ && scope === name);
        export_.event.push({ name: id, value: event.value_ });
      }

      for (const action of scenario.action_list_) {
        export_.action.push({
          name: action.name_,
          value: action.rule_id_,
          file: action.code_.file_,
          line: action.code_.line_,
          code: action.code_.code_,
        });
      }

      for (const [index, group] of scenario.state_group_) {
        const [scope, id] = this.LookupScopeId(index);
        console.assert(index === group.name_ && scope === name);
        if (exportAll || group.export_)
          export_.group.state.push({
            name: id,
            value: [...group.set_].sort((a, b) => a - b),
          });
      }

      for (const [index, group] of scenario.event_group_) {
        const [scope, id] = this.LookupScopeId(index);
        console.assert(index === group.name_ && scope === name);
        if (exportAll || group.export_)
          export_.group.event.push({
            name: id,
            value: [...group.set_].sort((a, b) => a - b),
          });
      }

      result.push(export_);
    }
    return result;
  }

  GrammarError(m: string) {
    return Error(`GrammarError ${m} @${this.grammar_?.GetFile()}:${this.grammar_?.GetLine()}`);
  }

  NameScopeId(scope: string, id: string): integer {
    if (scope === "") scope = this.CurrentScenarioName();

    let scope_index = this.scope_index_map_.get(scope);
    if (!scope_index) {
      scope_index = new Map<string, integer>();
      this.scope_index_map_.set(scope, scope_index);
    }

    let v = scope_index.get(id);
    if (v !== void 0) return v;

    v = this.next_name_index_++;
    scope_index.set(id, v);
    this.index_info_map_.set(v, [scope, id]);
    return v;
  }

  LookupScopeId(index: integer): [scope: string, id: string] {
    return this.index_info_map_.get(index)!;
  }

  LookupScenario(name: string): Scenario {
    let scenario = this.name_scenario__.get(name);
    if (scenario) return scenario;
    scenario = new Scenario(this, name);
    this.name_scenario__.set(name, scenario);
    return scenario;
  }

  ReadCode() {
    return this.tokenize_!.ReadCode();
  }

  CurrentScenarioName() {
    return this.grammar_!.GetScenarioName();
  }

  private next_name_index_ = 1;
  private scope_index_map_ = new Map<string, Map<string, integer>>();
  private index_info_map_ = new Map<integer, [scope: string, id: string]>();
  private name_scenario__ = new Map<string, Scenario>();

  private grammar_?: Grammar;
  private tokenize_?: Tokenize;

  /* Code generate ... */
  private next_event_value_ = 260;
  private next_state_value_ = 0;

  private resolve_state_group(group: StateGroupValue, ttl: integer) {
    const error_trace = (m: string) => {
      const [scope, id] = this.LookupScopeId(group.name_);
      console_error(`resolve_state_group ${scope}.${id} Error ${m}`);
      return false;
    };

    if (ttl < 1) return error_trace(`TTL < 1`);

    const ref = [...group.ref_];

    group.ref_.clear();
    for (const index of ref) {
      const state = this.index_state_map_.get(index);
      if (state !== void 0) {
        group.set_.add(state);
        continue;
      }

      const ref = this.index_state_group_map_.get(index);
      if (ref) {
        for (const v of ref) group.set_.add(v);
        continue;
      }

      const [scope, id] = this.LookupScopeId(index);
      const scenario = this.name_scenario__.get(scope);
      if (!scenario) return error_trace(`scenario ${scope}.${id} Not Found!`);

      const g = scenario.state_group_.get(index);
      if (!g) return error_trace(`state-group ${scope}.${id} Not Found!`);

      if (!this.resolve_state_group(g, ttl - 1)) return error_trace(`resolve ${scope}.${id} Failed!`);

      for (const v of this.index_state_group_map_.get(index)!) group.set_.add(v);
    }

    if (!group.set_.size) return error_trace(`empty group!`);

    this.index_state_group_map_.set(group.name_, group.set_);
    return true;
  }

  private resolve_event_group(group: EventGroupValue, ttl: integer) {
    const error_trace = (m: string) => {
      const [scope, id] = this.LookupScopeId(group.name_);
      console_error(`resolve_event_group ${scope}.${id} Error ${m}`);
      return false;
    };

    if (ttl < 1) return error_trace(`TTL < 1`);

    const ref = [...group.ref_];

    group.ref_.clear();
    for (const index of ref) {
      const event = this.index_event_map_.get(index);
      if (event !== void 0) {
        group.set_.add(event);
        continue;
      }

      const ref = this.index_event_group_map_.get(index);
      if (ref) {
        for (const v of ref) group.set_.add(v);
        continue;
      }

      const [scope, id] = this.LookupScopeId(index);
      const scenario = this.name_scenario__.get(scope);
      if (!scenario) return error_trace(`scenario ${scope}.${id} Not Found!`);

      const g = scenario.event_group_.get(index);
      if (!g) return error_trace(`event-group ${scope}.${id} Not Found!`);

      if (!this.resolve_event_group(g, ttl - 1)) return error_trace(`resolve ${scope}.${id} Failed!`);

      for (const v of this.index_event_group_map_.get(index)!) group.set_.add(v);
    }

    if (!group.set_.size) /* Warning */ /* return */ error_trace(`empty group!`);

    this.index_event_group_map_.set(group.name_, group.set_);
    return true;
  }

  private resolve_regexp_ccl(ccl: TokenCCl, error_trace: (m: string) => boolean) {
    const ref = [...ccl.ref_];

    ccl.ref_.clear();
    for (const index of ref) {
      const [scope, id] = this.LookupScopeId(index);
      const scenario = this.name_scenario__.get(scope);
      if (!scenario) return error_trace(`CCl-lookup ${scope}.${id} Not Found!`);

      const group = scenario.event_group_.get(index);
      if (group) {
        for (const event of group.set_) ccl.set_.add(event);
      } else {
        const event = scenario.event_list_.get(index);
        if (event === void 0) return error_trace(`CCl-lookup ${scope}.${id} Not Found!`);
        console.assert(event.value_ > 0);
        ccl.set_.add(event.value_);
      }
    }

    return true;
  }

  private resolve_start_state(start: StartStateValue, error_trace: (m: string) => boolean) {
    const ref = [...start.ref_];

    start.ref_.clear();
    for (const index of ref) {
      const [scope, id] = this.LookupScopeId(index);
      const scenario = this.name_scenario__.get(scope);
      if (!scenario) return error_trace(`Start-state-lookup ${scope}.${id} Not Found!`);

      const group = scenario.state_group_.get(index);
      if (group) {
        for (const state of group.set_) start.set_.add(state);
      } else {
        const state = scenario.state_list_.get(index);
        if (state === void 0) return error_trace(`Start-state-lookup ${scope}.${id} Not Found!`);
        console.assert(state.value_ >= 0);
        start.set_.add(state.value_);
      }
    }

    if (!start.set_.size) return error_trace(`Start-state-lookup empty set!`);

    return true;
  }

  private resolve_regexp_ext(ext: TokenExtRef, ttl: integer, error_trace: (m: string) => boolean) {
    const index = ext.ref_;
    if (this.index_extref_map_.has(index)) return true;

    const [scope, id] = this.LookupScopeId(index);
    if (ttl < 1) return error_trace(`Ext-lookup ${scope}.${id} TTL < 1`);

    const scenario = this.name_scenario__.get(scope);
    if (!scenario) return error_trace(`Ext-lookup ${scope}.${id} Not Found!`);

    const macro = scenario.define_list_.get(index);
    if (macro) return this.resolve_define_regexp(macro, ttl - 1);

    const re = new RegExpExpr();
    const group = scenario.event_group_.get(index);
    if (group) {
      const size = group.set_.size;
      if (0 === size) {
        re.value_.push(OpCodeValue(kOpCode.MakeNil));
      } else if (1 === size) {
        for (const v of group.set_) re.value_.push(OpCodeValue(kOpCode.MakeChr, v));
      } else {
        const ccl = new TokenCCl(false);
        for (const v of group.set_) ccl.set_.add(v);
        re.value_.push(ccl);
      }
    } else {
      const event = scenario.event_list_.get(index);
      if (event === void 0) return error_trace(`Ext-lookup ${scope}.${id} Not Found!`);
      console.assert(event.value_ > 0);
      re.value_.push(OpCodeValue(kOpCode.MakeChr, event.value_));
    }

    this.index_extref_map_.set(index, re);
    return true;
  }

  private resolve_define_regexp(macro: DefineValue, ttl: integer) {
    const error_trace = (m: string) => {
      const [scope, id] = this.LookupScopeId(macro.name_);
      console_error(`resolve_define_regexp ${scope}.${id} Error ${m}`);
      return false;
    };

    if (ttl < 1) return error_trace(`TTL < 1`);

    for (const code of macro.re_.value_) {
      if (code instanceof TokenCCl) {
        if (!this.resolve_regexp_ccl(code, error_trace)) return false;
      } else if (code instanceof TokenExtRef) {
        if (!this.resolve_regexp_ext(code, ttl - 1, error_trace)) return false;
      }
    }

    this.index_extref_map_.set(macro.name_, macro.re_);
    return true;
  }

  private resolve_group_value(scenario: Scenario) {
    let error = 0;

    for (const [index, group] of scenario.state_group_) {
      if (this.index_state_group_map_.has(index)) continue;
      if (!this.resolve_state_group(group, kMaxTTL)) ++error;
    }

    for (const [index, group] of scenario.event_group_) {
      if (this.index_event_group_map_.has(index)) continue;
      if (!this.resolve_event_group(group, kMaxTTL)) ++error;
    }

    return error;
  }

  private resolve_define_value(scenario: Scenario) {
    let error = 0;
    for (const [index, macro] of scenario.define_list_) {
      if (this.index_extref_map_.has(index)) continue;
      if (!this.resolve_define_regexp(macro, kMaxTTL)) ++error;
    }
    return error;
  }

  private resolve_action_value(scenario: Scenario) {
    let error = 0;

    for (const action of scenario.action_list_) {
      const error_trace = (m: string) => {
        console_error(`resolve_action_value ${scenario.scenario_name_}.${action.name_} Error ${m}`);
        return false;
      };

      if (!this.resolve_start_state(action.start_, error_trace)) ++error;

      for (const code of action.re_.value_) {
        if (code instanceof TokenCCl) {
          if (!this.resolve_regexp_ccl(code, error_trace)) ++error;
        } else if (code instanceof TokenExtRef) {
          if (!this.resolve_regexp_ext(code, kMaxTTL, error_trace)) ++error;
        }
      }
    }

    return error;
  }

  private index_state_map_ = new Map<integer, integer>();
  private index_event_map_ = new Map<integer, integer>();
  private index_state_group_map_ = new Map<integer, Set<integer>>();
  private index_event_group_map_ = new Map<integer, Set<integer>>();
  private index_extref_map_ = new Map<integer, RegExpExpr>();
  private all_scenario_ = new Array<Scenario>();
  verbose_: boolean;
}

interface Native_ {
  jsGrammar_yyLen(): integer;
  jsGrammar_yyOffset(): integer;
  jsGrammar_yyNextState(reason: integer): integer;
  _initialize(): void;
}

const kStackSize = 256,
  kMaxIterValue = 65535;
export class Grammar {
  static async Create(context: Context): Promise<Grammar> {
    const memory = new WebAssembly.Memory({ initial: 1, maximum: 1 });
    if (!Grammar.wasmModule_) Grammar.wasmModule_ = await WebAssembly.compile(jsScenarioManager.Assets());

    const instance = await WebAssembly.instantiate(Grammar.wasmModule_, {
      env: {
        memory,
      },
      rLANG: {
        jsGrammar_yyError,
        jsGrammar_yyCopyValue,
      },
    });
    const jsGrammarObject = new Grammar(instance, context);

    function jsGrammar_yyError(prefix: Addr, symbol: Addr) {
      const buffer = Buffer.from(memory.buffer);
      let prefix_end = prefix,
        symbol_end = symbol;
      while (0 !== buffer[prefix_end]) ++prefix_end;
      while (0 !== buffer[symbol_end]) ++symbol_end;
      const s_prefix = buffer.subarray(prefix, prefix_end).toString();
      const s_symbol = buffer.subarray(symbol, symbol_end).toString();
      console_error(`${s_prefix} ${s_symbol}`);
    }
    function jsGrammar_yyCopyValue(offset: integer) {
      jsGrammarObject.yyvsa_[offset] = jsGrammarObject.yylval_;
      jsGrammarObject.yylval_ = void 0;
    }
    return jsGrammarObject;
  }

  private constructor(instance: WebAssembly.Instance, context: Context) {
    this.yylval_ = void 0;
    this.yyvsa_ = new Array<TypeGrammar>(kStackSize + 4);
    this.native_ = <Native_>(<unknown>instance.exports);
    this.native_._initialize();
    this.context_ = context;

    /* [^\r\n] */
    this.ccl_any_ = new TokenCCl(true);
    this.ccl_any_.set_.add(13);
    this.ccl_any_.set_.add(10);
  }

  Initialize(file: string) {
    this.file_ = file;
    this.line_ = -1;
    this.yyvsa_.fill(void 0);
    this.yylval_ = void 0;
    this.scenario_name_ = "";
    this.scenario_ = void 0;
    this.current_start_state_ = void 0;
    this.current_event_group_ = void 0;
    this.current_start_state_ = void 0;

    this.error_ = this.native_.jsGrammar_yyNextState(-1);
    console.assert(this.error_ === -1);
  }

  Next(line: integer, token: integer, value?: TypeGrammar) {
    this.line_ = line;

    if (token < 0) throw this.EINVAL(`Token ${token} .LT. 0`);
    else if (token > Token.$MAX_TOKEN_VALUE) throw this.ERANGE(`Token ${token} .GT. Max`);
    else if (this.error_ !== -1) throw this.EBADFD(`Invalid state ${this.error_}`);

    this.yylval_ = value;
    this.error_ = this.native_.jsGrammar_yyNextState(token);

    for (;;) {
      if (this.error_ <= 0) {
        if (this.error_ < -1) throw this.EBADFD(`Invalid Grammar.state ${this.error_}`);
        return this.error_;
      }

      this.reduce_(this.error_);
      this.error_ = this.native_.jsGrammar_yyNextState(-2);
    }
  }

  GetScenarioName() {
    if (this.scenario_name_ === "") throw this.EINVAL(`Empty Scenario.Name`);
    return this.scenario_name_;
  }

  private reduce_(rule: integer) {
    const argc = this.native_.jsGrammar_yyLen();
    const offset = this.native_.jsGrammar_yyOffset();

    let $$ = this.yyvsa_[offset + 1];
    const $ = (index: integer) => {
      console.assert(index >= 1 && index <= argc && offset + index < kStackSize);
      return this.yyvsa_[offset + index];
    };

    switch (rule) {
      case Action.AC_PACKAGE_DECLARE:
        this.next_package_name_ = <string>$(2);
        break;

      case Action.AC_PACKAGE_NAME2:
        $$ = `${$$}.${$(3)}`;
        break;

      case Action.AC_SCENARIO_NAME:
        this.scenario_name_ = <string>$(1);
        this.scenario_ = this.context_.LookupScenario(this.scenario_name_);
        if (this.scenario_.declare_) throw this.EINVAL(`Scenario ${this.scenario_name_} declared already!`);
        this.scenario_.package_name_ = this.next_package_name_;
        this.scenario_.declare_ = true;
        break;

      case Action.AC_STATE_1:
        this.scenario_!.LookupState(<string>$(1), true);
        break;

      case Action.AC_STATE_2:
        this.scenario_!.LookupState(<string>$(3), true);
        break;

      case Action.AC_EVENT_1:
        this.scenario_!.LookupEvent(<string>$(1), true);
        break;

      case Action.AC_EVENT_2:
        this.scenario_!.LookupEvent(<string>$(3), true);
        break;

      case Action.AC_EXPORT_GROUP_FALSE:
        this.next_export_group_ = false;
        break;

      case Action.AC_EXPORT_GROUP_TRUE:
        this.next_export_group_ = true;
        break;

      case Action.AC_STATE_GROUP_NAME:
        this.current_state_group_ = this.scenario_!.LookupStateGroup(<string>$(1), true);
        this.current_state_group_.export_ = this.next_export_group_;
        break;

      case Action.AC_STATE_GROUP_1:
        {
          const state = this.scenario_!.LookupState(<string>$(1), false);
          this.current_state_group_!.ref_.add(state.name_);
        }
        break;

      case Action.AC_STATE_GROUP_2:
        {
          const scenario = this.context_.LookupScenario(<string>$(1));
          const state = scenario.LookupState(<string>$(3), false);
          this.current_state_group_!.ref_.add(state.name_);
        }
        break;

      case Action.AC_STATE_GROUP_G1:
        {
          const group = this.scenario_!.LookupStateGroup(<string>$(2), false);
          this.current_state_group_!.ref_.add(group.name_);
        }
        break;

      case Action.AC_STATE_GROUP_G2:
        {
          const scenario = this.context_.LookupScenario(<string>$(2));
          const group = scenario.LookupStateGroup(<string>$(4), false);
          this.current_state_group_!.ref_.add(group.name_);
        }
        break;

      case Action.AC_EVENT_GROUP_NAME:
        this.current_event_group_ = this.scenario_!.LookupEventGroup(<string>$(1), true);
        this.current_event_group_.export_ = this.next_export_group_;
        break;

      case Action.AC_EVENT_GROUP_1:
        {
          const event = this.scenario_!.LookupEvent(<string>$(1), false);
          this.current_event_group_!.ref_.add(event.name_);
        }
        break;

      case Action.AC_EVENT_GROUP_2:
        {
          const scenario = this.context_.LookupScenario(<string>$(1));
          const event = scenario.LookupEvent(<string>$(3), false);
          this.current_event_group_!.ref_.add(event.name_);
        }
        break;

      case Action.AC_EVENT_GROUP_G1:
        {
          const group = this.scenario_!.LookupEventGroup(<string>$(2), false);
          this.current_event_group_!.ref_.add(group.name_);
        }
        break;

      case Action.AC_EVENT_GROUP_G2:
        {
          const scenario = this.context_.LookupScenario(<string>$(2));
          const group = scenario.LookupEventGroup(<string>$(4), false);
          this.current_event_group_!.ref_.add(group.name_);
        }
        break;

      case Action.AC_START_STATE_DECLARE:
        this.current_start_state_ = new StartStateValue();
        break;

      case Action.AC_START_STATE_1:
        {
          const state = this.scenario_!.LookupState(<string>$(1), false);
          this.current_start_state_!.ref_.add(state.name_);
        }
        break;

      case Action.AC_START_STATE_2:
        {
          const scenario = this.context_.LookupScenario(<string>$(1));
          const state = scenario.LookupState(<string>$(3), false);
          this.current_start_state_!.ref_.add(state.name_);
        }
        break;

      case Action.AC_START_STATE_G1:
        {
          const group = this.scenario_!.LookupStateGroup(<string>$(2), false);
          this.current_start_state_!.ref_.add(group.name_);
        }
        break;

      case Action.AC_START_STATE_G2:
        {
          const scenario = this.context_.LookupScenario(<string>$(2));
          const group = scenario.LookupStateGroup(<string>$(4), false);
          this.current_start_state_!.ref_.add(group.name_);
        }
        break;

      case Action.AC_ACTION_DECLARE_0:
        this.scenario_!.NewActionValue(
          `#${this.line_}`,
          <RegExpExpr>$(2),
          this.current_start_state_!,
          <ActionCode>$(3)
        );
        break;

      case Action.AC_ACTION_DECLARE_1:
        this.scenario_!.NewActionValue(<string>$(2), <RegExpExpr>$(3), this.current_start_state_!, <ActionCode>$(4));
        break;

      case Action.AC_ACTION_OPT_CODE_NULL:
        $$ = new ActionCode();
        break;

      case Action.AC_ACTION_OPT_CODE_START:
        $$ = new ActionCode(this.file_, this.line_, this.context_.ReadCode());
        break;

      case Action.AC_DEFINE_EXPR:
        {
          const re = <RegExpExpr>$(3);
          if (re.bol_) throw this.EINVAL(`Unsupported BOL('^') in define value`);
          this.scenario_!.NewDefineValue(<string>$(2), <RegExpExpr>$(3));
        }
        break;

      case Action.AC_REGEXP_RE:
        $$ = $(2);
        break;

      case Action.AC_REGEXP_RE_BOL:
        ($$ = <RegExpExpr>$(3)).bol_ = true;
        break;

      case Action.AC_RE_SERIES:
        break;

      case Action.AC_RE2_SERIES:
        (<RegExpExpr>$$).Merge(<RegExpExpr>$(3)).Link(OpCodeValue(kOpCode.MakeOr));
        break;

      case Action.AC_SERIES_SINGLETON:
        break;

      case Action.AC_SERIES2_SINGLETON:
        (<RegExpExpr>$$).Merge(<RegExpExpr>$(2)).Link(OpCodeValue(kOpCode.LinkNil));
        break;

      case Action.AC_SINGLETON_RE:
        $$ = $(2);
        break;

      case Action.AC_SINGLETON_MKCLOS:
        (<RegExpExpr>$$).Link(OpCodeValue(kOpCode.MakeClos));
        break;

      case Action.AC_SINGLETON_MKPOSCL:
        (<RegExpExpr>$$).Link(OpCodeValue(kOpCode.MakePoscl));
        break;

      case Action.AC_SINGLETON_MKOPT:
        (<RegExpExpr>$$).Link(OpCodeValue(kOpCode.MakeOpt));
        break;

      case Action.AC_SINGLETON_MKREP1:
      case Action.AC_SINGLETON_MKREP1X:
        {
          const op = rule === Action.AC_SINGLETON_MKREP1 ? kOpCode.MakeRep1 : kOpCode.MakeRep1X;
          const v = <integer>$(3);
          if (v <= 0 || v > kMaxIterValue) throw this.EINVAL(`{${v}} (v <= 0 || v > kMaxIterValue)`);
          (<RegExpExpr>$$).Link(OpCodeValue(op, v));
        }
        break;

      case Action.AC_SINGLETON_MKREP2EX:
        {
          const a = <integer>$(3),
            b = <integer>$(5);
          if (a < 0 || a > b || b < 1 || b > kMaxIterValue)
            throw this.EINVAL(`{${a},${b}} (a < 0 || a > b || b < 1 || b > kMaxIterValue)`);
          (<RegExpExpr>$$).Link(OpCodeValue(kOpCode.MakeRep2EX, a), b);
        }
        break;

      case Action.AC_SINGLETON_CHAR:
        ($$ = new RegExpExpr()).Link(OpCodeValue(kOpCode.MakeChr, <integer>$(1)));
        break;

      case Action.AC_SINGLETON_CCL:
        ($$ = new RegExpExpr()).Link(<TokenCCl>$(1));
        break;

      case Action.AC_SINGLETON_EXT:
        ($$ = new RegExpExpr()).Link(<TokenExtRef>$(1));
        break;

      case Action.AC_SINGLETON_EMPTY:
        ($$ = new RegExpExpr()).Link(OpCodeValue(kOpCode.MakeNil));
        break;

      case Action.AC_SINGLETON_STRING:
        $$ = $(2);
        break;

      case Action.AC_SINGLETON_ANYCHR:
        ($$ = new RegExpExpr()).Link(this.ccl_any_);
        break;

      case Action.AC_STRING_CHAR:
        ($$ = new RegExpExpr()).Link(OpCodeValue(kOpCode.MakeChr, <integer>$(1)));
        break;

      case Action.AC_STRING2_CHAR:
        (<RegExpExpr>$$).Link(OpCodeValue(kOpCode.LinkChr, <integer>$(2)));
        break;
    }

    for (let i = 2; i <= argc; ++i) this.yyvsa_[offset + i] = void 0;
    this.yyvsa_[offset + 1] = $$;
  }

  private EINVAL(m = "") {
    this.error_ = -22;
    return TypeError(`EINVAL ${m} @${this.file_}:${this.line_}`);
  }
  private EBADFD(m = "") {
    this.error_ = -77;
    return Error(`EBADFD ${m} @${this.file_}:${this.line_}`);
  }

  private ERANGE(m = "") {
    this.error_ = -34;
    return RangeError(`ERANGE ${m} @${this.file_}:${this.line_}`);
  }

  GetFile() {
    return this.file_;
  }
  GetLine() {
    return this.line_;
  }

  private static wasmModule_?: WebAssembly.Module;
  private readonly yyvsa_: TypeGrammar[];
  private readonly native_: Native_;
  private readonly ccl_any_: TokenCCl;

  private yylval_: TypeGrammar;
  private error_ = -77;
  private file_ = "";
  private line_ = -1;

  private scenario_name_ = "";
  private scenario_?: Scenario;
  private context_: Context;

  private current_state_group_?: StateGroupValue;
  private current_event_group_?: EventGroupValue;
  private current_start_state_?: StartStateValue;
  private next_export_group_ = false;
  private next_package_name_ = "";
}
