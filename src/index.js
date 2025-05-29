'use strict';
import path from 'path';
import fs from 'node:fs';
import axios from 'axios';
import minimist from 'minimist';
import { minify } from 'terser';
import Watchpack from 'watchpack';

//#region Console
const con = {
  dbg(...msg) {
    console.debug('[DBG]', ...msg);
  },
  err(...msg) {
    console.error('[ERROR]', ...msg);
  },
  info(...msg) {
    console.info('[INFO]', ...msg);
  },
  log(...msg) {
    console.log('[LOG]', ...msg);
  }
};
const { err, log } = con;
//#endregion

//#region Utilites
/**
 * @template O
 * @param { O } obj
 * @returns { string }
 */
const objToStr = (obj) => Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1];
/**
 * Object is typeof `object` / JSON Object
 * @template O
 * @param { O } obj
 */
const isObj = (obj) => objToStr(obj) === 'Object';
/**
 * Object is `null` or `undefined`
 * @template O
 * @param { O } obj
 */
const isNull = (obj) => {
  return Object.is(obj, null) || Object.is(obj, undefined);
};
/**
 * Object is Blank
 * @template O
 * @param { O } obj
 */
const isBlank = (obj) => {
  return (
    (typeof obj === 'string' && Object.is(obj.trim(), '')) ||
    ((obj instanceof Set || obj instanceof Map) && Object.is(obj.size, 0)) ||
    (Array.isArray(obj) && Object.is(obj.length, 0)) ||
    (isObj(obj) && Object.is(Object.keys(obj).length, 0))
  );
};
/**
 * Object is Empty
 * @template O
 * @param { O } obj
 */
const isEmpty = (obj) => {
  return isNull(obj) || isBlank(obj);
};
const toTime = () => {
  return new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    fractionalSecondDigits: 3
  }).format(new Date());
};
//#endregion
/**
 * @param {import('node:fs').PathLike} filePath
 * @param {string} encoding
 */
const readFile = async (filePath, encoding = 'utf-8') => {
  try {
    await fs.promises.access(filePath, fs.promises.constants.R_OK | fs.promises.constants.W_OK);
    const data = await fs.promises.readFile(filePath, encoding);
    return data.toString(encoding);
  } catch (e) {
    err(e);
    if (e instanceof Error) {
      return e.message;
    }
    return '';
  }
};

