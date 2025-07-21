/**
 * Scripting API: https://help.aidungeon.com/scripting
 * 
 * Scripting Guidebook: https://github.com/magicoflolis/aidungeon.js/blob/main/Scripting%20Guidebook.md
 */

/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>

//#region Director

/**
 * Similar to {@link Modifier} type and {@link modifier} function.
 *
 * @typedef { <T extends typeof text, S extends typeof stop>(this: typeof Director, text: T, stop: S, type: 'library') => { text: T; stop?: S } } ModifierFN
 */

//#region Console

Error.stackTraceLimit = 3;

class AIDError extends Error {
  /**
   * @param { string } [message]
   * @param { ErrorOptions } [options]
   */
  constructor(message, options) {
    super(message, options);
    const stack = this.stack || '';
    if ('captureStackTrace' in Error) {
      /** Avoid `AIDError` in stack trace */
      Error.captureStackTrace(this, AIDError);
      /** Avoid `Director.log` in stack trace */
      Error.captureStackTrace(this, Director.log);
    }
    let tmp = '';
    const reg = /\s?\(?(\<isolated-vm\w*\>):(\d+):(\d+)\)?/gm;
    const clean = stack
      .replace(/^Error:\s(\w*Error:)/gm, (_m, p1) => p1)
      .replace(reg, (_m, _p1, line, column) => `:${line}:${column}`);
    tmp += clean;
    this.stack = clean;
    if (!this.cause) {
      const [, c] = /\s(\w+):\d+:\d+/.exec(stack) ?? [];
      if (c) {
        this.cause = c;
      } else {
        this.cause = 'Unknown';
      }
    }
    this.message = `[${this.cause}] ${tmp}`;
  }
}

//#endregion

