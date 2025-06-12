/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>

//#region Director

/**
 * @typedef { <T extends typeof text>(text: T) => { text: T; stop?: typeof stop } } ModifierFN
 */

class Director {
  static error = class DirectorError extends Error {
    constructor(...params) {
      /** Pass remaining arguments (including vendor specific ones) to parent constructor */
      super(...params);
      /** Maintains proper stack trace for where our error was thrown (non-standard) */
      if ('captureStackTrace' in Error) {
        /** Avoid `DirectorError` itself in the stack trace */
        Error.captureStackTrace(this, DirectorError);
      }
      this.tmp = this.toString();
      /** A stack trace exists for this error */
      if (this.stack) {
        const [, line, column] = /(\d+):(\d+)$/.exec(this.stack) ?? [];
        if (line) {
          /** The top-level location of this error is known */
          this.tmp = `${this.tmp} at line #${line} column #${column}`;
        } else {
          this.tmp = `${this.tmp} ${this.stack
            .replace(
              new RegExp(
                `${this.name}:|at\\s*(#throwError|Const.(declare|initialize|read)|new\\s*Const)\\s*(\\d+:\\d+)`,
                'g'
              ),
              ''
            )
            .replace(/\s{2,}/g, ' ')
            .trim()}`;
        }
      }
      if (this.cause) {
        this.tmp = `[${this.cause}] ${this.tmp}`;
      }
      this.message = this.tmp;
      delete this.tmp;
    }
  };
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
     * @returns { ?ModifierFN }
     */
    Func(code) {
      try {
        if (typeof code === 'string') return eval(`(() => { return ${code} })()`);
        return code;
      } catch (e) {
        console.log('{ error }', e);
        return null;
      }
    },
    /**
     * @returns { string }
     */
    objToStr(obj) {
      return Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1];
    },
    /**
     * @param obj
     * @returns { obj is { [key: string]: unknown } }
     */
    isObj(obj) {
      return Director.util.objToStr(obj) === 'Object';
    },
    /**
     * @param obj
     * @returns { obj is null }
     * @returns { obj is undefined }
     */
    isNull(obj) {
      return Object.is(obj, null) || Object.is(obj, undefined);
    }
  };
  /**
   * @type { typeof text }
   */
  static originalText = globalThis.text;
  /**
   * @type { typeof stop }
   */
  static originalStop = globalThis.stop;
  static types = ['library', 'input', 'context', 'output'];
  /**
   * @type { 'library' | 'input' | 'context' | 'output' }
   */
  type = 'library';
  /**
   * @type { { [key: string]: { _: {}; scripts: ModifierFN["name"][]; } } }
   */
  store = {};
  constructor() {
    this.load = this.load.bind(this);

    /**
     * Ensures a `modifier` function exists & prevent it from being `undefined`
     *
     * _This is the last function called in chain._
     */
    const modifier = () => {
      const { text, stop } = this;
      return { text, stop };
    };
    globalThis.modifier = modifier;
    Object.freeze(globalThis.modifier);

    for (const type of Director.types) {
      /**
       * @param  {...ModifierFN | string} modifiers
       */
      this[type] = (...modifiers) => this.load(type, ...modifiers);
      this[`on${type.at(0).toUpperCase()}${type.slice(1)}`] = this[type];
    }

    if (!('$store' in this.state)) this.setStore();
  }
  setStore() {
    globalThis.state.$store = state.$store = this.store;
    return this;
  }
  /**
   * @template { Text | ModifierFN | [typeof text, typeof stop] | ReturnType<ModifierFN> } T
   * @param { T } str
   */
  setText(str) {
    const { isObj, objToStr, isNull } = Director.util;
    /**
     * @param { T } val
     */
    const extract = (val) => {
      if (val instanceof Promise) {
        throw new Director.error('Unsupported, "val" is a type of Promise.', {
          cause: 'Director.text'
        });
      } else if (typeof val === 'function') {
        /**
         * @type { T }
         */
        let r = Director.originalText;
        try {
          if (/autocards?/i.test(val.name)) {
            if (/library/i.test(this.type)) {
              val(null);
            } else {
              r = val(this.type, this.text, this.stop);
            }
          } else {
            r = val.call(this, this.text, this.stop, this.type);
          }
        } catch (e) {
          console.log('{cache} Error:', e);
          return Director.originalText;
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
      throw new Director.error(`"str" must be a type of string, got "${objToStr(str)}"`, {
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
   * @template { this['type'] } T
   * @param { T } type
   * @param { ...(ModifierFN | string) } modifiers
   */
  load(type = 'library', ...modifiers) {
    if (typeof type === 'string' && Director.types.includes(type) && !Object.is(type, this.type))
      this.type = type;

    if (Director.util.modifier(Director.util.Func('typeof modifier !== "undefined" && modifier')))
      throw new Director.error(`Defined "modifier()" in "${type}"`, {
        cause: 'Director.load'
      });

    if (!(type in this.store)) {
      this.store[type] = {
        _: {
          text: Director.originalText,
          stop: Director.originalStop
        },
        scripts: this.loadFunc(modifiers, true)
      };
    }

    for (const modifier of modifiers) {
      const fn = Director.util.Func(modifier);
      if (Director.util.modifier(fn)) this.setText(fn);
    }

    return this.setStore();
  }
  /**
   * @template S
   * @template { ModifierFN } modifier
   * @template { S extends boolean ? modifier["name"] : modifier } R
   * @param { modifier[] } modifiers
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
   * @type { text }
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
    this.setStop(bol);
  }
  /**
   * @type { typeof state }
   */
  get state() {
    return (typeof globalThis.state === 'object' && typeof state !== 'undefined' && state) || {};
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
}
const director = new Director();
const { load } = director;
//#endregion
