import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, UiPressArgument, UiScrollResult } from 'claude-code'

import type {
  Checks,
  Collapsed,
  Cursor,
  Decided,
  Dialog,
  Help,
  Item,
  Ledger,
  Note,
  PrCheck,
  PrThread,
  PrView,
  PrViews,
  Presence,
  Previous,
  Section,
  Settled,
  Snapshot,
  Stop,
  Tab,
} from '../types'
import { checkLine, checksIn, claimMessage, contradictedClaim, isStale, readResults, recordCheck } from './checks'
import { demoView } from './demo'
import { candidates, changedPaths, readChanged, readLsTree, sameSnapshot } from './git'
import type { Exchange, Press, StoredLedger, Update } from './ledger'
import {
  THREADS_QUERY,
  VIEW_FIELDS,
  checkCounts,
  failingChecks,
  parseRef,
  prRefs,
  prompts,
  readThreads,
  readView,
  readiness,
  threadWhere,
  waitingThreads,
} from './prs'
import {
  CLOSED_BY_CLAUDE,
  EMPTY,
  SYSTEM,
  addNote,
  ago,
  answerNote,
  applyUpdate,
  buildPrompt,
  carryText,
  closeItem,
  normalizeLedger,
  parseReply,
  catchUpPrompt,
  closeByClaude,
  closedText,
  inboxText,
  resetTime,
  readCommandRow,
  screenText,
  statusLine,
  stopFix,
  stopKindOf,
  stopText,
  tasksRunBy,
} from './ledger'

const LEDGER = atom({ plugin: 'session-inbox', key: 'ledger' } as const, EMPTY)
const PRESENCE = atom(
  { plugin: 'session-inbox', key: 'presence' } as const,
  {
    lastActiveAt: 0,
    isAway: false,
    isUpdating: false,
    error: null,
    minute: 0,
  } as Presence,
)
const PREVIOUS = atom({ plugin: 'session-inbox', key: 'previous' } as const, null as Previous | null)
const TAB = atom({ plugin: 'session-inbox', key: 'tab' } as const, 'waiting' as Tab)
// Collapsed pane sections, a preference kept in the store across sessions.
const COLLAPSED = atom({ plugin: 'session-inbox', key: 'collapsed' } as const, {} as Collapsed)
// Checks are proof to look up, not something to act on, so they start folded.
const COLLAPSED_BY_DEFAULT: Record<Section, boolean> = {
  questions: false,
  tasks: false,
  running: false,
  checks: true,
  done: false,
  decided: false,
}
const NO_CURSOR: Cursor = { id: null, index: 0 }
const SELECTION = atom(
  { plugin: 'session-inbox', key: 'selection' } as const,
  { waiting: NO_CURSOR, notes: NO_CURSOR, prs: NO_CURSOR } as Record<Tab, Cursor>,
)
// Whether Claude Code uses its `dark` theme, which picks the selected row's tint.
const IS_DARK_THEME = atom({ plugin: 'session-inbox', key: 'isDarkTheme' } as const, false)
const PR_VIEWS = atom(
  { plugin: 'session-inbox', key: 'prViews' } as const,
  { views: {}, branchRef: null, isFetching: false } as PrViews,
)
const STOP = atom({ plugin: 'session-inbox', key: 'stop' } as const, null as Stop | null)
const DIALOGS = atom({ plugin: 'session-inbox', key: 'dialogs' } as const, [] as Dialog[])
const NO_CHECKS: Checks = { results: [], snapshot: null, changedAt: 0, codeChangedAt: 0 }
const CHECKS = atom({ plugin: 'session-inbox', key: 'checks' } as const, NO_CHECKS)
const TYPING = atom({ plugin: 'session-inbox', key: 'typing' } as const, null as string | null)
const SETTLED = atom({ plugin: 'session-inbox', key: 'settled' } as const, [] as Settled[])
// How long a closed item's row stays in place, with its outcome, before it moves to Closed.
const SETTLED_MS = 8000
const IS_DEMO = atom({ plugin: 'session-inbox', key: 'isDemo' } as const, false)
const SAMPLE_PRESS = 'Sample entry: nothing was sent. Run /inbox demo to go back.'
// A dirtier tree is read only this far, so changes past it go unseen.
const SNAPSHOT_MAX = 2000
const PR_POLL_MS = 2 * 60_000
const MAX_PRS = 6

const NOTE_TOOL = 'mcp__session-inbox__note'
const NOTE_DESCRIPTION = `Record a note for the user about something you noticed that deserves their attention but is outside the current task: a bug, a risk, missing tests, tech debt, or an opportunity to improve something. Also record one when you work around a problem instead of fixing it, or when part of your change could not be tested or verified. The note waits in their session card, where they can ask you to address it or to discuss it.

Keep working on the current task, and do not fix the noted thing unless asked. Record only what a careful senior engineer would flag to a teammate, not style nits or anything already discussed. You do not need to mention the note in your reply.`
const NOTE_GUIDANCE = `# Session inbox
The session-inbox plugin keeps what waits on the user in a band above their prompt and in the /inbox pane.

When you notice something outside the current task that deserves the user's attention, such as a bug, a risk, missing tests, tech debt, or a chance to improve something, record it with the mcp__session-inbox__note tool when you notice it. Record one too at these moments, which are easy to pass over while focused on the task:
- You work around a problem instead of fixing it, such as copying files by hand because a tool does not reach them.
- Part of your change could not be tested or verified.
The user reviews notes in /inbox and can ask you to address or discuss each one. Keep to the task; you may still mention the note briefly in your reply.

Before telling the user an inbox item is open or needs them, check the latest session-inbox context beside their prompt. It lists every open item; an item it does not list is closed.

That list shows each item's and note's id, such as [i35]. When the user's message answers an open item, close it first, before any other work, with the mcp__session-inbox__close tool and their answer in a few words, so their inbox shows it answered at once. When an item is done or no longer applies, close it with a reason of a few words, without waiting to be asked. Never close a question to answer it for the user: only they answer it.`
const CLOSE_TOOL = 'mcp__session-inbox__close'
const CLOSE_DESCRIPTION = `Close an item or note in the user's session inbox, by the id the inbox context beside their latest message shows, such as i35 or n32. When the user's own message answered it, pass their answer; call this first, before other work, so their inbox shows it answered at once. When it is done or no longer applies, pass a reason instead. Never close a question to answer it for the user. A closed item shows in /inbox under Closed.`
const CLOSE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'The id of the open item or note, such as i35 or n32.' },
    answer: {
      type: 'string',
      description: "The user's answer, in their words and at most 8, when their own message answered it.",
    },
    reason: {
      type: 'string',
      description: 'Otherwise, why it is closed, in at most 8 words, such as "no longer applies: Inbox kept".',
    },
  },
  required: ['id'],
}
const NOTE_SCHEMA = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      enum: ['issue', 'opportunity'],
      description: 'issue: something wrong or risky. opportunity: something that could be better.',
    },
    title: { type: 'string', description: 'What it is, in at most 12 plain words.' },
    detail: { type: 'string', description: 'Why it matters and what you would do, in one or two sentences.' },
    path: { type: 'string', description: 'The file it is about, if one.' },
  },
  required: ['kind', 'title', 'detail'],
}

const PANE = 'session-inbox'
// Theme keys, so the colors follow the person's Claude Code theme.
const ACCENT = 'claude'
const WAITING = 'warning'
// The tab bar's panel: a theme key a shade off the pane's background, in every theme.
const PANEL_BG = 'userMessageBackground'
// The selected row in every tab is blue. In the dark theme its background is
// the `ide` blue at about 20% over the pane's rgb(38, 38, 38), muted next to
// the theme's selectionBg. Hex does not follow the theme, so other themes use SELECTION_BG.
const DARK_SELECTION = '#2d3846'
const SELECTION_BG = 'selectionBg'
// In the dark theme, the pane's body is darker than its rgb(38, 38, 38), and
// each section sits on a card of that color. Hex does not follow the theme,
// so other themes draw neither.
const DARK_BODY = '#1a1a1a'
const CARD_BG = 'composerSidebarBackground'
// The tree's lines and the dividers between rows, quieter than the text.
const MUTED_LINE = 'subtle'
// The dividers in the dark theme: about half the contrast of `subtle`'s
// rgb(80, 80, 80) against the pane's rgb(38, 38, 38). Other themes use MUTED_LINE.
const DARK_DIVIDER = '#3c3c3c'
// A child's place under its section: a middle child, the last, or a block the tree passes.
type TreePos = 'mid' | 'last' | 'pass'
// More tree lines than a row wraps to; the tree's Box clips the rest.
const TREE_DEPTH = 200
const DONE = 'success'
// Each pane tab has its own color, used by its marker and by what it shows.
const NOTES = 'autoAccept'
const PRS = 'planMode'
const TAB_COLORS: Record<Tab, string> = { waiting: WAITING, notes: NOTES, prs: PRS }
const TABS: { id: Tab; label: string; hotkey: string }[] = [
  { id: 'waiting', label: 'Waiting', hotkey: 'w' },
  { id: 'notes', label: 'Notes', hotkey: 'n' },
  { id: 'prs', label: 'PRs', hotkey: 'p' },
]
// The Waiting tab lists questions first, because each takes one key.
const WAITING_GROUPS: { kind: Item['kind']; title: string; section: Section }[] = [
  { kind: 'decide', title: 'Questions', section: 'questions' },
  { kind: 'do', title: 'Your tasks', section: 'tasks' },
]
const MODEL = 'sonnet'
const AWAY_MS = 15 * 60_000
const PREVIOUS_MAX_AGE_MS = 7 * 24 * 60 * 60_000
const KEPT_SESSIONS = 40
// Opened with `open -R` (shown in Finder) instead of `open`, which would launch them.
const LAUNCHES =
  /\.(app|command|tool|terminal|workflow|scpt|scptd|applescript|pkg|mpkg|dmg|webloc|inetloc|fileloc|prefpane|kext)$/i
const LOCAL_URL = /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|[\w.-]+\.localhost)(?::\d+)?[^\s"'`)\]]*/g

// One turn's exchange, gathered across hooks. Module variables reset on a hot
// reload, which only loses the turn in progress.
let activity: string[] = []
let person: string | null = null
let trigger: string | null = null
let isTurnRunning = false
let isOn = false
// The press behind this turn's prompt.
let press: Press | null = null
// Set in session.start, which a hot reload runs again.
let sessionId = ''
let root = ''
// The repo's top folder, where git reads the working tree; null outside git.
let top: string | null = null
let refreshing: Promise<void> = Promise.resolve()
let isSaved = false
let queue: Promise<void> = Promise.resolve()
// The inbox text Claude last read beside a prompt, so it is sent again only when it changed.
let toldInbox: string | null = null
// The line last published to this pane's Herdr sidebar row, and the chain that publishes in order.
let published: string | null = null
let publishing: Promise<void> = Promise.resolve()
// Context for prompts this mod sent, by text, appended just before each prompt's row.
const contextFor = new Map<string, string[]>()
// The settled items Claude has been told about, by id.
let toldDecided = new Set<string>()
// The `!` command whose output row comes next.
let shellCommand: string | null = null
// Slash commands that say nothing about the work.
const QUIET_COMMANDS = new Set(['inbox', 'clear'])

/** Adds a command the person ran themselves to what they sent this turn. */
function notePerson(line: string) {
  person = person === null ? line : `${person}\n\n${line}`
}

function noteActivity(line: string) {
  if (activity.length < 40 && !activity.includes(line)) activity.push(line)
}

async function save($: EngineInterface, ledger: Ledger) {
  const savedAt = await $.clock.now()
  const key = `s:${sessionId}`
  // The first save in a process deletes the key first, moving it to the end of
  // the store's insertion order, which the pruning treats as most recent. Later
  // saves only overwrite, so pruning runs once per process.
  if (!isSaved) await $.store.delete(key)
  await $.store.set(key, { savedAt, ledger })
  if (ledger.card) await $.store.set(`p:${root}`, { sessionId, savedAt, ledger })
  if (isSaved) return
  isSaved = true
  const sessions = (await $.store.keys()).filter(k => k.startsWith('s:'))
  for (const old of sessions.slice(0, Math.max(0, sessions.length - KEPT_SESSIONS))) {
    await $.store.delete(old)
  }
}

/**
 * Publishes the session's status line to its Herdr pane, where a sidebar row
 * showing the `inbox` token reads it. Outside Herdr it does nothing. Calls run
 * in order and read the state when they run, so an older line never lands
 * after a newer one, as when a dialog opens and closes in quick succession.
 */
function publishStatus($: EngineInterface, isEnding = false): Promise<void> {
  publishing = publishing
    .then(async () => {
      const pane = await $.env.get('HERDR_PANE_ID')
      if (!pane) return
      const line = isEnding ? '' : statusLine(await readLedger($), await read($, STOP), await read($, DIALOGS))
      if (line === published) return
      published = line
      const token = line ? ['--token', `inbox=${line}`] : ['--clear-token', 'inbox']
      await $.process.run(['herdr', 'pane', 'report-metadata', pane, '--source', 'session-inbox', ...token], {
        timeoutMs: 5000,
      })
    })
    .catch(() => undefined)

  return publishing
}

async function setStop($: EngineInterface, stop: Stop | null) {
  if (stop === null && (await read($, STOP)) === null) return
  await update($, STOP, () => stop)
  void publishStatus($)
}

/**
 * A tool call's identity: the tool and its main argument. A dialog keeps it,
 * so it closes when its own call ends, not when a like call does.
 */
function callKey(tool: string, input: Record<string, unknown>): string {
  const main = ['command', 'file_path', 'notebook_path', 'url', 'pattern', 'query', 'skill', 'description'].find(
    k => typeof input[k] === 'string',
  )

  return main ? `${tool} ${main}=${String(input[main])}` : `${tool} ${JSON.stringify(input)}`
}

async function openDialog($: EngineInterface, dialog: Dialog) {
  await update($, DIALOGS, d => [...d.filter(x => x.key !== dialog.key), dialog])
  void publishStatus($)
}

/** Closes the dialogs of one call, or every dialog. */
async function closeDialogs($: EngineInterface, key: string | null) {
  if (!(await read($, DIALOGS)).some(d => key === null || d.key === key)) return
  await update($, DIALOGS, d => (key === null ? [] : d.filter(x => x.key !== key)))
  void publishStatus($)
}

/** Runs a tool call and closes its dialog when the call resolves, since `next` returns only after the person answers any prompt for it. */
async function clearingDialog<T>($: EngineInterface, key: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } finally {
    await closeDialogs($, key)
  }
}

