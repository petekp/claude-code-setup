import type { Card, Decided, Dialog, Help, Item, Ledger, Note, Stop } from '../types'

export const EMPTY: Ledger = {
  card: null,
  items: [],
  decided: [],
  notes: [],
  prs: [],
  nextId: 1,
  turn: 0,
  batchTurn: 0,
}

type StoredItem = Omit<Item, 'helps'> & { helps?: Help[] }
/** A ledger as stored: one saved before notes, PRs or helps existed lacks them. */
export type StoredLedger = Omit<Ledger, 'items' | 'notes' | 'prs'> & {
  items: StoredItem[]
  notes?: Ledger['notes']
  prs?: Ledger['prs']
}

/** Fills the fields a ledger saved by an earlier version lacks. */
export function normalizeLedger(l: StoredLedger): Ledger {
  return { ...l, notes: l.notes ?? [], prs: l.prs ?? [], items: l.items.map(i => ({ ...i, helps: i.helps ?? [] })) }
}

const NL = '\n'
const MAX_OPEN = 20
/** Prompts after which an unanswered item is dropped as moot. */
const STALE_AFTER = 12
const MAX_DECIDED = 12
const MAX_HELPS = 3
const MAX_NOTES = 30
/**
 * Commands that sign in or ask for a password. They need the person's own
 * terminal, so their button copies them instead of asking Claude to run them.
 */
const NEEDS_PERSON =
  /\b(login|logout|auth|signin|sign-in|sudo|passwd|ssh-add|ssh-keygen|configure|init --interactive)\b/i

export const SYSTEM = `You keep a short ledger for a person who works with a coding agent across many parallel sessions. They glance at your ledger between tasks, or after time away, to see where this session stands. You read one exchange and update the ledger.

Input:
- <card>: the ledger before this exchange (may be empty)
- <open>: items still waiting on the person, each with an id
- <notes>: findings the agent recorded for the person to review later, outside the current task, each with an id
- <decided>: items the person already settled, and how. Never add one of these again as NEW, even when the reply asks it again.
- <person>: what the person just sent, and the commands they ran themselves: "$ cmd" for a shell command, with its output, and "/name" for a slash command
- <activity>: what the agent did this turn (files edited, commands, URLs)
- <reply>: the agent's final reply
- <screen>: what the person has on screen besides the conversation. They always see the items in <open> in a band above their prompt.
- <checks>: the latest result of each test, type check, lint or build the agent ran, read from the commands themselves. "before the last edit" means files changed after it ran. These results override the reply: never write in DONE or NOW that a check passes unless <checks> shows it passing and not before the last edit.

Answer with lines only, each starting with one of these keys. No other text.

GOAL: what this session is for, at most 12 words. Keep the previous goal unless the person clearly changed direction.
DONE: one finished outcome, at most 8 words. Up to 4 DONE lines, oldest first, keeping the most recent. Outcomes, not activity: "PR #12 opened", not "ran gh".
NOW: where the work stands at the end of this reply, at most 12 words. Name what it waits on, if anything.
RUNNING: something still running that the person may open, as "name: URL or port". Dev servers, simulators, background jobs. Omit anything the agent stopped. Zero or more lines.
CLOSED: <id> | what was decided, at most 8 words. For each item in <open> the person answered in <person> (including "all recommended", "go", "yes to all", numbered answers), or that the reply or <activity> shows is done or no longer applies. A person asking what an item means has not answered it, and a reply explaining it does not close it. When <person> asks to run an item's command and the reply says it ran, that item is done. So is an item whose command the person ran themselves, per <person>, when its output shows it worked. Also one line for each note in <notes> that the reply or <activity> shows was fixed, or that the person dealt with or set aside.
NEW: <kind> | <label> | <ask> | <options> | <rec>
  One line per thing in <reply> that waits on the person and is not already in <open> or <notes>. A finding the agent recorded as a note is not NEW unless the reply asks the person to decide on it now. When the reply restates, rewords or narrows an item in <open>, it is not new: add HELP lines to that item's id instead.
  kind: "decide" (a choice, approval, or information only the person has, explicitly put to them, without which the agent cannot go on with its task) or "do" (an action only the person can take, without which the agent cannot continue or finish: sign in, run a command needing their password, test on their device, reply to a teammate).
  label: the reply's own number or id for it ("1", "D3"), or "-".
  ask: plain words, readable without the reply, at most 12 words, or up to 16 when 12 would lose meaning. Keep the question's meaning and every alternative it names. Replace any term the reply coined with what it means.
  options: the choices offered, separated by " / ", at most 5 words each; "-" if open-ended or kind "do".
  rec: the agent's recommendation in at most 8 words, or "-".
  Skip: rhetorical questions; offers to continue ("Want me to start?") when continuing is the obvious default; FYIs; generic "let me know"; invitations to look at, try or check finished work ("Open X to see it", "reload to check") unless the agent waits on the person's verdict before going on; optional suggestions; anything the person already has on screen, per <screen>; questions asking the person to describe what they saw, did or meant, even when the answer would help diagnose a problem ("What happens when you click it?", "Which file did you mean?"). The person answers those by replying.
HELP: <item> | <kind> | <value> | <name>
  A step that does part of an item's work in one press, when the reply or activity already spells it out: the file to edit, the text to paste, the command to run, the page to visit. Not background reading. Up to 3 per item, most useful first.
  item: "new N" for the Nth NEW line in your answer, or an id from <open>.
  kind and value:
    open | a file or folder the person needs to open or edit, the path as written
    copy | text for the person to paste into a file or form, never a command: "block N" for the code block marked [block N] in <reply>, or one line of text
    run | a shell command the reply asks the person to run or approve: "block N" or the command
    link | an https URL the person needs to visit
  name: what a copy, command or link is, at most 3 words ("settings snippet", "removal command", "token page"), or "-".
  Use only paths, commands, text and URLs that appear in <reply> or <activity>. Never invent one.

Write plainly. No jargon, no filler, no markdown.`

