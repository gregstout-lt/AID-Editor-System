# AI Dungeon Director – Narrative Developer Guide

## 1. Introduction

AI Dungeon is powerful, but it can drift. Stories lose track of details, pacing falls apart, mysteries resolve too soon, and NPCs forget what just happened. For freeform play, that chaos can be fun. But if you want to build **structured scenarios**—a dungeon crawl with loot and HP, a relationship sim where NPCs remember you, or a murder mystery with secrets revealed at the right time—you need tools to keep control.

That’s where the **Director** comes in. Director is not magic—it doesn’t generate new storylines by itself. Instead, it orchestrates **hooks** (Input, Context, Output) and lets you compose small functions into a coherent control system. It’s like having a backstage crew making sure the lights come up at the right time, props are in place, and actors don’t forget their lines.

* **Input Hook**: Runs after the player acts; you can transform or block input.
* **Context Hook**: Runs before the AI generates; you can inject Author’s Notes, World Info, or reminders.
* **Output Hook**: Runs after the AI responds; you can adjust style, capture state, or enforce rules.

Director coordinates these hooks with predictable order and shared state.

# First, what AI Dungeon is actually doing

* AI Dungeon is an AI-guided interactive storytelling tool. You type an action or a line of dialogue; the model looks at the recent context and continues the story with the “most likely” next text. There’s no built-in plot graph — it’s probabilistic continuation, steered by the text you give it. ([AI Dungeon Guidebook][1])
* “Scripting” is AI Dungeon’s way to intercept or augment that loop: you can modify memory, input to the model, and the model’s output, and you can maintain your own state (stats, flags, plot variables) across turns. It’s JavaScript that runs at predefined hooks (Input, Context, Output, Library). ([AI Dungeon Guidebook][2])

# What that “Director” tool really is (purpose, not just mechanics)

Think of “Director” as a **meta-controller** for your scripts — a small framework layer that centralizes *story direction* so you’re not scattering ad-hoc rules across input/output hooks. Where vanilla scripts are “do X at this hook,” **Director** is “keep these global creative constraints and pacing goals in effect, and let the hook scripts consult that plan.”

Put another way: instead of hard-coding a dozen little one-off checks (keep noir tone, keep 1st-person, escalate stakes by Act 2, don’t forget the blood-red locket, etc.), you tell **Director** the *ongoing intent* and it coordinates the hook-level behavior to enforce it.

# Why you’d want to use it (the value, not just the features)

If you’re already comfortable with AI Dungeon, the model does fine for a few turns — then it drifts: tone slips, clues get lost, subplots stall, or the AI solves your mystery in two paragraphs. **Director** exists to counter that natural drift.

Here are the concrete payoffs:

1. **Pacing & structure**

   * Keep a 3-act arc (setup → confrontation → resolution) or story beats on schedule (e.g., a reveal by turn \~10). The Director layer tracks “where we are” and nudges generation to hit beats.
   * Without it, you end up manually herding the story every few turns.

2. **Continuity & world state**

   * Protect canon: names, locations, rules of magic/physics, inventory, unresolved threads. The Director can promote key facts into memory/“world info” and refresh them at the right hook so the model actually sees them.
   * Without it, you rely on the model remembering — which is unreliable once context rolls off.

3. **Consistent style & POV**

   * Enforce tense, POV, genre voice (“hard-boiled noir,” “clinical sci-fi log”), or safety/ratings constraints. The Director routes all outputs through a single style/guardrail pass.
   * Without it, you chase tone drift with manual edits.

4. **Gameplay mechanics**

   * If you add light RPG rules (stats, cooldowns, clocks), Director acts like a referee: advance clocks, gate outcomes, inject system messages when conditions trigger.
   * Without it, your mechanics live in scattered hook snippets that go out of sync.

5. **Reusable control surface**

   * You get a centralized set of “dials”: difficulty, darkness, romance, verbosity, railroading vs. sandbox. Toggle one variable instead of finding five places to tweak.

# When you probably *don’t* need it

* One-shot, freeform play with no house rules.
* You’re okay with occasional weirdness and don’t mind manually course-correcting.
* Your scenario’s scripts are tiny (one or two simple hook modifiers).

# What using Director *feels* like (practical examples)

Below are “what it does for you” examples — tool-agnostic so you can map them to the Director API once you adopt it:

1. **Three-Beat Mystery**

   * *Directive:* “Act 1: plant 3 clues; Act 2: complicate 2; Act 3: force a choice, no deus ex machina.”
   * *Director’s job:* Maintain a `beat` counter and `clues[]`. On each Output, if beat==1 and clues<3, inject or reframe scenes to place a clue. On Input, if player jumps ahead, Director defers a reveal until Act 3.

2. **Tone Lock (Noir)**

   * *Directive:* “1st-person, past tense, smoky metaphors, short sentences; ban high fantasy tropes.”
   * *Director’s job:* At Output, rewrite for tense/voice if the AI slips; at Context, remind the model of style rules; at Input, annotate player actions with genre-appropriate framing.

3. **Safety / Rating Guardrails**

   * *Directive:* “Keep PG-13 violence, fade-to-black intimacy.”
   * *Director’s job:* Scan Output for restricted content; soften or redirect; add an in-world transition line if needed.

4. **RPG Lite**

   * *Directive:* “Track HP, inventory, and a 4-segment ‘Alarm’ clock; compel stealth checks when Alarm ≥ 2.”
   * *Director’s job:* Update state each turn; if conditions met, prepend a rule-prompt (“Stealth check DC 12”) so the model resolves it in-fiction but under consistent rules.

# How this connects to the official AI Dungeon model & scripting

* The **engine** itself is still just predicting the next text; **Director** improves the *conditioning* by curating what the model sees (Context hook), what the player sends (Input hook), and what comes back (Output hook). That’s exactly the extension surface AI Dungeon exposes for creators. ([AI Dungeon Guidebook][2])
* AI Dungeon explicitly supports custom scripts that “modify memory, input, and output” and keep custom state objects — Director is a patternized way to manage those responsibilities cleanly. ([GitHub][3])







## 2. Case Study #1 – Light Dungeon Crawl

### The Problem

AI Dungeon will happily describe a dungeon… but forgets you have a lantern, that you were hurt in the last fight, or that the chest you opened is now empty.

### The Solution with Director

Use Director to track stats, inventory, and room states across turns. Hooks ensure the model always “remembers.”

### Implementation

**Library: Player State**

```javascript
const state = {
  hp: 20,
  inventory: ["lantern"],
  rooms: { 'crypt': { openedChest: false } }
};
```

**Input Hook: Combat Commands**

```javascript
function dungeonInput(state, input) {
  if (input.startsWith("/attack")) {
    state.message = "You swing your weapon.";
    return "You attack the monster.";
  }
  if (input.startsWith("/heal")) {
    state.hp += 5;
    return "You take a moment to bandage your wounds.";
  }
  return input;
}
```

**Context Hook: State Injection**

```javascript
function dungeonContext(state) {
  state.memory.frontMemory = `HP: ${state.hp}, Inventory: ${state.inventory.join(", ")}`;
}
```

**Output Hook: Capture Loot**

```javascript
function lootCatcher(state, output) {
  const match = output.match(/you find a (\w+)/i);
  if (match) state.inventory.push(match[1]);
  return output;
}
```

**Reflection**: Director makes the dungeon playable. The AI doesn’t “forget” your HP or items, because you’re injecting them into context every turn and capturing new ones from output.

---

## 3. Case Study #2 – Relationship Simulator

### The Problem

NPCs don’t remember how you treated them. You can insult someone one moment and they’ll act friendly the next.

### The Solution with Director

Track relationship meters, adjust dialogue tone in context/output, and parse actions that shift those meters.

### Implementation

**Library: Relationship Schema**

```javascript
const state = {
  relationships: {
    alice: 0, // -10 hostile, +10 ally
    bob: 0
  }
};
```

**Input Hook: Parsing Social Actions**

```javascript
function relationshipInput(state, input) {
  if (/compliment/i.test(input)) state.relationships.alice++;
  if (/insult/i.test(input)) state.relationships.alice--;
  return input;
}
```

**Context Hook: Inject Relationship Notes**

```javascript
function relationshipContext(state) {
  let notes = [];
  if (state.relationships.alice > 5) notes.push("Alice trusts the player deeply.");
  if (state.relationships.alice < -5) notes.push("Alice resents the player.");
  state.memory.authorsNote = notes.join(" ");
}
```

**Output Hook: Tone Adjustment**

```javascript
function relationshipOutput(state, output) {
  if (state.relationships.alice < -5) {
    return output.replace(/Alice says/i, "Alice snaps");
  }
  return output;
}
```