/** What a permission prompt asks, in a few words: "push main to origin", "edit README.md". */
function permissionText(tool: string, input: Record<string, unknown>): string {
  const text = (key: string) => (typeof input[key] === 'string' ? (input[key] as string) : '')
  const file = (key: string) => baseName(text(key))
  switch (tool) {
    case 'Bash': {
      const said = text('description') || text('command')
      // "Push main to origin" reads as "Allow push main to origin?"; an acronym keeps its case.
      return clipLabel(/^[A-Z][a-z]/.test(said) ? said.charAt(0).toLowerCase() + said.slice(1) : said, 60)
    }
    case 'Edit':
    case 'MultiEdit':
    case 'Write':
      return `edit ${file('file_path')}`
    case 'NotebookEdit':
      return `edit ${file('notebook_path')}`
    case 'Read':
      return `read ${file('file_path')}`
    case 'Glob':
    case 'Grep':
      return `search ${text('path') ? `${file('path')} ` : ''}for ${clipLabel(text('pattern'), 30)}`
    case 'WebFetch':
      return `fetch ${
        text('url')
          .replace(/^https?:\/\//, '')
          .split('/')[0]
      }`
    case 'WebSearch':
      return `search the web for ${clipLabel(text('query'), 30)}`
    case 'Skill':
      return `use the ${text('skill')} skill`
    case 'Agent':
    case 'Task':
      return text('description') ? `run an agent: ${text('description')}` : 'run an agent'
    default:
      return tool.startsWith('mcp__') ? tool.slice(5).replace(/__/g, ' ') : tool
  }
}

/** The ledger, with fields an earlier version of the mod did not write filled in. */
async function readLedger($: EngineInterface): Promise<Ledger> {
  return normalizeLedger(await read($, LEDGER))
}

/** Changes the ledger and saves it, so a resumed session finds it. */
async function commitLedger($: EngineInterface, change: (l: Ledger) => Ledger): Promise<Ledger> {
  let before: Ledger = EMPTY
  const after = await update($, LEDGER, l => {
    before = normalizeLedger(l)
    return change(before)
  })
  await save($, after)
  void publishStatus($)
  await showSettled($, before, after)

  return after
}

/**
 * The open items of one kind in the order the Waiting tab lists them.
 * Questions go newest first, so a new batch's numbers match Claude's in its reply.
 */
function listedItems(items: Item[], kind: Item['kind']): Item[] {
  const listed = items.filter(i => i.kind === kind)
  return kind === 'decide' ? listed.sort((a, b) => b.turn - a.turn) : listed
}

/**
 * Keeps each item that just closed in its row for a few seconds, with its
 * outcome, so the person sees it was registered, however it closed. An item
 * dropped as stale has no outcome and leaves at once.
 */
async function showSettled($: EngineInterface, before: Ledger, after: Ledger) {
  const open = new Set(after.items.map(i => i.id))
  const settled = before.items.flatMap(item => {
    const d = open.has(item.id) ? undefined : after.decided.find(x => x.id === item.id)
    return d ? [{ ...d, kind: item.kind, index: listedItems(before.items, item.kind).indexOf(item) }] : []
  })
  if (settled.length === 0) return
  await update($, SETTLED, s => [...s.filter(x => !settled.some(y => y.id === x.id)), ...settled])
  // A reload or session end cuts the wait short; the rows then go with the state.
  void $.clock
    .sleep(SETTLED_MS)
    .then(() => update($, SETTLED, s => s.filter(x => !settled.some(y => y.id === x.id && y.at === x.at))))
    .catch(() => undefined)
}

type ModelResult = Awaited<ReturnType<EngineInterface['model']['fork']>>

/** Applies the ledger model's reply; returns what went wrong, or null. */
async function applyLedgerReply(
  $: EngineInterface,
  r: ModelResult,
  source: string | null,
  change: (l: Ledger, u: Update, now: number) => Ledger,
): Promise<string | null> {
  if (!r.isAnswered) {
    if (r.reason === 'api-error') return `model error ${r.status ?? ''}`.trim()
    return r.reason === 'nothing-to-fork' ? 'nothing to read yet' : r.reason
  }
  const parsed = parseReply(r.text, source)
  if (!parsed) return 'the ledger model replied in an unreadable format'
  const now = await $.clock.now()
  await commitLedger($, l => change(l, parsed, now))

  return null
}

/** Updates the ledger from one exchange; returns what went wrong, or null. */
async function runUpdate($: EngineInterface, ex: Exchange): Promise<string | null> {
  const r = await $.model.complete({
    model: MODEL,
    system: SYSTEM,
    prompt: buildPrompt(await readLedger($), ex),
    maxTokens: 1600,
    effort: 'low',
    timeoutMs: 45_000,
  })
  // An Explain turn talks about its item without deciding it.
  const explained = ex.press?.action === 'explain' ? ex.press.id : null

  return applyLedgerReply($, r, [ex.reply, ...ex.activity].join('\n'), (l, u, now) =>
    applyUpdate(l, { ...u, closed: u.closed.filter(c => c.id !== explained) }, now, ex.turn),
  )
}

/**
 * Brings the ledger up to date over the whole conversation, for turns the
 * per-turn update missed: it closes what was handled and adds what still waits.
 */
async function catchUp($: EngineInterface): Promise<string | null> {
  const r = await $.model.fork({ prompt: catchUpPrompt(await readLedger($), await screen($)) })

  return applyLedgerReply($, r, null, (l, u, now) => applyUpdate(l, u, now, l.turn))
}

/**
 * Queues the next update: a catch-up after a failed one, since the ledger may
 * have missed that turn, else this exchange alone.
 */
function queueUpdate($: EngineInterface, ex: Exchange | null) {
  queue = queue.then(async () => {
    const isBehind = (await read($, PRESENCE)).error !== null
    await update($, PRESENCE, p => ({ ...p, isUpdating: true }))
    const error = await (isBehind || ex === null ? catchUp($) : runUpdate($, ex)).catch(() => 'the last update failed')
    await update($, PRESENCE, p => ({ ...p, isUpdating: false, error }))
  })
  // A rejected link would skip every later update, so the chain swallows it.
  queue = queue.catch(() => undefined)
}

async function tick($: EngineInterface) {
  const now = await $.clock.now()
  const p = await read($, PRESENCE)
  if (p.isAway) {
    await update($, PRESENCE, q => ({ ...q, minute: Math.floor(now / 60_000) }))
  } else if (!isTurnRunning && p.lastActiveAt > 0 && now - p.lastActiveAt > AWAY_MS) {
    await update($, PRESENCE, q => ({ ...q, isAway: true, minute: Math.floor(now / 60_000) }))
  }
}

/**
 * Sends an answer to Claude as the person's own message. The item closes at
 * once, so a second press cannot send it twice. A prompt sent mid-turn waits
 * for the turn to end.
 */
async function sendAnswer($: EngineInterface, item: Item, answer: string) {
  await close($, item.id, answer)
  await send($, `Re "${item.ask}": ${answer}`, { id: item.id, action: 'answer' })
}

/**
 * Sends a prompt as the person's own message. A plugin's own prompt skips that
 * plugin's prompt.submit hook, so the bookkeeping happens here, and what
 * Claude reads beside the prompt goes just before it, in a row only the model sees.
 */
async function send($: EngineInterface, text: string, sentBy: Press | null = null) {
  const context = await notePrompt($, text, sentBy)
  // The engine may run the prompt now, after the running turn, or inside it, so
  // the context goes in when the prompt's own row is stored (session.append).
  if (context.length > 0) contextFor.set(text, context)
  await $.prompt.submit({ text, asUser: true })
}

/** Appends context as a row only the model reads. Without it Claude still gets the prompt, so a refused append is ignored. */
async function appendContext($: EngineInterface, context: string[]) {
  if (context.length === 0) return
  await $.session
    .append({ message: { type: 'user', content: [{ type: 'text', text: context.join('\n\n') }] } })
    .catch(() => undefined)
}

/**
 * Records a prompt in the person's words and returns what Claude reads beside
 * it: the previous session's card when they continue from it, the questions a
 * numbered answer refers to, and the inbox when it changed.
 */
async function notePrompt($: EngineInterface, text: string, sentBy: Press | null): Promise<string[]> {
  const now = await $.clock.now()
  await update($, PRESENCE, p => ({ ...p, lastActiveAt: now, isAway: false }))
  const ledger = await update($, LEDGER, l => ({ ...normalizeLedger(l), turn: l.turn + 1 }))
  const notes: string[] = []

  const prev = await read($, PREVIOUS)
  if (prev) {
    if (prev.isBroughtIn) {
      const carried = carryText(
        prev.ledger,
        `session-inbox: the user chose to continue from the previous session in this folder (${ago(now - prev.savedAt)}). Where it stood:`,
      )
      if (carried) notes.push(carried)
    }
    await update($, PREVIOUS, () => null)
  }
  // A button's prompt already says what it does; an Explain, for one, quotes its item without answering it.
  const answer = sentBy ? null : answerNote(ledger, text, ledger.turn)
  if (answer) notes.push(answer)
  // The inbox when it changed since Claude last read it, or when something was
  // settled since. An empty inbox with nothing settled says nothing new.
  const inbox = inboxText(ledger, await isPaneShown($))
  const closed = closedText(ledger.decided.filter(d => !toldDecided.has(d.id)))
  const isEmpty = ledger.items.length === 0 && ledger.notes.length === 0
  if (closed || (inbox !== toldInbox && !(isEmpty && toldInbox === null))) {
    notes.push(closed ? `${inbox}\n${closed}` : inbox)
    toldInbox = inbox
    toldDecided = new Set(ledger.decided.map(d => d.id))
  }

  if (sentBy) press = sentBy
  person = person === null ? text : `${person}\n\n${text}`
  trigger = null

  return notes
}

/** Asks Claude what an item is about. The item stays open, since nothing was decided. */
async function explain($: EngineInterface, item: Item) {
  const what = item.kind === 'do' ? 'this task you left for me' : 'this question you asked me'
  const options = item.options.length > 0 ? `\nOptions: ${item.options.join(' / ')}` : ''
  const text = `Remind me what ${what} is about: why it came up, and what each choice would mean. Don't act on it yet.\n"${item.ask}"${options}`
  await send($, text, { id: item.id, action: 'explain' })
}

async function close($: EngineInterface, id: string, outcome: string) {
  const now = await $.clock.now()
  await commitLedger($, l => closeItem(l, id, outcome, now))
}