/**
 * Asks a fork of the main conversation to bring the ledger up to date at once,
 * for turns the per-turn update missed.
 */
export function catchUpPrompt(ledger: Ledger, screen: string): string {
  return [
    'Pause the task. Do not use tools. Instead, act as the ledger keeper described below, over this whole conversation.',
    'Treat the whole conversation as the exchange. The ledger below may have missed turns. Close every item in <open> and every note in <notes> that the conversation shows answered, done, dealt with, or no longer relevant. Add as NEW only what still waits on the user and is not already in <open> or <notes>.',
    ...ledgerBlocks(ledger),
    `<screen>${NL}${screen}${NL}</screen>`,
    'Code blocks here carry no [block N] marker, so a copy HELP must be one line of text.',
    '',
    SYSTEM,
  ].join(NL)
}

export type Exchange = {
  /** What the person typed; null when something else started the turn. */
  person: string | null
  /** What started the turn when the person didn't (a task notification, a peer). */
  trigger: string | null
  activity: string[]
  reply: string
  /** The person-prompt count when the reply was written. */
  turn: number
  /** The item button the person pressed to send this turn's prompt, if any. */
  press: Press | null
  /** What the person has on screen besides the conversation, from screenText. */
  screen: string
  /** The latest result of each check the agent ran, from checkLine. */
  checks: string[]
}

/** A prompt the mod sent for an item: an answer, an Explain, or a Run. */
export type Press = { id: string; action: 'answer' | 'explain' | 'run' }

export type Update = {
  card: Omit<Card, 'updatedAt'>
  closed: { id: string; outcome: string }[]
  added: (Omit<Item, 'id' | 'turn' | 'helps'> & { helps: Help[] })[]
  /** Helps for items already open. */
  helped: { id: string; help: Help }[]
}

const FENCE = /```[^\n]*\n([\s\S]*?)```/g

/** The reply's fenced code blocks, in the order buildPrompt numbers them. */
function codeBlocks(reply: string): string[] {
  return [...reply.matchAll(FENCE)].map(m => (m[1] ?? '').replace(/\n$/, ''))
}

function numberBlocks(reply: string): string {
  let n = 0

  return reply.replace(FENCE, block => `[block ${(n += 1)}]${NL}${block}`)
}

