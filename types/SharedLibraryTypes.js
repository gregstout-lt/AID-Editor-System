/**
 * Scripting API: https://help.aidungeon.com/scripting
 * 
 * Scripting Guidebook: https://github.com/magicoflolis/aidungeon.js/blob/main/Scripting%20Guidebook.md
 */

// #region "Shared Library" Typings
/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
/**
 * @typedef {Object} History
 * @property {string} text The text of the action.
 * @property {'continue'|'say'|'do'|'story'|'see'|'repeat'|'start'|'unknown'} type most common action types are listed below:
 *  - `start`: the first action of an adventure
 *  - `continue`: an action created by the AI
 *  - `do`: a do action submitted by a player
 *  - `say`: a say action submitted by a player
 *  - `story`: a story action submitted by a player
 *  - `see`: a see action submitted by a player
 * @property {History['text']} rawText The same as text, deprecated and included for backwards compatibility.
 */
/**
 * @typedef {Object} StoryCard
 * @property {string} id Usually a number represented as a string.
 * @property {string} [title] This is `NAME` in `DETAILS` section of a story card.
 * @property {string} [keys] This is `TRIGGERS` in `DETAILS` section of a story card.
 * @property {string} [type] This is `TYPE` in `DETAILS` section of a story card.
 * @property {string} [entry] This is `value` when exported through `Story Card Management`.
 * @property {string} [description] This is `NOTES` in `DETAILS` section of a story card.
 * @property {string} [createdAt] Defined after creating a StoryCard using `addStoryCard`.
 * @property {string} [updatedAt] Defined after creating a StoryCard using `addStoryCard`.
 * @property {boolean} [useForCharacterCreation] Defined after creating a StoryCard using `addStoryCard`.
 */
/**
 * @typedef {Object} thirdPerson
 * @property {string} text
 * @property {Array<string|{name:string}>} [visibleTo]
 */
/**
 * @typedef {string} plotEssentials - This is [Plot Essentials](https://help.aidungeon.com/faq/plot-essentials)
 */
/**
 * @typedef {Object} StateMemory
 * @property {plotEssentials} [context] - This is [Plot Essentials](https://help.aidungeon.com/faq/plot-essentials), added to the beginning of the context, before the history. Corresponds to the Memory available in the UI.
 * @property {string} [authorsNote] - This is [Author's Note](https://help.aidungeon.com/faq/what-is-the-authors-note), added close to the end of the context, immediately before the most recent AI response.
 * @property {string} [frontMemory] - Added to the very end of the context, after the most recent player input.
 */
/**
 * @typedef {Object} State
 * @property {StateMemory & { [key: string]: unknown;} } memory - This is **creator**-defined memory, has priority over `UserMemory`. Changes made to `state.memory` during `onOutput` won't take affect until the next player action.
 * @property {string | thirdPerson | thirdPerson[]} message - This field is a string which will be shown to the user.
 */
/**
 * @typedef {Object} Info
 * @property {number } actionCount - Total number of actions in the adventure.
 * @property {(string | {name: string;})[] } characters - Characters in the adventure.
 * @property {number} [maxChars] - Estimated maximum number of characters that can be included in the model context (character per token can vary).
 * @property {number} [memoryLength] - Number of characters included in the model context from the memory.
 * @property {number} [contextTokens] - Context Tokens.
 */
/**
 * ---
 *
 * _Example(s):_
 *
 * ```js
 * // For `onOutput` hook
 * if (typeof text === "string") text = text.replace(/\s{2,}|\n/g, '\n\n');
 * return { text };
 * ```
 *
 * ---
 *
 * - For the `onInput` hook, this field has the text entered by the player.
 *   - _Returns:_ an empty string in `onInput` throws an `Error` which is shown to the player and says **`Unable to run scenario scripts.`**
 * - For the `onModelContext` hook, this field has the text that would otherwise be sent to the AI.
 *   - _Returns:_ an empty string in `onModelContext` causes the context to be built as though the script did not run.
 * - For the `onOutput` hook, this field has the text that would otherwise be sent back to the player.
 *   - _Returns:_ an empty string in `onOutput` throws an `Error` which is shown to the player and says **`A custom script running on this scenario failed. Please try again or fix the script.`**
 *
 * Returning the text `stop` is equivalent to returning `stop: true`.
 *
 * @global
 * @type {*}
 */
globalThis.text;
/**
 * ---
 *
 * _Example(s):_
 *
 * ```js
 * // For `onInput` hook
 * let stop = typeof text === "string" && text.includes("Pause the story");
 * if (stop) text = null;
 * return { text, stop };
 * ```
 *
 * ---
 *
 * If `stop === true`, then the game loop will not proceed. This is useful in cases where you want a player input to update the state but to not run the AI.
 *
 * When you return `stop` in the `onInput` hook, it throws an `Error` which is shown to the player and says **`Unable to run scenario scripts`**
 *
 * When you return `stop` in the `onModelContext` hook, it throws an `Error` which is shown to the player and says **`Sorry, the AI is stumped. Edit/retry your previous action, or write something to help it along.`**
 *
 * When you return `stop` in the `onOutput` hook, it changes the output to `stop`. Don’t do this.
 *
 * @global
 * @type {boolean}
 */
