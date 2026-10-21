// The catch-up: at most three lines, conclusion first, on where the work
// stands and what happened since the person's last prompt. A fast model
// writes it after each reply. It never creates or closes items.

import type { Brief, CatchUp } from '../types'
import { isStale, stopText, waitingLabel, waitingOn } from './record'

export const SYSTEM = `You write the catch-up line of a briefing for a person who runs many coding-agent sessions in parallel and glances at each between other work, or after time away. You read what happened in one session since their last message and write where it stands.

Answer with one to three lines, each starting with "LINE: ". Nothing else.
- The first line is the conclusion: where the work stands now, at most 12 words. If something waits on the person, say so by its id, as in "Waiting on d3: publish now?".
- The next lines, if needed, say what changed since their last message, unfinished parts first, then finished ones. At most 16 words each.
- Use plain words a newcomer understands. Replace any term the agent coined with what it means.
- Facts in <measured> come from the tools and override the reply. Never say tests or checks pass unless <measured> shows them passing and not stale. When files changed after the last check, say the latest change is untested.
- Mention only what the reply, <activity> or <measured> shows. Do not guess at plans.
- Do not list items; the briefing shows them. Name at most one item, by its id.`

const NL = '\n'

export type TurnFacts = {
  /** The person's messages since their last catch-up window began, oldest first. */
  person: string[]
  /** What started the turn when the person did not: a press, a task notification. */
  trigger: string | null
  activity: string[]
  reply: string
}

function excerpt(text: string, max: number): string {
  if (text.length <= max) return text
  const head = Math.floor(max * 0.4)

  return `${text.slice(0, head)}\n[…]\n${text.slice(text.length - (max - head))}`
}

/** The measured facts the catch-up must not contradict. */
export function measuredText(b: Brief): string {
  const lines = [
    ...b.checks.map(
      c =>
        `- ${c.name}: ${c.result}${c.summary ? ` (${c.summary})` : ''}${isStale(c, b.work.changedAt) ? '; files changed since it ran' : ''}`,
    ),
    b.stop ? `- the session stopped: ${stopText(b.stop)}` : null,
  ].filter(Boolean)

  return lines.length > 0 ? lines.join(NL) : '- no checks have run'
}

export function buildPrompt(b: Brief, previous: CatchUp | null, facts: TurnFacts): string {
  const waiting = waitingOn(b, [])
    .map(w => {
      const id =
        w.kind === 'decision' ? w.decision.id : w.kind === 'task' ? w.task.id : w.kind === 'act' ? w.act.id : null

      return `- ${id ? `${id}: ` : ''}${waitingLabel(w)}`
    })
    .join(NL)

  return [
    b.goal ? `<goal>${b.goal}</goal>` : '<goal>not recorded</goal>',
    previous
      ? `<earlier>\n${previous.lines.join(NL)}\n</earlier>\nThe catch-up so far in this window. Rewrite it to cover the whole window.`
      : '',
    `<person>\n${facts.person.length > 0 ? facts.person.map(p => excerpt(p, 1200)).join('\n---\n') : `(no message from the person; the turn started from ${facts.trigger ?? 'elsewhere'})`}\n</person>`,
    `<activity>\n${facts.activity.slice(-40).join(NL) || '(no tool calls)'}\n</activity>`,
    `<measured>\n${measuredText(b)}\n</measured>`,
    `<waiting>\n${waiting || '(nothing waits on the person)'}\n</waiting>`,
    `<reply>\n${excerpt(facts.reply, 6000)}\n</reply>`,
  ]
    .filter(Boolean)
    .join(NL + NL)
}

/** The model's answer as catch-up lines, or null when it has none. */
export function parseCatchUp(text: string): string[] | null {
  const lines = text
    .split(NL)
    .map(l => l.trim())
    .filter(l => /^LINE:/i.test(l))
    .map(l => l.replace(/^LINE:\s*/i, '').trim())
    .filter(Boolean)
    .slice(0, 3)
    .map(l => (l.length > 140 ? `${l.slice(0, 139)}…` : l))

  return lines.length > 0 ? lines : null
}