const AIDRequest = class {
  #_;
  /** @type {string} */
  token;
  /**
   * @type { { operationName: string; variables: {[key: string]: unknown}; query: string; } }
   */
  data = {};
  constructor(accessToken) {
    this.token = accessToken;
  }
  get headers() {
    return this.#_;
  }
  /**
   * @param {string} data
   */
  set headers(data) {
    this.#_ = {
      authorization: `firebase ${this.token}`,
      'content-type': 'application/json',
      'x-gql-operation-name': data,
      'Sec-GPC': '1',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      Priority: 'u=4'
    };
  }
  /**
   * @param {this["data"]} d
   */
  setBody(d) {
    d.variables ??= {};
    this.data = d;
    return this;
  }
  format() {
    const { headers, data } = this;
    return {
      headers,
      data
    };
  }
  async fetch(type, shortId) {
    try {
      const template = {
        adventure: {
          headers: {
            'x-gql-operation-name': 'GetGameplayAdventure'
          },
          body: {
            operationName: 'GetGameplayAdventure',
            variables: { shortId, limit: 1000000, desc: true },
            query:
              'query GetGameplayAdventure($shortId: String, $limit: Int, $offset: Int, $desc: Boolean) {\n  adventure(shortId: $shortId) {\n    id\n    publicId\n    shortId\n    scenarioId\n    instructions\n    title\n    description\n    tags\n    nsfw\n    isOwner\n    userJoined\n    gameState\n    actionCount\n    contentType\n    createdAt\n    showComments\n    commentCount\n    allowComments\n    voteCount\n    userVote\n    editedAt\n    published\n    unlisted\n    deletedAt\n    saveCount\n    isSaved\n    user {\n      id\n      isCurrentUser\n      isMember\n      profile {\n        id\n        title\n        thumbImageUrl\n        __typename\n      }\n      __typename\n    }\n    shortCode\n    thirdPerson\n    imageStyle\n    memory\n    authorsNote\n    image\n    actionWindow(limit: $limit, offset: $offset, desc: $desc) {\n      id\n      imageText\n      ...ActionSubscriptionAction\n      __typename\n    }\n    allPlayers {\n      ...PlayerSubscriptionPlayer\n      __typename\n    }\n    storyCards {\n      id\n      ...StoryCard\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ActionSubscriptionAction on Action {\n  id\n  text\n  type\n  imageUrl\n  shareUrl\n  imageText\n  adventureId\n  decisionId\n  undoneAt\n  deletedAt\n  createdAt\n  logId\n  __typename\n}\n\nfragment PlayerSubscriptionPlayer on Player {\n  id\n  userId\n  characterName\n  isTypingAt\n  user {\n    id\n    isMember\n    profile {\n      id\n      title\n      thumbImageUrl\n      __typename\n    }\n    __typename\n  }\n  createdAt\n  deletedAt\n  blockedAt\n  __typename\n}\n\nfragment StoryCard on StoryCard {\n  id\n  type\n  keys\n  value\n  title\n  useForCharacterCreation\n  description\n  updatedAt\n  deletedAt\n  __typename\n}'
          }
        },
        adventureDetails: {
          body: {
            operationName: 'GetAdventureDetails',
            variables: { shortId },
            query:
              'query GetAdventureDetails($shortId: String) {\n  adventureState(shortId: $shortId) {\n    id\n    details\n    __typename\n  }\n}'
          }
        },
        scenario: {
          headers: {
            'x-gql-operation-name': 'GetScenario'
          },
          body: {
            operationName: 'GetScenario',
            variables: { shortId },
            query:
              'query GetScenario($shortId: String) {\n  scenario(shortId: $shortId) {\n    id\n    contentType\n    createdAt\n    editedAt\n    publicId\n    shortId\n    title\n    description\n    prompt\n    memory\n    authorsNote\n    image\n    isOwner\n    published\n    unlisted\n    allowComments\n    showComments\n    commentCount\n    voteCount\n    userVote\n    saveCount\n    storyCardCount\n    isSaved\n    tags\n    adventuresPlayed\n    thirdPerson\n    nsfw\n    contentRating\n    contentRatingLockedAt\n    contentRatingLockedMessage\n    tags\n    type\n    details\n    parentScenario {\n      id\n      shortId\n      title\n      __typename\n    }\n    user {\n      isCurrentUser\n      isMember\n      profile {\n        title\n        thumbImageUrl\n        __typename\n      }\n      __typename\n    }\n    options {\n      id\n      userId\n      shortId\n      title\n      prompt\n      parentScenarioId\n      deletedAt\n      __typename\n    }\n    storyCards {\n      id\n      ...StoryCard\n      __typename\n    }\n    ...CardSearchable\n    __typename\n  }\n}\n\nfragment CardSearchable on Searchable {\n  id\n  contentType\n  publicId\n  shortId\n  title\n  description\n  image\n  tags\n  userVote\n  voteCount\n  published\n  unlisted\n  publishedAt\n  createdAt\n  isOwner\n  editedAt\n  deletedAt\n  blockedAt\n  isSaved\n  saveCount\n  commentCount\n  userId\n  contentRating\n  user {\n    id\n    isMember\n    profile {\n      id\n      title\n      thumbImageUrl\n      __typename\n    }\n    __typename\n  }\n  ... on Adventure {\n    actionCount\n    userJoined\n    playPublicId\n    unlisted\n    playerCount\n    __typename\n  }\n  ... on Scenario {\n    adventuresPlayed\n    __typename\n  }\n  __typename\n}\n\nfragment StoryCard on StoryCard {\n  id\n  type\n  keys\n  value\n  title\n  useForCharacterCreation\n  description\n  updatedAt\n  deletedAt\n  __typename\n}'
          }
        },
        scenarioScripting: {
          operationName: 'GetScenarioScripting',
          variables: { shortId },
          query:
            'query GetScenarioScripting($shortId: String) {\n  scenario(shortId: $shortId) {\n    gameCodeSharedLibrary\n    gameCodeOnInput\n    gameCodeOnOutput\n    gameCodeOnModelContext\n    recentScriptLogs\n    lastModelContext\n  }\n}'
        },
        aiVersions: {
          headers: {
            'x-gql-operation-name': 'GetAiVersions'
          },
          body: {
            operationName: 'GetAiVersions',
            variables: {},
            query:
              'query GetAiVersions {\n  aiVisibleVersions {\n    success\n    message\n    aiVisibleVersions {\n      id\n      type\n      versionName\n      aiDetails\n      aiSettings\n      access\n      release\n      available\n      instructions\n      engineNameEngine {\n        engineName\n        available\n        availableSettings\n        __typename\n      }\n      __typename\n    }\n    visibleTextVersions {\n      id\n      type\n      versionName\n      aiDetails\n      aiSettings\n      access\n      release\n      available\n      instructions\n      engineNameEngine {\n        engineName\n        available\n        availableSettings\n        __typename\n      }\n      __typename\n    }\n    visibleImageVersions {\n      id\n      type\n      versionName\n      aiDetails\n      aiSettings\n      access\n      release\n      available\n      instructions\n      engineNameEngine {\n        engineName\n        available\n        availableSettings\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}'
          }
        },
        importStoryCards: {
          headers: {
            'x-gql-operation-name': 'ImportStoryCards'
          },
          body: {
            operationName: 'ImportStoryCards',
            variables: {
              input: shortId
            },
            query:
              'mutation ImportStoryCards($input: ImportStoryCardsInput!) {  importStoryCards(input: $input) {    success    message    storyCards {      keys      value      type      __typename    }    __typename  }}'
          }
        },
        UpdateScenario: {
          headers: {
            'x-gql-operation-name': 'UpdateScenario'
          },
          body: {
            operationName: 'UpdateScenario',
            variables: {
              input: shortId
            },
            query:
              'mutation UpdateScenario($input: ScenarioInput) {  updateScenario(input: $input) {    scenario {      id      title      description      prompt      memory      authorsNote      tags      nsfw      contentRating      contentRatingLockedAt      contentRatingLockedMessage      published      thirdPerson      allowComments      unlisted      image      uploadId      type      details      editedAt      __typename    }    message    success    __typename  }}'
          }
        },
        UpdateScenarioScripts: {
          headers: {
            'x-gql-operation-name': 'UpdateScenarioScripts'
          },
          body: {
            operationName: 'UpdateScenarioScripts',
            variables: shortId,
            query:
              'mutation UpdateScenarioScripts($shortId: String, $gameCode: JSONObject) {  updateScenarioScripts(shortId: $shortId, gameCode: $gameCode) {    success    message    scenario {      id      gameCodeSharedLibrary      gameCodeOnInput      gameCodeOnOutput      gameCodeOnModelContext      __typename    }    __typename  }}'
          }
        },
        UpdateOptionTitle: {
          headers: {
            'x-gql-operation-name': 'UpdateOptionTitle'
          },
          body: {
            operationName: 'UpdateOptionTitle',
            variables: {
              input: shortId
            },
            query:
              'mutation UpdateOptionTitle($input: ScenarioInput) {  updateScenario(input: $input) {    scenario {      id      shortId      title      prompt      parentScenarioId      deletedAt      __typename    }    message    success    __typename  }}'
          }
        },
        UpdateAdventureState: {
          headers: {
            'x-gql-operation-name': 'UpdateAdventureState'
          },
          body: {
            operationName: 'UpdateAdventureState',
            variables: {
              input: shortId
            },
            query:
              'mutation UpdateAdventureState($input: AdventureStateInput) {  updateAdventureState(input: $input) {    adventure {      id      details      editedAt      __typename    }    message    success    __typename  }}'
          }
        },
        UpdateAdventurePlot: {
          headers: {
            'x-gql-operation-name': 'UpdateAdventurePlot'
          },
          body: {
            operationName: 'UpdateAdventurePlot',
            variables: {
              input: shortId
            },
            query:
              'mutation UpdateAdventurePlot($input: AdventurePlotInput) {  updateAdventurePlot(input: $input) {    adventure {      id      thirdPerson      memory      authorsNote      editedAt      __typename    }    message    success    __typename  }}'
          }
        }
      };
      const sel = template[type];
      if (sel) {
        this.headers = sel.headers;
        this.setBody(sel.body);
        const req = await axios({
          method: 'post',
          url: '/graphql',
          baseURL: 'https://api.aidungeon.com',
          timeout: 1000,
          responseType: 'json',
          ...this.format()
        });
        if (req.data) {
          return req.data;
        }
        return req;
      }
    } catch (ex) {
      err(ex);
    }
    // return {};
  }
  toJSON() {
    const { operationName, variables, query } = this.data;
    return {
      operationName,
      variables,
      query
    };
  }
};
/**
 * @param {string} data
 */