globalThis.stop;
if (!globalThis.addStoryCard) {
  /**
   * ---
   *
   * Adds a new `StoryCard` and returns the index of the new card.
   *
   * If there is already an existing card with the same keys, returns false.
   *
   * `addWorldEntry` also works for backwards compatibility, but is deprecated.
   *
   * ---
   *
   * _Example(s):_
   *
   * ```js
   * log(addStoryCard("Superman", "a bird")); // Returns new length of the `storyCards` array.
   *
   * // Find and create Story Cards
   * function getStoryCard(keys, entry, type = 'Custom') {
   * // Find Story Card based `keys`, `entry`, `type`
   * const card = storyCards.find(({keys: k, entry: e, title: t, type: ty}) => e === entry && ty === type && (k === keys || t === keys));
   * // If `card` exists, return { index, card }
   * if (card) return { index: storyCards.indexOf(card), card };
   * // Otherwise, call `addStoryCard()` function and loop
   * addStoryCard(keys, entry, type);
   * return getStoryCard(keys, entry, type);
   * };
   *
   * // Returns { index: StoryCard[keyof StoryCard], card: StoryCard }
   * log(getStoryCard("Quack", "a duck", "Animal"));
   * ```
   *
   * ---
   *
   * @global
   * @template {string} K
   * @template {string} E
   * @template {string} T
   * @param {K} keys - This will set `StoryCard.keys` __and__ `StoryCard.title`.
   * @param {E} entry - This will set `StoryCard.entry`.
   * @param {T} [type='Custom'] - This will set `StoryCard.type`.
   * @returns {number} The new length of the storyCards array.
   */
  globalThis.addStoryCard = (keys, entry, type) => {};
}
if (!globalThis.updateStoryCard) {
  /**
   * ---
   *
   * Updates a `StoryCard`
   *
   * If card does not exist, throws an `Error`
   *
   * `updateWorldEntry` also works for backwards compatibility, but is deprecated.
   *
   * ---
   *
   * _Example(s):_
   *
   * ```js
   * let entry = "Eleanor Rigby";
   * let keys = "A old British women from the Victorian era.";
   * let type = "character";
   * const { index } = getStoryCard(keys, entry, type);
   * entry = "Jude";
   * keys = "A young boy from the Victorian era.";
   * type = "Custom";
   *
   * updateStoryCard(index, keys, entry, type);
   * ```
   *
   * @see `addStoryCard` for further information on `getStoryCard()` function.
   *
   * ---
   *
   * @global
   * @template {string|number} I
   * @template {string} K
   * @template {string} E
   * @template {string} T
   * @param {I} index - `StoryCard` index number.
   * @param {K} keys - `StoryCard.keys`.
   * @param {E} entry - `StoryCard.entry`.
   * @param {T} type - `StoryCard.type`.
   * @returns {void}
   */
  globalThis.updateStoryCard = (index, keys, entry, type) => {};
}
if (!globalThis.removeStoryCard) {
  /**
   * ---
   *
   * Removes a `StoryCard`
   *
   * If card does not exist, throws an `Error`
   *
   * `removeWorldEntry` also works for backwards compatibility, but is deprecated.
   *
   * ---
   *
   * _Example(s):_
   *
   * ```js
   * const entry = "Eleanor Rigby";
   * const keys = "A old British women from the Victorian era.";
   * const type = "character";
   * const { index } = getStoryCard(keys, entry, type);
   *
   * removeStoryCard(index);
   * ```
   *
   * @see `addStoryCard` for further information on `getStoryCard()` function.
   *
   * ---
   *
   * @global
   * @template {string|number} I
   * @param {I} index - `StoryCard` index number.
   * @returns {void}
   */
  globalThis.removeStoryCard = (index) => {};
}
if (!globalThis.log) {
  /**
   * Logs information to the console.
   *
   * `console.log` also works to reduce confusion.
   *
   * `sandboxConsole.log` also works for backward compatibility, but is deprecated.
   *
   * @global
   * @param {...?} data
   * @returns {void}
   */
  globalThis.log = (...data) => {};
}
/**
 * `history` is an array of recent actions from the adventure, see `History`.
 *
 * @global
 * @type {History[]}
 */
globalThis.history;
/**
 * `storyCards` is an array of [story cards](https://help.aidungeon.com/faq/story-cards) from the adventure, see `StoryCard`.
 * @global
 * @type {StoryCard[]}
 */
globalThis.storyCards;
/**
 * This field is an object where scripts can store additional persistent information to be available across turns. Beyond being an object, this field can have any structure needed for the script.
 *
 * To change the state, scripts can set values in the state object directly, without using a helper function.
 *
 * In addition to creator-defined fields, the state object also expects to have the following fields.
 *
 * @global
 * @type {State & {[key: string]: unknown}}
 */
globalThis.state;
/**
 * This is **user**-defined memory, `state.memory` has priority
 *
 * @global
 * @type {{
 *   context?: plotEssentials,
 *   [key: string]: unknown
 * }}
 */
globalThis.memory;
/**
 * This field is an object that can contain additional values that may sometimes be useful. These values may be different for different hooks.
 * - All Hooks
 *   - `characterNames` - an array of character names for players of a multiplayer adventure
 *   - `info.actionCount` - the total number of actions in the adventure
 * - onModelContext
 *   - `info.maxChars` - the estimated maximum number of characters that can be included in the model context (character per token can vary)
 *   - `info.memoryLength` - the number of characters included in the model context from the memory
 *
 * @global
 * @type {Info & {[key: string]: unknown}}
 */
globalThis.info;
// #endregion

/**
 * Guidebook: https://help.aidungeon.com/scripting
 * @template {typeof text} T
 * @param {T} text 
 * @returns {{ text: T; stop?: typeof stop }}
 */
const modifier = (text) => {
  return { text };
};

// Don't modify this part
modifier(text);