/**
 * Opens a file in the app macOS assigns to its type, else the default text
 * editor. A folder, an executable, or anything `open` would launch is shown in
 * Finder instead.
 */
async function openPath($: EngineInterface, raw: string) {
  const home = (await $.env.get('HOME')) ?? ''
  const path = raw.startsWith('~/')
    ? home + raw.slice(1)
    : raw.startsWith('/')
      ? raw
      : `${root}/${raw.replace(/^\.\//, '')}`
  const name = baseName(path)
  if (!(await $.fs.exists(path))) {
    $.ui.toast(`${name} is not there anymore`)
    return
  }
  const stat = await $.fs.stat(path)
  const isExecutable = stat.kind === 'file' && (await $.process.run(['test', '-x', path])).exitCode === 0
  const isReveal = stat.kind !== 'file' || isExecutable || LAUNCHES.test(path)
  const r = await $.process.run(isReveal ? ['open', '-R', path] : ['open', path])
  // A file with no registered type, such as .env.local, fails `open`; -t uses the default text editor.
  const retry = r.exitCode !== 0 && !isReveal ? await $.process.run(['open', '-t', path]) : r
  if (retry.exitCode !== 0) $.ui.toast(`Could not open ${name}: ${retry.stderr.trim()}`)
}

async function useHelp($: EngineInterface, item: Item, help: Help, press: UiPressArgument) {
  if (help.kind === 'open') {
    await openPath($, help.path)
  } else if (help.kind === 'copy') {
    const r = await $.ui.copy({ text: help.text, surface: press.surface })
    $.ui.toast(r.isCopied ? `Copied ${help.name ?? 'snippet'}` : 'Could not copy to the clipboard')
  } else if (help.kind === 'run') {
    const fence = '```'
    await send($, `For "${item.ask}", run this:\n${fence}\n${help.command}\n${fence}`, { id: item.id, action: 'run' })
  } else if (help.kind === 'terminal') {
    // A filled "! command" reaches the model as text; only a typed "!" switches the prompt to shell mode.
    const r = await $.ui.copy({ text: help.command, surface: press.surface })
    const what = help.name ?? 'the command'
    $.ui.toast(
      r.isCopied
        ? `Copied ${what}. Run it in a terminal, or type ! here and paste.`
        : 'Could not copy to the clipboard',
    )
  } else {
    await openUrl($, help.url)
  }
}

