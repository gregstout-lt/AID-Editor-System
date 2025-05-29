
declare namespace aidungeon.js {
  //#region Console
  interface con {
    dbg(...msg: unknown[]): void;
    err(...msg: unknown[]): void;
    info(...msg: unknown[]): void;
    log(...msg: unknown[]): void; // (typeof console)['log'];
  }
  //#endregion
  //#region Utilites
  /**
   * Object to `[object *]`
   */
  function objToStr<O>(obj: O): string;
  /**
   * Object is typeof `RegExp`
   */
  function isRegExp(obj: unknown): obj is RegExp;
  /**
   * Object is typeof `HTMLElement`
   */
  function isHTML(obj: unknown): obj is HTMLElement;
  /**
   * Object is typeof `Element`
   */
  function isElem(obj: unknown): obj is Element;
  /**
   * Object is typeof `object` / JSON Object
   */
  function isObj(obj: unknown): obj is object;
  /**
   * Object is typeof `Function`
   */
  function isFN(obj: unknown): obj is () => void;
  /**
   * Object is `null` or `undefined`
   */
  function isNull(obj: unknown): obj is null;
  function isNull(obj: unknown): obj is undefined;
  /**
   * Object is blank
   */
  function isBlank<O>(obj: O): boolean;
  /**
   * Object is empty
   */
  function isEmpty<O>(obj: O): boolean;
  //#endregion
  const readFile: (filePath: import('node:fs').PathLike, encoding?: string) => Promise<string>;
  const getEnv: () => {
    AID_ENV?: string;
    AID_TOKEN?: string;
    AID_SHORTID?: string;
  };
}

export = aidungeon.js;