const minifyCode = async (data) => {
  try {
    const { code } = await minify(data, { ecma: 2022 });
    if (typeof code === 'string') return code;
  } catch (e) {
    err(e);
  }
  return data;
};

async function build() {
  try {
    /**
     * @type { typeof import('./index.d.ts').getEnv }
     */
    const getEnv = () => {
      const obj = {};
      const argv = minimist(process.argv.slice(2));
      for (const [k, v] of Object.entries({ ...argv, ...process.env })) {
        if (!k.startsWith('AID_')) continue;
        if (!(k in obj) || (isEmpty(obj[k]) && !isEmpty(v))) {
          obj[k] = v;
        }
      }
      return obj;
    };
    const { AID_ENV, AID_TOKEN, AID_SHORTID } = getEnv();
    const isDev = typeof AID_ENV === 'string' && AID_ENV === 'development';
    const isSetup = !isEmpty(AID_TOKEN) && !isEmpty(AID_SHORTID);
    const r = new AIDRequest(AID_TOKEN);
    const buildFiles = async () => {
      try {
        const files = await Promise.all([
          readFile('./src/context.js').then(async (c) => {
            if (!isDev || !isSetup) {
              await fs.promises.writeFile('./dist/context.js', c);
            }
            return { onModelContext: c };
          }),
          readFile('./src/input.js').then(async (c) => {
            if (!isDev || !isSetup) {
              await fs.promises.writeFile('./dist/input.js', c);
            }
            return { onInput: c };
          }),
          readFile('./src/library.js').then(async (c) => {
            if (!isDev || !isSetup) {
              await fs.promises.writeFile('./dist/library.js', c);
              await fs.promises.writeFile('./dist/library.min.js', await minifyCode(c));
            }
            return { sharedLibrary: c };
          }),
          readFile('./src/output.js').then(async (c) => {
            if (!isDev || !isSetup) {
              await fs.promises.writeFile('./dist/output.js', c);
            }
            return { onOutput: c };
          })
        ]);
        if (!isDev || !isSetup) {
          log('Created Files:', {
            time: toTime()
          });
        }
        if (isSetup) {
          const gameCode = {};
          for (const f of files) {
            for (const [k, v] of Object.entries(f)) {
              gameCode[k] = v;
            }
          }
          const { data } = await r.fetch('UpdateScenarioScripts', {
            gameCode,
            shortId: AID_SHORTID
          });
          if (data.errors && Array.isArray(data.errors)) {
            throw new Error(data.errors[0].message);
          }
          log('UpdateScenarioScripts:', {
            message: data.updateScenarioScripts.message,
            time: toTime()
          });
        }
      } catch (ex) {
        err(ex);
      }
    };
    log(`Node ENV: ${AID_ENV}`);
    await buildFiles();
    if (isDev) {
      const wp = new Watchpack();
      let changed = new Set();
      wp.watch(['context.js', 'input.js', 'library.js', 'output.js'], ['./src']);
      wp.on('change', (changedFile, mtime) => {
        if (mtime === null) {
          changed.delete(changedFile);
        } else {
          changed.add(changedFile);
        }
      });
      wp.on('aggregated', async () => {
        // Filter out files that start with a dot from detected changes
        // (as they are hidden files or temp files created by an editor).
        const changes = Array.from(changed).filter((filePath) => {
          return !path.basename(filePath).startsWith('.');
        });
        changed = new Set();

        if (changes.length === 0) {
          return;
        }

        await buildFiles();
      });
    } else {
      process.exit(0);
    }
  } catch (ex) {
    err(ex);
  }
}

export { build };
export default build;