/**
 * Checks one HELP line; null when it is unusable. A path, command, URL or line
 * of text must appear in `source`, the reply and activity, so the model cannot
 * invent one. A null source (a catch-up over the whole conversation) skips that.
 */
function readHelp(
  kind: string,
  value: string,
  name: string | null,
  blocks: string[],
  source: string | null,
): Help | null {
  const isQuoted = (text: string) => source === null || source.includes(text)
  // "block N" names a code block of the reply, already quoted; anything else is the value as written.
  const block = value.match(/^block\s+(\d+)$/i)
  const quoted = block ? (blocks[Number(block[1]) - 1] ?? '') : value.replace(/^`|`$/g, '')
  const isFromReply = (text: string) => block !== null || isQuoted(text)
  if (kind === 'open') {
    const path = value.replace(/^`|`$/g, '')
    return path !== '' && path.length <= 300 && !/^[a-z]+:/i.test(path) && isQuoted(path) ? { kind, path } : null
  }
  if (kind === 'copy') {
    return quoted.trim() !== '' && quoted.length <= 8000 && isFromReply(quoted) ? { kind, text: quoted, name } : null
  }
  if (kind === 'run') {
    const command = quoted.trim().replace(/^!\s*/, '')
    const isUsable = command !== '' && command.length <= 4000 && isFromReply(command)
    return isUsable ? { kind: NEEDS_PERSON.test(command) ? 'terminal' : 'run', command, name } : null
  }
  if (kind === 'link') {
    try {
      const url = new URL(value)
      return url.protocol === 'https:' && isQuoted(value) ? { kind, url: url.href, name } : null
    } catch {
      return null
    }
  }

  return null
}

/** The command a help runs or copies, so a copy of a command yields to its command button. */
function commandOf(help: Help): string | null {
  if (help.kind === 'run' || help.kind === 'terminal') return help.command
  if (help.kind === 'copy') return help.text.trim().replace(/^!\s*/, '')

  return null
}

function isCommand(help: Help): boolean {
  return help.kind === 'run' || help.kind === 'terminal'
}

/** What a help acts on, without the name the model gave it, so one command under two names counts once. */
function helpTarget(help: Help): string {
  if (help.kind === 'open') return `open ${help.path}`
  if (help.kind === 'link') return `link ${help.url}`

  return `command ${commandOf(help)}`
}

function withHelp(helps: Help[], help: Help): Help[] {
  const command = commandOf(help)
  const kept = isCommand(help) ? helps.filter(h => h.kind !== 'copy' || commandOf(h) !== command) : helps
  // A copy and a run of one command share a target, so either covers the other.
  const isCovered = kept.some(h => helpTarget(h) === helpTarget(help))

  return isCovered || kept.length >= MAX_HELPS ? kept : [...kept, help]
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max) + ' …[cut]'
}

/** The ledger as the model reads it: the card, the open items and the notes, with their ids. */
function ledgerBlocks(ledger: Ledger): string[] {
  const card = ledger.card
    ? [
        `GOAL: ${ledger.card.goal}`,
        ...ledger.card.done.map(d => `DONE: ${d}`),
        `NOW: ${ledger.card.now}`,
        ...ledger.card.running.map(r => `RUNNING: ${r}`),
      ].join(NL)
    : ''
  const open = ledger.items.map(i => `${i.id} | ${i.kind} | ${i.label ?? '-'} | ${i.ask}`).join(NL)
  const notes = ledger.notes.map(n => `${n.id} | ${n.kind}: ${n.title}`).join(NL)
  const decided = ledger.decided
    .slice(-8)
    .map(d => `${d.ask} → ${settled(d)}`)
    .join(NL)

  return [
    `<card>${NL}${card}${NL}</card>`,
    `<open>${NL}${open}${NL}</open>`,
    `<notes>${NL}${notes}${NL}</notes>`,
    `<decided>${NL}${decided}${NL}</decided>`,
  ]
}

