// #region Type Definitions
/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
/**
 * @typedef {Object} History
 * @property {string} text
 * @property {"continue"|"say"|"do"|"story"|"see"|"repeat"|"start"|"unknown"} type
 * @property {string} rawText
 */
/**
 * @typedef {Object} StoryCard
 * @property {string} id
 * @property {string} title
 * @property {string} keys
 * @property {string} type
 * @property {string} entry - This is `value` when exported
 * @property {string} description
 */
/**
 * @typedef {Object} Memory
 * @property {string} context
 * @property {string} authorsNote
 * @property {Object.<string, unknown>} [others] - Other dynamic keys may exist
 */
/**
 * @typedef {Object} State
 * @property {string} key
 * @property {Memory} memory
 * @property {string} message
 * @property {Object.<string, unknown>} [others] - Other dynamic keys may exist
 */
/**
 * @typedef {Object} Info
 * @property {number} actionCount
 * @property {string[]} characters
 * @property {Object.<string, unknown>} [others] - Other dynamic keys may exist
 */
/**
 * @type { { stop: boolean; text: unknown; history: History[]; storyCards: StoryCard[]; state: State; memory: Memory; info: Info } }
 */
const $ = globalThis;
// #endregion

// const secretNameOfTheKing = 'Bob';

// function getKingName() {
//   return secretNameOfTheKing;
// }
