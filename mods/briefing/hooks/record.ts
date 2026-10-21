// The briefing record and every change to it. Pure: register.tsx reads and
// saves the record and sends the messages these functions return.

import type { Brief, Change, Check, Decision, Dialog, HeldAct, Helper, Stop, Task } from '../types'

export const EMPTY: Brief = {
  goal: null,
  decisions: [],
  tasks: [],
  acts: [],
  checks: [],
  stop: null,
  catchUp: null,
  work: { snapshot: null, changedAt: 0 },
  log: [],
  next: { d: 1, t: 1, a: 1 },
  turn: 0,
}

const LOG_MAX = 200
const NL = '\n'

function log(b: Brief, by: Change['by'], text: string, at: number): Brief {
  return { ...b, log: [...b.log, { at, by, text }].slice(-LOG_MAX) }
}

/** Lowercase words only, for spotting a question asked twice. */
function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
}

function sameQuestion(a: string, b: string): boolean {
  return words(a).join(' ') === words(b).join(' ')
}

/** The option a free-text pick names: an exact option, or one it starts or is contained in. */
export function matchOption(options: string[], pick: string): string | null {
  const p = pick.trim().toLowerCase()
  if (p === '') return null

  return (
    options.find(o => o.toLowerCase() === p) ??
    options.find(o => o.toLowerCase().startsWith(p) || p.startsWith(o.toLowerCase())) ??
    options.find(o => o.toLowerCase().includes(p)) ??
    null
  )
}

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()

  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

// The agent's tool ------------------------------------------------------------

export type AskInput = {
  question: string
  label?: string
  options?: string[]
  recommend?: string
  reason?: string
  detail?: string
}
export type ChoseInput = {
  id?: string
  question: string
  options?: string[]
  took: string
  reason?: string
  detail?: string
}
export type TaskInput = { what: string; label?: string; run?: string; open?: string; link?: string }
export type CloseInput = { id: string; answer?: string; reason?: string }
export type RecordInput = {
  goal?: string
  ask?: AskInput[]
  chose?: ChoseInput[]
  task?: TaskInput[]
  close?: CloseInput[]
}

function asList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** The tool's input as the model sent it, with anything malformed dropped. */
export function readInput(raw: Record<string, unknown>): RecordInput {
  const strings = (v: unknown) => asList<unknown>(v).map(str).filter(Boolean)

  return {
    goal: str(raw.goal) || undefined,
    ask: asList<Record<string, unknown>>(raw.ask).map(a => ({
      question: str(a.question),
      label: str(a.label) || undefined,
      options: strings(a.options),
      recommend: str(a.recommend) || undefined,
      reason: str(a.reason) || undefined,
      detail: str(a.detail) || undefined,
    })),
    chose: asList<Record<string, unknown>>(raw.chose).map(c => ({
      id: str(c.id) || undefined,
      question: str(c.question),
      options: strings(c.options),
      took: str(c.took),
      reason: str(c.reason) || undefined,
      detail: str(c.detail) || undefined,
    })),
    task: asList<Record<string, unknown>>(raw.task).map(t => ({
      what: str(t.what),
      label: str(t.label) || undefined,
      run: str(t.run) || undefined,
      open: str(t.open) || undefined,
      link: str(t.link) || undefined,
    })),
    close: asList<Record<string, unknown>>(raw.close).map(c => ({
      id: str(c.id),
      answer: str(c.answer) || undefined,
      reason: str(c.reason) || undefined,
    })),
  }
}