export function buildPrompt(ledger: Ledger, ex: Exchange): string {
  const person = ex.person ?? `(The person sent nothing. The turn was started by: ${ex.trigger ?? 'unknown'}.)`

  return [
    ...ledgerBlocks(ledger),
    `<person>${NL}${clip(person, 4000)}${NL}</person>`,
    `<activity>${NL}${clip(ex.activity.join(NL), 2500)}${NL}</activity>`,
    `<reply>${NL}${clip(numberBlocks(ex.reply), 12000)}${NL}</reply>`,
    `<screen>${NL}${ex.screen}${NL}</screen>`,
    `<checks>${NL}${ex.checks.length > 0 ? ex.checks.join(NL) : '(none ran)'}${NL}</checks>`,
  ].join(NL)
}

/** What the person sees besides the conversation, as the ledger model reads it. */
export function screenText(isPaneOpen: boolean, tab: string): string {
  return isPaneOpen
    ? `The /inbox pane is open beside the conversation, on its ${tab} tab, listing every open item.`
    : 'The /inbox pane is closed.'
}

/**
 * The open tasks a shell command the person ran completes: those whose run or
 * sign-in step is that exact command, so nothing closes on a guess.
 */
export function tasksRunBy(ledger: Ledger, command: string): Item[] {
  const typed = squash(command)

  return ledger.items.filter(
    i =>
      i.kind === 'do' && i.helps.some(h => (h.kind === 'run' || h.kind === 'terminal') && squash(h.command) === typed),
  )
}

/** A transcript row of the person's own command, as session.append carries it. */
export type CommandRow =
  | { kind: 'shell'; command: string }
  | { kind: 'output'; stdout: string; stderr: string }
  | { kind: 'slash'; name: string; args: string }

/** Reads a `!` command, its output, or a slash command from a row's text; null for any other row. */
export function readCommandRow(text: string): CommandRow | null {
  const input = text.match(/^<bash-input>([\s\S]*)<\/bash-input>$/)
  if (input) return { kind: 'shell', command: (input[1] ?? '').trim() }
  const output = text.match(/<bash-stdout>([\s\S]*?)<\/bash-stdout><bash-stderr>([\s\S]*?)<\/bash-stderr>/)
  if (output) return { kind: 'output', stdout: (output[1] ?? '').trim(), stderr: (output[2] ?? '').trim() }
  const name = text.match(/<command-name>\/?([^<\s]+)<\/command-name>/)
  if (name)
    return {
      kind: 'slash',
      name: name[1] ?? '',
      args: (text.match(/<command-args>([\s\S]*?)<\/command-args>/)?.[1] ?? '').trim(),
    }

  return null
}

function squash(command: string): string {
  return command.trim().replace(/\s+/g, ' ')
}

function dash(value: string | undefined): string | null {
  const v = (value ?? '').trim()

  return v === '' || v === '-' ? null : v
}

/**
 * Reads the model's line format; null when no known key appears. `source` is
 * the reply followed by the activity: HELP values must appear in it, and
 * "copy | block N" names its code blocks. Null skips both, so block copies drop.
 */
export function parseReply(text: string, source: string | null = null): Update | null {
  const blocks = source === null ? [] : codeBlocks(source)
  const card = { goal: '', done: [] as string[], now: '', running: [] as string[] }
  const closed: Update['closed'] = []
  const added: Update['added'] = []
  const helped: Update['helped'] = []
  const helps: { target: string; help: Help }[] = []
  let seen = 0

  for (const raw of text.split(NL)) {
    const m = raw.match(/^\s*[-*]?\s*(GOAL|DONE|NOW|RUNNING|CLOSED|NEW|HELP)\s*:\s*(.*)$/)
    if (!m) continue
    seen += 1
    const key = m[1]
    const value = (m[2] ?? '').trim()
    if (key === 'GOAL') card.goal = value
    else if (key === 'NOW') card.now = value
    else if (key === 'DONE' && value) card.done.push(value)
    else if (key === 'RUNNING' && value && value !== '-') card.running.push(value)
    else if (key === 'CLOSED') {
      const [id, outcome] = value.split('|').map(s => s.trim())
      if (id) closed.push({ id, outcome: outcome ?? '' })
    } else if (key === 'NEW') {
      const [kind, label, ask, options, rec] = value.split('|').map(s => s.trim())
      if (!ask) continue
      added.push({
        kind: kind === 'do' ? 'do' : 'decide',
        label: dash(label),
        ask,
        options:
          dash(options)
            ?.split(/\s+\/\s+/)
            .filter(Boolean) ?? [],
        rec: dash(rec),
        helps: [],
      })
    } else if (key === 'HELP') {
      const [target, kind, help, name] = value.split('|').map(s => s.trim())
      const parsed = readHelp(kind ?? '', help ?? '', dash(name), blocks, source)
      if (parsed && target) helps.push({ target, help: parsed })
    }
  }
  // HELP lines name their item, and may come before or after its NEW line.
  for (const { target, help } of helps) {
    // Lenient about extra words: the model sometimes writes "open i9" for "i9".
    const n = target.match(/\bnew\s*(\d+)\b/i)
    const id = target.match(/\b(i\d+)\b/)?.[1]
    const item = n ? added[Number(n[1]) - 1] : undefined
    if (item) item.helps = withHelp(item.helps, help)
    else if (!n && id) helped.push({ id, help })
  }

  return seen === 0 ? null : { card: { ...card, done: card.done.slice(-4) }, closed, added, helped }
}