function clipLabel(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/** Each step's helps in order: one press copies then opens, for example. */
async function useStep($: EngineInterface, item: Item, step: Help[], press: UiPressArgument) {
  for (const help of step) await useHelp($, item, help, press)
}

function baseName(path: string): string {
  return path.replace(/\/+$/, '').split('/').pop() ?? path
}

function helpLabel(help: Help): string {
  const label =
    help.kind === 'open'
      ? `Open ${baseName(help.path)}`
      : help.kind === 'copy'
        ? `Copy ${help.name ?? 'snippet'}`
        : help.kind === 'run'
          ? `Run ${help.name ?? help.command}`
          : help.kind === 'terminal'
            ? `Copy ${help.name ?? help.command}`
            : `Open ${help.name ?? new URL(help.url).host}`

  return clipLabel(label, 32)
}

/**
 * The item's helps as buttons. A snippet to copy and a file to open become one
 * step, "Copy env line and open .env.local", since the snippet goes in that file.
 */
function steps(helps: Help[]): { label: string; step: Help[] }[] {
  const copy = helps.find(h => h.kind === 'copy')
  const open = helps.find(h => h.kind === 'open')
  if (!copy || !open || copy.kind !== 'copy' || open.kind !== 'open')
    return helps.map(h => ({ label: helpLabel(h), step: [h] }))

  return helps
    .filter(h => h !== copy)
    .map(h =>
      h === open
        ? { label: clipLabel(`Copy ${copy.name ?? 'snippet'} and open ${baseName(open.path)}`, 48), step: [copy, open] }
        : { label: helpLabel(h), step: [h] },
    )
}

async function recordNote($: EngineInterface, input: Record<string, unknown>): Promise<string> {
  const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')
  const title = text(input.title, 120)
  const detail = text(input.detail, 600)
  if (title === '' || detail === '') return 'Not recorded: a note needs a title and a detail.'
  const at = await $.clock.now()
  const path = text(input.path, 300)
  const note = {
    kind: input.kind === 'opportunity' ? ('opportunity' as const) : ('issue' as const),
    title,
    detail,
    path: path || null,
    at,
  }
  let isAdded = false
  await commitLedger($, l => {
    const r = addNote(l, note)
    isAdded = r.isAdded
    return r.ledger
  })

  return isAdded ? 'Noted. The user sees it in the Notes tab of /inbox.' : 'Already noted.'
}

async function recordClose($: EngineInterface, input: Record<string, unknown>): Promise<string> {
  const text = (key: string) => (typeof input[key] === 'string' ? (input[key] as string).trim().slice(0, 80) : '')
  const id = text('id').replace(/^\[|\]$/g, '')
  const answer = text('answer')
  const reason = text('reason')
  if (id === '' || (answer === '' && reason === ''))
    return "Not closed: give the id, and the user's answer or a reason."
  const now = await $.clock.now()
  let closed: 'item' | 'note' | null = null
  await commitLedger($, l => {
    const r = closeByClaude(l, id, answer ? { answer } : { reason }, now)
    closed = r.closed
    return r.ledger
  })
  if (closed === 'item') return `Closed ${id}. The user sees it in /inbox under Closed.`
  if (closed === 'note') return `Closed note ${id}.`

  return `Not closed: no open item or note has the id ${id}. The open ones are listed beside the user's latest message.`
}

/** Opens the free-text field under a row and gives it the keyboard. */
async function startTyping($: EngineInterface, id: string) {
  await update($, TYPING, () => id)
  await $.ui.focus({ requestId: PANE, key: `type-${id}` }).catch(() => undefined)
}

/**
 * Sends the person's own words about an item as their message. A question
 * closes with those words as its answer, as an option press does. A task
 * stays open, since Claude closes it once the message settles it.
 */
async function sendTypedForItem($: EngineInterface, item: Item, text: string) {
  await update($, TYPING, () => null)
  const words = text.trim()
  if (!words) return
  if (item.kind === 'do') await send($, `Re the task you left for me, "${item.ask}": ${words}`)
  else await sendAnswer($, item, words)
}

/** Sends the person's own words about a note, which leaves the Notes tab as Address does. */
async function sendTypedForNote($: EngineInterface, note: Note, text: string) {
  await update($, TYPING, () => null)
  const words = text.trim()
  if (!words) return
  await removeNote($, note.id)
  const body = [`${noteKindLabel(note)}: ${note.title}`, note.detail, ...(note.path ? [`File: ${note.path}`] : [])]
  await send($, [`About this note you recorded:`, ...body, '', words].join('\n'))
}

async function removeNote($: EngineInterface, id: string) {
  await commitLedger($, l => ({ ...l, notes: l.notes.filter(n => n.id !== id) }))
}

/** Sends the note back to Claude, to fix it or to talk it through first. */
async function actOnNote($: EngineInterface, note: Note, how: 'address' | 'discuss') {
  await removeNote($, note.id)
  const opening =
    how === 'address'
      ? 'Please address this note you recorded:'
      : "Let's talk through this note you recorded before changing anything:"
  const body = [`${noteKindLabel(note)}: ${note.title}`, note.detail, ...(note.path ? [`File: ${note.path}`] : [])]
  await send($, [opening, ...body].join('\n'))
}

async function showTab($: EngineInterface, tab: Tab) {
  await update($, TAB, () => tab)
  await $.ui.scroll({ in: PANE, to: 'start' }).catch(() => undefined)
  if (tab === 'prs') void fetchPrs($, true)
}

function isCollapsed(collapsed: Collapsed, section: Section): boolean {
  return collapsed[section] ?? COLLAPSED_BY_DEFAULT[section]
}

async function toggleSection($: EngineInterface, section: Section) {
  const collapsed = await update($, COLLAPSED, c => ({ ...c, [section]: !isCollapsed(c, section) }))
  await $.store.set('collapsed', collapsed)
}

/**
 * Selects a row and scrolls the pane the least that shows it whole. The row's
 * scroll target is drawn only once the row redraws expanded, and the engine
 * refuses a key it has not drawn, so the scroll retries for a few frames.
 * Measured before the redraw, the row's end would land out of view.
 */
async function select($: EngineInterface, tab: Tab, id: string, index: number) {
  await update($, SELECTION, s => ({ ...s, [tab]: { id, index } }))
  await update($, TYPING, t => (t === id ? t : null))
  for (let tries = 0; tries < 10; tries++) {
    const result = await $.ui
      .scroll({ in: PANE, to: { key: `view-${id}` }, block: 'nearest' })
      .catch((): UiScrollResult => ({}))
    if (result.deny === undefined) return
    await $.clock.sleep(30)
  }
}

/**
 * The selected row's position: the cursor's row while it exists, else the row
 * now at its old position, so closing an item selects the one after it.
 */
function selectedIndex(ids: string[], cursor: Cursor): number {
  if (ids.length === 0) return -1
  const at = cursor.id === null ? -1 : ids.indexOf(cursor.id)

  return at >= 0 ? at : Math.min(cursor.index, ids.length - 1)
}

async function isPaneShown($: EngineInterface) {
  return (await $.ui.panes().catch(() => [])).some(p => p.id === PANE && p.isShown)
}

/** The PRs tab is on screen, so the current branch's PR is worth looking up. */
async function isPrsTabShown($: EngineInterface) {
  return (await read($, TAB)) === 'prs' && (await isPaneShown($))
}

/** What the person has on screen besides the conversation, for the ledger model. */
async function screen($: EngineInterface) {
  const tab = await read($, TAB)

  return screenText(await isPaneShown($), TABS.find(t => t.id === tab)?.label ?? tab)
}

/** Closes the open tasks whose exact command the person ran in shell mode. */
async function closeTasksRunBy($: EngineInterface, command: string) {
  const ran = tasksRunBy(await readLedger($), command)
  if (ran.length === 0) return
  const now = await $.clock.now()
  await commitLedger($, l => ran.reduce((after, item) => closeItem(after, item.id, 'you ran it', now), l))
}

async function gh($: EngineInterface, args: string[]) {
  return $.process.run(['gh', ...args], { cwd: root, timeoutMs: 20_000 })
}

/** Remembers PRs this session created or linked, newest last. */
async function linkPrs($: EngineInterface, refs: string[]) {
  const linked = (await readLedger($)).prs
  if (refs.every(r => linked.includes(r))) return
  await commitLedger($, l => ({ ...l, prs: [...l.prs.filter(r => !refs.includes(r)), ...refs].slice(-MAX_PRS) }))
  void fetchPrs($, await isPrsTabShown($))
}

/**
 * One PR's view and open threads. `target` is "owner/repo#123", or null for
 * the current branch's PR, whose ref is known only from gh's answer.
 */
async function fetchPr(
  $: EngineInterface,
  target: string | null,
  views: Record<string, PrView>,
): Promise<PrView | null> {
  const threadsOf = (ref: string) => {
    const r = parseRef(ref)
    return gh($, [
      'api',
      'graphql',
      '-f',
      `query=${THREADS_QUERY}`,
      '-F',
      `owner=${r.owner}`,
      '-F',
      `repo=${r.name}`,
      '-F',
      `number=${r.number}`,
    ])
  }
  const t = target ? parseRef(target) : null
  // A linked PR's two calls are independent; the branch PR's threads wait for its ref.
  const [view, early] = await Promise.all([
    gh($, ['pr', 'view', ...(t ? [t.number, '-R', t.repo] : []), '--json', VIEW_FIELDS]),
    target ? threadsOf(target) : null,
  ])
  const ref = target ?? (view.exitCode === 0 ? urlRef(view.stdout) : null)
  if (!ref) return null
  const previous = views[ref]
  const base = view.exitCode === 0 ? readView(ref, view.stdout) : null
  if (!base)
    return previous ? { ...previous, error: view.stderr.trim().split('\n')[0] || 'gh could not read the PR' } : null
  const threads = early ?? (await threadsOf(ref))

  return {
    ...base,
    threads: threads.exitCode === 0 ? readThreads(threads.stdout) : (previous?.threads ?? []),
    fetchedAt: await $.clock.now(),
    error: threads.exitCode === 0 ? null : 'could not read review threads',
  }
}

/** The ref of the PR whose `gh pr view --json` output this is. */
function urlRef(json: string): string | null {
  try {
    return prRefs(String((JSON.parse(json) as { url?: unknown }).url ?? ''))[0] ?? null
  } catch {
    return null
  }
}

/**
 * Refreshes every PR the tab shows: the linked ones and the current branch's.
 * Only `findsBranchPr` asks gh which PR the branch has; otherwise the last one
 * found is refreshed by its ref. One fetch runs at a time.
 */
async function fetchPrs($: EngineInterface, findsBranchPr: boolean) {
  const state = await read($, PR_VIEWS)
  if (state.isFetching) return
  await update($, PR_VIEWS, v => ({ ...v, isFetching: true }))
  try {
    const linked = (await readLedger($)).prs
    const branchTarget = findsBranchPr ? null : state.branchRef
    const [branch, ...rest] = await Promise.all([
      findsBranchPr || branchTarget ? fetchPr($, branchTarget, state.views) : null,
      ...linked.map(ref => fetchPr($, ref, state.views)),
    ])
    const views: Record<string, PrView> = {}
    for (const v of [...rest, branch]) if (v) views[v.ref] = v
    await update($, PR_VIEWS, () => ({
      views,
      branchRef: findsBranchPr ? (branch?.ref ?? null) : state.branchRef,
      isFetching: false,
    }))
  } catch {
    await update($, PR_VIEWS, v => ({ ...v, isFetching: false }))
  }
}

/** The timed refresh, which runs only while the person is around and there is a PR to show or the PRs tab is open. */
async function pollPrs($: EngineInterface) {
  const [presence, ledger, prs, findsBranchPr] = await Promise.all([
    read($, PRESENCE),
    readLedger($),
    read($, PR_VIEWS),
    isPrsTabShown($),
  ])
  if (presence.isAway || (!findsBranchPr && ledger.prs.length === 0 && prs.branchRef === null)) return
  await fetchPrs($, findsBranchPr)
}

async function openUrl($: EngineInterface, url: string) {
  const r = await $.process.run(['open', url])
  if (r.exitCode !== 0) $.ui.toast(`Could not open ${url}`)
}

async function unlinkPr($: EngineInterface, ref: string) {
  await commitLedger($, l => ({ ...l, prs: l.prs.filter(r => r !== ref) }))
  await update($, PR_VIEWS, v => {
    const views = { ...v.views }
    delete views[ref]
    return { ...v, views }
  })
}

/** The band's one-line PR alert: the first open PR that needs the person, or null. */
function prAttention(views: PrView[]): string | null {
  for (const pr of views) {
    if (pr.state !== 'OPEN') continue
    const open = waitingThreads(pr).length
    if (checkCounts(pr).fail > 0) return `PR #${pr.number} CI failing`
    if (pr.reviewDecision === 'CHANGES_REQUESTED') return `PR #${pr.number} changes requested`
    if (open > 0) return `PR #${pr.number} ${open} ${open === 1 ? 'thread' : 'threads'} waiting on you`
  }

  return null
}

type Action = {
  key: string
  label: string
  variant?: 'primary'
  dimColor?: boolean
  onPress: (press: UiPressArgument) => void
}

/** One-press answers: the options the agent offered, or a short recommendation. */
function answers(item: Item): string[] {
  if (item.options.length > 0) return item.options
  return item.rec && item.rec.length <= 32 ? [item.rec] : []
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
}

/**
 * Which answer the recommendation names, if any: the answer whose words all
 * appear in it, the longest when several do. "Symlink into a PATH folder"
 * names "Symlink into PATH".
 */
function recommendedIndex(all: string[], rec: string | null): number {
  if (!rec) return -1
  const named = new Set(words(rec))
  let best = -1
  let bestLength = 0
  all.forEach((answer, n) => {
    const w = words(answer)
    if (w.length > bestLength && w.every(x => named.has(x))) {
      best = n
      bestLength = w.length
    }
  })

  return best
}

function answerActions($: EngineInterface, item: Item): Action[] {
  const all = answers(item)
  const recommended = recommendedIndex(all, item.rec)

  return all.map((answer, n) => ({
    key: `answer-${item.id}-${n}`,
    label: n === recommended ? `${clipLabel(answer, 32)} (recommended)` : clipLabel(answer, 32),
    ...(n === recommended ? { variant: 'primary' as const } : {}),
    onPress: () => void sendAnswer($, item, answer),
  }))
}

function helpActions($: EngineInterface, item: Item): Action[] {
  return steps(item.helps).map(({ label, step }, n) => ({
    key: `help-${item.id}-${n}`,
    label,
    onPress: (press: UiPressArgument) => void useStep($, item, step, press),
  }))
}

function doneAction($: EngineInterface, item: Item): Action {
  return { key: `done-${item.id}`, label: 'Done', onPress: () => void close($, item.id, 'done') }
}

/** A pane action with the key that presses it while the pane has focus. */
type KeyAction = Action & { hotkey: string }

/**
 * The selected item's actions. `keys` finish it: answers and helps on digits,
 * as a survey numbers them, and Done for a task. `more` are the other ways to
 * respond: your own words, Explain, and Dismiss for a question.
 */
function itemKeys($: EngineInterface, item: Item): { keys: KeyAction[]; more: KeyAction[] } {
  const numbered = [...(item.kind === 'do' ? [] : answerActions($, item)), ...helpActions($, item)]
    .slice(0, 9)
    .map((a, n) => ({ ...a, hotkey: String(n + 1) }))
  const explainKey = { key: `explain-${item.id}`, label: 'Explain', hotkey: 'e', onPress: () => void explain($, item) }
  const typeKey = {
    key: `typekey-${item.id}`,
    label: item.kind === 'do' ? 'Type a reply' : 'Type an answer',
    hotkey: 't',
    onPress: () => void startTyping($, item.id),
  }
  if (item.kind === 'do')
    return { keys: [...numbered, { ...doneAction($, item), hotkey: 'd' }], more: [typeKey, explainKey] }

  return {
    keys: numbered,
    more: [
      typeKey,
      explainKey,
      { key: `dismiss-${item.id}`, label: 'Dismiss', hotkey: 'x', onPress: () => void close($, item.id, 'dismissed') },
    ],
  }
}

/** "dev server: http://localhost:5173" → its name and its URL or port. */
function splitRunning(run: string): { name: string; url: string } {
  const at = run.search(/(https?:\/\/|\bport\b|:\d{2,5}\b)/i)
  if (at <= 0) return { name: '', url: run }

  return { name: run.slice(0, at).replace(/[\s:–-]+$/, ''), url: run.slice(at).trim() }
}

/** Link refuses its whole tree unless href is https or http://localhost. */
function isLinkable(url: string): boolean {
  return /^(https:\/\/|http:\/\/localhost(:\d+)?(\/|$))[!-~]*$/.test(url) && !url.includes('@')
}

function decisionText(d: Decided): string {
  return `${d.ask} → ${d.outcome}`
}

/** An item that closed without the person deciding it: dismissed, or overtaken by the work. */
function isLapsed(d: Decided): boolean {
  return (
    d.outcome === 'dismissed' ||
    d.outcome.startsWith(CLOSED_BY_CLAUDE) ||
    /^(no longer applies|replaced|superseded|moot)/i.test(d.outcome)
  )
}

/** The outcome as the pane shows it: "Dismissed", "Yes, renamed". */
function outcomeText(d: Decided): string {
  return d.outcome.charAt(0).toUpperCase() + d.outcome.slice(1)
}

function noteKindLabel(note: Note): string {
  return note.kind === 'issue' ? 'Issue' : 'Opportunity'
}

/** Runs a git command that reads the working tree; null when it fails. Optional locks are off, so it never takes the index lock from a commit. */
async function runGit($: EngineInterface, args: string[], stdin?: string): Promise<string | null> {
  if (!top) return null
  const r = await $.process
    .run(['git', '--no-optional-locks', ...args], {
      cwd: top,
      timeoutMs: 15_000,
      ...(stdin === undefined ? {} : { stdin }),
    })
    .catch(() => null)

  return r && r.exitCode === 0 ? r.stdout : null
}

/** Each file's blob id, as a commit would store it. A folder, such as a submodule's, gets a mark of its own. */
async function hashFiles($: EngineInterface, paths: string[]): Promise<string[] | null> {
  const out = await runGit($, ['hash-object', '--stdin-paths'], `${paths.join('\n')}\n`)
  if (out !== null) return out.split('\n')
  // One path git cannot hash fails the whole call, so hash the files alone.
  const kinds = await Promise.all(
    paths.map(p =>
      $.fs.stat(`${top}/${p}`).then(
        s => s.kind,
        () => 'other' as const,
      ),
    ),
  )
  const files = paths.filter((_p, i) => kinds[i] === 'file')
  const hashed = files.length > 0 ? await runGit($, ['hash-object', '--stdin-paths'], `${files.join('\n')}\n`) : ''
  if (hashed === null) return null
  const ids = hashed.split('\n')

  return paths.map((_p, i) => (kinds[i] === 'file' ? (ids[files.indexOf(paths[i] ?? '')] ?? '') : `${kinds[i]}`))
}

/** The working tree's content, read without writing to the repo. */
async function readSnapshot($: EngineInterface): Promise<Snapshot | null> {
  const out = await runGit($, ['status', '--porcelain=v1', '-z', '-uall'])
  if (out === null) return null
  const head = (await runGit($, ['rev-parse', '--verify', '-q', 'HEAD']))?.trim() || null
  const changed = readChanged(out).slice(0, SNAPSHOT_MAX)
  const dirty: Snapshot['dirty'] = {}
  for (const c of changed) if (c.isDeleted) dirty[c.path] = ''
  const present = changed.filter(c => !c.isDeleted && !c.path.includes('\n')).map(c => c.path)
  if (present.length > 0) {
    const ids = await hashFiles($, present)
    if (!ids) return null
    present.forEach((path, i) => {
      dirty[path] = ids[i] ?? ''
    })
  }

  return { head, dirty }
}

/** Each path's object id in a commit, for the paths it has. */
async function lsTree($: EngineInterface, head: string, paths: string[]): Promise<Record<string, string> | null> {
  const ids: Record<string, string> = {}
  for (let i = 0; i < paths.length; i += 200) {
    const out = await runGit($, ['ls-tree', '-z', '--full-tree', head, '--', ...paths.slice(i, i + 200)])
    if (out === null) return null
    Object.assign(ids, readLsTree(out))
  }

  return ids
}

/** The paths whose content differs between two snapshots, or null when git could not tell. A commit only moves content into HEAD, so it changes nothing. */
async function contentChanges($: EngineInterface, a: Snapshot, b: Snapshot): Promise<string[] | null> {
  if (a.head !== b.head && !b.head) return null
  let committed: string[] = []
  if (a.head && b.head && a.head !== b.head) {
    const out = await runGit($, ['diff', '--name-only', '-z', '--no-renames', a.head, b.head])
    if (out === null) return null
    committed = out.split('\0').filter(Boolean)
  }
  const paths = candidates(a, b, committed)
  if (paths.length === 0) return []
  const before = a.head ? await lsTree($, a.head, paths) : {}
  const after = b.head === a.head ? before : b.head ? await lsTree($, b.head, paths) : {}
  if (!before || !after) return null

  return changedPaths(a, b, paths, before, after)
}

/**
 * Reads the working tree again. When its content differs from the last
 * reading, now becomes when it changed, so checks that ran earlier read as
 * before the last edit. Readings run one at a time.
 */
function refreshTree($: EngineInterface): Promise<void> {
  refreshing = refreshing
    .then(async () => {
      const snapshot = await readSnapshot($)
      if (!snapshot) return
      const before = (await read($, CHECKS)).snapshot
      if (before && sameSnapshot(before, snapshot)) return
      // A path list git could not read counts as a change to code.
      const changes = before ? await contentChanges($, before, snapshot) : []
      const now = await $.clock.now()
      await update($, CHECKS, c => ({
        ...c,
        snapshot,
        changedAt: changes === null || changes.length > 0 ? now : c.changedAt,
        codeChangedAt: changes === null || changes.some(p => !/\.md$/i.test(p)) ? now : c.codeChangedAt,
      }))
    })
    .catch(() => undefined)

  return refreshing
}

/** Records how each check a Bash command ran ended. */
async function recordChecks($: EngineInterface, command: string, output: string, isError: boolean) {
  const calls = checksIn(command)
  if (calls.length === 0) return
  const results = readResults(command, calls, output, isError)
  // Edits made before the check count as before it.
  await refreshTree($)
  const ranAt = await $.clock.now()
  await update($, CHECKS, c => ({
    ...c,
    results: results.reduce(
      (all, r) =>
        recordCheck(all, { name: r.call.name, kind: r.call.kind, result: r.result, summary: r.summary, ranAt }),
      c.results,
    ),
  }))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    isOn = e.isInteractive
    if (!isOn) return r
    sessionId = await $.session.id()
    root = await $.session.root()
    isSaved = false
    const git = await $.process
      .run(['git', 'rev-parse', '--show-toplevel'], { cwd: root, timeoutMs: 5000 })
      .catch(() => null)
    top = git?.exitCode === 0 ? git.stdout.trim() || null : null

    await $.command.register({
      name: 'inbox',
      description: 'Show where this session stands and what is waiting on you',
    })
    await $.tool.register({ name: 'note', description: NOTE_DESCRIPTION, inputSchema: NOTE_SCHEMA })
    await $.tool.register({ name: 'close', description: CLOSE_DESCRIPTION, inputSchema: CLOSE_SCHEMA })
    // A reload stops any update the previous load had running, and state outlives
    // it, so an update in flight at load was cut off: record it as failed.
    const presence = await update($, PRESENCE, p =>
      p.isUpdating ? { ...p, isUpdating: false, error: 'an update was cut off' } : p,
    )
    const theme = (await $.config.list().catch(() => [])).find(row => row.key === 'theme')?.value
    await update($, IS_DARK_THEME, () => theme === 'dark')
    // Earlier versions stored the folded sections as a list.
    const stored = (await $.store.get('collapsed')) as Collapsed | Section[] | undefined
    if (stored)
      await update($, COLLAPSED, () =>
        Array.isArray(stored) ? Object.fromEntries(stored.map(s => [s, true])) : stored,
      )
    const now = await $.clock.now()
    const current = await read($, LEDGER)
    const saved = (await $.store.get(`s:${sessionId}`)) as { savedAt: number; ledger: StoredLedger } | undefined
    if (current.turn === 0 && !current.card) {
      if (saved) {
        // A resumed session: bring its card back and show it as a return.
        await update($, LEDGER, () => normalizeLedger(saved.ledger))
        await update($, PRESENCE, p => ({ ...p, lastActiveAt: saved.savedAt, isAway: true }))
      } else {
        const prev = (await $.store.get(`p:${root}`)) as
          (Omit<Previous, 'isBroughtIn' | 'ledger'> & { ledger: StoredLedger }) | undefined
        if (prev?.ledger.card && now - prev.savedAt < PREVIOUS_MAX_AGE_MS) {
          await update($, PREVIOUS, () => ({ ...prev, ledger: normalizeLedger(prev.ledger), isBroughtIn: false }))
        }
      }
    }
    $.clock.every(60_000, () => {
      void tick($)
    })
    $.clock.every(PR_POLL_MS, () => {
      void pollPrs($)
    })
    // Catch up now after a failed update, or when the ledger is empty in a
    // conversation that already has turns: the mod loaded mid-session, or its saved state was lost.
    const loaded = await readLedger($)
    const isEmpty = !loaded.card && loaded.items.length === 0
    if (presence.error !== null || (isEmpty && (await $.session.turns().catch(() => 0)) > 0)) queueUpdate($, null)
    await publishStatus($)
    // A resumed session's linked PRs; the branch's PR waits for the PRs tab.
    if (loaded.prs.length > 0) void fetchPrs($, false)

    return r
  })

  on('session.end', async ($, e, next) => {
    // The pane outlives the session, so its sidebar line goes with it.
    if (isOn) {
      await update($, STOP, () => null)
      await update($, DIALOGS, () => [])
      await update($, CHECKS, () => NO_CHECKS)
      await update($, SETTLED, () => [])
      await update($, IS_DEMO, () => false)
      await publishStatus($, true)
    }
    if (isOn && e.reason === 'clear') {
      await update($, LEDGER, () => EMPTY)
      await update($, PREVIOUS, () => null)
      await update($, PRESENCE, p => ({ ...p, isAway: false, error: null }))
      activity = []
      person = null
      press = null
      shellCommand = null
      toldInbox = null
      toldDecided = new Set()
      contextFor.clear()
    }

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (!isOn) return next(e)
    const origin = e.origin
    // send() already recorded this mod's own prompts.
    if (origin.kind === 'plugin' && origin.name === 'session-inbox') return next(e)
    // The person's own words: typed, or sent as theirs by another plugin.
    const isPersonsWords =
      origin.kind === 'composer' || origin.kind === 'bridge' || (origin.kind === 'plugin' && origin.asUser === true)
    if (!isPersonsWords) {
      if (!e.turnId) trigger = origin.kind

      return next(e)
    }

    const notes = await notePrompt($, e.text, null)

    return notes.length === 0 ? next(e) : next({ ...e, context: [...(e.context ?? []), ...notes] })
  })

  on('turn.start', async ($, e, next) => {
    isTurnRunning = true
    // A turn that starts means the session runs again.
    if (isOn) await setStop($, null)

    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const r = await next(e)
    if (!isOn) return r

    return {
      ...r,
      sections: [...r.sections, { id: 'session-inbox:guidance', text: NOTE_GUIDANCE, scope: 'session' as const }],
    }
  })

  // The note tool is listed up front, needs no permission prompt, and is served here.
  on('tool.describe', { tool: NOTE_TOOL }, async ($, e, next) => ({ ...(await next(e)), isDeferred: false }))
  on('tool.check', { tool: NOTE_TOOL }, () => ({ decision: 'allow' }))
  on('tool.call', { tool: NOTE_TOOL }, async ($, e) => ({
    result: await recordNote($, e as unknown as Record<string, unknown>),
  }))
  on('tool.describe', { tool: CLOSE_TOOL }, async ($, e, next) => ({ ...(await next(e)), isDeferred: false }))
  on('tool.check', { tool: CLOSE_TOOL }, () => ({ decision: 'allow' }))

  on('tool.call', async ($, e, next) => {
    if (!isOn) return next(e)
    const { tool: _tool, tool_use_id: _id, agentId: _agent, ...input } = e as unknown as Record<string, unknown>
    // The close tool is served here: a matcher naming a tool registered at run time does not type-check.
    if (String(e.tool) === CLOSE_TOOL) return { result: await recordClose($, input) }
    const key = callKey(String(e.tool), input)
    const run = () => clearingDialog($, key, () => next(e))
    // A subagent's call can raise a permission prompt too, which the person answers.
    if (e.agentId) return run()
    if (e.tool === 'Bash') {
      noteActivity(`${e.run_in_background ? 'started in background' : 'ran'}: ${e.command.slice(0, 140)}`)
      const ran = await run()
      const output = (ran.result && typeof ran.result === 'object' ? ran.result : {}) as {
        interrupted?: unknown
        backgroundTaskId?: unknown
      }
      // A command that was cut off or moved to the background has not finished its checks.
      if (!e.run_in_background && !output.interrupted && !output.backgroundTaskId && typeof ran.deny !== 'string') {
        await recordChecks($, e.command, ran.text ?? '', ran.isError === true)
      }
      if (activity.length < 40)
        for (const url of new Set(ran.text?.match(LOCAL_URL) ?? [])) noteActivity(`URL in output: ${url}`)
      // A PR this session opened; other commands print PR links that are not this session's.
      if (/\bgh\s+pr\s+create\b/.test(e.command)) void linkPrs($, prRefs(ran.text ?? ''))

      return ran
    }
    if (e.tool === 'AskUserQuestion') {
      const questions = (Array.isArray(input.questions) ? input.questions : []) as { question?: unknown }[]
      const question = typeof questions[0]?.question === 'string' ? questions[0].question : 'A question'
      await openDialog($, { kind: 'question', text: question, key })
      // The answers come back in the tool result, never in a typed prompt, so
      // the ledger model only learns them from here.
      const ran = await run()
      const result = (ran.result && typeof ran.result === 'object' ? ran.result : {}) as { afkTimeoutMs?: unknown }
      // A dialog that resolved on its own while the person was away holds no answer of theirs.
      const how =
        typeof result.afkTimeoutMs === 'number'
          ? 'it timed out while the user was away, so the user did not answer; it went on with'
          : 'answer'
      noteActivity(`asked the user in a dialog; ${how}: ${(ran.text ?? '').slice(0, 400)}`)

      return ran
    }
    if (e.tool === 'Edit' || e.tool === 'Write') noteActivity(`edited ${e.file_path}`)
    else if (e.tool === 'Skill') noteActivity(`used skill ${e.skill}`)
    else if (e.tool === 'Agent') noteActivity(`started agent: ${e.description}`)
    else if (String(e.tool).startsWith('mcp__')) noteActivity(`called ${String(e.tool).slice(5)}`)

    return run()
  })

  // A question dialog opens from its own tool call, which also raises a permission request.
  on('classic.PermissionRequest', async ($, e, next) => {
    if (isOn && e.tool_name !== 'AskUserQuestion') {
      const input = (e.tool_input ?? {}) as Record<string, unknown>
      await openDialog($, {
        kind: 'permission',
        text: permissionText(e.tool_name, input),
        key: callKey(e.tool_name, input),
      })
    }

    return next(e)
  })

  on('classic.StopFailure', async ($, e, next) => {
    const r = await next(e)
    if (!isOn || e.agent_id) return r
    const message = e.last_assistant_message ?? ''
    await setStop($, {
      kind: stopKindOf(String(e.error), message),
      detail: String(e.error),
      resets: resetTime(message),
      at: await $.clock.now(),
    })

    return r
  })

  // A reply that claims a check passes when its latest run failed, or ran
  // before the last edit, sends Claude back once to run it or say so.
  on('classic.Stop', async ($, e, next) => {
    const r = await next(e)
    if (!isOn || e.agent_id || e.stop_hook_active || r.block) return r
    const reply = e.last_assistant_message ?? ''
    if (!reply.trim() || (await read($, CHECKS)).results.length === 0) return r
    await refreshTree($)
    const claim = contradictedClaim(reply, await read($, CHECKS))

    return claim ? { ...r, block: claimMessage(claim) } : r
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId) return r
    isTurnRunning = false
    // No dialog outlives the turn that raised it.
    await closeDialogs($, null)
    if (!isOn || e.reason !== 'answer' || e.answer.trim() === '') return r

    if ((await read($, CHECKS)).results.length > 0) await refreshTree($)
    const checks = await read($, CHECKS)
    const ex: Exchange = {
      person,
      trigger,
      activity,
      reply: e.answer,
      turn: (await read($, LEDGER)).turn,
      press,
      screen: await screen($),
      checks: checks.results.map(c => checkLine(c, checks)),
    }
    press = null
    person = null
    trigger = null
    activity = []
    const now = await $.clock.now()
    await update($, PRESENCE, p => ({ ...p, lastActiveAt: now }))
    queueUpdate($, ex)
    await linkPrs($, prRefs(e.answer))

    return r
  })

  on('prompt.context', async ($, e, next) => {
    const r = await next(e)
    if (!isOn) return r
    const text = carryText(
      await readLedger($),
      'session-inbox: where this session stands, summarized by a plugin after each reply. It may be slightly out of date.',
      true,
    )

    return text ? { ...r, blocks: [...r.blocks, { name: 'session_inbox', text }] } : r
  })

  // A prompt this mod sent: its context goes in just before it, wherever the engine runs it.
  on('session.append', { door: ['prompt', 'delivery'] }, async ($, e, next) => {
    const isMine = e.origin.kind === 'plugin' && 'name' in e.origin && e.origin.name === 'session-inbox'
    if (!isOn || e.agentId || !isMine) return next(e)
    const text = e.message.content.map(b => (b.type === 'text' ? b.text : '')).join('')
    const context = contextFor.get(text)
    contextFor.delete(text)
    if (context) await appendContext($, context)

    return next(e)
  })

  // The person's own `!` and slash commands reach no prompt.submit hook, only these rows.
  // The matcher keeps every other row from waking the hooks module.
  on('session.append', { door: 'command' }, async ($, e, next) => {
    const r = await next(e)
    if (!isOn || e.agentId) return r
    const row = readCommandRow(e.message.content.map(b => (b.type === 'text' ? b.text : '')).join(''))
    if (row?.kind === 'shell') {
      shellCommand = row.command
      notePerson(`$ ${row.command}`)
    } else if (row?.kind === 'output') {
      const output = [row.stdout, row.stderr].filter(Boolean).join('\n')
      if (output) notePerson(`output: ${clipLabel(output, 600)}`)
      // The row has no exit code, so only a run with nothing on stderr closes a
      // task here. The ledger model judges the rest from the output.
      if (shellCommand && !row.stderr) await closeTasksRunBy($, shellCommand)
      shellCommand = null
    } else if (row?.kind === 'slash' && !QUIET_COMMANDS.has(row.name)) {
      if (row.name === 'login' && (await read($, STOP))?.kind === 'sign-in') await setStop($, null)
      notePerson(`/${row.name} ${row.args}`.trim())
    }

    return r
  })

  on('command.run', { command: 'inbox' }, async ($, e) => {
    const isDemo = e.args.trim() === 'demo' ? await update($, IS_DEMO, d => !d) : await read($, IS_DEMO)
    const opened = await $.ui.open({ id: PANE, title: 'Session inbox', focus: true, closeOnEscape: true })
    if (opened.isPlaced && !isDemo && (await read($, TAB)) === 'prs') void fetchPrs($, true)

    return {
      text: isDemo
        ? 'Showing sample entries in the session inbox. Run /inbox demo again to go back.'
        : 'Opened the session inbox.',
    }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!isOn || e.props.hasSurvey) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const [realLedger, presence, prev, realPrs, realStop, realChecks, realSettled, now, isDemo] = await Promise.all([
      readLedger($),
      read($, PRESENCE),
      read($, PREVIOUS),
      read($, PR_VIEWS),
      read($, STOP),
      read($, CHECKS),
      read($, SETTLED),
      $.clock.now(),
      read($, IS_DEMO),
    ])
    const demo = isDemo ? demoView(now) : null
    const ledger = demo?.ledger ?? realLedger
    const prs = demo?.prViews ?? realPrs
    const stop = demo ? demo.stop : realStop
    const checks = demo?.checks ?? realChecks
    const settled = demo?.settled ?? realSettled
    const isWorking = e.props.isWorking

    // A stop is the one thing to act on, so it takes the band.
    if (stop) {
      return (
        <Text wrap="truncate-end">
          <Text color="error">! Stopped {ago(now - stop.at)}: </Text>
          {stopText(stop)}. <Text dimColor>{stopFix(stop)}</Text>
        </Text>
      )
    }

    if (prev && ledger.turn === 0) {
      const c = prev.ledger.card
      const waiting = prev.ledger.items.length

      return (
        <Box flexDirection="column">
          <Text bold>
            Last session in this folder <Text dimColor>· {ago(now - prev.savedAt)}</Text>
          </Text>
          {c && <Text wrap="truncate-end"> Goal {c.goal}</Text>}
          {c?.now && (
            <Text wrap="truncate-end" dimColor>
              {' '}
              Now {c.now}
            </Text>
          )}
          {waiting > 0 && (
            <Text wrap="truncate-end" dimColor>
              {'  '}
              {waiting} {waiting === 1 ? 'item was' : 'items were'} waiting on you
            </Text>
          )}
          <Box flexDirection="row" gap={1}>
            {prev.isBroughtIn ? (
              <Text dimColor> Added to your next message.</Text>
            ) : (
              <Button
                key="bring"
                label="Continue from it"
                variant="primary"
                onPress={() => update($, PREVIOUS, p => (p ? { ...p, isBroughtIn: true } : p))}
              />
            )}
            <Button key="hide-prev" label="Hide" onPress={() => update($, PREVIOUS, () => null)} />
          </Box>
        </Box>
      )
    }

    const card = ledger.card
    const justSettled = settled.filter(s => now - s.at < SETTLED_MS)
    if (!card && ledger.items.length === 0 && ledger.notes.length === 0 && justSettled.length === 0) return next(e)
    const settledHint = justSettled.map(s => (
      <Text color={DONE}>
        {' · ✓ '}
        {s.ask} → {outcomeText(s)}
      </Text>
    ))

    const goal = card?.goal || 'This session'
    const waiting = ledger.items.length
    const noteCount = ledger.notes.length
    const prAlert = prAttention(Object.values(prs.views))
    // The items themselves live in /inbox; the band only says how many wait.
    const hints = [
      ...settledHint,
      waiting > 0 ? <Text color={WAITING}> · {waiting} waiting on you in /inbox</Text> : null,
      noteCount > 0 ? (
        <Text color={NOTES}> · {noteCount === 1 ? '1 note' : `${noteCount} notes`} in /inbox</Text>
      ) : null,
      prAlert ? <Text color={PRS}> · {prAlert}</Text> : null,
    ]

    if (isWorking) {
      return (
        <Text wrap="truncate-end">
          <Text color={ACCENT}>◆ </Text>
          <Text dimColor>{goal}</Text>
          {settledHint}
          {waiting > 0 ? <Text color={WAITING}> · {waiting} waiting on you</Text> : null}
        </Text>
      )
    }

    const openRows = (card?.running ?? []).slice(0, 3).map(run => (
      <Text wrap="truncate-end">
        <Text color={DONE}> ● </Text>
        <Text dimColor>{run}</Text>
      </Text>
    ))

    // A failed check gets a line of its own, so a narrow band cannot cut it off.
    const failedRows = checks.results
      .filter(c => c.result === 'fail')
      .map(c => (
        <Text wrap="truncate-end" color="error">
          {'  '}
          {checkLine(c, checks)}
        </Text>
      ))

    if (presence.isAway && card) {
      const rows = [
        <Text wrap="truncate-end">
          <Text color={ACCENT}>◆ </Text>
          <Text bold>{card.goal}</Text>
          <Text dimColor> · last active {ago(now - presence.lastActiveAt)}</Text>
          {hints}
        </Text>,
        ...(card.done.length > 0
          ? [
              <Text wrap="truncate-end">
                <Text color={DONE}> ✓ </Text>
                <Text dimColor>{card.done.slice(-3).join(' · ')}</Text>
              </Text>,
            ]
          : []),
        <Text wrap="truncate-end">
          <Text dimColor> → </Text>
          {card.now}
        </Text>,
        ...(checks.results.length > 0
          ? [
              <Text wrap="truncate-end" dimColor>
                {'  '}
                {checks.results.map(c => checkLine(c, checks)).join(' · ')}
              </Text>,
            ]
          : []),
        ...openRows,
        ...(ledger.decided.length > 0
          ? [
              <Text wrap="truncate-end" dimColor>
                {'  Closed: '}
                {ledger.decided.slice(-2).map(decisionText).join(' · ')}
              </Text>,
            ]
          : []),
      ]

      return <Box flexDirection="column">{rows.slice(0, Math.max(1, e.props.maxRows))}</Box>
    }

    return (
      <Box flexDirection="column">
        <Text wrap="truncate-end">
          <Text color={ACCENT}>◆ </Text>
          <Text dimColor>
            {goal}
            {card?.now ? ` · ${card.now}` : ''}
          </Text>
          {hints}
        </Text>
        {failedRows}
        {openRows}
      </Box>
    )
  })

  on('config.set', { key: 'theme' }, async ($, e, next) => {
    const r = await next(e)
    const theme = (await $.config.list().catch(() => [])).find(row => row.key === 'theme')?.value
    await update($, IS_DARK_THEME, () => theme === 'dark')

    return r
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const elements = $.ui.resolve(e)
    const { Box, Button, Link, Markdown, Text } = elements
    // The mobile app draws no text field, so there the typed reply is not offered.
    const Input = 'Input' in elements ? elements.Input : null
    const [
      realLedger,
      presence,
      tab,
      realPrs,
      collapsed,
      selection,
      now,
      isDark,
      realStop,
      realChecks,
      typing,
      realSettled,
      isDemo,
    ] = await Promise.all([
      readLedger($),
      read($, PRESENCE),
      read($, TAB),
      read($, PR_VIEWS),
      read($, COLLAPSED),
      read($, SELECTION),
      $.clock.now(),
      read($, IS_DARK_THEME),
      read($, STOP),
      read($, CHECKS),
      read($, TYPING),
      read($, SETTLED),
      read($, IS_DEMO),
    ])
    const demo = isDemo ? demoView(now) : null
    const ledger = demo?.ledger ?? realLedger
    const prState = demo?.prViews ?? realPrs
    const stop = demo ? demo.stop : realStop
    const checks = demo?.checks ?? realChecks
    const settled = demo?.settled ?? realSettled
    // Sample entries can be selected and opened, but their actions send nothing.
    const act = (onPress: (press: UiPressArgument) => void) => (demo ? () => $.ui.toast(SAMPLE_PRESS) : onPress)
    const card = ledger.card
    const prViews = Object.values(prState.views)

    // One list row's content. Selected, a row shows its context line, its title
    // in full, its body and its keys; otherwise one line: `line`, or the title.
    type Row = {
      id: string
      handle: string
      meta?: JSX.Element
      title: string
      /** Dim text on the selected title's line, such as an age. */
      titleAfter?: string
      /** A line under the selected title. */
      subtitle?: JSX.Element
      /** Unselected, the row is one line: `before` dimmed, `text` as a button that selects the row, then `after`. */
      line?: { before?: string; text: string; after?: string; afterColor?: string }
      body?: JSX.Element | null
      keys: () => KeyAction[]
      /** Secondary actions, dimmed on a line under `keys`. */
      moreKeys?: () => KeyAction[]
      /** Where the person's own words go, for a row that takes them. */
      onType?: (text: string) => void
      typeHint?: string
    }
    // An item's group header says whether it is a question or a task, so the row
    // needs no context line. A recommendation that names an answer is marked on
    // that answer's key instead of in the body.
    const itemRow = (item: Item, handle: string): Row => {
      const rec = item.rec && item.kind !== 'do' && recommendedIndex(answers(item), item.rec) < 0 ? item.rec : null

      return {
        id: item.id,
        handle,
        title: item.ask,
        body: rec ? (
          <Text wrap="wrap">
            <Text dimColor>Recommended: </Text>
            <Text bold>{rec}</Text>
          </Text>
        ) : null,
        keys: () => itemKeys($, item).keys,
        moreKeys: () => itemKeys($, item).more,
        onType: (text: string) => void sendTypedForItem($, item, text),
        typeHint: item.kind === 'do' ? 'Your reply to Claude' : 'Your answer',
      }
    }
    const noteRow = (note: Note): Row => ({
      id: note.id,
      handle: '•',
      title: note.title,
      titleAfter: ` · ${ago(now - note.at)}`,
      subtitle: (
        <Text wrap="truncate-end">
          <Text color={NOTES}>{noteKindLabel(note)}</Text>
          {note.path ? <Text dimColor> · {baseName(note.path)}</Text> : null}
        </Text>
      ),
      line: { text: note.title, after: ` · ${ago(now - note.at)}` },
      body: <Text wrap="wrap">{note.detail}</Text>,
      onType: (text: string) => void sendTypedForNote($, note, text),
      typeHint: 'Your reply to Claude',
      keys: () => [
        {
          key: `address-${note.id}`,
          label: 'Address it',
          hotkey: 'a',
          onPress: () => void actOnNote($, note, 'address'),
        },
        { key: `discuss-${note.id}`, label: 'Discuss', hotkey: 'd', onPress: () => void actOnNote($, note, 'discuss') },
        { key: `typekey-${note.id}`, label: 'Type a reply', hotkey: 't', onPress: () => void startTyping($, note.id) },
        { key: `drop-${note.id}`, label: 'Dismiss', hotkey: 'x', onPress: () => void removeNote($, note.id) },
      ],
    })
    const checkRow = (pr: PrView, c: PrCheck): Row => ({
      id: `${pr.ref} check ${c.name}`,
      handle: '✗',
      meta: (
        <Text color="error" bold>
          Failing check
        </Text>
      ),
      title: c.name,
      line: { text: c.name, after: ' · failing check', afterColor: 'error' },
      keys: () => [
        { key: `fix-${pr.ref}-${c.name}`, label: 'Fix', hotkey: 'f', onPress: () => void send($, prompts.fix(pr, c)) },
        {
          key: `log-${pr.ref}-${c.name}`,
          label: 'Open log',
          hotkey: 'o',
          onPress: () => void openUrl($, c.url ?? pr.url),
        },
      ],
    })
    const threadRow = (pr: PrView, t: PrThread): Row => {
      const latest = t.reply ?? { author: t.author, body: t.body }

      return {
        id: `${pr.ref} thread ${t.id}`,
        handle: '◦',
        meta: (
          <Text wrap="truncate-end">
            <Text color={PRS} bold>
              Review thread
            </Text>
            <Text dimColor>
              {t.replies > 0 ? ` · ${t.replies + 1} comments` : ''}
              {t.isOutdated ? ' · outdated' : ''}
            </Text>
          </Text>
        ),
        title: threadWhere(t),
        line: { before: `${threadWhere(t, baseName(t.path))} `, text: latest.body.replace(/\s+/g, ' ') },
        body: (
          <Box flexDirection="column">
            {t.reply ? <Markdown dimColor text={`@${t.author}: ${clipLabel(t.body, 200)}`} /> : null}
            <Markdown text={`**@${latest.author}:** ${clipLabel(latest.body, 1200)}`} />
          </Box>
        ),
        keys: () => [
          {
            key: `address-${t.id}`,
            label: 'Address',
            hotkey: 'a',
            onPress: () => void send($, prompts.address(pr, [t])),
          },
          {
            key: `draft-${t.id}`,
            label: 'Draft reply',
            hotkey: 'r',
            onPress: () => void send($, prompts.draft(pr, t)),
          },
          {
            key: `discuss-${t.id}`,
            label: 'Discuss',
            hotkey: 'd',
            onPress: () => void send($, prompts.discuss(pr, t)),
          },
          {
            key: `open-${t.id}`,
            label: 'Open',
            hotkey: 'o',
            onPress: () => void openUrl($, t.reply?.url || t.url || pr.url),
          },
        ],
      }
    }

    // Each tab's rows in order: the cursor, the counts and the drawing all read these.
    const waitingGroups = WAITING_GROUPS.map(g => ({
      ...g,
      rows: listedItems(ledger.items, g.kind).map((item, n) => itemRow(item, g.kind === 'decide' ? `${n + 1})` : '•')),
    }))
    const prGroups = prViews.map(pr => ({
      pr,
      rows: [...failingChecks(pr).map(c => checkRow(pr, c)), ...waitingThreads(pr).map(t => threadRow(pr, t))],
    }))
    // A folded section's rows are out of view, so the selection skips them.
    const rows: Record<Tab, Row[]> = {
      waiting: waitingGroups.filter(g => !isCollapsed(collapsed, g.section)).flatMap(g => g.rows),
      notes: [...ledger.notes].reverse().map(noteRow),
      prs: prGroups.flatMap(g => g.rows),
    }
    const ids = rows[tab].map(r => r.id)
    const indexOf = new Map(ids.map((id, n) => [id, n]))
    const at = selectedIndex(ids, selection[tab])

    const keyRow = (keys: KeyAction[], dimmed: KeyAction[] = []) => (
      <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
        {keys.map(k => (
          <Button plain {...k} />
        ))}
        {dimmed.map(k => (
          <Button plain {...k} dimColor />
        ))}
      </Box>
    )
    // A selected row's secondary keys share its key row, dimmed, when they fit,
    // and otherwise take a line of their own rather than wrap mid-row. A plain
    // Button draws "key: label", and keyRow puts 2 columns between Buttons.
    const keysWidth = (keys: KeyAction[]) =>
      keys.reduce((w, k) => w + k.hotkey.length + 2 + k.label.length, 0) + 2 * Math.max(0, keys.length - 1)
    // A typed reply needs a text field, so it is left out where there is none.
    // In the demo, every other key only says that nothing was sent.
    const pressable = (keys: KeyAction[]) =>
      keys
        .filter(k => Input || !k.key.startsWith('typekey-'))
        .map(k => (k.key.startsWith('typekey-') ? k : { ...k, onPress: act(k.onPress) }))
    // A section's children hang from its title like a directory listing. A
    // child's row has a 1-column bar, 3 columns for the tree, 3 for its marker,
    // then its text. `branch` draws the tree: ├─ on the child's first line, or
    // └─ on the last child's, then │ below while siblings follow; `pass` is │
    // throughout, for a block between a title and its children. The lines sit
    // in an absolute Box that spans the row, however it wraps, and the row clips
    // the rest. The row clips, not this Box: once its row scrolled out of view,
    // Claude Code drew lines this Box clipped elsewhere in the pane (anthropics/claude-code#100030).
    const branch = (pos: TreePos, lead = 0) => (
      <Box position="absolute" top={0} bottom={0} left={1} width={2}>
        <Text color={MUTED_LINE}>
          {[
            ...Array<string>(lead).fill('│'),
            pos === 'last' ? '└─' : pos === 'mid' ? '├─' : '│',
            ...Array<string>(TREE_DEPTH).fill(pos === 'last' ? ' ' : '│'),
          ].join('\n')}
        </Text>
      </Box>
    )
    const treeRow = (
      pos: TreePos,
      marker: JSX.Element,
      content: JSX.Element,
      opts: { key?: string; age?: string; gapAfter?: boolean } = {},
    ) => (
      <Box key={opts.key} flexDirection="row" paddingBottom={opts.gapAfter ? 1 : 0} overflow="hidden">
        <Box width={4} flexShrink={0} />
        <Box width={3} flexShrink={0}>
          {marker}
        </Box>
        <Box flexDirection="column" flexShrink={1} flexGrow={1} paddingRight={opts.age ? 0 : 1}>
          {content}
        </Box>
        {opts.age ? (
          <Box flexShrink={0} marginLeft={2}>
            <Text dimColor>{opts.age}</Text>
          </Box>
        ) : null}
        {branch(pos)}
      </Box>
    )
    const childPos = (n: number, count: number): TreePos => (n === count - 1 ? 'last' : 'mid')
    // A list's rows with a divider between each two. It starts where the rows'
    // text starts and runs to the pane's edge; in a section, the tree's │ passes it.
    const divided = (rowEls: JSX.Element[], group: string, isTree: boolean) =>
      rowEls.flatMap((el, n) =>
        n === 0
          ? [el]
          : [
              isTree ? (
                <Box key={`divider-${group}-${n}`} flexDirection="row">
                  <Box width={1} flexShrink={0} />
                  <Box width={6} flexShrink={0}>
                    <Text color={MUTED_LINE}>│</Text>
                  </Box>
                  <Text color={isDark ? DARK_DIVIDER : MUTED_LINE}>
                    {'─'.repeat(Math.max(0, e.props.bodyColumns - 9))}
                  </Text>
                </Box>
              ) : (
                <Box key={`divider-${group}-${n}`} paddingLeft={5}>
                  <Text color={isDark ? DARK_DIVIDER : MUTED_LINE}>
                    {'─'.repeat(Math.max(0, e.props.bodyColumns - 7))}
                  </Text>
                </Box>
              ),
              el,
            ],
      )
    // The selected row gets a blue background, and reads top to bottom:
    // context line, title, body, keys, each set off by a blank line. The handle
    // is a Button, so a click selects the row.
    // A Button label does not wrap or truncate, so the clickable text is clipped
    // to what fits beside the handle and the row's other text.
    const unselectedLine = (row: Row, onPress: () => void, inset: number) => {
      const line = row.line ?? { text: row.title }
      const room = Math.max(
        12,
        e.props.bodyColumns - 3 - inset - (line.before?.length ?? 0) - (line.after?.length ?? 0),
      )

      return (
        <Box flexDirection="row">
          {line.before ? <Text dimColor>{line.before}</Text> : null}
          <Button plain key={`title-${row.id}`} label={clipLabel(line.text, room)} onPress={onPress} />
          {line.after ? (
            <Text wrap="truncate-end" color={line.afterColor} dimColor={!line.afterColor}>
              {line.after}
            </Text>
          ) : null}
        </Box>
      )
    }
    // `tree` places the row as a section's child; without it, as in Notes, the
    // handle sits in the 4 columns after the bar.
    const listRow = (row: Row, tree?: TreePos) => {
      const index = indexOf.get(row.id) ?? -1
      const isSelected = index === at
      const keys = isSelected ? pressable(row.keys()) : []
      const more = isSelected ? pressable(row.moreKeys?.() ?? []) : []

      return (
        <Box
          key={`row-${row.id}`}
          flexDirection="row"
          overflow="hidden"
          backgroundColor={isSelected ? (isDark ? DARK_SELECTION : SELECTION_BG) : undefined}
        >
          <Box width={1} flexShrink={0} />
          {tree ? <Box width={3} flexShrink={0} /> : null}
          <Box width={tree ? 3 : 4} flexShrink={0} paddingLeft={tree ? 0 : 2} paddingY={isSelected ? 1 : 0}>
            <Button
              plain
              key={`select-${row.id}`}
              label={row.handle}
              dimColor={!isSelected}
              onPress={() => void select($, tab, row.id, index)}
            />
          </Box>
          {isSelected ? (
            <Box flexDirection="column" flexShrink={1} flexGrow={1} paddingRight={1} paddingY={1}>
              {row.meta}
              <Text wrap="wrap">
                <Text bold>{row.title}</Text>
                {row.titleAfter ? <Text dimColor>{row.titleAfter}</Text> : null}
              </Text>
              {row.subtitle}
              {row.body ? <Box marginTop={1}>{row.body}</Box> : null}
              <Box flexDirection="column" marginTop={1}>
                {keys.length === 0
                  ? keyRow(more)
                  : keysWidth([...keys, ...more]) <= e.props.bodyColumns - 3 - (tree ? 7 : 5)
                    ? keyRow(keys, more)
                    : [keyRow(keys), keyRow([], more)]}
              </Box>
              {Input && row.onType && typing === row.id ? (
                <Box marginTop={1}>
                  <Input
                    key={`type-${row.id}`}
                    placeholder={row.typeHint}
                    submitLabel="send"
                    autoFocus
                    onSubmit={(value: string) => (demo ? $.ui.toast(SAMPLE_PRESS) : row.onType?.(value))}
                  />
                </Box>
              ) : null}
            </Box>
          ) : (
            <Box flexShrink={1} flexGrow={1} paddingRight={1}>
              {unselectedLine(row, () => void select($, tab, row.id, index), tree ? 7 : 5)}
            </Box>
          )}
          {tree ? branch(tree, isSelected ? 1 : 0) : null}
          {/* What select() scrolls into view. Drawn on the selected row alone, so the key exists
          only once that row has redrawn expanded. */}
          {isSelected ? <Box key={`view-${row.id}`} position="absolute" top={0} bottom={0} left={0} width={1} /> : null}
        </Box>
      )
    }
    const emptyLine = (text: string) => (
      <Box paddingLeft={1}>
        <Text dimColor wrap="wrap">
          {text}
        </Text>
      </Box>
    )

    const newest = prViews.reduce((t, v) => Math.max(t, v.fetchedAt), 0)
    const status =
      tab === 'prs' && prViews.length > 0
        ? prState.isFetching
          ? 'Refreshing PRs'
          : `PRs checked ${ago(now - newest)}`
        : presence.isUpdating
          ? 'Updating…'
          : card
            ? `Updated ${ago(now - card.updatedAt)}`
            : 'Not updated yet'

    // The tab bar is the pane's top panel, with when the inbox last updated at
    // its right end, or under the tabs when the pane is too narrow. The current
    // tab's chip is two rows high: half blocks in its color above and below its
    // label row, so the label sits in the middle.
    const tabs = (
      <Box
        backgroundColor={PANEL_BG}
        paddingX={1}
        flexDirection="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        columnGap={3}
      >
        <Box flexDirection="row" alignItems="center" columnGap={3}>
          {TABS.map(({ id, label, hotkey }) => {
            const count = id === 'waiting' ? ledger.items.length : rows[id].length
            const chip = ` ${label}${count > 0 ? ` ${count}` : ''} `

            return tab === id ? (
              <Box flexDirection="column">
                <Text color={TAB_COLORS[id]}>{'▄'.repeat(chip.length)}</Text>
                <Text backgroundColor={TAB_COLORS[id]} color="inverseText" bold>
                  {chip}
                </Text>
                <Text color={TAB_COLORS[id]}>{'▀'.repeat(chip.length)}</Text>
              </Box>
            ) : (
              <Box flexDirection="row">
                <Button
                  plain
                  key={`tab-${id}`}
                  hotkey={hotkey}
                  label={label}
                  dimColor
                  onPress={() => void showTab($, id)}
                />
                {count > 0 ? <Text color={TAB_COLORS[id]}> {count}</Text> : null}
              </Box>
            )
          })}
        </Box>
        <Box flexDirection="row" columnGap={2}>
          <Text dimColor>{status}</Text>
          {presence.error && !presence.isUpdating ? (
            <Text color="error">update failed, retries after the next reply</Text>
          ) : null}
        </Box>
      </Box>
    )

    // A section's title row: a caret, ▸ folded or ▾ open, the title, its count
    // muted after it, and a red ✗ while a check fails. A Button's label takes one
    // style, so each part is a Button of its own, and a last one pads the row to
    // its edge, so a click anywhere on the row folds or opens the section. While
    // the pointer is on the row, the keyed Box, every part inverts at full
    // strength, so the row lights as one bar.
    const sectionHeader = (section: Section, title: string, count: number, isFailing = false) => {
      const caret = isCollapsed(collapsed, section) ? '▸' : '▾'
      const toggle = () => void toggleSection($, section)
      const used = 1 + ` ${title}`.length + ` ${count}`.length + (isFailing ? 2 : 0)
      const pad = e.props.bodyColumns - 4 - used
      const lit = { dimColor: false, inverse: true }

      return (
        <Box key={`header-${section}`} flexDirection="row" paddingLeft={1}>
          <Button plain key={`toggle-${section}-caret`} label={caret} dimColor hover={lit} onPress={toggle} />
          <Button plain key={`toggle-${section}`} label={` ${title}`} hover={lit} onPress={toggle} />
          <Button plain key={`toggle-${section}-count`} label={` ${count}`} dimColor hover={lit} onPress={toggle} />
          {isFailing ? (
            <Text color="error" hover={{ inverse: true }}>
              {' ✗'}
            </Text>
          ) : null}
          {pad > 0 ? (
            <Button plain key={`toggle-${section}-row`} label={' '.repeat(pad)} hover={lit} onPress={toggle} />
          ) : null}
        </Box>
      )
    }
    // The line between two sections that share a card, from the caret to the edge.
    const sectionDivider = (key: string) => (
      <Box key={key} paddingLeft={1}>
        <Text color={isDark ? DARK_DIVIDER : MUTED_LINE}>{'─'.repeat(Math.max(0, e.props.bodyColumns - 3))}</Text>
      </Box>
    )
    const sectionCard = (children: JSX.Element | JSX.Element[]) => (
      <Box flexDirection="column" paddingY={1} backgroundColor={isDark ? CARD_BG : undefined}>
        {children}
      </Box>
    )
    // The line between an open section's title and its first child: blank, but
    // for the tree's │, so the children do not crowd the title.
    const titleGap = (hasChildren = true) => (
      <Box paddingLeft={1}>
        <Text color={MUTED_LINE}>{hasChildren ? '│' : ' '}</Text>
      </Box>
    )
    // A folding section of the record: its entries hang under its title, each
    // drawn for its place in the tree. An open section's blank line follows
    // its last entry, so collapsed titles sit on consecutive lines.
    // `isFailing` adds a red ✗ that stays visible folded.
    const collapsible = (
      section: Section,
      title: string,
      entries: ((pos: TreePos) => JSX.Element)[],
      opts: { isLast: boolean; isFailing?: boolean },
    ) => {
      if (entries.length === 0) return []
      return [
        sectionHeader(section, title, entries.length, opts.isFailing),
        ...(isCollapsed(collapsed, section)
          ? []
          : [
              <Box flexDirection="column" marginBottom={opts.isLast ? 0 : 1}>
                {titleGap()}
                {entries.map((draw, n) => draw(childPos(n, entries.length)))}
              </Box>,
            ]),
      ]
    }

    const waitingView = () => {
      const decided = [...ledger.decided].reverse().slice(0, 6)
      const history = [
        collapsible(
          'checks',
          'Checks',
          [...checks.results].reverse().map(
            c => (pos: TreePos) =>
              treeRow(
                pos,
                <Text
                  color={c.result === 'pass' ? DONE : c.result === 'fail' ? 'error' : undefined}
                  dimColor={c.result === 'unknown'}
                >
                  {c.result === 'pass' ? '✓' : c.result === 'fail' ? '✗' : '·'}
                </Text>,
                <Text wrap="wrap">
                  {c.name}
                  <Text dimColor>
                    {c.summary ? `, ${c.summary}` : ''}
                    {isStale(c, checks) ? ', before the last edit' : ''}
                  </Text>
                </Text>,
                { age: ago(now - c.ranAt).replace(' ago', '') },
              ),
          ),
          {
            isLast: (card?.done ?? []).length === 0 && decided.length === 0,
            isFailing: checks.results.some(c => c.result === 'fail'),
          },
        ),
        collapsible(
          'done',
          'Finished by Claude',
          (card?.done ?? []).map(
            d => (pos: TreePos) =>
              treeRow(
                pos,
                <Text color={DONE}>✓</Text>,
                <Text wrap="wrap" dimColor>
                  {d}
                </Text>,
              ),
          ),
          { isLast: decided.length === 0 },
        ),
        collapsible(
          'decided',
          'Closed',
          decided.map(
            d => (pos: TreePos) =>
              treeRow(
                pos,
                <Text dimColor>◇</Text>,
                <Box flexDirection="column">
                  <Text wrap="wrap" dimColor>
                    {d.ask}
                  </Text>
                  <Text wrap="wrap" bold={!isLapsed(d)} dimColor={isLapsed(d)}>
                    {outcomeText(d)}
                  </Text>
                </Box>,
                // Two-line entries need space between them to read as separate items.
                { age: ago(now - d.at).replace(' ago', ''), gapAfter: pos === 'mid' },
              ),
          ),
          { isLast: true },
        ),
      ]
        .filter(section => section.length > 0)
        .flatMap((section, n) => (n === 0 ? section : [sectionDivider(`history-divider-${n}`), ...section]))

      // An item that just closed stays where its row was in its group, with a
      // check and its outcome, until it moves to Closed. It cannot be selected.
      const fresh = settled.filter(s => now - s.at < SETTLED_MS).sort((a, b) => a.index - b.index)
      const settledRow = (s: Settled, pos: TreePos) =>
        treeRow(
          pos,
          <Text color={DONE}>✓</Text>,
          <Box flexDirection="column">
            <Text wrap="truncate-end" dimColor>
              {s.ask}
            </Text>
            <Text wrap="wrap" color={DONE}>
              {outcomeText(s)}
            </Text>
          </Box>,
          { key: `settled-${s.id}` },
        )
      const groups = waitingGroups.flatMap(g => {
        const entries: ({ row: Row } | { settled: Settled })[] = g.rows.map(row => ({ row }))
        for (const s of fresh.filter(x => x.kind === g.kind))
          entries.splice(Math.min(s.index, entries.length), 0, { settled: s })
        const listed = divided(
          entries.map((x, n) =>
            'row' in x
              ? listRow(x.row, childPos(n, entries.length))
              : settledRow(x.settled, childPos(n, entries.length)),
          ),
          g.kind,
          true,
        )

        if (listed.length === 0) return []

        return [
          sectionCard([
            sectionHeader(g.section, g.title, g.rows.length),
            ...(isCollapsed(collapsed, g.section) ? [] : [titleGap(), ...listed]),
          ]),
        ]
      })
      // A stop is fixed in the session, not here, so it shows above the list without keys.
      const outside = stop
        ? [
            sectionCard(
              <Box flexDirection="column" paddingLeft={1}>
                <Text wrap="truncate-end">
                  <Text color="error" bold>
                    Stopped
                  </Text>
                  <Text dimColor> · {ago(now - stop.at)}</Text>
                </Text>
                <Text wrap="wrap">
                  {stopText(stop).charAt(0).toUpperCase() + stopText(stop).slice(1)}. {stopFix(stop)}
                </Text>
              </Box>,
            ),
          ]
        : []

      return (
        <Box flexDirection="column" gap={1}>
          {outside}
          {groups.length > 0 ? groups : outside.length === 0 ? emptyLine('Nothing is waiting on you.') : null}
          {card && card.running.length > 0
            ? sectionCard([
                sectionHeader('running', 'Running', card.running.length),
                ...(isCollapsed(collapsed, 'running') ? [] : [titleGap()]),
                ...(isCollapsed(collapsed, 'running') ? [] : card.running).map((run, n) => {
                  const { name, url } = splitRunning(run)

                  return treeRow(
                    childPos(n, card.running.length),
                    <Text color={DONE}>●</Text>,
                    <Text wrap="wrap">
                      {name ? <Text>{name} </Text> : null}
                      {url && isLinkable(url) ? <Link href={url} /> : <Text dimColor>{url}</Text>}
                    </Text>,
                  )
                }),
              ])
            : null}
          {history.length > 0 ? sectionCard(history) : null}
        </Box>
      )
    }

    const notesView = () =>
      rows.notes.length === 0
        ? emptyLine('No notes. Claude adds one when it notices an issue or an opportunity outside the current task.')
        : sectionCard(
            divided(
              rows.notes.map(r => listRow(r)),
              'notes',
              false,
            ),
          )

    const prBlock = ({ pr, rows: prRows }: { pr: PrView; rows: Row[] }) => {
      const ready = readiness(pr)
      const counts = checkCounts(pr)
      const waitingOn = waitingThreads(pr)
      const answered = pr.threads.length - waitingOn.length
      const facts = [
        pr.isDraft ? 'draft' : null,
        pr.ref === prState.branchRef ? 'this branch' : null,
        pr.checks.length > 0 ? `${counts.pass}/${pr.checks.length - counts.skip} checks pass` : null,
        counts.pending > 0 ? `${counts.pending} running` : null,
        answered > 0 ? `${answered} ${answered === 1 ? 'thread waits' : 'threads wait'} on others` : null,
      ].filter(Boolean)

      return sectionCard([
        <Box paddingLeft={1}>
          <Text wrap="wrap">
            <Text bold color={PRS}>
              #{pr.number}{' '}
            </Text>
            <Text bold>{pr.title}</Text>
          </Text>
        </Box>,
        titleGap(prRows.length > 0),
        <Box flexDirection="row" overflow="hidden">
          <Box width={4} flexShrink={0} />
          <Box width={3} flexShrink={0}>
            <Text color={ready.isReady ? DONE : WAITING}>{ready.isReady ? '✓' : '◇'}</Text>
          </Box>
          <Box flexDirection="column" flexShrink={1} flexGrow={1} paddingRight={1}>
            <Text wrap="wrap" color={ready.isReady ? DONE : WAITING}>
              {ready.text}
            </Text>
            {facts.length > 0 ? (
              <Text dimColor wrap="wrap">
                {facts.join(' · ')}
              </Text>
            ) : null}
            {pr.error ? (
              <Text color="error" wrap="wrap">
                Last refresh failed: {pr.error}
              </Text>
            ) : null}
            <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
              {waitingOn.length > 1 ? (
                <Button
                  key={`address-all-${pr.ref}`}
                  label={`Address all ${waitingOn.length} threads`}
                  onPress={act(() => void send($, prompts.address(pr, waitingOn)))}
                />
              ) : null}
              <Button key={`open-${pr.ref}`} label="Open PR" dimColor onPress={act(() => void openUrl($, pr.url))} />
              {pr.ref !== prState.branchRef ? (
                <Button
                  key={`unlink-${pr.ref}`}
                  label="Remove"
                  dimColor
                  onPress={act(() => void unlinkPr($, pr.ref))}
                />
              ) : null}
            </Box>
          </Box>
          {prRows.length > 0 ? branch('pass') : null}
        </Box>,
        ...divided(
          prRows.map((r, n) => listRow(r, childPos(n, prRows.length))),
          pr.ref,
          true,
        ),
      ])
    }
    const prsView = () => (
      <Box flexDirection="column" gap={1}>
        {prGroups.length === 0
          ? emptyLine(
              prState.isFetching
                ? 'Checking for PRs…'
                : 'No PRs. A PR shows here when this session opens or links one, or when this branch has one.',
            )
          : prGroups.map(prBlock)}
      </Box>
    )

    const move = (step: number) => {
      const to = Math.min(Math.max(at + step, 0), ids.length - 1)
      void select($, tab, ids[to] ?? '', to)
    }
    const moveKeys: KeyAction[] =
      ids.length > 1
        ? [
            { key: 'next', label: 'Next', hotkey: 'j', dimColor: true, onPress: () => move(1) },
            { key: 'previous', label: 'Previous', hotkey: 'k', dimColor: true, onPress: () => move(-1) },
          ]
        : []

    // At least the body's height, so the pane's background fills it. A pane takes a
    // key only as a Button's hotkey, so j and k are Buttons in a hidden Box.
    return (
      <Box
        flexDirection="column"
        gap={1}
        minHeight={e.props.scroll.bodyRows}
        backgroundColor={isDark ? DARK_BODY : undefined}
      >
        {tabs}
        <Box flexDirection="column" paddingX={1} flexGrow={1}>
          {tab === 'notes' ? notesView() : tab === 'prs' ? prsView() : waitingView()}
        </Box>
        <Box display="none">{keyRow(moveKeys)}</Box>
      </Box>
    )
  })
}
