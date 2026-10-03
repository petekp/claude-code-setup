import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, UiPressArgument } from 'claude-code'

import type { Cursor, Decided, Help, Item, Ledger, Note, PrCheck, PrThread, PrView, PrViews, Presence, Previous, Section, Tab } from '../types'
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
  EMPTY,
  SYSTEM,
  addNote,
  ago,
  answerNote,
  applyUpdate,
  buildPrompt,
  carryText,
  closeItem,
  latestBatch,
  normalizeLedger,
  olderItems,
  parseReply,
  catchUpPrompt,
  closedText,
  inboxText,
  readCommandRow,
  screenText,
  statusLine,
  tasksRunBy,
} from './ledger'

const LEDGER = atom({ plugin: 'session-inbox', key: 'ledger' } as const, EMPTY)
const PRESENCE = atom({ plugin: 'session-inbox', key: 'presence' } as const, {
  lastActiveAt: 0,
  isAway: false,
  isUpdating: false,
  error: null,
  minute: 0,
} as Presence)
const PREVIOUS = atom({ plugin: 'session-inbox', key: 'previous' } as const, null as Previous | null)
const TAB = atom({ plugin: 'session-inbox', key: 'tab' } as const, 'waiting' as Tab)
// Collapsed pane sections, a preference kept in the store across sessions.
const COLLAPSED = atom({ plugin: 'session-inbox', key: 'collapsed' } as const, [] as Section[])
const NO_CURSOR: Cursor = { id: null, index: 0 }
const SELECTION = atom({ plugin: 'session-inbox', key: 'selection' } as const, { waiting: NO_CURSOR, notes: NO_CURSOR, prs: NO_CURSOR } as Record<Tab, Cursor>)
// Whether Claude Code uses its `dark` theme, which picks the selected row's tint.
const IS_DARK_THEME = atom({ plugin: 'session-inbox', key: 'isDarkTheme' } as const, false)
const PR_VIEWS = atom({ plugin: 'session-inbox', key: 'prViews' } as const, { views: {}, branchRef: null, isFetching: false } as PrViews)
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

