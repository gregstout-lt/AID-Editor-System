import './SharedLibraryTypes.d.ts';

/**
 * Ignore this.
 */
export type ScriptingAPI = unknown;

// #region Global
declare global {
  /**
   * Ensures a `modifier` function exists & prevent it from being `undefined`
   *
   * _This is the last function called in chain._
   */
  function modifier<T extends typeof text>(
    text: T
  ): {
    text: T;
    stop?: typeof stop;
  };

  /**
   * Ensures a `modifier` function exists & prevent it from being `undefined`
   *
   * _This is the last function called in chain._
   */
  type Modifier = <T extends typeof text>(text: T) => { text: T; stop?: typeof stop };
}
// #endregion
