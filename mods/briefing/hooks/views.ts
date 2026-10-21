// The words each surface shows. Pure, so the grammar is tested in one place.

import type { Brief, Change, Check, Dialog, Stop } from '../types'
import { isStale, type Waiting } from './record'

/** Herdr's default sidebar is 26 columns; its row has room for about this many characters. */
export const LINE_MAX = 22

/** Cuts text at a word boundary, with an ellipsis when it is cut. */
export function fit(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')

  return `${space > max * 0.5 ? cut.slice(0, space) : cut}…`
}

/** The stop in a few words with its fix, as the sidebar and band say it. */
export function stopShort(stop: Stop): string {
  switch (stop.kind) {
    case 'sign-in':
      return 'Signed out: /login'
    case 'billing':
      return 'Billing problem'
    case 'usage-limit':
      return 'Usage limit'
    default:
      return 'API error: resume'
  }
}

/** A waiting thing's short name: the agent's label, else its text cut to fit. */
export function shortLabel(w: Waiting, max = 16): string {
  switch (w.kind) {
    case 'stop':
      return stopShort(w.stop)
    case 'dialog':
      return fit(w.dialog.label ?? (w.dialog.kind === 'permission' ? `Allow ${w.dialog.text}` : w.dialog.text), max)
    case 'act':
      return fit(`Run: ${w.act.summary}`, max)
    case 'decision':
      return fit(w.decision.label ?? w.decision.question, max)
    case 'task':
      return fit(w.task.label ?? w.task.what, max)
  }
}

/**
 * The session's line in Herdr's sidebar: the stop and its fix, else the first
 * thing waiting and how many more, else nothing.
 */
export function lineText(waiting: Waiting[]): string {
  const first = waiting[0]
  if (!first) return ''
  if (first.kind === 'stop') return fit(`! ${stopShort(first.stop)}`, LINE_MAX)
  const more = waiting.length - 1
  const tail = more > 0 ? ` +${more}` : ''

  return `? ${shortLabel(first, LINE_MAX - 2 - tail.length)}${tail}`
}

/** "1h 30m", "45m", "2d 3h". */
export function span(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60_000))
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 48) return `${h}h${m % 60 ? ` ${m % 60}m` : ''}`

  return `${Math.floor(h / 24)}d ${h % 24}h`
}

/** "5 min ago", for ages in the pane. */
export function ago(ms: number): string {
  const m = Math.round(ms / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 48) return `${h}h ago`

  return `${Math.round(h / 24)}d ago`
}

/**
 * What changed while the person was away, from the log: counts, not a list,
 * so a night away is still one line. Empty parts are left out.
 */
export function awaySummary(log: Change[], since: number, now: number): string | null {
  const during = log.filter(c => c.at > since)
  if (during.length === 0) return null
  const count = (re: RegExp) => during.filter(c => re.test(c.text)).length
  const chose = count(/^chose /)
  const asked = count(/^asked /)
  const tasks = count(/^task /)
  const broke = during.filter(c => c.by === 'measured' && /\bfailed\b/.test(c.text)).length
  const fixed = during.filter(c => c.by === 'measured' && /\bpassed\b/.test(c.text)).length
  const parts = [
    chose > 0 ? `Claude chose ${chose} ${chose === 1 ? 'thing' : 'things'}` : null,
    asked + tasks > 0 ? `${asked + tasks} new for you` : null,
    broke > 0 ? `${broke} ${broke === 1 ? 'check' : 'checks'} failed` : fixed > 0 ? 'checks passed' : null,
  ].filter(Boolean)

  return parts.length > 0 ? `Away ${span(now - since)}: ${parts.join(', ')}` : `Away ${span(now - since)}`
}

/** The checks' one problem worth a word in the band: a failure, else that nothing ran since the files last changed. */
export function checkProblem(checks: Check[], changedAt: number): { text: string; isFailure: boolean } | null {
  const failed = checks.filter(c => c.result === 'fail')
  if (failed.length > 0) return { text: `✗ ${failed.map(c => c.name).join(', ')} failed`, isFailure: true }
  if (checks.length > 0 && checks.every(c => isStale(c, changedAt)))
    return { text: 'Not checked since the last edit', isFailure: false }

  return null
}

export function checkLine(c: Check, changedAt: number): string {
  const mark = c.result === 'pass' ? '✓' : c.result === 'fail' ? '✗' : '·'
  const when = isStale(c, changedAt) ? ', before the last edit' : ''

  return `${mark} ${c.name}${c.summary ? `, ${c.summary}` : ''}${when}`
}

/** The dialog in the band's words. */
export function dialogText(d: Dialog): string {
  return d.kind === 'permission' ? `Allow ${d.text}?` : d.text
}

/** Options with the agent's pick first, so 1 is always Claude's pick. */
export function pickFirst(options: string[], pick: string | null): string[] {
  if (!pick || !options.includes(pick)) return options

  return [pick, ...options.filter(o => o !== pick)]
}

/** The whole briefing has nothing to show. */
export function isEmpty(b: Brief): boolean {
  return (
    !b.goal &&
    b.decisions.length === 0 &&
    b.tasks.length === 0 &&
    b.acts.length === 0 &&
    b.checks.length === 0 &&
    !b.stop &&
    !b.catchUp
  )
}