const FILLER = new Set([
  'the',
  'and',
  'for',
  'with',
  'use',
  'into',
  'from',
  'that',
  'this',
  'your',
  'you',
  'should',
  'make',
  'add',
  'all',
])

function keyWords(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(w => w.length > 2 && !FILLER.has(w)))
}

/**
 * Whether one ask rewords the other: most of the shorter one's key words
 * appear in the longer. Asks with one key word only match exactly, since
 * "Deploy?" and "Deploy now?" can be different questions.
 */
function restates(a: string, b: string): boolean {
  const x = keyWords(a)
  const y = keyWords(b)
  const fewer = Math.min(x.size, y.size)
  const shared = [...x].filter(w => y.has(w)).length

  return fewer >= 2 ? shared / fewer >= 0.7 : sameAsk(a, b)
}

function sameAsk(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()

  return norm(a) === norm(b)
}

/**
 * The open item a NEW line repeats, if any. The summary model often restates
 * an open item, labelled with its id or reworded, instead of leaving it alone.
 */
function matchOpen(items: Item[], a: Update['added'][number]): number {
  return items.findIndex(
    i => i.id === a.label || sameAsk(i.ask, a.ask) || (i.kind === a.kind && restates(i.ask, a.ask)),
  )
}

/** The outcome of an item Claude closed, so the pane and Claude can tell it from the user's own decision. */
export const CLOSED_BY_CLAUDE = 'closed by Claude'

/**
 * Closes an open item or note for Claude: one the user answered in their own
 * message, with that answer as its outcome, or one that is done or no longer
 * applies, with Claude's reason. A note, which Claude recorded itself, is
 * removed. `closed` is null when no open one has the id.
 */
export function closeByClaude(
  ledger: Ledger,
  id: string,
  how: { answer: string } | { reason: string },
  now: number,
): { ledger: Ledger; closed: 'item' | 'note' | null } {
  const outcome = 'answer' in how ? how.answer : `${CLOSED_BY_CLAUDE}: ${how.reason}`
  if (ledger.items.some(i => i.id === id)) return { ledger: closeItem(ledger, id, outcome, now), closed: 'item' }
  if (ledger.notes.some(n => n.id === id))
    return { ledger: { ...ledger, notes: ledger.notes.filter(n => n.id !== id) }, closed: 'note' }

  return { ledger, closed: null }
}

/** Closes one item, recording what was decided. */
export function closeItem(ledger: Ledger, id: string, outcome: string, now: number): Ledger {
  return {
    ...ledger,
    items: ledger.items.filter(i => i.id !== id),
    decided: [
      ...ledger.decided,
      ...ledger.items.filter(i => i.id === id).map(i => ({ id, ask: i.ask, outcome, at: now })),
    ].slice(-MAX_DECIDED),
  }
}