const Director = class {
  /**
   * @param {unknown[]} messages
   */
  static log(...messages) {
    for (let m of messages) {
      if (m instanceof Error) {
        const e = m instanceof AIDError ? m : new AIDError(m.message, m.cause || undefined);
        m = e.message;
      }
      console.log(m);
      if (typeof m === 'string') state.message = m;
    }
  }
  static util = {
    /**
     * @template {ModifierFN} F
     * @param {F} [fn]
     */
    modifier(fn) {
      return typeof fn === 'function' && !Object.is(fn.toString(), globalThis.modifier.toString());
    },
    /**
     * @template { string | ModifierFN } Code
     * @param { Code } code
     * @param { boolean } [useEval]
     * @returns { ?ModifierFN }
     */
    Func(code, useEval) {
      try {
        const s = Director.util.objToStr(code);
        if (!/String|Function/.test(s))
          throw new AIDError(`"code" must be a type of string or function, got "${s}"`, {
            cause: 'Director.util.Func'
          });
        if (typeof code === 'string') {
          const parse = code.startsWith('return ') ? code : `return ${code}`;
          if (useEval) {
            return eval(`(() => { ${parse} })()`);
          }
          return new Object.constructor(parse)();
        }
        return code;
      } catch (e) {
        const ex = e instanceof AIDError ? e : new AIDError(e, { cause: 'Director.util.Func()' });
        Director.log(ex.message);
        return null;
      }
    },
    /**
     * @param {?} obj
     * @returns {string}
     */
    objToStr(obj) {
      return Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1];
    },
    /**
     * @param {?} obj
     * @returns {obj is { [key: string]: unknown }}
     */
    isObj(obj) {
      return Director.util.objToStr(obj) === 'Object';
    },
    /**
     * @param {?} obj
     * @returns {obj is (null | undefined)}
     */
    isNull(obj) {
      return Object.is(obj, null) || Object.is(obj, undefined);
    }
  };
  /**
   * @type {['library', 'input', 'context', 'output']}
   */
  static types = ['library', 'input', 'context', 'output'];
  /**
   * @type {'library' | 'input' | 'context' | 'output'}
   */
  type = 'library';
  /**
   * @type {{ [key: string]: { _: {}; scripts: ModifierFN["name"][] } }}
   */
  store = {};
  constructor() {
    this.load = this.load.bind(this);

    /**
     * Ensures `modifier` function exists & prevent it from being `undefined`
     *
     * _This is the last executed function in the chain._
     */
    const modifier = () => {
      const { text, stop } = this;
      return { text, stop };
    };
    globalThis.modifier = modifier;
    Object.freeze(globalThis.modifier);

    for (const type of Director.types) {
      /**
       * @param  {...ModifierFN} modifiers
       */
      this[type] = (...modifiers) => this.load(type, ...modifiers);
      this[`on${type[0].toUpperCase()}${type.slice(1)}`] = this[type];
    }
  }
  /**
   * @template {Text | ModifierFN | [typeof text, typeof stop] | ReturnType<ModifierFN>} T
   * @param {T} str
   */
  setText(str) {
    const { isObj, objToStr, isNull } = Director.util;
    /**
     * @param { T } val
     */
    const extract = (val) => {
      if (val instanceof Promise) {
        throw new AIDError('Unsupported, "val" is a type of Promise.', {
          cause: 'Director.text'
        });
      } else if (typeof val === 'function') {
        const { text, stop, type } = this;
        /**
         * @type { T }
         */
        let r = text;
        try {
          if (/autocards?/i.test(val.name)) {
            if (/library/i.test(type)) {
              val(null);
            } else {
              r = val(type, text, stop);
            }
          } else {
            r = val.call(this, text, stop, type);
          }
        } catch (e) {
          const ex =
            e instanceof AIDError
              ? e
              : new AIDError(e, { cause: val.name || 'Director.setText():extract' });
          Director.log(ex.message);
          return text;
        }
        return extract(r);
      } else if (Array.isArray(val)) {
        const [TEXT, STOP = false] = val;
        if (Object.is(STOP, true)) this.stop = STOP;
        return TEXT;
      } else if (isObj(val)) {
        const { text, stop = false } = val;
        if (Object.is(stop, true)) this.stop = stop;
        return text;
      }
      return val;
    };
    str = extract(str);
    if (Object.is(this.stop, false) && typeof str !== 'string') {
      throw new AIDError(`"str" must be a type of string, got "${objToStr(str)}"`, {
        cause: 'Director.text'
      });
    }
    if (!Object.is(globalThis.text, str) && (typeof str === 'string' || isNull(str)))
      globalThis.text = text = str;
    return this;
  }
  /**
   * @param { boolean } bol
   */
  setStop(bol) {
    if (typeof bol !== 'boolean') bol = true;
    if (!Object.is(globalThis.stop, bol)) {
      globalThis.stop = bol;
      if (typeof stop !== 'undefined') stop = bol;
      if (Object.is(bol, true) && typeof this.text === 'string') this.setText(null);
    }
    return this;
  }
  /**
   * @template {"library" | "input" | "context" | "output"} T
   * @param {T} type
   * @param {...ModifierFN} modifiers
   */
  load(type, ...modifiers) {
    if (typeof type === 'string' && Director.types.includes(type) && !Object.is(type, this.type))
      this.type = type;

    const mod = Director.util.Func('typeof modifier !== "undefined" && modifier');
    if (mod && Director.util.modifier(mod))
      throw new AIDError(`Defined "modifier()" in "${type}"`, {
        cause: 'Director.load'
      });

    if (!(type in this.store)) {
      this.store[type] = {
        _: {
          text: this.text,
          stop: this.stop
        },
        scripts: this.loadFunc(modifiers, true)
      };
    }

    for (const modifier of modifiers) {
      const fn = Director.util.Func(modifier);
      if (fn && Director.util.modifier(fn)) this.setText(fn);
    }

    return this;
  }
  /**
   * @template S
   * @template { ModifierFN } $modifier
   * @template { S extends boolean ? string : $modifier } R
   * @param { $modifier[] } modifiers
   * @param { S } toStr
   * @returns { R[] }
   */
  loadFunc(modifiers, toStr) {
    /**
     * @type { Set<R> }
     */
    const fnSet = new Set();
    for (const modifier of modifiers) {
      const fn = Director.util.Func(modifier);
      if (fn && Director.util.modifier(fn) && !fnSet.has(toStr ? fn.name : fn))
        fnSet.add(toStr ? fn.name : fn);
    }
    return [...fnSet];
  }
  /**
   * @type { typeof text }
   */
  get text() {
    return globalThis.text;
  }
  set text(str) {
    this.setText(str);
  }
  /**
   * @type { typeof stop }
   */
  get stop() {
    return globalThis.stop;
  }
  set stop(bol) {
    if (typeof bol === 'boolean') this.setStop(bol);
  }
  *[Symbol.iterator]() {
    for (const v of Object.values(this.store)) {
      if (Array.isArray(v.scripts)) {
        for (const s of this.loadFunc(v.scripts, null)) {
          yield s;
        }
      }
    }
  }
};
const director = new Director();
const { load } = director;
//#endregion
