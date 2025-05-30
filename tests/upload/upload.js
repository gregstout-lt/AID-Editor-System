'use strict';
import AID from 'aidungeon.js';
const aid = new AID({
  env: 'development',
  shortid: '', // or ['shortID_A', 'shortID_B', 'shortID_C', ...]
  files: ['context.js', 'input.js', 'library.js', 'output.js'],
  dir: ['./src'],
  token: ''
});
async function name() {
  (await aid.build()).watch();
}
name();
