'use strict';
import path from 'path';
import fs from 'node:fs';
import axios from 'axios';
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
const toDate = () => {
  return new Intl.DateTimeFormat('default').format(new Date());
};
const toTime = () => {
  return new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    fractionalSecondDigits: 3
  }).format(new Date());
};
/**
 * @template T
 * @param {T} target
 * @param {boolean} split
 * @returns {...T}
 */
const normalizeTarget = (target, split = true) => {
  if (isNull(target)) {
    return [];
  }
  if (Array.isArray(target)) {
    return target;
  }
  if (typeof target === 'string') {
    return split ? Array.of(target) : Array.from(target);
  }
  return Array.from(target);
};
// /**
//  * @template O
//  * @param {O} object
//  * @returns {O}
//  */
// const copyObject = (object) => JSON.parse(JSON.stringify(object));
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
    return e instanceof Error ? e.message : '';
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
//#endregion

class Options extends null {
  /**
   * @returns { import('./index.d.ts').AIDOptions }
   */
  static createDefault() {
    return {
      env: 'development',
      files: ['context.js', 'input.js', 'library.js', 'output.js'],
      dir: ['./src']
    };
  }
}

/**
 * @type { typeof import('./index.d.ts').AID }
 */
const AID = class {
  constructor(options = {}) {
    this.createFiles = this.createFiles.bind(this);
    this.build = this.build.bind(this);
    if (typeof options !== 'object' || options === null) {
      throw new Error('"options" must be a type of JSON Object', { cause: 'AID.constructor()' });
    }
    const defaultOptions = Options.createDefault();
    /**
     * @type { import('./index.d.ts').AIDOptions }
     */
    this.options = {
      ...defaultOptions,
      ...options
    };
    Object.defineProperty(this, 'token', { writable: true });
    if (!this.token && 'AID_TOKEN' in process.env) {
      /**
       * <warn>This should be kept private at all times.</warn>
       * @type {?string}
       */
      this.token = process.env.AID_TOKEN;
    } else if (this.options.token) {
      this.token = this.options.token;
    } else {
      this.token = null;
    }
    this.isSetup = this.options.token && this.options.shortid;
    log(`Node ENV: ${this.options.env}`);
  }
  /**
   * @param {string} type
   * @param {*} shortId
   */
  async fetch(type, shortId) {
    if (!this.token) throw new Error('An invalid token was provided.', { cause: 'AID.fetch()' });
    const template = {
      GetGameplayAdventure: {
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
      GetAdventureDetails: {
        body: {
          operationName: 'GetAdventureDetails',
          variables: { shortId },
          query:
            'query GetAdventureDetails($shortId: String) {\n  adventureState(shortId: $shortId) {\n    id\n    details\n    __typename\n  }\n}'
        }
      },
      GetScenario: {
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
      GetScenarioScripting: {
        operationName: 'GetScenarioScripting',
        variables: { shortId },
        query:
          'query GetScenarioScripting($shortId: String) {\n  scenario(shortId: $shortId) {\n    gameCodeSharedLibrary\n    gameCodeOnInput\n    gameCodeOnOutput\n    gameCodeOnModelContext\n    recentScriptLogs\n    lastModelContext\n  }\n}'
      },
      GetAiVersions: {
        headers: {
          'x-gql-operation-name': 'GetAiVersions'
        },
        body: {
          operationName: 'GetAiVersions',
          query:
            'query GetAiVersions {\n  aiVisibleVersions {\n    success\n    message\n    aiVisibleVersions {\n      id\n      type\n      versionName\n      aiDetails\n      aiSettings\n      access\n      release\n      available\n      instructions\n      engineNameEngine {\n        engineName\n        available\n        availableSettings\n        __typename\n      }\n      __typename\n    }\n    visibleTextVersions {\n      id\n      type\n      versionName\n      aiDetails\n      aiSettings\n      access\n      release\n      available\n      instructions\n      engineNameEngine {\n        engineName\n        available\n        availableSettings\n        __typename\n      }\n      __typename\n    }\n    visibleImageVersions {\n      id\n      type\n      versionName\n      aiDetails\n      aiSettings\n      access\n      release\n      available\n      instructions\n      engineNameEngine {\n        engineName\n        available\n        availableSettings\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}'
        }
      },
      ImportStoryCards: {
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
      },
      GetResources: {
        headers: {
          'x-gql-operation-name': 'GetResources'
        },
        body: {
          operationName: 'GetResources',
          query:
            'query GetResources {  user {    id    creditsBalance {      id      currentBalance      __typename    }    scalesBalance {      id      currentBalance      __typename    }    promoActionsBalance {      id      currentBalance      __typename    }    __typename  }}'
        }
      },
      NotificationsWebAddDeviceToken: {
        headers: {
          'x-gql-operation-name': 'NotificationsWebAddDeviceToken'
        },
        body: {
          operationName: 'NotificationsWebAddDeviceToken',
          variables: {
            platform: 'web',
            token: 'web'
          },
          query:
            'mutation NotificationsWebAddDeviceToken($token: String, $platform: String) {  addDeviceToken(token: $token, platform: $platform) {    success    __typename  }}'
        }
      }
    };
    const sel = template[type];
    if (sel) {
      sel.body.variables ??= {};
      const req = await axios({
        method: 'post',
        url: '/graphql',
        baseURL: 'https://api.aidungeon.com',
        timeout: 10000,
        responseType: 'json',
        headers: {
          authorization: `firebase ${this.token}`,
          'content-type': 'application/json',
          'Sec-GPC': '1',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          Priority: 'u=4',
          ...sel.headers
        },
        data: sel.body
      });
      if (isEmpty(req.data)) return req;
      if (req.data.errors && Array.isArray(req.data.errors))
        throw new Error(req.data.errors[0].message);
      return req.data;
    }
  }
  /**
   * @template F
   * @param {...F} files
   */
  async UpdateScenarioScripts(files) {
    try {
      if (!isEmpty(files) || this.isSetup) {
        const gameCode = {};
        for (const f of files) {
          for (const [k, v] of Object.entries(f)) {
            gameCode[k] = v;
          }
        }
        for (const shortId of normalizeTarget(this.options.shortid)) {
          const { data } = await this.fetch('UpdateScenarioScripts', {
            gameCode,
            shortId
          });
          log('UpdateScenarioScripts:', {
            shortId,
            message: data.updateScenarioScripts.message,
            time: toTime()
          });
        }
      }
    } catch (e) {
      err(e);
    }
    return this;
  }
  async createFiles(regions = true) {
    try {
      const i = this.options.env !== 'development' || !this.isSetup;
      const dir = this.options.dir[0];
      const jsDoc = [
        'aidungeon.js v1.0.1',
        `@updated-at ${toDate()} ${toTime()}`,
        '',
        'Checkout the Guidebook examples to get an idea of other ways you can use scripting.',
        '@link https://help.aidungeon.com/scripting',
        '',
        'For additional help, checkout the GitHub repository.',
        '@link https://github.com/magicoflolis/aidungeon.js',
      ].map(j => ` * ${j}`).join('\n');
      const header = `/**\n${jsDoc}\n */\n`;
      const wrap = (type, c) => {
        if (regions) {
          return `${header}// #region ${type}\n${c}\n// #endregion`
        }
        return `${header}${c}`;
      }
      const files = await Promise.all([
        readFile(`${dir}/context.js`).then(async (c) => {
          c = wrap('onModelContext', c);
          if (i) {
            await fs.promises.writeFile('./dist/context.js', c);
          }
          return { onModelContext: c };
        }),
        readFile(`${dir}/input.js`).then(async (c) => {
          c = wrap('onInput', c);
          if (i) {
            await fs.promises.writeFile('./dist/input.js', c);
          }
          return { onInput: c };
        }),
        readFile(`${dir}/library.js`).then(async (c) => {
          c = wrap('sharedLibrary', c);
          if (i) {
            await fs.promises.writeFile('./dist/library.js', c);
            await fs.promises.writeFile('./dist/library.min.js', await minifyCode(c));
          }
          return { sharedLibrary: c };
        }),
        readFile(`${dir}/output.js`).then(async (c) => {
          c = wrap('onOutput', c);
          if (i) {
            await fs.promises.writeFile('./dist/output.js', c);
          }
          return { onOutput: c };
        })
      ]);
      if (i) {
        log('Created Files:', {
          time: toTime()
        });
      }
      return files;
    } catch (ex) {
      err(ex);
    }
  }
  async build() {
    const files = await this.createFiles(true);
    if (files) {
      await this.UpdateScenarioScripts(files);
    }
    return this;
  }
  watch() {
    const { build } = this;
    if (this.options.env === 'development') {
      const wp = new Watchpack();
      let changed = new Set();
      wp.watch(this.options.files, this.options.dir);
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

        await build();
      });
    } else {
      process.exit(0);
    }
  }
};

export { AID };
export default AID;