**Reflection**: With Director, relationships stop being ephemeral. The AI’s tone and dialogue adapt based on past choices.

---

## 4. Case Study #3 – In-Depth Campus Murder Mystery

### The Problem

Mysteries fall apart if the AI reveals secrets too soon, forgets key details, or ignores pacing.

### Goals

* 3-Act structure: discovery → complication → reveal.
* NPC relationships evolve.
* Secrets hidden until the right moment.
* Noir tone maintained.

### Solution with Director

Director manages beats, relationships, and when secrets become available.

### Implementation

**Library: State Schema**

```javascript
const state = {
  beat: 1,
  turn: 0,
  clues: [],
  relationships: { dean: 0, janitor: 0, student: 0 },
  secrets: { ledger: false, affair: false, coverup: false }
};
```

**Context Hook: Beat Planner & Style**

```javascript
function beatPlanner(state) {
  if (state.beat === 1 && state.clues.length < 3) {
    state.memory.authorsNote = "Plant a subtle clue in this scene.";
  }
  if (state.beat === 3) {
    state.memory.authorsNote = "Force a reveal using at least two planted clues.";
  }
}

function noirPrimer(state) {
  state.memory.frontMemory = "Style: first-person, past tense, moody noir metaphors.";
}

function canonInjector(state) {
  if (state.clues.length > 0) {
    state.memory.frontMemory += " Unresolved clues: " + state.clues.join(", ");
  }
}
```

**Input Hook: Command Parser**

```javascript
function mysteryInput(state, input) {
  if (input.startsWith("/reveal")) {
    if (state.beat < 3) {
      state.message = "The truth isn’t ready to come out.";
      return "I kept quiet, waiting for the right time.";
    }
    if (state.beat === 3) {
      state.secrets.ledger = true;
      return "I confronted the dean with the ledger in hand.";
    }
  }
  return input;
}
```

**Output Hook: Tone & Clue Capture**

```javascript
function toneLock(state, output) {
  return output.replace(/is/g, "was"); // enforce past tense
}

function clueCatcher(state, output) {
  const found = output.match(/(ledger|affair|coverup)/i);
  if (found && !state.clues.includes(found[0])) {
    state.clues.push(found[0]);
  }
  return output;
}
```

**Beat Progression**

```javascript
function advanceBeats(state) {
  state.turn++;
  if (state.turn === 8) state.beat = 2;
  if (state.turn === 15) state.beat = 3;
}
```

**Director Registration**

```javascript
Director.context([beatPlanner, noirPrimer, canonInjector]);
Director.input([mysteryInput]);
Director.output([toneLock, clueCatcher]);
```

### Reflection

Director here acts as an invisible game master:

* Ensures secrets don’t spill before Act 3.
* Keeps unresolved clues visible to the model.
* Adapts tone and style every turn.
* Lets NPCs respond to changing relationships.

The result: a mystery that unspools on your terms, not chaotically.

---

## 5. Idea Bank – Other Creative Uses

Here’s a list of additional ways you could apply Director, each with a mini-example:

1. **Foreshadowing System**: Insert a mysterious phrase every 5 turns (`Context: state.memory.authorsNote = "Foreshadow the locked tower."`).
2. **Rumor Mill**: Track rumors spread by NPCs; inject contradictory world info entries depending on who the player spoke to.
3. **Sanity Meter**: Decrement a stat each time the player sees something horrific; at low sanity, distort Output text.
4. **Dream Sequences**: Every 10 turns, switch style/context to surreal imagery.
5. **Dynamic Genre Shift**: Begin in “detective noir,” but on Act 3 shift to “cosmic horror” by changing Author’s Notes.
6. **Timed Events**: At turn 12, automatically trigger a fire alarm event in Output.
7. **Multiple Endings**: Track 3 flags; at game end, inject Author’s Note that forces the model toward one ending.
8. **NPC Callback Memory**: When player revisits an NPC, inject a note reminding the AI of past dialogue choices.

---

## 6. Conclusion

Director is not about concatenating strings. It’s about orchestration. By centralizing hooks, it allows you to:

* Control pacing.
* Preserve continuity.
* Enforce style.
* Add mechanics and memory.

It transforms AI Dungeon from a wild improviser into a reliable co-author, without taking away creativity. Used well, it makes your stories richer, deeper, and far more satisfying to play.