export function applyUpdate(ledger: Ledger, u: Update, now: number, turn: number): Ledger {
  const prev = ledger.card
  const card: Card = {
    goal: u.card.goal || prev?.goal || '',
    done: u.card.done.length > 0 ? u.card.done : (prev?.done ?? []),
    now: u.card.now || prev?.now || '',
    running: u.card.running,
    updatedAt: now,
  }
  const closing = new Map(u.closed.map(c => [c.id, c.outcome]))
  const decided = [...ledger.decided]
  const items: Item[] = []
  for (const item of ledger.items) {
    const outcome = closing.get(item.id)
    const helps = u.helped.filter(h => h.id === item.id).reduce((all, h) => withHelp(all, h.help), item.helps)
    if (outcome === undefined) items.push({ ...item, helps })
    else decided.push({ id: item.id, ask: item.ask, outcome, at: now })
  }

  let nextId = ledger.nextId
  let added = 0
  for (const a of u.added) {
    const at = matchOpen(items, a)
    const restated = items[at]
    if (restated) {
      items[at] = { ...restated, helps: a.helps.reduce((all, h) => withHelp(all, h), restated.helps) }
      continue
    }
    items.push({ ...a, id: `i${nextId}`, turn })
    nextId += 1
    added += 1
  }

  return {
    ...ledger,
    card,
    items: items.filter(i => turn - i.turn <= STALE_AFTER).slice(-MAX_OPEN),
    decided: decided.slice(-MAX_DECIDED),
    notes: ledger.notes.filter(n => !closing.has(n.id)),
    nextId,
    batchTurn: added > 0 ? turn : ledger.batchTurn,
  }
}

/** The items the agent's latest reply added, which "1. yes" answers refer to. */
export function latestBatch(ledger: Ledger): Item[] {
  return ledger.batchTurn === 0 ? [] : ledger.items.filter(i => i.turn === ledger.batchTurn)
}

function describe(item: Item): string {
  const parts = [`"${item.ask}"`]
  if (item.options.length > 0) parts.push(`options: ${item.options.join(' / ')}`)
  if (item.rec) parts.push(`recommended: ${item.rec}`)
  if (item.kind === 'do') parts.push('an action for the user')

  return parts.join('; ')
}

function numberOf(label: string | null): number | null {
  const m = label?.match(/(\d+)/)

  return m ? Number(m[1]) : null
}

