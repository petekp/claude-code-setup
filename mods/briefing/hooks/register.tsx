import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ToolCallArgs, ToolCallResult, UiPressArgument } from 'claude-code'

import type {
  Brief,
  Cursor,
  Decision,
  Dialog,
  Explained,
  HeldAct,
  Live,
  Outbox,
  PressLine,
  Presence,
  Request,
  Snapshot,
  Task,
} from '../types'
import { isAlwaysHeld, lastQuestion, outward, wasAsked } from './acts'
import { SYSTEM as CATCH_UP_SYSTEM, buildPrompt, parseCatchUp } from './catchup'
import { checksIn, doingNow, readCommandRow, readResults, stopKindOf } from './evidence'
import { candidates, contentDiffers, readLsTree, readStatus, sameDirty, type Status } from './git'
import { GUIDANCE, TOOL, TOOL_DESCRIPTION, TOOL_NAME, TOOL_SCHEMA } from './guidance'
import {
  EMPTY,
  applyRecord,
  closeTasksRun,
  fullText,
  holdAct,
  madeFor,
  pressDismiss,
  pressOption,
  pressTask,
  pressYourCall,
  prune,
  readInput,
  recordCheck,
  recordDialog,
  setStop,
  settleAct,
  startAct,
  stopFix,
  stopText,
  waitingOn,
  type Press,
  type Waiting,
} from './record'
import { checkMessage, contradictedClaim, unrecordedQuestions } from './turn-check'
import { ago, awaySummary, checkLine, checkProblem, dialogText, fit, isEmpty, lineText, pickFirst, span } from './views'

const BRIEF = atom({ plugin: 'briefing', key: 'brief' } as const, EMPTY)
const PRESENCE = atom(
  { plugin: 'briefing', key: 'presence' } as const,
  { lastActiveAt: 0, lastPromptAt: 0, awayFrom: null, returnedAt: null } as Presence,
)
const LIVE = atom(
  { plugin: 'briefing', key: 'live' } as const,
  { isWorking: false, dialogs: [], git: null, isSummarizing: false, summaryError: null } as Live,
)
const CURSOR = atom({ plugin: 'briefing', key: 'selected' } as const, { id: null, index: 0, section: null } as Cursor)
const EXPLAINED = atom({ plugin: 'briefing', key: 'explained' } as const, {} as Record<string, Explained>)
const OUTBOX = atom({ plugin: 'briefing', key: 'outbox' } as const, null as Outbox | null)
const PENDING = atom({ plugin: 'briefing', key: 'pending' } as const, [] as PressLine[])
const NEWS = atom({ plugin: 'briefing', key: 'news' } as const, [] as string[])
// Whether Claude Code uses its `dark` theme, which picks the selected row's tint.
const IS_DARK_THEME = atom({ plugin: 'briefing', key: 'isDarkTheme' } as const, false)

const PANE = 'briefing'
// Theme keys, so the colors follow the person's Claude Code theme.
const NEEDS = 'warning'
const STOPPED = 'error'
const PASSED = 'success'
// Claude's own color, for what Claude chose.
const CLAUDE = 'claude'
const PANEL_BG = 'userMessageBackground'
const SELECTION_BG = 'selectionBg'
// The selected row in the dark theme, a shade over the pane's rgb(38, 38, 38). Hex does not follow the theme.
const DARK_SELECTION = '#3a3a3a'

const MODEL = 'sonnet'
const AWAY_MS = 15 * 60_000
// Presses this close together reach the agent as one message.
const BATCH_MS = 2000
const BATCH_MAX_MS = 6000
// After an answer the next item slides under the cursor; digits wait this long so a double press cannot answer it.
const DIGIT_PAUSE_MS = 600
const CHOSE_MAX = 6
const EARLIER_MAX = 3
// Saved records older than this are deleted when a session starts.
const KEEP_DAYS = 30
// Uncommitted paths past this many are left out of the working tree's snapshot.
const SNAPSHOT_MAX = 2000

// Set in session.start, which a hot reload runs again. Module variables reset
// on a hot reload, which only loses the turn in progress.
let isOn = false
let sessionId = ''
let root = ''
// The git work tree's top folder, which `git status` paths are relative to; null outside git.
let top: string | null = null
// The folder that holds each session's saved record.
let dir = ''
// The catch-up's window: what happened since the person's last typed prompt or press.
let windowPerson: string[] = []
let windowTrigger: string | null = null
let windowActivity: string[] = []
// What the person asked for since their last typed prompt, which decides whether an outward act waits for their press.
let requests: Request[] = []
let lastReply = ''
let isTurnRunning = false
// Whether the agent has had the whole record in this process; a resumed session has not.
let hasToldFull = false
let published: string | null = null
let lines: Promise<void> = Promise.resolve()
let summaries: Promise<void> = Promise.resolve()
let refreshing: Promise<void> = Promise.resolve()
// Goes up when /clear or /resume switches sessions, so work begun for one session never lands in the next.
let generation = 0
let flushTimer: { cancel: () => void } | null = null
let pauseUntil = 0
// The `!` command whose output row comes next.
let shellCommand: string | null = null

// The record ------------------------------------------------------------

/** A saved record, with fields an earlier version did not write filled in. */
function normalize(saved: Partial<Brief>): Brief {
  return { ...EMPTY, ...saved, work: { ...EMPTY.work, ...saved.work }, next: { ...EMPTY.next, ...saved.next } }
}

async function save($: EngineInterface, b: Brief) {
  if (!dir) return
  // /clear starts a new session id in the same process.
  if (!sessionId) sessionId = await $.session.id()
  await $.fs
    .write(`${dir}/${sessionId}.json`, JSON.stringify({ savedAt: await $.clock.now(), root, brief: b }))
    .catch(() => undefined)
}

async function load($: EngineInterface): Promise<Brief | null> {
  const text = await $.fs.read(`${dir}/${sessionId}.json`).catch(() => null)
  if (!text) return null
  try {
    const saved = JSON.parse(text) as { brief?: Partial<Brief> }

    return saved.brief ? normalize(saved.brief) : null
  } catch {
    return null
  }
}

/** Changes the record, saves it, and updates the sidebar line. `change` may run more than once. */
async function commit($: EngineInterface, change: (b: Brief) => Brief): Promise<Brief> {
  const after = await update($, BRIEF, change)
  await save($, after)
  publishLine($)

  return after
}

/**
 * Publishes the session's line to its Herdr pane, where a sidebar row showing
 * the `inbox` token reads it. Outside Herdr it does nothing. Calls run in order,
 * so an older line never lands after a newer one.
 */
function publishLine($: EngineInterface, isEnding = false) {
  lines = lines
    .then(async () => {
      const pane = await $.env.get('HERDR_PANE_ID')
      if (!pane) return
      const [b, live] = await Promise.all([read($, BRIEF), read($, LIVE)])
      const line = isEnding ? '' : lineText(waitingOn(b, live.dialogs))
      if (line === published) return
      published = line
      const token = line ? ['--token', `inbox=${line}`] : ['--clear-token', 'inbox']
      await $.process.run(['herdr', 'pane', 'report-metadata', pane, '--source', 'briefing', ...token], {
        timeoutMs: 5000,
      })
    })
    .catch(() => undefined)

  return lines
}

// Dialogs ------------------------------------------------------------

/**
 * A tool call's identity: the tool and its main argument. A dialog keeps it,
 * so the dialog closes when its own call ends, not when a like call does.
 */
function callKey(tool: string, input: Record<string, unknown>): string {
  const main = ['command', 'file_path', 'notebook_path', 'url', 'pattern', 'query', 'skill', 'description'].find(
    k => typeof input[k] === 'string',
  )

  return main ? `${tool} ${main}=${String(input[main])}` : `${tool} ${JSON.stringify(input)}`
}

async function openDialog($: EngineInterface, dialog: Dialog) {
  await update($, LIVE, l => ({ ...l, dialogs: [...l.dialogs.filter(d => d.key !== dialog.key), dialog] }))
  publishLine($)
}

/** Closes the dialogs of one call, or every dialog. */
async function closeDialogs($: EngineInterface, key: string | null) {
  if (!(await read($, LIVE)).dialogs.some(d => key === null || d.key === key)) return
  await update($, LIVE, l => ({ ...l, dialogs: key === null ? [] : l.dialogs.filter(d => d.key !== key) }))
  publishLine($)
}