Before telling the user an inbox item is open or needs them, check the latest session-inbox context beside their prompt. It lists every open item; an item it does not list is closed.`
const NOTE_SCHEMA = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['issue', 'opportunity'], description: 'issue: something wrong or risky. opportunity: something that could be better.' },
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
const RECOMMENDED = 'suggestion'
// The header and footer panels: a theme key a shade off the pane's background, in every theme.
const PANEL_BG = 'userMessageBackground'
// The selected row in the dark theme: its tab's color at about 15% over the
// pane's rgb(38, 38, 38). Hex does not follow the theme, so other themes use SELECTION_BG.
const DARK_TINTS: Record<Tab, string> = { waiting: '#473d21', notes: '#3b3547', prs: '#2b3735' }
const SELECTION_BG = 'selectionBg'
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
const MODEL = 'sonnet'
const AWAY_MS = 15 * 60_000
const PREVIOUS_MAX_AGE_MS = 7 * 24 * 60 * 60_000
const KEPT_SESSIONS = 40
// Opened with `open -R` (shown in Finder) instead of `open`, which would launch them.
const LAUNCHES = /\.(app|command|tool|terminal|workflow|scpt|scptd|applescript|pkg|mpkg|dmg|webloc|inetloc|fileloc|prefpane|kext)$/i
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
let isSaved = false
let queue: Promise<void> = Promise.resolve()
// The inbox text Claude last read beside a prompt, so it is sent again only when it changed.
let toldInbox: string | null = null
// The line last published to this pane's Herdr sidebar row.
let published: string | null = null
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
 * showing the `inbox` token reads it. Outside Herdr it does nothing.
 */
async function publishStatus($: EngineInterface, ledger: Ledger) {
  const pane = await $.env.get('HERDR_PANE_ID')
  const line = statusLine(ledger)
  if (!pane || line === published) return
  published = line
  const token = line ? ['--token', `inbox=${line}`] : ['--clear-token', 'inbox']
  await $.process.run(['herdr', 'pane', 'report-metadata', pane, '--source', 'session-inbox', ...token], { timeoutMs: 5000 }).catch(() => undefined)
}

/** The ledger, with fields an earlier version of the mod did not write filled in. */
async function readLedger($: EngineInterface): Promise<Ledger> {
  return normalizeLedger(await read($, LEDGER))
}

/** Changes the ledger and saves it, so a resumed session finds it. */
async function commitLedger($: EngineInterface, change: (l: Ledger) => Ledger): Promise<Ledger> {
  const after = await update($, LEDGER, l => change(normalizeLedger(l)))
  await save($, after)
  void publishStatus($, after)

  return after
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
  // Without the context row Claude still gets the prompt, so a refused append does not stop it.
  if (context.length > 0) await $.session.append({ message: { type: 'user', content: [{ type: 'text', text: context.join('\n\n') }] } }).catch(() => undefined)
  await $.prompt.submit({ text, asUser: true })
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
  // An Explain quotes its item without answering it.
  const answer = sentBy?.action === 'explain' ? null : answerNote(ledger, text, ledger.turn)
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

/** Starts a free-text answer in the prompt, for a question with no options. */
async function startReply($: EngineInterface, item: Item, handle: string) {
  const prefix = /^\d{1,2}$/.test(handle) ? `${handle}. ` : `Re "${item.ask}": `
  const box = await $.prompt.read()
  const kept = box.text.trimEnd().split('\n').filter(line => line !== '' && !line.startsWith(prefix))
  await $.prompt.fill({ text: [...kept, prefix].join('\n'), mode: 'replace' })
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
  const path = raw.startsWith('~/') ? home + raw.slice(1) : raw.startsWith('/') ? raw : `${root}/${raw.replace(/^\.\//, '')}`
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
    $.ui.toast(r.isCopied ? `Copied ${what}. Run it in a terminal, or type ! here and paste.` : 'Could not copy to the clipboard')
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
  if (!copy || !open || copy.kind !== 'copy' || open.kind !== 'open') return helps.map(h => ({ label: helpLabel(h), step: [h] }))

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
  const note = { kind: input.kind === 'opportunity' ? ('opportunity' as const) : ('issue' as const), title, detail, path: path || null, at }
  let isAdded = false
  await commitLedger($, l => {
    const r = addNote(l, note)
    isAdded = r.isAdded
    return r.ledger
  })

  return isAdded ? 'Noted. The user sees it in the Notes tab of /inbox.' : 'Already noted.'
}

async function removeNote($: EngineInterface, id: string) {
  await commitLedger($, l => ({ ...l, notes: l.notes.filter(n => n.id !== id) }))
}

/** Sends the note back to Claude, to fix it or to talk it through first. */
async function actOnNote($: EngineInterface, note: Note, how: 'address' | 'discuss') {
  await removeNote($, note.id)
  const opening = how === 'address' ? 'Please address this note you recorded:' : 'Let\'s talk through this note you recorded before changing anything:'
  const body = [`${noteKindLabel(note)}: ${note.title}`, note.detail, ...(note.path ? [`File: ${note.path}`] : [])]
  await send($, [opening, ...body].join('\n'))
}

async function showTab($: EngineInterface, tab: Tab) {
  await update($, TAB, () => tab)
  if (tab === 'prs') void fetchPrs($, true)
}

async function toggleSection($: EngineInterface, section: Section) {
  const collapsed = await update($, COLLAPSED, c => (c.includes(section) ? c.filter(s => s !== section) : [...c, section]))
  await $.store.set('collapsed', collapsed)
}

/** Selects a row and scrolls the pane the least that shows it whole. */
async function select($: EngineInterface, tab: Tab, id: string, index: number) {
  await update($, SELECTION, s => ({ ...s, [tab]: { id, index } }))
  await $.ui.scroll({ in: PANE, to: { key: `row-${id}` }, block: 'nearest' }).catch(() => undefined)
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
async function fetchPr($: EngineInterface, target: string | null, views: Record<string, PrView>): Promise<PrView | null> {
  const threadsOf = (ref: string) => {
    const r = parseRef(ref)
    return gh($, ['api', 'graphql', '-f', `query=${THREADS_QUERY}`, '-F', `owner=${r.owner}`, '-F', `repo=${r.name}`, '-F', `number=${r.number}`])
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
  if (!base) return previous ? { ...previous, error: view.stderr.trim().split('\n')[0] || 'gh could not read the PR' } : null
  const threads = early ?? (await threadsOf(ref))

  return {
    ...base,
    threads: threads.exitCode === 0 ? readThreads(threads.stdout) : previous?.threads ?? [],
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
    await update($, PR_VIEWS, () => ({ views, branchRef: findsBranchPr ? branch?.ref ?? null : state.branchRef, isFetching: false }))
  } catch {
    await update($, PR_VIEWS, v => ({ ...v, isFetching: false }))
  }
}

/** The timed refresh, which runs only while the person is around and there is a PR to show or the PRs tab is open. */
async function pollPrs($: EngineInterface) {
  const [presence, ledger, prs, findsBranchPr] = await Promise.all([read($, PRESENCE), readLedger($), read($, PR_VIEWS), isPrsTabShown($)])
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

/** The band shows answer buttons only when they fit beside the question. */
function fitsInline(item: Item): boolean {
  const all = answers(item)
  return item.kind === 'do' || (item.options.length > 0 && all.length <= 3 && all.join('').length <= 24)
}

function answerActions($: EngineInterface, item: Item): Action[] {
  const all = answers(item)
  const recommended = recommendedIndex(all, item.rec)

  return all.map((answer, n) => ({
    key: `answer-${item.id}-${n}`,
    label: clipLabel(answer, 32),
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
 * The selected item's actions: answers, helps and Reply on digits, as a
 * survey numbers them, then Explain, then Done for a task or Dismiss for a question.
 */
function itemKeys($: EngineInterface, item: Item, handle: string): KeyAction[] {
  const reply = item.kind !== 'do' && item.options.length === 0 ? [{ key: `reply-${item.id}`, label: 'Reply', onPress: () => void startReply($, item, handle) }] : []
  const numbered = [...(item.kind === 'do' ? [] : answerActions($, item)), ...helpActions($, item), ...reply]
    .slice(0, 9)
    .map((a, n) => ({ ...a, hotkey: String(n + 1) }))
  const explainKey = { key: `explain-${item.id}`, label: 'Explain', hotkey: 'e', onPress: () => void explain($, item) }
  const end =
    item.kind === 'do'
      ? { ...doneAction($, item), hotkey: 'd' }
      : { key: `dismiss-${item.id}`, label: 'Dismiss', hotkey: 'x', onPress: () => void close($, item.id, 'dismissed') }

  return [...numbered, explainKey, end]
}

/** The band's buttons beside a question: its answers, or a task's first help and Done. */
function bandActions($: EngineInterface, item: Item): Action[] {
  return item.kind === 'do' ? [...helpActions($, item).slice(0, 1), doneAction($, item)] : answerActions($, item)
}

/**
 * The item's handle in the band. Items from the latest reply carry the agent's
 * own numbers, or 1, 2, 3 when it gave none, matching how answerNote maps
 * "1. yes". Older items get no number, because a number no longer maps to them.
 */
function marker(item: Item, batch: Item[]): string {
  const index = batch.indexOf(item)
  if (index >= 0) {
    if (item.label) return item.label
    if (!batch.some(i => i.label)) return String(index + 1)
  }

  return item.kind === 'do' ? 'you' : '•'
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

function noteKindLabel(note: Note): string {
  return note.kind === 'issue' ? 'Issue' : 'Opportunity'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    isOn = e.isInteractive
    if (!isOn) return r
    sessionId = await $.session.id()
    root = await $.session.root()
    isSaved = false

    await $.command.register({
      name: 'inbox',
      description: 'Show where this session stands and what is waiting on you',
    })
    await $.tool.register({ name: 'note', description: NOTE_DESCRIPTION, inputSchema: NOTE_SCHEMA })
    // A reload stops any update the previous load had running, and state outlives
    // it, so an update in flight at load was cut off: record it as failed.
    const presence = await update($, PRESENCE, p => (p.isUpdating ? { ...p, isUpdating: false, error: 'an update was cut off' } : p))
    const theme = (await $.config.list().catch(() => [])).find(row => row.key === 'theme')?.value
    await update($, IS_DARK_THEME, () => theme === 'dark')
    const collapsed = (await $.store.get('collapsed')) as Section[] | undefined
    if (collapsed) await update($, COLLAPSED, () => collapsed)
    const now = await $.clock.now()
    const current = await read($, LEDGER)
    const saved = (await $.store.get(`s:${sessionId}`)) as { savedAt: number; ledger: StoredLedger } | undefined
    if (current.turn === 0 && !current.card) {
      if (saved) {
        // A resumed session: bring its card back and show it as a return.
        await update($, LEDGER, () => normalizeLedger(saved.ledger))
        await update($, PRESENCE, p => ({ ...p, lastActiveAt: saved.savedAt, isAway: true }))
      } else {
        const prev = (await $.store.get(`p:${root}`)) as (Omit<Previous, 'isBroughtIn' | 'ledger'> & { ledger: StoredLedger }) | undefined
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
    await publishStatus($, loaded)
    // A resumed session's linked PRs; the branch's PR waits for the PRs tab.
    if (loaded.prs.length > 0) void fetchPrs($, false)

    return r
  })

  on('session.end', async ($, e, next) => {
    // The pane outlives the session, so its sidebar line goes with it.
    if (isOn) await publishStatus($, EMPTY)
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
    }

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (!isOn) return next(e)
    const origin = e.origin
    // send() already recorded this mod's own prompts.
    if (origin.kind === 'plugin' && origin.name === 'session-inbox') return next(e)
    // The person's own words: typed, or sent as theirs by another plugin.
    const isPersonsWords = origin.kind === 'composer' || origin.kind === 'bridge' || (origin.kind === 'plugin' && origin.asUser === true)
    if (!isPersonsWords) {
      if (!e.turnId) trigger = origin.kind

      return next(e)
    }

    const notes = await notePrompt($, e.text, null)

    return notes.length === 0 ? next(e) : next({ ...e, context: [...(e.context ?? []), ...notes] })
  })

  on('turn.start', ($, e, next) => {
    isTurnRunning = true

    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const r = await next(e)
    if (!isOn) return r

    return { ...r, sections: [...r.sections, { id: 'session-inbox:guidance', text: NOTE_GUIDANCE, scope: 'session' as const }] }
  })

  // The note tool is listed up front, needs no permission prompt, and is served here.
  on('tool.describe', { tool: NOTE_TOOL }, async ($, e, next) => ({ ...(await next(e)), isDeferred: false }))
  on('tool.check', { tool: NOTE_TOOL }, () => ({ decision: 'allow' }))
  on('tool.call', { tool: NOTE_TOOL }, async ($, e) => ({ result: await recordNote($, e as unknown as Record<string, unknown>) }))

  on('tool.call', async ($, e, next) => {
    if (!isOn || e.agentId) return next(e)
    if (e.tool === 'Bash') {
      noteActivity(`${e.run_in_background ? 'started in background' : 'ran'}: ${e.command.slice(0, 140)}`)
      const ran = await next(e)
      if (activity.length < 40) for (const url of new Set(ran.text?.match(LOCAL_URL) ?? [])) noteActivity(`URL in output: ${url}`)
      // A PR this session opened; other commands print PR links that are not this session's.
      if (/\bgh\s+pr\s+create\b/.test(e.command)) void linkPrs($, prRefs(ran.text ?? ''))

      return ran
    }
    if (e.tool === 'AskUserQuestion') {
      // The answers come back in the tool result, never in a typed prompt, so
      // the ledger model only learns them from here.
      const ran = await next(e)
      noteActivity(`asked the user in a dialog; answer: ${(ran.text ?? '').slice(0, 400)}`)

      return ran
    }
    if (e.tool === 'Edit' || e.tool === 'Write') noteActivity(`edited ${e.file_path}`)
    else if (e.tool === 'Skill') noteActivity(`used skill ${e.skill}`)
    else if (e.tool === 'Agent') noteActivity(`started agent: ${e.description}`)
    else if (String(e.tool).startsWith('mcp__')) noteActivity(`called ${String(e.tool).slice(5)}`)

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId) return r
    isTurnRunning = false
    if (!isOn || e.reason !== 'answer' || e.answer.trim() === '') return r

    const ex: Exchange = { person, trigger, activity, reply: e.answer, turn: (await read($, LEDGER)).turn, press, screen: await screen($) }
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
    )

    return text ? { ...r, blocks: [...r.blocks, { name: 'session_inbox', text }] } : r
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
      notePerson(`/${row.name} ${row.args}`.trim())
    }

    return r
  })

  on('command.run', { command: 'inbox' }, async $ => {
    const opened = await $.ui.open({ id: PANE, title: 'Session inbox', focus: true, closeOnEscape: true })
    if (opened.isPlaced && (await read($, TAB)) === 'prs') void fetchPrs($, true)

    return { text: 'Opened the session inbox.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!isOn || e.props.hasSurvey) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const [ledger, presence, prev, prs, now] = await Promise.all([
      readLedger($),
      read($, PRESENCE),
      read($, PREVIOUS),
      read($, PR_VIEWS),
      $.clock.now(),
    ])
    const isWorking = e.props.isWorking

    if (prev && ledger.turn === 0) {
      const c = prev.ledger.card
      const waiting = prev.ledger.items.length

      return (
        <Box flexDirection="column">
          <Text bold>
            Last session in this folder <Text dimColor>· {ago(now - prev.savedAt)}</Text>
          </Text>
          {c && <Text wrap="truncate-end">  Goal  {c.goal}</Text>}
          {c?.now && <Text wrap="truncate-end" dimColor>  Now   {c.now}</Text>}
          {waiting > 0 && (
            <Text wrap="truncate-end" dimColor>
              {'  '}
              {waiting} waiting on you: {prev.ledger.items.slice(0, 3).map(i => i.ask).join(' · ')}
            </Text>
          )}
          <Box flexDirection="row" gap={1}>
            {prev.isBroughtIn ? (
              <Text dimColor>  Added to your next message.</Text>
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
    if (!card && ledger.items.length === 0 && ledger.notes.length === 0) return next(e)

    const batch = latestBatch(ledger)
    const older = olderItems(ledger)
    // Numbers only map back to items while no prompt has been sent since the
    // reply that asked them; answerNote applies the same rule.
    const numbered = ledger.batchTurn === ledger.turn ? batch : []
    const goal = card?.goal || 'This session'
    const waiting = ledger.items.length
    const noteCount = ledger.notes.length
    const prAlert = prAttention(Object.values(prs.views))
    // What else in /inbox wants attention, appended to the band's first line.
    const hints = [
      noteCount > 0 ? <Text color={NOTES}> · {noteCount === 1 ? '1 note' : `${noteCount} notes`} in /inbox</Text> : null,
      prAlert ? <Text color={PRS}> · {prAlert}</Text> : null,
    ]

    if (isWorking) {
      return (
        <Text wrap="truncate-end">
          <Text color={ACCENT}>◆ </Text>
          <Text dimColor>{goal}</Text>
          {waiting > 0 ? <Text color={WAITING}> · {waiting} waiting on you</Text> : null}
        </Text>
      )
    }

    const isReturn = presence.isAway && card !== null
    const shown = (isReturn ? [...older.slice(-2), ...batch] : batch).slice(-6)
    const hidden = waiting - shown.length
    const olderRows = hidden > 0 ? [<Text dimColor>  +{hidden} older in /inbox</Text>] : []
    const fit = (rows: JSX.Element[]) => <Box flexDirection="column">{rows.slice(0, Math.max(1, e.props.maxRows))}</Box>
    const itemRow = (item: Item) => {
      const handle = marker(item, numbered)
      const isInline = fitsInline(item)

      return (
        <Box flexDirection="row">
          <Box width={4} flexShrink={0}>
            <Text bold color={WAITING}>
              {handle}
            </Text>
          </Box>
          <Box flexShrink={1}>
            <Text wrap="truncate-end">
              {item.ask}
              {!isInline && item.rec ? <Text dimColor>  recommended: </Text> : null}
              {!isInline && item.rec ? <Text color={RECOMMENDED}>{item.rec}</Text> : null}
            </Text>
          </Box>
          {isInline ? (
            <Box flexDirection="row" flexShrink={0} gap={1} marginLeft={2}>
              {bandActions($, item).map(a => (
                <Button {...a} />
              ))}
            </Box>
          ) : null}
        </Box>
      )
    }
    const openRows = (card?.running ?? []).slice(0, 3).map(run => (
      <Text wrap="truncate-end">
        <Text color={DONE}>  ● </Text>
        <Text dimColor>{run}</Text>
      </Text>
    ))

    if (isReturn && card) {
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
                <Text color={DONE}>  ✓ </Text>
                <Text dimColor>{card.done.slice(-3).join(' · ')}</Text>
              </Text>,
            ]
          : []),
        <Text wrap="truncate-end">
          <Text dimColor>  → </Text>
          {card.now}
        </Text>,
        ...openRows,
        ...(ledger.decided.length > 0
          ? [
              <Text wrap="truncate-end" dimColor>
                {'  Decided: '}
                {ledger.decided
                  .slice(-2)
                  .map(decisionText)
                  .join(' · ')}
              </Text>,
            ]
          : []),
        ...(shown.length > 0
          ? [
              <Text bold color={WAITING}>
                Waiting on you
              </Text>,
              ...shown.map(itemRow),
            ]
          : []),
        ...olderRows,
      ]

      return fit(rows)
    }

    if (shown.length === 0) {
      return (
        <Box flexDirection="column">
          <Text wrap="truncate-end">
            <Text color={ACCENT}>◆ </Text>
            <Text dimColor>
              {goal}
              {card?.now ? ` · ${card.now}` : ''}
            </Text>
            {hidden > 0 ? <Text color={WAITING}> · {hidden} older waiting on you in /inbox</Text> : null}
            {hints}
          </Text>
          {openRows}
        </Box>
      )
    }

    const rows = [
      <Text wrap="truncate-end">
        <Text bold color={WAITING}>
          Waiting on you
        </Text>
        <Text dimColor> · {goal}</Text>
        {hints}
      </Text>,
      ...shown.map(itemRow),
      ...olderRows,
      ...openRows,
    ]

    return fit(rows)
  })

  on('config.set', { key: 'theme' }, async ($, e, next) => {
    const r = await next(e)
    const theme = (await $.config.list().catch(() => [])).find(row => row.key === 'theme')?.value
    await update($, IS_DARK_THEME, () => theme === 'dark')

    return r
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Link, Markdown, Text } = $.ui.resolve(e)
    const [ledger, presence, tab, prState, collapsed, selection, now, isDark] = await Promise.all([
      readLedger($),
      read($, PRESENCE),
      read($, TAB),
      read($, PR_VIEWS),
      read($, COLLAPSED),
      read($, SELECTION),
      $.clock.now(),
      read($, IS_DARK_THEME),
    ])
    const card = ledger.card
    const numbered = ledger.batchTurn === ledger.turn ? latestBatch(ledger) : []
    const prViews = Object.values(prState.views)
    const isFocused = e.props.isFocused
    const color = TAB_COLORS[tab]

    // One list row's content. Selected, a row shows its context line, its title
    // in full, its body and its keys; otherwise one line: `line`, or the title.
    type Row = {
      id: string
      handle: string
      meta: JSX.Element
      title: string
      line?: JSX.Element
      body?: JSX.Element | null
      keys: () => KeyAction[]
    }
    const itemRow = (item: Item): Row => {
      const handle = marker(item, numbered)
      const rec = item.rec && item.kind !== 'do' ? item.rec : null

      return {
        id: item.id,
        handle,
        meta: (
          <Text color={WAITING} bold>
            {item.kind === 'do' ? 'Your task' : 'Question'}
          </Text>
        ),
        title: item.ask,
        body: rec ? (
          <Text wrap="wrap">
            <Text dimColor>Recommended: </Text>
            <Text bold>{rec}</Text>
          </Text>
        ) : null,
        keys: () => itemKeys($, item, handle),
      }
    }
    const noteRow = (note: Note): Row => ({
      id: note.id,
      handle: '•',
      meta: (
        <Text wrap="truncate-end">
          <Text color={NOTES} bold>
            {noteKindLabel(note)}
          </Text>
          <Text dimColor>
            {' · '}
            {ago(now - note.at)}
            {note.path ? ` · ${baseName(note.path)}` : ''}
          </Text>
        </Text>
      ),
      title: note.title,
      line: (
        <Text wrap="truncate-end">
          {note.title}
          <Text dimColor> · {ago(now - note.at)}</Text>
        </Text>
      ),
      body: <Text wrap="wrap">{note.detail}</Text>,
      keys: () => [
        { key: `address-${note.id}`, label: 'Address it', hotkey: 'a', onPress: () => void actOnNote($, note, 'address') },
        { key: `discuss-${note.id}`, label: 'Discuss', hotkey: 'd', onPress: () => void actOnNote($, note, 'discuss') },
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
      line: (
        <Text wrap="truncate-end">
          <Text color="error">{c.name}</Text>
          <Text dimColor> · failing check</Text>
        </Text>
      ),
      keys: () => [
        { key: `fix-${pr.ref}-${c.name}`, label: 'Fix', hotkey: 'f', onPress: () => void send($, prompts.fix(pr, c)) },
        { key: `log-${pr.ref}-${c.name}`, label: 'Open log', hotkey: 'o', onPress: () => void openUrl($, c.url ?? pr.url) },
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
        line: (
          <Text wrap="truncate-end">
            <Text dimColor>{threadWhere(t, baseName(t.path))} </Text>
            {latest.body.replace(/\s+/g, ' ')}
          </Text>
        ),
        body: (
          <Box flexDirection="column">
            {t.reply ? <Markdown dimColor text={`@${t.author}: ${clipLabel(t.body, 200)}`} /> : null}
            <Markdown text={`**@${latest.author}:** ${clipLabel(latest.body, 1200)}`} />
          </Box>
        ),
        keys: () => [
          { key: `address-${t.id}`, label: 'Address', hotkey: 'a', onPress: () => void send($, prompts.address(pr, [t])) },
          { key: `draft-${t.id}`, label: 'Draft reply', hotkey: 'r', onPress: () => void send($, prompts.draft(pr, t)) },
          { key: `discuss-${t.id}`, label: 'Discuss', hotkey: 'd', onPress: () => void send($, prompts.discuss(pr, t)) },
          { key: `open-${t.id}`, label: 'Open', hotkey: 'o', onPress: () => void openUrl($, t.reply?.url || t.url || pr.url) },
        ],
      }
    }

    // Each tab's rows in order: the cursor, the counts and the drawing all read these.
    const prGroups = prViews.map(pr => ({ pr, rows: [...failingChecks(pr).map(c => checkRow(pr, c)), ...waitingThreads(pr).map(t => threadRow(pr, t))] }))
    const rows: Record<Tab, Row[]> = {
      waiting: ledger.items.map(itemRow),
      notes: [...ledger.notes].reverse().map(noteRow),
      prs: prGroups.flatMap(g => g.rows),
    }
    const ids = rows[tab].map(r => r.id)
    const indexOf = new Map(ids.map((id, n) => [id, n]))
    const at = selectedIndex(ids, selection[tab])
    // Wide enough for the longest handle, such as "you" on a task.
    const handleWidth = 3 + Math.max(1, ...rows[tab].map(r => r.handle.length))

    const keyRow = (keys: KeyAction[]) => (
      <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
        {keys.map(k => (
          <Button plain {...k} />
        ))}
      </Box>
    )
    // The selected row gets a bar in the tab's color and a tinted background,
    // and reads top to bottom: context line, title, body, keys, each set off by
    // a blank line. The handle is a Button, so a click selects the row.
    const listRow = (row: Row) => {
      const index = indexOf.get(row.id) ?? -1
      const isSelected = index === at

      return (
        <Box key={`row-${row.id}`} flexDirection="row" backgroundColor={isSelected ? (isDark ? DARK_TINTS[tab] : SELECTION_BG) : undefined}>
          <Box width={1} flexShrink={0} backgroundColor={isSelected ? color : undefined} />
          <Box width={handleWidth} flexShrink={0} paddingLeft={1} paddingY={isSelected ? 1 : 0}>
            <Button plain key={`select-${row.id}`} label={row.handle} dimColor={!isSelected} onPress={() => void select($, tab, row.id, index)} />
          </Box>
          {isSelected ? (
            <Box flexDirection="column" flexShrink={1} flexGrow={1} paddingRight={1} paddingY={1}>
              {row.meta}
              <Text wrap="wrap" bold>
                {row.title}
              </Text>
              {row.body ? <Box marginTop={1}>{row.body}</Box> : null}
              <Box marginTop={1}>{keyRow(row.keys())}</Box>
            </Box>
          ) : (
            <Box flexShrink={1} flexGrow={1} paddingRight={1}>
              {row.line ?? <Text wrap="truncate-end">{row.title}</Text>}
            </Box>
          )}
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

    // The tab bar is the pane's top panel; the footer is its bottom one.
    const tabs = (
      <Box backgroundColor={PANEL_BG} paddingX={1} paddingY={1}>
        <Box flexDirection="row" columnGap={3} flexGrow={1}>
          {TABS.map(({ id, label, hotkey }) => {
            const count = rows[id].length

            return tab === id ? (
              <Text backgroundColor={TAB_COLORS[id]} color="inverseText" bold>
                {` ${label}${count > 0 ? ` ${count}` : ''} `}
              </Text>
            ) : (
              <Box flexDirection="row">
                <Button plain key={`tab-${id}`} hotkey={hotkey} label={label} dimColor onPress={() => void showTab($, id)} />
                {count > 0 ? <Text color={TAB_COLORS[id]}> {count}</Text> : null}
              </Box>
            )
          })}
        </Box>
      </Box>
    )

    // A collapsible section: its title is its toggle. An open section's blank
    // line follows its last entry, so collapsed toggles sit on consecutive lines.
    const collapsible = (section: Section, title: string, entries: JSX.Element[], isLast: boolean) =>
      entries.length === 0
        ? []
        : [
            <Button
              plain
              key={`toggle-${section}`}
              label={`${collapsed.includes(section) ? '▸' : '▾'} ${title} ${entries.length}`}
              dimColor
              onPress={() => void toggleSection($, section)}
            />,
            ...(collapsed.includes(section)
              ? []
              : [
                  <Box flexDirection="column" marginBottom={isLast ? 0 : 1}>
                    {entries}
                  </Box>,
                ]),
          ]

    const waitingView = () => {
      const decided = [...ledger.decided].reverse().slice(0, 6)
      const history = [
        ...collapsible(
          'done',
          'Done',
          (card?.done ?? []).map(d => (
            <Text wrap="wrap">
              <Text color={DONE}>✓ </Text>
              <Text dimColor>{d}</Text>
            </Text>
          )),
          decided.length === 0,
        ),
        ...collapsible(
          'decided',
          'Decided',
          decided.map(d => (
            <Text wrap="wrap" dimColor>
              {decisionText(d)}
            </Text>
          )),
          true,
        ),
      ]

      return (
        <Box flexDirection="column" gap={1}>
          <Box flexDirection="column">{rows.waiting.length === 0 ? emptyLine('Nothing is waiting on you.') : rows.waiting.map(listRow)}</Box>
          {card && card.running.length > 0 ? (
            <Box flexDirection="column" paddingLeft={1}>
              <Text dimColor>Running {card.running.length}</Text>
              {card.running.map(run => {
                const { name, url } = splitRunning(run)

                return (
                  <Text wrap="wrap">
                    <Text color={DONE}>● </Text>
                    {name ? <Text>{name}  </Text> : null}
                    {url && isLinkable(url) ? <Link href={url} /> : <Text dimColor>{url}</Text>}
                  </Text>
                )
              })}
            </Box>
          ) : null}
          {history.length > 0 ? (
            <Box flexDirection="column" paddingLeft={1}>
              {history}
            </Box>
          ) : null}
        </Box>
      )
    }

    const notesView = () => (
      <Box flexDirection="column">
        {rows.notes.length === 0
          ? emptyLine('No notes. Claude adds one when it notices an issue or an opportunity outside the current task.')
          : rows.notes.map(listRow)}
      </Box>
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

      return (
        <Box flexDirection="column">
          <Box paddingLeft={1}>
            <Text wrap="wrap">
              <Text bold color={PRS}>
                #{pr.number}{' '}
              </Text>
              <Text bold>{pr.title}</Text>
            </Text>
          </Box>
          <Box flexDirection="column" paddingLeft={handleWidth}>
            <Text wrap="wrap" color={ready.isReady ? DONE : WAITING}>
              {ready.isReady ? '✓ ' : '◇ '}
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
                <Button key={`address-all-${pr.ref}`} label={`Address all ${waitingOn.length} threads`} onPress={() => void send($, prompts.address(pr, waitingOn))} />
              ) : null}
              <Button key={`open-${pr.ref}`} label="Open PR" dimColor onPress={() => void openUrl($, pr.url)} />
              {pr.ref !== prState.branchRef ? <Button key={`unlink-${pr.ref}`} label="Remove" dimColor onPress={() => void unlinkPr($, pr.ref)} /> : null}
            </Box>
          </Box>
          {prRows.map(listRow)}
        </Box>
      )
    }
    const prsView = () => (
      <Box flexDirection="column" gap={1}>
        {prGroups.length === 0
          ? emptyLine(prState.isFetching ? 'Checking for PRs…' : 'No PRs. A PR shows here when this session opens or links one, or when this branch has one.')
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

    // At least the body's height, so the growing content pushes the footer to
    // the pane's bottom. Longer content scrolls, and the footer follows it.
    return (
      <Box flexDirection="column" gap={1} minHeight={e.props.scroll.bodyRows}>
        {tabs}
        <Box flexDirection="column" paddingX={1} flexGrow={1}>
          {tab === 'notes' ? notesView() : tab === 'prs' ? prsView() : waitingView()}
        </Box>

        <Box backgroundColor={PANEL_BG} paddingX={1}>
          <Box flexDirection="row" justifyContent="space-between" columnGap={2} flexGrow={1}>
            <Box flexShrink={0}>{isFocused ? keyRow(moveKeys) : <Text dimColor>ctrl+x tab for keys</Text>}</Box>
            <Box flexDirection="row" columnGap={2} flexShrink={1}>
              <Text dimColor wrap="truncate-start">
                {status}
              </Text>
              {presence.error && !presence.isUpdating ? <Text color="error">update failed, retries after the next reply</Text> : null}
            </Box>
          </Box>
        </Box>
      </Box>
    )
  })
}