const LINE_ANSWER = /(?:^|\n)\s*(?:[QqDd#]\s?)?(\d{1,2})\s*[.):\-–]\s*\S/g
const INLINE_ANSWER = /\s(?:[QqDd#]\s?)?(\d{1,2})\s*[.)]\s+\S/g
const ACCEPT_ALL =
  /^\s*(go|go ahead|yes|yep|yeah|sure|ok|okay|sgtm|lgtm|sounds good|do it|proceed|all good|ship it)\s*[.!]*\s*$/i
const ACCEPT_RECS = /\b(all|both|everything|your)\b[^.\n]{0,40}\b(recommend\w*|recs?|suggest\w*|picks?|calls?)\b/i

/**
 * The note attached to the person's prompt when it answers open items:
 * numbered answers mapped to the latest batch, an item quoted from the band,
 * or a blanket "go" over the latest recommendations. Null when it answers none.
 *
 * `turn` is the person's prompt count including this prompt, so the latest
 * batch is only offered when it came from the reply just before it.
 */
export function answerNote(ledger: Ledger, text: string, turn: number): string | null {
  const lines: string[] = []
  const batch = ledger.batchTurn === turn - 1 ? latestBatch(ledger) : []

  if (batch.length > 0) {
    const numbers = new Set<number>()
    for (const m of text.matchAll(LINE_ANSWER)) numbers.add(Number(m[1]))
    // "1. node 2. yes" on one line counts only when the message opens with an
    // answer, so "bullet 4." mid-sentence is not read as answering item 4.
    if (/^\s*(?:[QqDd#]\s?)?\d{1,2}\s*[.):\-–]\s/.test(text)) {
      for (const m of text.matchAll(INLINE_ANSWER)) numbers.add(Number(m[1]))
    }
    const hasLabels = batch.some(i => numberOf(i.label) !== null)
    for (const n of [...numbers].sort((a, b) => a - b)) {
      const item = hasLabels ? batch.find(i => numberOf(i.label) === n) : batch[n - 1]
      if (item) lines.push(`- ${n} → ${describe(item)}`)
    }
    if (lines.length === 0 && (ACCEPT_ALL.test(text) || ACCEPT_RECS.test(text))) {
      const withRecs = batch.filter(i => i.rec)
      if (withRecs.length > 0) {
        return [
          'session-inbox: if the user is accepting your recommendations, these are the open ones:',
          ...withRecs.map(i => `- ${i.label ?? '•'} → ${describe(i)}`),
        ].join(NL)
      }
    }
  }

  return lines.length === 0
    ? null
    : ["session-inbox: the user's message answers these open items from your earlier replies:", ...lines].join(NL)
}

/**
 * Adds a note Claude recorded. A note whose title matches an open one is
 * skipped, so the same finding is not listed twice.
 */
export function addNote(ledger: Ledger, note: Omit<Note, 'id'>): { ledger: Ledger; isAdded: boolean } {
  const notes = ledger.notes
  if (notes.some(n => sameAsk(n.title, note.title))) return { ledger, isAdded: false }

  return {
    ledger: {
      ...ledger,
      notes: [...notes, { ...note, id: `n${ledger.nextId}` }].slice(-MAX_NOTES),
      nextId: ledger.nextId + 1,
    },
    isAdded: true,
  }
}

/** An open item as Claude reads it, with its id when Claude may close it. */
function itemLine(item: Item, withId: boolean): string {
  return `- ${withId ? `[${item.id}] ` : ''}${item.label ? `(${item.label}) ` : ''}${describe(item)}`
}

function noteLine(note: Note, withId: boolean): string {
  return `- ${withId ? `[${note.id}] ` : ''}${note.kind}: ${note.title}`
}

/**
 * What the model reads after a compaction, so open items and the goal
 * survive it. Ids go in only for this session's own ledger, since Claude
 * closes items by id; the previous session's items are not this one's.
 */
export function carryText(ledger: Ledger, title: string, withIds = false): string | null {
  const notes = ledger.notes
  if (!ledger.card && ledger.items.length === 0 && notes.length === 0) return null
  const out = [title]
  if (ledger.card) {
    out.push(`Goal: ${ledger.card.goal}`)
    if (ledger.card.done.length > 0) out.push(`Done: ${ledger.card.done.join('; ')}`)
    if (ledger.card.now) out.push(`Now: ${ledger.card.now}`)
    if (ledger.card.running.length > 0) out.push(`Running: ${ledger.card.running.join('; ')}`)
  }
  if (ledger.items.length > 0) {
    out.push('Waiting on the user:')
    for (const item of ledger.items) out.push(itemLine(item, withIds))
  }
  if (notes.length > 0) {
    out.push('Notes you recorded for the user, still open:')
    for (const n of notes) out.push(noteLine(n, withIds))
  }
  if (ledger.decided.length > 0) {
    out.push('Recently decided:')
    for (const d of ledger.decided.slice(-6)) out.push(`- "${d.ask}" → ${d.outcome}`)
  }

  return out.join(NL)
}

/**
 * The inbox as Claude reads it beside a prompt: what is open now and whether
 * the pane shows it. prompt.context reaches only the first message, so this is
 * how Claude learns what changed since.
 */
export function inboxText(ledger: Ledger, isPaneOpen: boolean): string {
  const out = ['session-inbox: the inbox as of the last reply. Only the items listed here are open.']
  if (ledger.items.length > 0) {
    out.push('Waiting on the user:')
    for (const item of ledger.items) out.push(itemLine(item, true))
  } else {
    out.push('Nothing is waiting on the user.')
  }
  if (ledger.notes.length > 0) {
    out.push('Notes you recorded, still open:')
    for (const n of ledger.notes) out.push(noteLine(n, true))
  }
  out.push(isPaneOpen ? 'The user has the /inbox pane open beside the conversation.' : 'The /inbox pane is closed.')

  return out.join(NL)
}

/** How an item was settled, in words a model reads without the mod's vocabulary. */
function settled(d: Decided): string {
  return d.outcome === 'dismissed' ? 'dismissed by the user' : d.outcome
}

/**
 * The items settled since Claude last read the inbox, so Claude can tell a
 * dismissed question from one still waiting and does not ask it again.
 */
export function closedText(decided: Decided[]): string | null {
  if (decided.length === 0) return null

  return [
    'Settled since you last read the inbox. Do not ask these again unless the user brings them up:',
    ...decided.map(d => `- "${d.ask}" → ${settled(d)}`),
  ].join(NL)
}

/**
 * The stop's kind, from the error word and the message Claude Code showed.
 * A reached usage limit and a busy server are both `rate_limit`; only the
 * message, "You've hit your weekly limit · resets 7:33pm", tells them apart.
 */
export function stopKindOf(error: string, message: string): Stop['kind'] {
  if (error === 'rate_limit') return /\bhit your\b.*\blimit\b/i.test(message) ? 'usage-limit' : 'api-error'
  switch (error) {
    case 'authentication_failed':
    case 'oauth_org_not_allowed':
    case 'verification_required':
    case 'cloud_credential_error':
      return 'sign-in'
    case 'billing_error':
    case 'account_on_hold':
      return 'billing'
    default:
      return 'api-error'
  }
}

/** When a usage limit resets, as Claude Code's message says it: "7:33pm". */
export function resetTime(message: string): string | null {
  return message.match(/\bresets\s+(?:at\s+)?([^·(\n]+?)\s*(?:\(|·|$)/i)?.[1]?.trim() ?? null
}

/** "sign-in expired" */
export function stopText(stop: Stop): string {
  switch (stop.kind) {
    case 'sign-in':
      return 'sign-in expired'
    case 'billing':
      return 'billing problem'
    case 'usage-limit':
      return 'usage limit reached'
    default:
      return stop.detail === 'rate_limit'
        ? 'the API is limiting requests'
        : stop.detail === 'overloaded'
          ? 'the API is overloaded'
          : `API error (${stop.detail})`
  }
}

/** What the person does to clear a stop. */
export function stopFix(stop: Stop): string {
  switch (stop.kind) {
    case 'sign-in':
      return 'Run /login, then send a message to resume.'
    case 'billing':
      return 'Check billing in the Claude console, then resume.'
    case 'usage-limit':
      return stop.resets ? `Resume after ${stop.resets}.` : 'Resume when the limit resets.'
    default:
      return 'Send a message to resume.'
  }
}

/** The stop and its fix in a few words, for the sidebar. */
function stopShort(stop: Stop): string {
  switch (stop.kind) {
    case 'sign-in':
      return 'Signed out: /login'
    case 'billing':
      return 'Billing problem'
    case 'usage-limit':
      return stop.resets ? `Limit: resets ${stop.resets}` : 'Usage limit reached'
    default:
      return 'API error: resume'
  }
}

/** "Allow push main to origin?", or a question dialog's question. */
export function dialogText(dialog: Dialog): string {
  return dialog.kind === 'permission' ? `Allow ${dialog.text}?` : dialog.text
}

/**
 * The session's line in the Herdr sidebar: a stop and its fix, else an open
 * dialog, else how many items wait and the first of the latest reply's, else
 * where the work stands. The count leads, because the sidebar cuts long lines
 * at its edge. Empty when there is nothing to say.
 */
export function statusLine(ledger: Ledger, stop: Stop | null, dialogs: Dialog[]): string {
  if (stop) return `! ${stopShort(stop)}`
  const dialog = dialogs[0]
  if (dialog) return dialogText(dialog)
  const first = latestBatch(ledger)[0] ?? ledger.items[0]
  if (first) return ledger.items.length > 1 ? `${ledger.items.length} · ${first.ask}` : first.ask
  const notes = ledger.notes.length === 0 ? null : `${ledger.notes.length} note${ledger.notes.length === 1 ? '' : 's'}`

  return [ledger.card?.now, notes].filter(Boolean).join(' · ')
}

/** "just now", "12m ago", "3h ago", "2d ago". */
export function ago(ms: number): string {
  const min = Math.round(ms / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const h = Math.round(min / 60)
  if (h < 48) return `${h}h ago`

  return `${Math.round(h / 24)}d ago`
}