async function clearingDialog<T>($: EngineInterface, key: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } finally {
    await closeDialogs($, key)
  }
}

/** "Bash: npm test" in a permission dialog's words. */
function permissionText(tool: string, input: Record<string, unknown>): string {
  const text = (key: string) => (typeof input[key] === 'string' ? (input[key] as string) : '')
  const file = (key: string) => text(key).replace(/\/+$/, '').replace(/^.*\//, '')
  switch (tool) {
    case 'Bash':
      return fit(text('description') || text('command'), 60)
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
      return `search ${text('path') ? `${file('path')} ` : ''}for ${fit(text('pattern'), 30)}`
    case 'WebFetch':
      return `fetch ${
        text('url')
          .replace(/^https?:\/\//, '')
          .split('/')[0]
      }`
    case 'WebSearch':
      return `search the web for ${fit(text('query'), 30)}`
    case 'Skill':
      return `use the ${text('skill')} skill`
    case 'Agent':
    case 'Task':
      return text('description') ? `run an agent: ${text('description')}` : 'run an agent'
    default:
      return tool.startsWith('mcp__') ? tool.slice(5).replace(/__/g, ' ') : tool
  }
}

// The working tree ------------------------------------------------------------

/** Runs a git command that reads the work tree; null when it fails. Optional locks are off, so it never takes the index lock from a commit. */
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

/** The working tree's content, read without writing to the repo, and its status. */
async function readSnapshot($: EngineInterface): Promise<{ snapshot: Snapshot; status: Status } | null> {
  const out = await runGit($, ['status', '--porcelain=v1', '-z', '--branch', '-uall'])
  if (out === null) return null
  const status = readStatus(out)
  const head = (await runGit($, ['rev-parse', '--verify', '-q', 'HEAD']))?.trim() || null
  const changed = status.changed.slice(0, SNAPSHOT_MAX)
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

  return { snapshot: { head, dirty }, status }
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

/** Whether two snapshots hold different content. A commit only moves content into HEAD, so it changes nothing. */
async function contentChanged($: EngineInterface, a: Snapshot, b: Snapshot): Promise<boolean> {
  if (a.head !== b.head && !b.head) return true
  let committed: string[] = []
  if (a.head && b.head && a.head !== b.head) {
    const out = await runGit($, ['diff', '--name-only', '-z', '--no-renames', a.head, b.head])
    if (out === null) return true
    committed = out.split('\0').filter(Boolean)
  }
  const paths = candidates(a, b, committed)
  if (paths.length === 0) return false
  const before = a.head ? await lsTree($, a.head, paths) : {}
  const after = b.head === a.head ? before : b.head ? await lsTree($, b.head, paths) : {}
  if (!before || !after) return true

  return contentDiffers(a, b, paths, before, after)
}

/**
 * Reads the working tree again. When its content differs from the last
 * reading, now becomes when it changed, so checks that ran earlier read as
 * stale. Readings run one at a time.
 */
function refreshWork($: EngineInterface): Promise<void> {
  const gen = generation
  refreshing = refreshing
    .then(async () => {
      const reading = await readSnapshot($)
      if (!reading || gen !== generation) return
      const { snapshot, status } = reading
      await update($, LIVE, l => ({ ...l, git: { branch: status.branch, changed: status.files, ahead: status.ahead } }))
      const before = (await read($, BRIEF)).work.snapshot
      if (before && before.head === snapshot.head && sameDirty(before.dirty, snapshot.dirty)) return
      const differs = before !== null && (await contentChanged($, before, snapshot))
      const now = await $.clock.now()
      if (gen !== generation) return
      await commit($, b => ({ ...b, work: { snapshot, changedAt: differs ? now : b.work.changedAt } }))
    })
    .catch(() => undefined)

  return refreshing
}

// News for the agent ------------------------------------------------------------

async function addNews($: EngineInterface, line: string) {
  await update($, NEWS, n => [...n, line].slice(-20))
}

/** The news the agent has not heard, as one block; empties the queue. */
async function takeNews($: EngineInterface): Promise<string | null> {
  let news: string[] = []
  await update($, NEWS, n => {
    news = n
    return []
  })

  return news.length > 0 ? ['briefing: changes since you last looked.', ...news.map(n => `- ${n}`)].join('\n') : null
}

function noteActivity(line: string) {
  if (windowActivity.length < 60 && !windowActivity.includes(line)) windowActivity.push(line)
}

// Presence ------------------------------------------------------------

/** Marks the person active. Their first input after an absence ends the time the Away line counts. */
async function markActive($: EngineInterface) {
  const now = await $.clock.now()
  const p = await read($, PRESENCE)
  if (p.awayFrom !== null && p.returnedAt === null) {
    await update($, PRESENCE, q => ({ ...q, lastActiveAt: now, returnedAt: q.returnedAt ?? now }))
  } else if (now - p.lastActiveAt >= 20_000) {
    // Every keystroke would redraw the band; a 20-second grain is enough to tell away from here.
    await update($, PRESENCE, q => ({ ...q, lastActiveAt: now }))
  }
}

async function tick($: EngineInterface) {
  const now = await $.clock.now()
  const p = await read($, PRESENCE)
  if (p.awayFrom === null && p.lastActiveAt > 0 && now - p.lastActiveAt >= AWAY_MS) {
    await update($, PRESENCE, q => (q.awayFrom === null ? { ...q, awayFrom: q.lastActiveAt, returnedAt: null } : q))
  }
  const b = await read($, BRIEF)
  const kept = prune(b, now)
  if (
    kept.decisions.length + kept.tasks.length + kept.acts.length <
    b.decisions.length + b.tasks.length + b.acts.length
  )
    await commit($, x => prune(x, now))
}

/**
 * The person's own message, which ends any absence. One typed between turns
 * starts a new catch-up window and replaces what they asked for. Presses add
 * to it, since they answer within the same request.
 */
async function notePersonsMessage(
  $: EngineInterface,
  text: string,
  asked: Request[],
  how: 'prompt' | 'press' | 'mid-turn',
) {
  const now = await $.clock.now()
  await update($, PRESENCE, p => ({
    ...p,
    lastActiveAt: now,
    lastPromptAt: how === 'mid-turn' ? p.lastPromptAt : now,
    awayFrom: null,
    returnedAt: null,
  }))
  if (how === 'mid-turn') {
    windowPerson.push(text)
    requests.push(...asked)
    return
  }
  windowPerson = [text]
  windowActivity = []
  windowTrigger = null
  requests = how === 'prompt' ? [...asked] : [...requests, ...asked]
}

// Presses ------------------------------------------------------------

function requestsOf(pressed: PressLine[]): Request[] {
  return pressed.flatMap(l => (l.request ? [l.request] : []))
}

/**
 * Applies a press to the record. Its message goes to the agent with any other
 * presses made within a few seconds; its news waits for the next message.
 */
async function press(
  $: EngineInterface,
  run: (b: Brief, now: number) => Press,
  request: Request | null,
  settles?: { index: number },
) {
  const now = await $.clock.now()
  if (settles && now < pauseUntil) return
  const out: { press: Press | null } = { press: null }
  await commit($, b => {
    out.press = run(b, now)
    return out.press.brief
  })
  void markActive($)
  const r = out.press
  if (!r) return
  if (r.isStale) {
    $.ui.toast('Already settled')
    return
  }
  if (settles) {
    pauseUntil = now + DIGIT_PAUSE_MS
    // The cursor keeps this position, so the next item slides under it.
    await update($, CURSOR, c => ({ ...c, id: null, index: settles.index }))
  }
  if (r.news) await addNews($, r.news)
  if (r.message) await queue($, { text: r.message, request })
}

async function queue($: EngineInterface, line: PressLine) {
  const now = await $.clock.now()
  const o = await update($, OUTBOX, x =>
    x ? { ...x, lines: [...x.lines, line], lastAt: now } : { lines: [line], firstAt: now, lastAt: now },
  )
  flushTimer?.cancel()
  const at = Math.min((o?.lastAt ?? now) + BATCH_MS, (o?.firstAt ?? now) + BATCH_MAX_MS)
  flushTimer = $.clock.after(Math.max(0, at - now), () => {
    void flush($)
  })
}

async function takeOutbox($: EngineInterface): Promise<Outbox | null> {
  const out: { taken: Outbox | null } = { taken: null }
  await update($, OUTBOX, o => {
    out.taken = o
    return null
  })

  return out.taken
}

async function takePending($: EngineInterface): Promise<PressLine[]> {
  let taken: PressLine[] = []
  await update($, PENDING, p => {
    taken = p
    return []
  })

  return taken
}

/**
 * Sends the batched presses: as the person's own message when the agent is
 * idle, or, while it works, with its next tool result, so it can change
 * course within the turn.
 */
async function flush($: EngineInterface) {
  flushTimer = null
  const o = await takeOutbox($)
  if (!o || o.lines.length === 0) return
  if (!isTurnRunning) {
    await deliver($, o.lines, true)
    return
  }
  // They count from now: an act the agent takes after these presses is one the person asked for.
  await notePersonsMessage($, o.lines.map(l => l.text).join('\n'), requestsOf(o.lines), 'mid-turn')
  await update($, PENDING, p => [...p, ...o.lines])
  // The turn may have ended meanwhile, leaving no step to carry them.
  if (!isTurnRunning) {
    const left = await takePending($)
    if (left.length > 0) await deliver($, left, false)
  }
}

/** Sends presses as the person's own message, with any news in a row only the agent reads. */
async function deliver($: EngineInterface, pressed: PressLine[], isNew: boolean) {
  const text = pressed.map(l => l.text).join('\n')
  if (isNew) await notePersonsMessage($, text, requestsOf(pressed), 'press')
  const news = await takeNews($)
  if (news)
    await $.session
      .append({ message: { type: 'user', content: [{ type: 'text', text: news }] } })
      .catch(() => undefined)
  await $.prompt.submit({ text, asUser: true }).catch(async () => {
    // They go with the agent's next step or at the end of its next turn.
    await update($, PENDING, p => [...pressed, ...p])
    $.ui.toast('Could not send to Claude yet. It goes with the next turn.')
  })
}

async function answer($: EngineInterface, d: Decision, option: string, index: number) {
  await press($, (b, now) => pressOption(b, d.id, option, now), { words: option, question: d.question }, { index })
}

/** Leaves a decision to the agent, which counts as asking for what it recommended. */
async function leaveToAgent($: EngineInterface, d: Decision, index: number) {
  await press($, (b, now) => pressYourCall(b, d.id, now), d.pick ? { words: d.pick, question: d.question } : null, {
    index,
  })
}

async function dismiss($: EngineInterface, d: Decision, index: number) {
  await press($, (b, now) => pressDismiss(b, d.id, now), null, { index })
}

async function closeTask($: EngineInterface, t: Task, how: 'done' | 'wont', index: number) {
  await press($, (b, now) => pressTask(b, t.id, how, now), null, { index })
}

/**
 * Runs a held act as the person's own request, then tells the agent how it
 * went. It runs once: the record marks it running before the call. A held
 * discard runs only while the files are as they were when it was held.
 */
async function runAct($: EngineInterface, act: HeldAct, index: number) {
  const now = await $.clock.now()
  if (now < pauseUntil) return
  pauseUntil = now + DIGIT_PAUSE_MS
  void markActive($)
  if (act.verb === 'discard') await refreshWork($)
  const out: { act: HeldAct | null; isExpired: boolean } = { act: null, isExpired: false }
  await commit($, b => {
    const current = b.acts.find(a => a.id === act.id)
    out.isExpired = current?.status === 'held' && current.verb === 'discard' && b.work.changedAt > current.at
    if (out.isExpired) {
      out.act = null
      return settleAct(b, act.id, 'declined', 'The files changed after it was held, so it was not run.', now)
    }
    const s = startAct(b, act.id)
    out.act = s.act
    return s.brief
  })
  await update($, CURSOR, c => ({ ...c, id: null, index }))
  if (out.isExpired) {
    $.ui.toast('Not run: the files changed after it was held')
    await queue($, {
      text: `Held ${act.id}, "${act.summary}", was not run: the files changed after it was held, so it could discard newer work. If it is still needed, call it again, and it will wait for the person's press again.`,
      request: null,
    })
    return
  }
  const a = out.act
  if (!a) {
    $.ui.toast('Already settled')
    return
  }
  $.ui.invalidate('ui.render')
  // The held input is exactly what the agent called, so it fits the tool it names.
  const call = {
    ...a.input,
    tool: a.tool,
    consent: `The user pressed "Run" on held act ${a.id}, "${a.summary}", in the briefing pane.`,
  } as unknown as ToolCallArgs
  const r = await clearingDialog($, callKey(a.tool, a.input), () =>
    $.tool.call(call).catch((error: unknown): ToolCallResult => ({ deny: String(error) })),
  )
  const denied = typeof r.deny === 'string' ? r.deny : null
  const output = (r.text ?? '').trim()
  const status = denied !== null ? 'declined' : r.isError ? 'failed' : 'ran'
  const result = denied ?? (output.slice(0, 600) || null)
  const later = await $.clock.now()
  await commit($, b => settleAct(b, a.id, status, result, later))
  // A push or a discard changes what git reports.
  void refreshWork($)
  const said =
    status === 'ran'
      ? `I ran held ${a.id}, "${a.summary}".${output ? `\nOutput:\n${output.slice(0, 1200)}` : ''}`
      : status === 'failed'
        ? `I ran held ${a.id}, "${a.summary}", and it failed:\n${output.slice(0, 1200)}`
        : `Held ${a.id}, "${a.summary}", did not run: ${result}`
  await queue($, { text: said, request: null })
}

async function declineAct($: EngineInterface, act: HeldAct, index: number) {
  const now = await $.clock.now()
  if (now < pauseUntil) return
  pauseUntil = now + DIGIT_PAUSE_MS
  const before = await read($, BRIEF)
  if (before.acts.find(a => a.id === act.id)?.status !== 'held') {
    $.ui.toast('Already settled')
    return
  }
  await commit($, b => settleAct(b, act.id, 'declined', 'declined by the person', now))
  await update($, CURSOR, c => ({ ...c, id: null, index }))
  void markActive($)
  await queue($, { text: `Don't run held ${act.id}, "${act.summary}".`, request: null })
}

/** Takes a task's first step: copies its command, or opens its file or link. */
async function useHelper($: EngineInterface, t: Task, p: UiPressArgument) {
  const helper = t.helper
  if (!helper) return
  void markActive($)
  if (helper.kind === 'run') {
    const r = await $.ui.copy({ text: helper.command, surface: p.surface })
    $.ui.toast(r.isCopied ? 'Copied. Type ! in the prompt, paste, and press Enter.' : 'Could not copy to the clipboard')
    return
  }
  const target =
    helper.kind === 'link' ? helper.url : helper.path.startsWith('/') ? helper.path : `${root}/${helper.path}`
  const r = await $.process.run(['open', target], { timeoutMs: 10_000 }).catch(() => null)
  if (!r || r.exitCode !== 0) $.ui.toast(`Could not open ${fit(target, 60)}`)
}

/** What an item is, for an Explain answer. */
function aboutText(b: Brief, id: string): string | null {
  const d = b.decisions.find(x => x.id === id)
  if (d) {
    const pick = d.pick
      ? `\nYou ${d.status === 'waiting' ? 'recommended' : 'chose'}: ${d.pick}.${d.reason ? ` ${d.reason}` : ''}`
      : ''

    return `${d.id}: ${d.question}${d.options.length > 0 ? `\nOptions: ${d.options.join(' / ')}` : ''}${pick}`
  }
  const t = b.tasks.find(x => x.id === id)
  if (t) return `${t.id}, a task you left for the person: ${t.what}`
  const a = b.acts.find(x => x.id === id)
  if (a)
    return `${a.id}, an act held for the person to run: ${a.summary} (${a.tool} ${JSON.stringify(a.input).slice(0, 400)})`

  return null
}

/**
 * Explains an item in the pane, never in the chat: from a fork of the agent's
 * own context when it has one, else from the item and the agent's last reply.
 */
async function explain($: EngineInterface, id: string) {
  const about = aboutText(await read($, BRIEF), id)
  if (!about) return
  void markActive($)
  await update($, EXPLAINED, x => ({ ...x, [id]: { text: null, isLoading: true, error: null } }))
  const ask = `The person pressed Explain on this item in their briefing, the record of this session they see beside the chat:\n${about}\n\nExplain it to them in two to four short sentences of plain words: why it came up, and what each option leads to. Answer only with the explanation. Do not use tools, and do not act on it.`
  let r = await $.model.fork({ prompt: ask }).catch(() => null)
  if (!r || !r.isAnswered) {
    r = await $.model
      .complete({
        model: MODEL,
        system:
          'You explain one item from a coding agent’s session to the person who runs it. Plain words, two to four short sentences.',
        prompt: `${ask}\n\nThe agent's last reply, for context:\n${lastReply.slice(-4000) || '(none)'}`,
        maxTokens: 400,
        effort: 'low',
        timeoutMs: 45_000,
      })
      .catch(() => null)
  }
  const text = r?.isAnswered ? r.text.trim() : null
  await update($, EXPLAINED, x => ({
    ...x,
    [id]: { text, isLoading: false, error: text ? null : 'Could not explain it. Try again, or ask in the chat.' },
  }))
}

/** Selects a row and scrolls the pane the least that shows it whole. */
async function select($: EngineInterface, id: string, index: number, section: Cursor['section']) {
  await update($, CURSOR, () => ({ id, index, section }))
  void markActive($)
  await $.ui.scroll({ in: PANE, to: { key: `row-${id}` }, block: 'nearest' }).catch(() => undefined)
}

// The agent's turn ------------------------------------------------------------

async function recordTool($: EngineInterface, raw: Record<string, unknown>): Promise<string> {
  const input = readInput(raw)
  const now = await $.clock.now()
  let reply = ''
  await commit($, b => {
    const r = applyRecord(b, input, now)
    reply = r.reply
    return r.brief
  })

  return reply
}

/** Writes the catch-up for the current window, after a reply. Runs one at a time. */
function summarize($: EngineInterface, reply: string) {
  const facts = { person: [...windowPerson], trigger: windowTrigger, activity: [...windowActivity], reply }
  const gen = generation
  summaries = summaries
    .then(async () => {
      if (gen !== generation) return
      await update($, LIVE, l => ({ ...l, isSummarizing: true, summaryError: null }))
      await refreshWork($)
      const [b, p] = await Promise.all([read($, BRIEF), read($, PRESENCE)])
      const previous = b.catchUp && b.catchUp.since === p.lastPromptAt ? b.catchUp : null
      const r = await $.model
        .complete({
          model: MODEL,
          system: CATCH_UP_SYSTEM,
          prompt: buildPrompt(b, previous, facts),
          maxTokens: 400,
          effort: 'low',
          timeoutMs: 45_000,
        })
        .catch(() => null)
      if (gen !== generation) return
      const parsed = r?.isAnswered ? parseCatchUp(r.text) : null
      const now = await $.clock.now()
      if (parsed) await commit($, x => ({ ...x, catchUp: { lines: parsed, since: p.lastPromptAt, at: now } }))
      const error = parsed
        ? null
        : !r
          ? 'the catch-up could not run'
          : r.isAnswered
            ? 'the catch-up came back unreadable'
            : `the catch-up failed (${r.reason})`
      await update($, LIVE, l => ({ ...l, isSummarizing: false, summaryError: error }))
    })
    .catch(() => undefined)
}

/** Records the result of each check a Bash command ran. */
async function recordChecks($: EngineInterface, command: string, output: string, isError: boolean) {
  const calls = checksIn(command)
  if (calls.length === 0) return
  const results = readResults(command, calls, output, isError)
  // Edits made before the check count as before it.
  await refreshWork($)
  const now = await $.clock.now()
  await commit($, b =>
    results.reduce(
      (x, r) =>
        recordCheck(x, { name: r.call.name, kind: r.call.kind, result: r.result, summary: r.summary, ranAt: now }),
      b,
    ),
  )
}

// Sessions ------------------------------------------------------------

/** Loads this session's record, and clears what was live before it: a run cut short, a dialog, a catch-up in flight. */
async function startSession($: EngineInterface, id?: string) {
  sessionId = id || (await $.session.id())
  hasToldFull = false
  published = null
  const now = await $.clock.now()
  if (isEmpty(await read($, BRIEF))) {
    const saved = await load($)
    if (saved) await update($, BRIEF, () => prune(saved, now))
  }
  if ((await read($, BRIEF)).acts.some(a => a.status === 'running')) {
    await commit($, b => ({
      ...b,
      acts: b.acts.map(a =>
        a.status === 'running'
          ? {
              ...a,
              status: 'failed' as const,
              result: 'Stopped before it finished. Check whether it ran.',
              settledAt: now,
            }
          : a,
      ),
    }))
  }
  await update($, LIVE, l => ({ ...l, isSummarizing: false, isWorking: false, dialogs: [] }))
  if (await read($, OUTBOX)) flushTimer = $.clock.after(BATCH_MS, () => void flush($))
  void refreshWork($)
  publishLine($)
}

/** Forgets the session that ended. /clear and /resume switch sessions in the same process. */
async function endSession($: EngineInterface) {
  generation++
  flushTimer?.cancel()
  flushTimer = null
  await update($, BRIEF, () => EMPTY)
  await update($, LIVE, l => ({ ...l, dialogs: [], isWorking: false, isSummarizing: false, summaryError: null }))
  await update($, PRESENCE, p => ({ ...p, awayFrom: null, returnedAt: null }))
  await update($, OUTBOX, () => null)
  await update($, PENDING, () => [])
  await update($, NEWS, () => [])
  await update($, EXPLAINED, () => ({}))
  await update($, CURSOR, () => ({ id: null, index: 0, section: null }))
  sessionId = ''
  windowPerson = []
  windowActivity = []
  windowTrigger = null
  requests = []
  lastReply = ''
  hasToldFull = false
}

// Drawing ------------------------------------------------------------

/** A waiting thing in full, as the band's "Needs you" line says it. */
function waitingText(w: Waiting): { id: string | null; text: string } {
  switch (w.kind) {
    case 'stop':
      return { id: null, text: `${stopText(w.stop)}. ${stopFix(w.stop)}` }
    case 'dialog':
      return { id: null, text: dialogText(w.dialog) }
    case 'act':
      return { id: w.act.id, text: `Run held: ${w.act.summary}` }
    case 'decision':
      return { id: w.decision.id, text: w.decision.question }
    case 'task':
      return { id: w.task.id, text: w.task.what }
  }
}

type Key = {
  key: string
  label: string
  hotkey: string
  isPrimary?: boolean
  isDim?: boolean
  onPress: (p: UiPressArgument) => void
}

/**
 * A decision's keys. 1 is always Claude's pick: the recommended or taken
 * option, or "Your call" when it has none. The other options follow on 2 to 9.
 * The option it already says is left out.
 */
function decisionKeys($: EngineInterface, d: Decision, index: number): Key[] {
  const keys: Key[] = []
  if (d.status !== 'withdrawn') {
    const current = d.status === 'made' ? d.pick : d.status === 'waiting' ? null : d.outcome
    // An open question's recommendation is its one option.
    const choices = d.options.length > 0 ? pickFirst(d.options, d.pick) : d.pick ? [d.pick] : []
    const hasPick = d.pick !== null && choices[0] === d.pick
    const first = hasPick ? 1 : 2
    if (!hasPick && d.status === 'waiting')
      keys.push({
        key: `yours-${d.id}`,
        label: 'Your call',
        hotkey: '1',
        onPress: () => void leaveToAgent($, d, index),
      })
    choices.slice(0, 10 - first).forEach((option, n) => {
      if (option === current) return
      keys.push({
        key: `option-${d.id}-${n}`,
        label: fit(option, 32),
        hotkey: String(n + first),
        isPrimary: n === 0 && hasPick,
        onPress: () => void answer($, d, option, index),
      })
    })
  }
  keys.push({
    key: `explain-${d.id}`,
    label: 'Explain',
    hotkey: 'e',
    isDim: true,
    onPress: () => void explain($, d.id),
  })
  if (d.status === 'waiting')
    keys.push({
      key: `dismiss-${d.id}`,
      label: 'Dismiss',
      hotkey: 'x',
      isDim: true,
      onPress: () => void dismiss($, d, index),
    })

  return keys
}

function taskKeys($: EngineInterface, t: Task, index: number): Key[] {
  const helper = t.helper
  const first: Key[] = helper
    ? [
        {
          key: `helper-${t.id}`,
          label:
            helper.kind === 'run'
              ? `Copy ${fit(helper.command, 28)}`
              : helper.kind === 'link'
                ? `Open ${fit(helper.url.replace(/^https?:\/\//, ''), 28)}`
                : `Open ${fit(helper.path.replace(/^.*\//, ''), 28)}`,
          hotkey: '1',
          isPrimary: true,
          onPress: p => void useHelper($, t, p),
        },
      ]
    : []
  return [
    ...first,
    { key: `done-${t.id}`, label: 'Done', hotkey: 'd', onPress: () => void closeTask($, t, 'done', index) },
    { key: `explain-${t.id}`, label: 'Explain', hotkey: 'e', isDim: true, onPress: () => void explain($, t.id) },
    {
      key: `wont-${t.id}`,
      label: "Won't do",
      hotkey: 'x',
      isDim: true,
      onPress: () => void closeTask($, t, 'wont', index),
    },
  ]
}

function actKeys($: EngineInterface, a: HeldAct, index: number): Key[] {
  if (a.status !== 'held') return []

  return [
    { key: `run-${a.id}`, label: 'Run', hotkey: '1', isPrimary: true, onPress: () => void runAct($, a, index) },
    { key: `explain-${a.id}`, label: 'Explain', hotkey: 'e', isDim: true, onPress: () => void explain($, a.id) },
    { key: `decline-${a.id}`, label: 'Decline', hotkey: 'x', isDim: true, onPress: () => void declineAct($, a, index) },
  ]
}

/** Settled items, newest first: what the person or the agent closed, for a second look. */
function earlier(b: Brief): { id: string; at: number; text: string; outcome: string; decision: Decision | null }[] {
  const decisions = b.decisions
    .filter(d => d.settledAt !== null)
    .map(d => ({
      id: d.id,
      at: d.settledAt ?? d.at,
      text: d.question,
      outcome:
        d.status === 'withdrawn'
          ? d.settledBy === 'person'
            ? 'dismissed'
            : `withdrawn: ${d.outcome ?? 'no longer applies'}`
          : `${d.outcome ?? ''}${d.settledBy === 'person' ? (d.isDialog ? ', in a dialog' : ', by you') : ''}`,
      decision: d,
    }))
  const tasks = b.tasks
    .filter(t => t.settledAt !== null)
    .map(t => ({
      id: t.id,
      at: t.settledAt ?? t.at,
      text: t.what,
      outcome: t.status === 'done' ? 'done' : t.status === 'wont' ? "won't do" : 'withdrawn',
      decision: null,
    }))
  const acts = b.acts
    .filter(a => a.settledAt !== null)
    .map(a => ({ id: a.id, at: a.settledAt ?? a.at, text: a.summary, outcome: a.status, decision: null }))

  return [...decisions, ...tasks, ...acts].sort((x, y) => y.at - x.at).slice(0, EARLIER_MAX)
}

/** The pane's height when it opens: room for every section and one expanded item, within reason. */
function paneHeight(b: Brief, live: Live): number {
  const section = (n: number) => (n > 0 ? n + 2 : 0)
  const made = madeFor(b).length
  const verdict = 2 + Math.max(1, b.catchUp?.lines.length ?? 0) + (b.stop ? 1 : 0)
  const goal = b.goal || b.checks.length > 0 || live.git ? 3 + Math.min(b.checks.length, 4) + (live.git ? 1 : 0) : 0
  const content =
    verdict +
    section(waitingOn(b, live.dialogs).length) +
    goal +
    section(Math.min(made, CHOSE_MAX) + (made > CHOSE_MAX ? 1 : 0)) +
    section(earlier(b).length)

  // The selected item adds its detail and keys, and the footer one more row.
  return Math.min(40, Math.max(12, content + 7))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    isOn = e.isInteractive
    if (!isOn) return r
    root = await $.session.root()
    dir = `${(await $.env.get('HOME')) ?? ''}/.claude/briefing/sessions`
    const git = await $.process
      .run(['git', 'rev-parse', '--show-toplevel'], { cwd: root, timeoutMs: 5000 })
      .catch(() => null)
    top = git && git.exitCode === 0 ? git.stdout.trim() || null : null

    await $.command.register({
      name: 'briefing',
      description: 'What this session needs from you, what Claude chose, and where the work stands',
    })
    await $.tool.register({ name: TOOL_NAME, description: TOOL_DESCRIPTION, inputSchema: TOOL_SCHEMA })
    const theme = (await $.config.list().catch(() => [])).find(row => row.key === 'theme')?.value
    await update($, IS_DARK_THEME, () => theme === 'dark')
    // A resumed session finds its record on disk; a hot reload keeps it in state.
    await startSession($)
    $.clock.every(60_000, () => {
      void tick($)
    })
    void $.process
      .run(['find', dir, '-name', '*.json', '-mtime', `+${KEEP_DAYS}`, '-delete'], { timeoutMs: 10_000 })
      .catch(() => undefined)

    return r
  })

  on('session.end', async ($, e, next) => {
    if (isOn) {
      // The Herdr pane outlives the session, so the line goes with it.
      await publishLine($, true)
      if (e.reason === 'clear' || e.reason === 'resume') await endSession($)
    }

    return next(e)
  })

  // After /clear or /resume the process goes on as another session, whose record this loads.
  // The event names that session; `$.session.id()` still answers the old one during a resume.
  on('classic.SessionStart', async ($, e, next) => {
    const r = await next(e)
    if (isOn && dir && (e.source === 'clear' || e.source === 'resume')) await startSession($, e.session_id)

    return r
  })

  on('prompt.compose', async ($, e, next) => {
    const r = await next(e)
    if (!isOn) return r

    return { ...r, sections: [...r.sections, { id: 'briefing:guidance', text: GUIDANCE, scope: 'session' as const }] }
  })

  // After a compaction, the agent gets the whole record again.
  on('prompt.context', async ($, e, next) => {
    const r = await next(e)
    if (!isOn) return r
    const text = fullText(await read($, BRIEF))
    if (!text) return r
    hasToldFull = true

    return { ...r, blocks: [...r.blocks, { name: 'briefing', text }] }
  })

  on('prompt.submit', async ($, e, next) => {
    if (!isOn) return next(e)
    const origin = e.origin
    if (origin.kind === 'plugin' && origin.name === 'briefing') return next(e)
    // The person's own words: typed, or sent as theirs by another plugin.
    const isPersons =
      origin.kind === 'composer' || origin.kind === 'bridge' || (origin.kind === 'plugin' && origin.asUser === true)
    if (!isPersons) {
      if (!e.turnId) windowTrigger = origin.kind

      return next(e)
    }
    // A message between turns may answer the last reply's question; one sent mid-turn does not.
    const isMidTurn = Boolean(e.turnId)
    await notePersonsMessage(
      $,
      e.text,
      [{ words: e.text, question: isMidTurn ? null : lastQuestion(lastReply) }],
      isMidTurn ? 'mid-turn' : 'prompt',
    )
    const context: string[] = []
    if (!hasToldFull) {
      const full = fullText(await read($, BRIEF))
      if (full) context.push(full)
      hasToldFull = true
    }
    const news = await takeNews($)
    if (news) context.push(news)

    return context.length > 0 ? next({ ...e, context: [...(e.context ?? []), ...context] }) : next(e)
  })

  on('prompt.edit', ($, e, next) => {
    if (isOn) void markActive($)

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    if (isOn) {
      isTurnRunning = true
      await update($, LIVE, l => ({ ...l, isWorking: true }))
      if ((await read($, BRIEF)).stop) {
        const now = await $.clock.now()
        await commit($, b => setStop(b, null, now))
      }
    }

    return next(e)
  })

  // The record tool is listed up front and needs no permission prompt.
  on('tool.describe', { tool: TOOL }, async ($, e, next) => ({ ...(await next(e)), isDeferred: false }))
  on('tool.check', { tool: TOOL }, () => ({ decision: 'allow' }))

  on('tool.call', async ($, e, next) => {
    if (!isOn) return next(e)
    const tool = String(e.tool)
    const { tool: _tool, tool_use_id: _id, agentId, ...input } = e as unknown as Record<string, unknown>
    // The record tool is served here: a matcher that names it does not type-check, since the engine has no types for a tool registered at run time.
    if (tool === TOOL) return { result: await recordTool($, input) }
    // A held act this mod runs for the person is theirs; it is not held again.
    if (next.origin.plugin === 'briefing') return next(e)

    const acts = outward(tool, input)
    const unasked = acts.filter(a => !wasAsked(a.verb, requests))
    if (unasked.length > 0) {
      const verb = acts.some(a => a.verb === 'discard') ? 'discard' : (unasked[0]?.verb ?? 'send')
      const summary = acts.map(a => a.summary).join('; ')
      // A held discard runs later only while the files stay as they are now, so read them first.
      if (verb === 'discard') await refreshWork($)
      const now = await $.clock.now()
      const out = { id: '' }
      await commit($, b => {
        const h = holdAct(b, { summary, verb, tool, input, at: now })
        out.id = h.id
        return h.brief
      })
      const why = isAlwaysHeld(verb)
        ? 'acts like this always wait for their press'
        : 'their latest message did not ask for it'

      return {
        deny: `The briefing held this for the person as ${out.id} ("${summary}"), because ${why}. They see it with a Run button, and you will be told when they run or decline it. Do not retry it or do it another way. Go on with other work, or end your turn.`,
      }
    }

    if (!agentId) {
      const what = doingNow(tool, input)
      if (what) noteActivity(what)
    }

    if (tool === 'AskUserQuestion' && !agentId) {
      const questions = (Array.isArray(input.questions) ? input.questions : []) as {
        question?: string
        header?: string
        options?: { label?: string }[]
      }[]
      const key = callKey(tool, input)
      await openDialog($, {
        kind: 'question',
        text: questions[0]?.question ?? 'A question',
        label: questions[0]?.header ?? null,
        key,
        since: await $.clock.now(),
      })
      const r = await clearingDialog($, key, () => next(e))
      const result = (r.result && typeof r.result === 'object' ? r.result : {}) as {
        answers?: Record<string, string>
        afkTimeoutMs?: number
      }
      const answers = result.answers ?? {}
      // A dialog that resolved on its own while the person was away holds no answer of theirs.
      const isTimedOut = typeof result.afkTimeoutMs === 'number'
      const answered = questions
        .map(q => ({
          question: q.question ?? '',
          label: q.header ?? null,
          options: (q.options ?? []).map(o => o.label ?? ''),
          answer: answers[q.question ?? ''] ?? '',
        }))
        .filter(a => a.question && a.answer)
      if (answered.length > 0) {
        const now = await $.clock.now()
        await commit($, b => recordDialog(b, answered, isTimedOut, now))
        if (!isTimedOut) {
          requests.push(...answered.map(a => ({ words: a.answer, question: a.question })))
          windowPerson.push(answered.map(a => `${a.question} ${a.answer}`).join('\n'))
        }
      }

      return r
    }

    const r = await clearingDialog($, callKey(tool, input), () => next(e))
    if (typeof r.deny === 'string') return r
    const output = (r.result && typeof r.result === 'object' ? r.result : {}) as {
      interrupted?: boolean
      backgroundTaskId?: string
    }
    // A command that was cut off or moved to the background has not finished its checks.
    if (
      tool === 'Bash' &&
      typeof input.command === 'string' &&
      !input.run_in_background &&
      !output.interrupted &&
      !output.backgroundTaskId
    ) {
      await recordChecks($, input.command, r.text ?? '', r.isError === true)
    }
    // Presses made while the agent worked reach it here, at its next step.
    if (!agentId) {
      const pending = await takePending($)
      if (pending.length > 0) {
        const news = await takeNews($)
        const said = `The person answered in their briefing while you worked:\n${pending.map(l => l.text).join('\n')}${news ? `\n\n${news}` : ''}`

        return { ...r, context: [...(r.context ?? []), said] }
      }
    }

    return r
  })

  // The record tool's row shows its reply, which names what it recorded, instead of every argument.
  on('ui.render', { component: 'ToolUse', props: { tool: TOOL } }, ($, e, next) =>
    next({ ...e, props: { ...e.props, input: {} } }),
  )

  // A question dialog is mirrored from its tool call, which also raises this.
  on('classic.PermissionRequest', async ($, e, next) => {
    if (isOn && e.tool_name !== 'AskUserQuestion') {
      const input = (e.tool_input ?? {}) as Record<string, unknown>
      await openDialog($, {
        kind: 'permission',
        text: permissionText(e.tool_name, input),
        label: null,
        key: callKey(e.tool_name, input),
        since: await $.clock.now(),
      })
    }

    return next(e)
  })

  on('classic.StopFailure', async ($, e, next) => {
    const r = await next(e)
    if (!isOn || e.agent_id) return r
    const now = await $.clock.now()
    const stop = { kind: stopKindOf(String(e.error)), detail: String(e.error), at: now }
    await commit($, b => setStop(b, stop, now))
    await addNews($, `Your last turn stopped: ${stopText(stop)}.`)

    return r
  })

  // The end-of-turn check: questions no item records, or a success a check
  // contradicts, send the agent back once to fix its own record.
  on('classic.Stop', async ($, e, next) => {
    const r = await next(e)
    if (!isOn || e.agent_id || e.stop_hook_active || r.block) return r
    // Presses still waiting reach the agent as a message next, and may change everything.
    if ((await read($, PENDING)).length > 0 || (await read($, OUTBOX))) return r
    const reply = e.last_assistant_message ?? ''
    if (!reply.trim()) return r
    const before = await read($, BRIEF)
    const questions = unrecordedQuestions(
      reply,
      before.decisions.filter(d => d.status === 'waiting' || d.status === 'made'),
    )
    let claim = null
    if (before.checks.length > 0) {
      await refreshWork($)
      const b = await read($, BRIEF)
      claim = contradictedClaim(reply, b.checks, b.work.changedAt)
    }
    const message = checkMessage(
      questions,
      claim,
      before.decisions.filter(d => d.status === 'waiting'),
    )

    return message ? { ...r, block: message } : r
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (!isOn || e.agentId) return r
    isTurnRunning = false
    await update($, LIVE, l => ({ ...l, isWorking: false, dialogs: [] }))
    publishLine($)
    // The catch-up reads this turn's window, so it starts before presses open the next one.
    if (e.reason === 'answer' && e.answer.trim() !== '') {
      lastReply = e.answer
      summarize($, e.answer)
    }
    // Presses no tool result carried go now, as the person's own message.
    const pending = await takePending($)
    if (pending.length > 0) void deliver($, pending, true)

    return r
  })

  // The person's own `!` and slash commands reach no prompt.submit hook, only these rows.
  on('session.append', { door: 'command' }, async ($, e, next) => {
    const r = await next(e)
    if (!isOn || e.agentId) return r
    const row = readCommandRow(e.message.content.map(block => (block.type === 'text' ? block.text : '')).join(''))
    if (!row) return r
    void markActive($)
    if (row.kind === 'shell') {
      shellCommand = row.command
      windowPerson.push(`$ ${row.command}`)
    } else if (row.kind === 'output') {
      // The row has no exit code; a run with nothing on stderr counts as done.
      const command = shellCommand
      shellCommand = null
      if (command && !row.stderr) {
        const now = await $.clock.now()
        let closed: Task[] = []
        await commit($, b => {
          const c = closeTasksRun(b, command, now)
          closed = c.closed
          return c.brief
        })
        for (const t of closed) await addNews($, `${t.id} "${t.what}" is done: the person ran its command.`)
      }
    } else if (row.name === 'login') {
      const b = await read($, BRIEF)
      if (b.stop?.kind === 'sign-in') {
        const now = await $.clock.now()
        await commit($, x => setStop(x, null, now))
      }
    } else if (row.name !== 'briefing') {
      windowPerson.push(`/${row.name} ${row.args}`.trim())
    }

    return r
  })

  on('command.run', { command: 'briefing' }, async $ => {
    void markActive($)
    // The pane opens on its first row, the most pressing thing.
    await update($, CURSOR, () => ({ id: null, index: 0, section: null }))
    const [b, live] = await Promise.all([read($, BRIEF), read($, LIVE)])
    const opened = await $.ui.open({
      id: PANE,
      title: 'Briefing',
      focus: true,
      closeOnEscape: true,
      rows: paneHeight(b, live),
    })
    $.ui.invalidate('ui.render')
    void refreshWork($)

    return opened.isPlaced ? {} : { text: `The briefing could not open here: ${opened.reason}` }
  })

  on('ui.close', async ($, e, next) => {
    const r = await next(e)
    $.ui.invalidate('ui.render')

    return r
  })

  on('config.set', { key: 'theme' }, async ($, e, next) => {
    const r = await next(e)
    const theme = (await $.config.list().catch(() => [])).find(row => row.key === 'theme')?.value
    await update($, IS_DARK_THEME, () => theme === 'dark')

    return r
  })

  // The band names one loud thing, at most one problem, and the absence. It is
  // silent while the agent works, unless something waits on the person.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!isOn || e.props.hasSurvey) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const [b, live, p, panes, now] = await Promise.all([
      read($, BRIEF),
      read($, LIVE),
      read($, PRESENCE),
      $.ui.panes().catch(() => []),
      $.clock.now(),
    ])
    const isWorking = e.props.isWorking
    const isPaneShown = panes.some(x => x.id === PANE && x.isShown)
    const waiting = waitingOn(b, live.dialogs)
    const first = waiting[0]
    const rows: JSX.Element[] = []
    const hint = !isPaneShown ? <Text dimColor>{'   /briefing'}</Text> : null
    const problem = isWorking ? null : checkProblem(b.checks, b.work.changedAt)
    const problemText = problem ? (
      <Text color={problem.isFailure ? STOPPED : undefined} dimColor={!problem.isFailure}>{` · ${problem.text}`}</Text>
    ) : null
    const isFresh = b.catchUp !== null && b.catchUp.since === p.lastPromptAt

    if (isPaneShown) {
      if (!isWorking && isFresh && b.catchUp) {
        rows.push(
          <Text wrap="truncate-end" dimColor>
            Now: {b.catchUp.lines[0]}
          </Text>,
        )
      }
    } else if (first?.kind === 'stop') {
      rows.push(
        <Text wrap="truncate-end">
          <Text color={STOPPED}>
            Stopped {ago(now - first.stop.at)}: {stopText(first.stop)}.
          </Text>{' '}
          {stopFix(first.stop)}
          {hint}
        </Text>,
      )
    } else if (first) {
      const { id, text } = waitingText(first)
      rows.push(
        <Text wrap="truncate-end">
          <Text color={NEEDS}>Needs you: </Text>
          {id ? <Text dimColor>{id} </Text> : null}
          {text}
          {waiting.length > 1 ? <Text dimColor> +{waiting.length - 1}</Text> : null}
          {problemText}
          {hint}
        </Text>,
      )
    } else if (!isWorking && isFresh && b.catchUp) {
      rows.push(
        <Text wrap="truncate-end">
          <Text dimColor>Now: {b.catchUp.lines[0]}</Text>
          {problemText}
        </Text>,
      )
    }

    const away = p.awayFrom !== null && !isPaneShown ? awaySummary(b.log, p.awayFrom, p.returnedAt ?? now) : null
    if (away) {
      rows.push(
        <Text wrap="truncate-end" dimColor>
          {away}
        </Text>,
      )
    }
    if (rows.length === 0) return next(e)
    const inner = await next(e)

    return (
      <Box flexDirection="column">
        {rows}
        {inner}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const [b, live, p, cursor, explained, isDark, now] = await Promise.all([
      read($, BRIEF),
      read($, LIVE),
      read($, PRESENCE),
      read($, CURSOR),
      read($, EXPLAINED),
      read($, IS_DARK_THEME),
      $.clock.now(),
    ])
    const isFocused = e.props.isFocused
    const waiting = waitingOn(b, live.dialogs)
    const made = madeFor(b)
    const settled = earlier(b)

    // Every selectable row in order: the cursor, j and k, and the drawing all read this.
    type Row = {
      id: string
      section: Cursor['section']
      handle: string
      line: JSX.Element
      body: () => JSX.Element | null
      keys: (index: number) => Key[]
      bar: string | undefined
    }
    const needsRows: Row[] = waiting.map((w): Row => {
      switch (w.kind) {
        case 'stop':
          return {
            id: 'stop',
            section: 'needs',
            handle: '!',
            bar: STOPPED,
            line: (
              <Text wrap="truncate-end" color={STOPPED}>
                Stopped: {stopText(w.stop)}
              </Text>
            ),
            body: () => <Text wrap="wrap">{stopFix(w.stop)}</Text>,
            keys: () => [],
          }
        case 'dialog':
          return {
            id: 'dialog',
            section: 'needs',
            handle: '?',
            bar: NEEDS,
            line: <Text wrap="truncate-end">{dialogText(w.dialog)}</Text>,
            body: () => <Text dimColor>Answer it in the dialog below.</Text>,
            keys: () => [],
          }
        case 'act': {
          const a = w.act
          const isRunning = a.status === 'running'
          return {
            id: a.id,
            section: 'needs',
            handle: a.id,
            bar: NEEDS,
            line: (
              <Text wrap="truncate-end">
                <Text color={NEEDS}>{isRunning ? 'Running: ' : 'Run held: '}</Text>
                {a.summary}
              </Text>
            ),
            body: () => (
              <Box flexDirection="column">
                <Text wrap="wrap" dimColor>
                  {a.tool === 'Bash' && typeof a.input.command === 'string'
                    ? `$ ${a.input.command}`
                    : `${a.tool} ${JSON.stringify(a.input)}`}
                </Text>
                <Text dimColor>
                  {isRunning
                    ? 'Running…'
                    : isAlwaysHeld(a.verb)
                      ? 'Claude asked to run this. This kind of act always waits for your press.'
                      : 'Claude asked to run this. Your messages did not ask for it by name, so it waits for your press.'}
                </Text>
              </Box>
            ),
            keys: (index: number) => actKeys($, a, index),
          }
        }
        case 'decision': {
          const d = w.decision
          return {
            id: d.id,
            section: 'needs',
            handle: d.id,
            bar: NEEDS,
            line: <Text wrap="truncate-end">{d.question}</Text>,
            body: () => (
              <Box flexDirection="column">
                {d.pick ? (
                  <Text wrap="wrap">
                    <Text dimColor>Recommended: </Text>
                    <Text bold>{d.pick}</Text>
                    {d.reason ? <Text>. {d.reason}</Text> : null}
                  </Text>
                ) : d.reason ? (
                  <Text wrap="wrap" dimColor>
                    {d.reason}
                  </Text>
                ) : null}
                {d.detail ? (
                  <Text wrap="wrap" dimColor>
                    {d.detail}
                  </Text>
                ) : null}
                {d.options.length === 0 ? (
                  <Text dimColor>Answer it in your own message, or leave it to Claude.</Text>
                ) : null}
              </Box>
            ),
            keys: (index: number) => decisionKeys($, d, index),
          }
        }
        case 'task': {
          const t = w.task
          return {
            id: t.id,
            section: 'needs',
            handle: t.id,
            bar: NEEDS,
            line: (
              <Text wrap="truncate-end">
                <Text color={NEEDS}>Your task: </Text>
                {t.what}
              </Text>
            ),
            body: () =>
              t.helper?.kind === 'run' ? (
                <Text wrap="wrap" dimColor>
                  Run ! {t.helper.command} in the prompt; the task closes when it succeeds.
                </Text>
              ) : null,
            keys: (index: number) => taskKeys($, t, index),
          }
        }
      }
    })
    const choseRows: Row[] = made.slice(0, CHOSE_MAX).map(d => {
      const others = d.options.filter(o => o !== d.pick)

      return {
        id: d.id,
        section: 'chose',
        handle: d.id,
        bar: CLAUDE,
        // Wrapped, since what Claude took comes last and a cut line would hide it.
        line: d.pick ? (
          <Text wrap="wrap">
            {d.question} → <Text bold>{d.pick}</Text>
            {others.length > 0 ? <Text dimColor>, not {others.join(' or ')}</Text> : null}
          </Text>
        ) : (
          <Text wrap="wrap">
            {d.question} → <Text dimColor>left to Claude, not decided yet</Text>
          </Text>
        ),
        body: () => (
          <Box flexDirection="column">
            {d.reason ? <Text wrap="wrap">{d.reason}</Text> : null}
            {d.detail ? (
              <Text wrap="wrap" dimColor>
                {d.detail}
              </Text>
            ) : null}
            {d.outcome === 'left to you' ? <Text dimColor>You left this to Claude.</Text> : null}
            {d.isTimedOut ? (
              <Text dimColor>
                Claude asked this in a dialog that timed out while you were away, and went on with this answer.
              </Text>
            ) : null}
          </Box>
        ),
        keys: (index: number) => decisionKeys($, d, index),
      }
    })
    const earlierRows: Row[] = settled.map(s => ({
      id: s.id,
      section: 'earlier',
      handle: s.id,
      bar: CLAUDE,
      line: (
        <Text wrap="truncate-end" dimColor>
          {s.text} → {s.outcome}
        </Text>
      ),
      body: () => null,
      keys: (index: number) => (s.decision ? decisionKeys($, s.decision, index) : []),
    }))
    const rows = [...needsRows, ...choseRows, ...earlierRows]
    const ids = rows.map(r => r.id)
    // The selected row, while it stays in its section; else the row now at its position.
    const byId = cursor.id === null ? -1 : ids.indexOf(cursor.id)
    const at =
      rows.length === 0
        ? -1
        : byId >= 0 && rows[byId]?.section === cursor.section
          ? byId
          : Math.min(cursor.index, rows.length - 1)

    const keyRow = (keys: Key[]) => (
      <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
        {keys.map(k => (
          <Button
            plain
            key={k.key}
            label={k.label}
            hotkey={k.hotkey}
            {...(k.isPrimary ? { variant: 'primary' as const } : {})}
            {...(k.isDim ? { dimColor: true } : {})}
            onPress={k.onPress}
          />
        ))}
      </Box>
    )
    const handleWidth = 2 + Math.max(2, ...rows.map(r => r.handle.length))
    const drawRow = (row: Row) => {
      const index = ids.indexOf(row.id)
      const isSelected = index === at
      const note = explained[row.id]

      return (
        <Box
          key={`row-${row.id}`}
          flexDirection="row"
          backgroundColor={isSelected ? (isDark ? DARK_SELECTION : SELECTION_BG) : undefined}
        >
          <Box width={1} flexShrink={0} backgroundColor={isSelected ? row.bar : undefined} />
          <Box width={handleWidth} flexShrink={0} paddingLeft={1}>
            <Button
              plain
              key={`select-${row.id}`}
              label={row.handle}
              dimColor={!isSelected}
              onPress={() => void select($, row.id, index, row.section)}
            />
          </Box>
          {isSelected ? (
            <Box flexDirection="column" flexShrink={1} flexGrow={1} paddingRight={1} paddingBottom={1}>
              {row.line}
              {row.body()}
              {note ? (
                <Box marginTop={1}>
                  {note.isLoading ? (
                    <Text dimColor>Explaining…</Text>
                  ) : note.text ? (
                    <Text wrap="wrap">{note.text}</Text>
                  ) : (
                    <Text color={STOPPED}>{note.error}</Text>
                  )}
                </Box>
              ) : null}
              <Box marginTop={1}>{keyRow(row.keys(index))}</Box>
            </Box>
          ) : (
            <Box flexShrink={1} flexGrow={1} paddingRight={1}>
              {row.line}
            </Box>
          )}
        </Box>
      )
    }
    // A section header: its title at full brightness, then a dim rule to the pane's edge.
    const header = (title: string, color?: string) => (
      <Box flexDirection="row" paddingLeft={1}>
        <Text bold color={color}>
          {title}
        </Text>
        <Text dimColor>{` ${'─'.repeat(Math.max(0, e.props.bodyColumns - 4 - title.length))}`}</Text>
      </Box>
    )

    // The verdict: the catch-up's lines, conclusion first, with a stop above them.
    const catchUp = b.catchUp
    const verdict = (
      <Box flexDirection="column" paddingX={1}>
        {b.stop ? (
          <Text wrap="wrap" color={STOPPED} bold>
            Stopped {ago(now - b.stop.at)}: {stopText(b.stop)}. {stopFix(b.stop)}
          </Text>
        ) : null}
        {catchUp ? (
          catchUp.lines.map((line, n) => (
            <Text wrap="wrap" bold={n === 0}>
              {line}
            </Text>
          ))
        ) : isEmpty(b) ? (
          <Text wrap="wrap" dimColor>
            Nothing recorded yet. Claude records the goal, what it needs from you, and what it chose as it works.
          </Text>
        ) : null}
        {live.isSummarizing ? (
          <Text dimColor>Updating…</Text>
        ) : live.summaryError ? (
          <Text color={STOPPED}>Could not update: {live.summaryError}</Text>
        ) : null}
        {p.awayFrom !== null ? (
          <Text dimColor>
            {awaySummary(b.log, p.awayFrom, p.returnedAt ?? now) ?? `Away ${span((p.returnedAt ?? now) - p.awayFrom)}`}
          </Text>
        ) : null}
      </Box>
    )

    const git = live.git
    const gitLine = git
      ? [
          git.branch ? `On ${git.branch}` : 'No branch',
          git.changed > 0
            ? `${git.changed} ${git.changed === 1 ? 'file' : 'files'} not committed`
            : 'nothing to commit',
          git.ahead ? `${git.ahead} ${git.ahead === 1 ? 'commit' : 'commits'} not pushed` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null
    const checks = [...b.checks].sort((x, y) => y.ranAt - x.ranAt).slice(0, 4)
    const goal =
      b.goal || checks.length > 0 || gitLine ? (
        <Box flexDirection="column">
          {header('Goal')}
          <Box flexDirection="column" paddingLeft={handleWidth + 1} paddingRight={1}>
            <Text wrap="wrap">{b.goal ?? <Text dimColor>Not recorded yet.</Text>}</Text>
            {checks.map(c => (
              <Text
                wrap="truncate-end"
                color={c.result === 'fail' ? STOPPED : c.result === 'pass' ? PASSED : undefined}
              >
                {checkLine(c, b.work.changedAt)}
                <Text dimColor> · {ago(now - c.ranAt)}</Text>
              </Text>
            ))}
            {gitLine ? <Text dimColor>{gitLine}</Text> : null}
          </Box>
        </Box>
      ) : null

    const move = (step: number) => {
      const to = Math.min(Math.max(at + step, 0), rows.length - 1)
      const row = rows[to]
      if (row) void select($, row.id, to, row.section)
    }
    const footerKeys: Key[] =
      rows.length > 1
        ? [
            { key: 'next', label: 'Next', hotkey: 'j', isDim: true, onPress: () => move(1) },
            { key: 'previous', label: 'Previous', hotkey: 'k', isDim: true, onPress: () => move(-1) },
          ]
        : []

    // At least the body's height, so the footer sits at the pane's bottom.
    return (
      <Box flexDirection="column" gap={1} minHeight={e.props.scroll.bodyRows}>
        <Box paddingTop={1}>{verdict}</Box>
        {needsRows.length > 0 ? (
          <Box flexDirection="column">
            {header(`Needs you ${needsRows.length}`, NEEDS)}
            {needsRows.map(drawRow)}
          </Box>
        ) : null}
        {goal}
        {choseRows.length > 0 ? (
          <Box flexDirection="column">
            {header(`Claude chose ${made.length}`)}
            {choseRows.map(drawRow)}
            {made.length > CHOSE_MAX ? (
              <Box paddingLeft={handleWidth + 1}>
                <Text dimColor>and {made.length - CHOSE_MAX} more</Text>
              </Box>
            ) : null}
          </Box>
        ) : null}
        {earlierRows.length > 0 ? (
          <Box flexDirection="column">
            {header('Earlier')}
            {earlierRows.map(drawRow)}
          </Box>
        ) : null}
        <Box flexGrow={1} />
        <Box backgroundColor={PANEL_BG} paddingX={1}>
          {isFocused ? keyRow(footerKeys) : <Text dimColor>ctrl+x tab for keys</Text>}
        </Box>
      </Box>
    )
  })
}