function helperOf(t: TaskInput): Helper | null {
  if (t.run) return { kind: 'run', command: t.run }
  if (t.link && /^https?:\/\//.test(t.link)) return { kind: 'link', url: t.link }
  if (t.open) return { kind: 'open', path: t.open }

  return null
}

/**
 * Applies one call of the agent's `record` tool. Returns the new record and
 * the tool's reply: the ids it assigned and anything it refused, with why.
 */
export function applyRecord(b: Brief, input: RecordInput, now: number): { brief: Brief; reply: string } {
  const done: string[] = []
  const refused: string[] = []
  // Items the person or the agent settled already; closing one again changes nothing.
  const settled: string[] = []
  let next = b

  if (input.goal) {
    const goal = clip(input.goal, 160)
    if (goal !== next.goal) {
      next = log({ ...next, goal }, 'agent', `goal: ${goal}`, now)
      done.push('goal set')
    }
  }

  const isOpen = (d: Decision) => d.status === 'waiting' || d.status === 'made'

  for (const a of input.ask ?? []) {
    if (!a.question) continue
    const options = (a.options ?? []).slice(0, 4).map(o => clip(o, 40))
    const twin = next.decisions.find(d => d.status === 'waiting' && sameQuestion(d.question, a.question))
    if (twin) {
      refused.push(`"${clip(a.question, 60)}" repeats open ${twin.id}; it stays as it is.`)
      continue
    }
    const pick = a.recommend
      ? (matchOption(options, a.recommend) ?? (options.length === 0 ? clip(a.recommend, 60) : null))
      : null
    if (options.length >= 2 && !pick && !a.reason) {
      refused.push(
        `"${clip(a.question, 60)}" has options but no recommendation and no reason for having none. Add "recommend" naming one option, or "reason" saying why there is none.`,
      )
      continue
    }
    if (a.recommend && options.length >= 2 && !pick) {
      refused.push(
        `"${clip(a.question, 60)}": the recommendation "${clip(a.recommend, 40)}" is not one of its options.`,
      )
      continue
    }
    const id = `d${next.next.d}`
    const d: Decision = {
      id,
      question: clip(a.question, 160),
      label: a.label ? clip(a.label, 16) : null,
      options,
      pick,
      reason: clip(a.reason ?? '', 200),
      detail: a.detail ? clip(a.detail, 600) : null,
      status: 'waiting',
      outcome: null,
      settledBy: null,
      isDialog: false,
      at: now,
      settledAt: null,
    }
    next = log(
      { ...next, decisions: [...next.decisions, d], next: { ...next.next, d: next.next.d + 1 } },
      'agent',
      `asked ${id}: ${d.question}`,
      now,
    )
    done.push(`${id} asked`)
  }

  for (const c of input.chose ?? []) {
    // What the agent decided for a decision the person left to it.
    const left = c.id
      ? next.decisions.find(d => d.id === c.id && d.status === 'made' && d.outcome === 'left to you')
      : undefined
    if (c.id && !left && !c.question) {
      refused.push(`${c.id} is not a decision the person left to you. To record a new choice, give its question.`)
      continue
    }
    if (left && c.took) {
      const options = c.options && c.options.length > 0 ? c.options.slice(0, 4).map(o => clip(o, 40)) : left.options
      const took = matchOption(options, c.took) ?? clip(c.took, 40)
      const decided: Decision = {
        ...left,
        options: options.includes(took) ? options : [took, ...options].slice(0, 4),
        pick: took,
        reason: c.reason ? clip(c.reason, 200) : left.reason,
      }
      next = log(
        { ...next, decisions: next.decisions.map(x => (x.id === left.id ? decided : x)) },
        'agent',
        `chose ${left.id}: ${left.question} → ${took}`,
        now,
      )
      done.push(`${left.id} recorded`)
      continue
    }
    if (!c.question || !c.took) continue
    const options = (c.options ?? []).slice(0, 4).map(o => clip(o, 40))
    const took = matchOption(options, c.took) ?? clip(c.took, 40)
    const all = options.some(o => o === took) ? options : [took, ...options].slice(0, 4)
    const id = `d${next.next.d}`
    const d: Decision = {
      id,
      question: clip(c.question, 160),
      label: null,
      options: all,
      pick: took,
      reason: clip(c.reason ?? '', 200),
      detail: c.detail ? clip(c.detail, 600) : null,
      status: 'made',
      outcome: null,
      settledBy: null,
      isDialog: false,
      at: now,
      settledAt: null,
    }
    next = log(
      { ...next, decisions: [...next.decisions, d], next: { ...next.next, d: next.next.d + 1 } },
      'agent',
      `chose ${id}: ${d.question} → ${took}`,
      now,
    )
    done.push(`${id} recorded`)
  }

  for (const t of input.task ?? []) {
    if (!t.what) continue
    const twin = next.tasks.find(x => x.status === 'open' && sameQuestion(x.what, t.what))
    if (twin) {
      refused.push(`"${clip(t.what, 60)}" repeats open ${twin.id}.`)
      continue
    }
    const id = `t${next.next.t}`
    const task: Task = {
      id,
      what: clip(t.what, 160),
      label: t.label ? clip(t.label, 16) : null,
      helper: helperOf(t),
      status: 'open',
      settledBy: null,
      at: now,
      settledAt: null,
    }
    next = log(
      { ...next, tasks: [...next.tasks, task], next: { ...next.next, t: next.next.t + 1 } },
      'agent',
      `task ${id}: ${task.what}`,
      now,
    )
    done.push(`${id} added`)
  }

  for (const c of input.close ?? []) {
    const d = next.decisions.find(x => x.id === c.id)
    const t = next.tasks.find(x => x.id === c.id)
    const a = next.acts.find(x => x.id === c.id)
    if (d) {
      if (!isOpen(d)) {
        settled.push(`${d.id} (${d.status}${d.outcome ? `: ${d.outcome}` : ''})`)
        continue
      }
      const closed: Decision = c.answer
        ? { ...d, status: 'answered', outcome: clip(c.answer, 120), settledBy: 'person', settledAt: now }
        : {
            ...d,
            status: 'withdrawn',
            outcome: clip(c.reason ?? 'no longer applies', 120),
            settledBy: 'agent',
            settledAt: now,
          }
      next = log(
        { ...next, decisions: next.decisions.map(x => (x.id === d.id ? closed : x)) },
        'agent',
        `closed ${d.id}: ${closed.outcome}`,
        now,
      )
      done.push(`${d.id} closed`)
    } else if (t) {
      if (t.status !== 'open') {
        settled.push(`${t.id} (${t.status})`)
        continue
      }
      const closed: Task = c.answer
        ? { ...t, status: 'done', settledBy: 'agent', settledAt: now }
        : { ...t, status: 'withdrawn', settledBy: 'agent', settledAt: now }
      next = log(
        { ...next, tasks: next.tasks.map(x => (x.id === t.id ? closed : x)) },
        'agent',
        `closed ${t.id}: ${closed.status}`,
        now,
      )
      done.push(`${t.id} closed`)
    } else if (a) {
      if (a.status !== 'held') {
        settled.push(`${a.id} (${a.status})`)
        continue
      }
      next = log(
        {
          ...next,
          acts: next.acts.map(x =>
            x.id === a.id
              ? { ...a, status: 'declined' as const, result: c.reason ?? 'withdrawn by the agent', settledAt: now }
              : x,
          ),
        },
        'agent',
        `withdrew ${a.id}`,
        now,
      )
      done.push(`${a.id} withdrawn`)
    } else {
      refused.push(`No open item ${c.id}.`)
    }
  }

  const reply = [
    done.length > 0 ? `Recorded: ${done.join(', ')}.` : settled.length > 0 ? null : 'Nothing recorded.',
    settled.length > 0 ? `Already settled, so left as they are: ${settled.join(', ')}.` : null,
    ...refused.map(r => `Refused: ${r}`),
    done.some(x => x.endsWith('asked'))
      ? 'Refer to items by id in your reply, without listing them again as numbered questions.'
      : null,
  ]
    .filter(Boolean)
    .join(NL)

  return { brief: next, reply }
}

// The person's presses ------------------------------------------------------------

/**
 * A press's result. `message` goes to the agent at once, as the person's own
 * words. `news` waits for their next prompt or press, since it needs no turn of
 * its own. A stale press changes nothing: its item closed, or already says this.
 */
export type Press = { brief: Brief; message: string | null; news: string | null; isStale: boolean }

function stale(b: Brief): Press {
  return { brief: b, message: null, news: null, isStale: true }
}

/**
 * Picks an option of a decision: answers an asked one, or switches a made or
 * answered one. Returns the message for the agent, or marks the press stale
 * when the decision is gone or already says this.
 */
export function pressOption(b: Brief, id: string, option: string, now: number): Press {
  const d = b.decisions.find(x => x.id === id)
  if (!d || d.status === 'withdrawn') return stale(b)
  const current = d.status === 'made' ? d.pick : d.status === 'waiting' ? null : d.outcome
  if (current === option) return stale(b)

  if (d.status === 'waiting') {
    const answered: Decision = { ...d, status: 'answered', outcome: option, settledBy: 'person', settledAt: now }
    const brief = log(
      { ...b, decisions: b.decisions.map(x => (x.id === id ? answered : x)) },
      'person',
      `answered ${id}: ${option}`,
      now,
    )

    return { brief, message: `${id} "${d.question}": ${option}`, news: null, isStale: false }
  }

  const was = current ?? d.pick ?? ''
  const switched: Decision = { ...d, status: 'switched', outcome: option, settledBy: 'person', settledAt: now }
  const brief = log(
    { ...b, decisions: b.decisions.map(x => (x.id === id ? switched : x)) },
    'person',
    `switched ${id} to ${option}`,
    now,
  )

  return {
    brief,
    message: `Change ${id} "${d.question}" to ${option}${was ? `, instead of ${was}` : ''}.`,
    news: null,
    isStale: false,
  }
}

/** Leaves an asked decision to the agent: it goes with its recommendation or decides, and records it. */
export function pressYourCall(b: Brief, id: string, now: number): Press {
  const d = b.decisions.find(x => x.id === id)
  if (!d || d.status !== 'waiting') return stale(b)
  const made: Decision = { ...d, status: 'made', settledBy: 'person', settledAt: null, outcome: 'left to you' }
  const brief = log(
    { ...b, decisions: b.decisions.map(x => (x.id === id ? made : x)) },
    'person',
    `left ${id} to the agent`,
    now,
  )
  const rec = d.pick ? ` You recommended ${d.pick}; go with it unless you now think otherwise.` : ' Decide it.'

  return {
    brief,
    message: `${id} "${d.question}": your call.${rec} Record what you decide as chose, with id ${id}.`,
    news: null,
    isStale: false,
  }
}

/** Drops an asked decision the person does not want to answer. */
export function pressDismiss(b: Brief, id: string, now: number): Press {
  const d = b.decisions.find(x => x.id === id)
  if (!d || d.status !== 'waiting') return stale(b)
  const dropped: Decision = {
    ...d,
    status: 'withdrawn',
    outcome: 'dismissed by the person',
    settledBy: 'person',
    settledAt: now,
  }

  return {
    brief: log(
      { ...b, decisions: b.decisions.map(x => (x.id === id ? dropped : x)) },
      'person',
      `dismissed ${id}`,
      now,
    ),
    message: null,
    news: `The person dismissed ${id} "${d.question}". Do not ask it again unless the work cannot go on without it.`,
    isStale: false,
  }
}

export function pressTask(b: Brief, id: string, how: 'done' | 'wont', now: number): Press {
  const t = b.tasks.find(x => x.id === id)
  if (!t || t.status !== 'open') return stale(b)
  const closed: Task = { ...t, status: how, settledBy: 'person', settledAt: now }
  const brief = log(
    { ...b, tasks: b.tasks.map(x => (x.id === id ? closed : x)) },
    'person',
    `${how === 'done' ? 'did' : "won't do"} ${id}`,
    now,
  )

  return {
    brief,
    message:
      how === 'done'
        ? `Done: ${id} "${t.what}".`
        : `I won't do ${id} "${t.what}". Find another way or tell me what it blocks.`,
    news: null,
    isStale: false,
  }
}

/** Closes open tasks whose run step is exactly this command, after the person ran it without error. */
export function closeTasksRun(b: Brief, command: string, now: number): { brief: Brief; closed: Task[] } {
  const squash = (s: string) => s.replace(/\s+/g, ' ').trim()
  const ran = squash(command)
  const closed = b.tasks.filter(
    t => t.status === 'open' && t.helper?.kind === 'run' && squash(t.helper.command) === ran,
  )
  let next = b
  for (const t of closed) {
    next = log(
      {
        ...next,
        tasks: next.tasks.map(x =>
          x.id === t.id ? { ...t, status: 'done' as const, settledBy: 'measured' as const, settledAt: now } : x,
        ),
      },
      'measured',
      `${t.id} done: the person ran its command`,
      now,
    )
  }

  return { brief: next, closed }
}

// Held acts ------------------------------------------------------------

export function holdAct(
  b: Brief,
  act: Omit<HeldAct, 'id' | 'status' | 'result' | 'settledAt'>,
): { brief: Brief; id: string } {
  const twin = b.acts.find(
    a => a.status === 'held' && a.tool === act.tool && JSON.stringify(a.input) === JSON.stringify(act.input),
  )
  if (twin) return { brief: b, id: twin.id }
  const id = `a${b.next.a}`
  const held: HeldAct = { ...act, id, status: 'held', result: null, settledAt: null }

  return {
    brief: log(
      { ...b, acts: [...b.acts, held], next: { ...b.next, a: b.next.a + 1 } },
      'measured',
      `held ${id}: ${act.summary}`,
      act.at,
    ),
    id,
  }
}

/**
 * Marks a held act as running, once: a second press, or a press that races the
 * agent withdrawing it, finds it no longer held and runs nothing.
 */
export function startAct(b: Brief, id: string): { brief: Brief; act: HeldAct | null } {
  const a = b.acts.find(x => x.id === id)
  if (!a || a.status !== 'held') return { brief: b, act: null }
  const running: HeldAct = { ...a, status: 'running' }

  return { brief: { ...b, acts: b.acts.map(x => (x.id === id ? running : x)) }, act: running }
}

export function settleAct(
  b: Brief,
  id: string,
  status: 'ran' | 'declined' | 'failed',
  result: string | null,
  now: number,
): Brief {
  const a = b.acts.find(x => x.id === id)
  if (!a || (a.status !== 'held' && a.status !== 'running')) return b

  return log(
    { ...b, acts: b.acts.map(x => (x.id === id ? { ...a, status, result, settledAt: now } : x)) },
    'person',
    `${status} ${id}: ${a.summary}`,
    now,
  )
}

// Question dialogs ------------------------------------------------------------

/** One question of a Claude Code question dialog and the person's answer. */
export type DialogAnswer = { question: string; label: string | null; options: string[]; answer: string }

/**
 * Records the questions answered in a question dialog, so the record holds
 * every decision, wherever it was made. A dialog that resolved on its own
 * while the person was away records its answers as Claude's choices, which
 * the person can still change.
 */
export function recordDialog(b: Brief, answers: DialogAnswer[], isTimedOut: boolean, now: number): Brief {
  let next = b
  for (const a of answers) {
    if (!a.question || !a.answer) continue
    const id = `d${next.next.d}`
    const options = a.options.slice(0, 4).map(o => clip(o, 40))
    const answer = clip(a.answer, isTimedOut ? 40 : 120)
    const base = {
      id,
      question: clip(a.question, 160),
      label: a.label ? clip(a.label, 16) : null,
      reason: '',
      detail: null,
      isDialog: true,
      at: now,
    }
    const d: Decision = isTimedOut
      ? {
          ...base,
          options: options.includes(answer) ? options : [answer, ...options].slice(0, 4),
          pick: answer,
          status: 'made',
          outcome: null,
          settledBy: null,
          isTimedOut: true,
          settledAt: null,
        }
      : { ...base, options, pick: null, status: 'answered', outcome: answer, settledBy: 'person', settledAt: now }
    next = isTimedOut
      ? log(
          { ...next, decisions: [...next.decisions, d], next: { ...next.next, d: next.next.d + 1 } },
          'agent',
          `chose ${id} when a dialog timed out: ${d.question} → ${answer}`,
          now,
        )
      : log(
          { ...next, decisions: [...next.decisions, d], next: { ...next.next, d: next.next.d + 1 } },
          'person',
          `answered ${id} in a dialog: ${answer}`,
          now,
        )
  }

  return next
}

// Measured facts ------------------------------------------------------------

export function recordCheck(b: Brief, check: Check): Brief {
  const before = b.checks.find(c => c.name === check.name)
  const checks = [...b.checks.filter(c => c.name !== check.name), check]
  const changed = !before || before.result !== check.result

  return changed
    ? log(
        { ...b, checks },
        'measured',
        `${check.name} ${check.result === 'pass' ? 'passed' : check.result === 'fail' ? 'failed' : 'ran'}${check.summary ? `: ${check.summary}` : ''}`,
        check.ranAt,
      )
    : { ...b, checks }
}

export function setStop(b: Brief, stop: Stop | null, now: number): Brief {
  if (stop === null) return b.stop ? log({ ...b, stop: null }, 'measured', 'the session is running again', now) : b

  return log({ ...b, stop }, 'measured', `stopped: ${stopText(stop)}`, stop.at)
}

export function stopText(stop: Stop): string {
  switch (stop.kind) {
    case 'sign-in':
      return 'sign-in expired'
    case 'billing':
      return 'billing problem'
    case 'usage-limit':
      return 'usage limit reached'
    default:
      return `API error (${stop.detail})`
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
      return 'Resume when the limit resets.'
    default:
      return 'Resume when ready.'
  }
}

/** A check that ran before the working tree's content last changed. */
export function isStale(check: Check, changedAt: number): boolean {
  return changedAt > check.ranAt
}

// Views ------------------------------------------------------------

/** One thing waiting on the person, in the order they should see them. */
export type Waiting =
  | { kind: 'stop'; stop: Stop }
  | { kind: 'dialog'; dialog: Dialog }
  | { kind: 'act'; act: HeldAct }
  | { kind: 'decision'; decision: Decision }
  | { kind: 'task'; task: Task }

export function waitingOn(b: Brief, dialogs: Dialog[]): Waiting[] {
  return [
    ...(b.stop ? [{ kind: 'stop' as const, stop: b.stop }] : []),
    ...dialogs.slice(0, 1).map(dialog => ({ kind: 'dialog' as const, dialog })),
    ...b.acts.filter(a => a.status === 'held' || a.status === 'running').map(act => ({ kind: 'act' as const, act })),
    ...b.decisions.filter(d => d.status === 'waiting').map(decision => ({ kind: 'decision' as const, decision })),
    ...b.tasks.filter(t => t.status === 'open').map(task => ({ kind: 'task' as const, task })),
  ]
}

/** Decisions the agent made under the current goal, newest first. */
export function madeFor(b: Brief): Decision[] {
  return b.decisions.filter(d => d.status === 'made').reverse()
}

/** A short label for a waiting thing, for the sidebar line and the band. */
export function waitingLabel(w: Waiting): string {
  switch (w.kind) {
    case 'stop':
      return stopText(w.stop)
    case 'dialog':
      return w.dialog.kind === 'permission' ? `allow ${w.dialog.text}?` : w.dialog.text
    case 'act':
      return w.act.summary
    case 'decision':
      return w.decision.question
    case 'task':
      return w.task.what
  }
}

/** The whole record in a few lines, for the agent after a compaction or on resume. */
export function fullText(b: Brief): string | null {
  const open = b.decisions.filter(d => d.status === 'waiting')
  const made = madeFor(b).slice(0, 8)
  const tasks = b.tasks.filter(t => t.status === 'open')
  const acts = b.acts.filter(a => a.status === 'held')
  if (!b.goal && open.length + made.length + tasks.length + acts.length === 0 && !b.stop) return null

  return [
    'briefing: the shared record of this session that the person sees. Only the items listed here are open.',
    b.goal ? `Goal: ${b.goal}` : 'Goal: not recorded yet.',
    ...open.map(
      d =>
        `- ${d.id} waits on the person: ${d.question}${d.options.length ? ` (${d.options.join(' / ')}${d.pick ? `; you recommended ${d.pick}` : ''})` : ''}`,
    ),
    ...tasks.map(t => `- ${t.id} is the person's task: ${t.what}`),
    ...acts.map(a => `- ${a.id} is held for the person to run: ${a.summary}`),
    ...made.map(d => `- ${d.id} you chose: ${d.question} → ${d.pick}`),
    b.stop ? `The session was stopped: ${stopText(b.stop)}.` : null,
  ]
    .filter(Boolean)
    .join(NL)
}

/**
 * Settled items, and choices Claude made, leave the record this long after
 * they settled or were made, so it stays small across a long session. Items
 * waiting on the person stay.
 */
const KEEP_MS = 12 * 60 * 60_000

export function prune(b: Brief, now: number): Brief {
  const keep = (x: { settledAt: number | null }) => x.settledAt === null || now - x.settledAt < KEEP_MS
  const keepDecision = (d: Decision) => (d.status === 'made' ? now - d.at < KEEP_MS : keep(d))

  return { ...b, decisions: b.decisions.filter(keepDecision), tasks: b.tasks.filter(keep), acts: b.acts.filter(keep) }
}
