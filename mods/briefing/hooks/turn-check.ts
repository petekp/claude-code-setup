// The check at the end of each turn. It finds questions the reply puts to the
// person that no item records, and a success the reply claims that a measured
// check contradicts. Either one sends the agent back once, in one message, so
// it corrects its own record and stays the only author of items.

import type { Check, CheckKind, Decision } from '../types'
import { isStale } from './record'

/** The reply's prose, without code blocks and inline code. */
function prose(reply: string): string {
  return reply.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ')
}

function clean(sentence: string): string {
  return sentence
    .replace(/^[\s>#*-]*(?:\d+[.)]\s*)?/, '')
    .replace(/[*_]+/g, '')
    .trim()
}

/** Paragraphs and list items, each as its sentences. */
function blocks(text: string): string[][] {
  return text
    .split(/\n\s*\n|\n(?=\s*(?:[-*]|\d+[.)])\s)/)
    .map(block =>
      block
        .split(/\n+|(?<=[.!?])\s+/)
        .map(clean)
        .filter(Boolean),
    )
    .filter(b => b.length > 0)
}

/** A question that puts a choice to the person: should I, do you want, A or B. */
const DECISION =
  /\b(?:should|shall|can|may) (?:I|we)\b|\b(?:want|like) (?:me|us) to\b|\bfor (?:me|us) to\b|\bdo you want\b|\bwould you (?:like|prefer|rather)\b|\bok(?:ay)? (?:to|with|if)\b|\bgo ahead\b|\bproceed\b|\bapprove\b|\bprefer\b|\bwhich (?:one|option|approach|way|of)\b|\bor\b/i

/** A question about what the person saw, did or meant, which they answer by replying. */
const DIAGNOSTIC =
  /^(?:did|does|do you (?:see|get|have)|what (?:do|did|does|happens|happened|is|was)|when|where|how (?:did|does|do)|(?:is|are|was|were) (?:it|that|this|these|those|there)|are you (?:seeing|on|using)|can you (?:try|check|share|paste|confirm|send))\b|\b(?:did you (?:mean|want|see|expect|intend)|do you (?:mean|see|remember|know))\b/i

/** Words that tie a question to a recorded item, such as "d3". */
const ITEM_ID = /\b[dta]\d+\b/

function words(text: string): Set<string> {
  return new Set(text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [])
}

/** Whether most of a question's words appear in one recorded decision. */
function isRecorded(question: string, recorded: Decision[]): boolean {
  const q = words(question)
  if (q.size === 0) return true

  return recorded.some(d => {
    const w = words(d.question)
    let shared = 0
    for (const x of q) if (w.has(x)) shared++

    return shared / q.size >= 0.6
  })
}

/**
 * The questions in the reply that put a choice to the person and that no
 * waiting or made decision records. Only a question that ends its paragraph
 * or list item counts: one answered in the next sentence asks nothing.
 */
export function unrecordedQuestions(reply: string, recorded: Decision[]): string[] {
  const found: string[] = []
  for (const block of blocks(prose(reply))) {
    const s = block.at(-1) ?? ''
    if (!/\?["')\]]*$/.test(s)) continue
    if (ITEM_ID.test(s) || DIAGNOSTIC.test(s) || !DECISION.test(s)) continue
    if (!isRecorded(s, recorded) && !found.includes(s)) found.push(s)
  }

  return found.slice(0, 3)
}

const CLAIMS: { kind: CheckKind; pattern: RegExp }[] = [
  {
    kind: 'tests',
    pattern:
      /\b(?:all\s+)?(?:\d+\s+)?(?:the\s+|unit\s+)?tests?\s+(?:now\s+|all\s+|still\s+)*(?:pass(?:es|ed|ing)?|are passing|are green|succeed(?:s|ed)?)\b/i,
  },
  {
    kind: 'types',
    pattern:
      /\b(?:tsc|type[- ]?check(?:s|ing)?|types?)\s+(?:is\s+|are\s+|now\s+)*(?:pass(?:es|ed)?|clean|green|succeed(?:s|ed)?)\b|\bno type errors\b/i,
  },
  { kind: 'lint', pattern: /\blint(?:ing|er)?\s+(?:is\s+|now\s+)*(?:pass(?:es|ed)?|clean|green)\b/i },
  {
    kind: 'build',
    pattern: /\bbuild\s+(?:is\s+|now\s+)*(?:pass(?:es|ed)?|succeed(?:s|ed)?|green|works)\b|\bbuilds cleanly\b/i,
  },
]

/** Words that make a claim conditional, negative or about the future. */
const HEDGE = /\b(?:not|fail\w*|if|should|would|will|until|unless|once|might|may|expect\w*|untested)\b|n't\b/i

export type Contradiction = { claim: string; problem: string }

/**
 * The first success the reply claims that the latest measured check of that
 * kind contradicts: it failed, or the files changed after it ran. A claim
 * with no measured check of its kind is left alone, since the check may have
 * run in a way the briefing cannot see.
 */
export function contradictedClaim(reply: string, checks: Check[], changedAt: number): Contradiction | null {
  for (const s of blocks(prose(reply)).flat()) {
    if (HEDGE.test(s)) continue
    for (const { kind, pattern } of CLAIMS) {
      if (!pattern.test(s)) continue
      const latest = checks.filter(c => c.kind === kind).sort((a, b) => b.ranAt - a.ranAt)[0]
      if (!latest) continue
      if (latest.result === 'fail')
        return {
          claim: s,
          problem: `${latest.name} failed when it last ran${latest.summary ? ` (${latest.summary})` : ''}`,
        }
      if (isStale(latest, changedAt)) return { claim: s, problem: `the files changed after ${latest.name} last ran` }
    }
  }

  return null
}

/** The one message that sends the agent back: what it asked without recording, and what it claimed against a check. */
export function checkMessage(questions: string[], claim: Contradiction | null, waiting: Decision[]): string | null {
  if (questions.length === 0 && !claim) return null
  const parts = ['Briefing check, before you end your turn:']
  if (questions.length > 0) {
    parts.push(
      `- Your reply asks the person ${questions.map(q => `"${q}"`).join(' and ')}, and the briefing does not record ${questions.length === 1 ? 'it' : 'them'}, so the person will not see ${questions.length === 1 ? 'it' : 'them'} in their sidebar or briefing.${
        waiting.length > 0
          ? ` Already recorded and waiting: ${waiting.map(d => `${d.id} "${d.question}"`).join('; ')}.`
          : ''
      } If the person must decide one, record it with the briefing's record tool (ask, with your recommendation). If it is only a question about what they saw or meant, or one of the recorded ones, leave it.`,
    )
  }
  if (claim)
    parts.push(
      `- Your reply says "${claim.claim}", but ${claim.problem}. Run the check now and report what it shows, or say plainly that the latest change is untested.`,
    )

  return parts.join('\n')
}
