// Checks measured from Claude's commands: which commands were tests, type
// checks, lints, builds or validations, how each ended, whether the files
// changed after it, and whether Claude's reply claims a success a check
// contradicts. Nothing here asks a model.

import type { Check, CheckKind, Checks } from '../types'

/** One recognized check inside a command, such as `bun test` or `tsc`. */
export type CheckCall = { name: string; kind: CheckKind }

/** A package manager's options before its script, such as `--prefix app` or `-w pkg`. */
const PM_OPTIONS = String.raw`(?:-{1,2}[\w-]+(?:=\S+|\s+(?!-|(?:run|test|build|lint)\b)\S+)?\s+)*`
const pm = (managers: string, script: string) =>
  new RegExp(String.raw`\b(${managers})\s+${PM_OPTIONS}(?:run\s+)?${script}\b`)

const CHECKS: { kind: CheckKind; pattern: RegExp; name: (m: RegExpMatchArray) => string }[] = [
  { kind: 'tests', pattern: /\bclaude\s+plugin\s+test\b/, name: () => 'plugin tests' },
  { kind: 'validate', pattern: /\bclaude\s+plugin\s+validate\b/, name: () => 'plugin validate' },
  { kind: 'tests', pattern: pm('bun|npm|pnpm|yarn|deno', 'test'), name: m => `${m[1]} test` },
  { kind: 'tests', pattern: /\bnode\s+(?:-{1,2}[\w-]+(?:=\S+)?\s+)*--test\b/, name: () => 'node --test' },
  { kind: 'tests', pattern: /\b(vitest|jest|pytest|rspec|mocha|phpunit|ava|tap)\b/, name: m => m[1] ?? 'tests' },
  { kind: 'tests', pattern: /\b(go|cargo|swift|mix|dotnet)\s+test\b/, name: m => `${m[1]} test` },
  { kind: 'tests', pattern: /\bplaywright\s+test\b/, name: () => 'playwright' },
  { kind: 'tests', pattern: /\bxcodebuild\b[^|;&]*\btest\b/, name: () => 'xcodebuild test' },
  { kind: 'tests', pattern: /\bmake\s+(?:check|test)\b/, name: m => m[0] },
  { kind: 'types', pattern: /\btsc\b/, name: () => 'tsc' },
  { kind: 'types', pattern: /\b(mypy|pyright)\b/, name: m => m[1] ?? 'types' },
  { kind: 'types', pattern: pm('bun|npm|pnpm|yarn', '(?:typecheck|type-check|check-types)'), name: () => 'typecheck' },
  { kind: 'types', pattern: /\bcargo\s+check\b/, name: () => 'cargo check' },
  {
    kind: 'lint',
    pattern: /\b(eslint|biome|ruff|shellcheck|swiftlint|clippy|golangci-lint|stylelint)\b/,
    name: m => m[1] ?? 'lint',
  },
  { kind: 'lint', pattern: pm('bun|npm|pnpm|yarn', 'lint'), name: () => 'lint' },
  { kind: 'lint', pattern: /\bprettier\b[^|;&]*--check\b/, name: () => 'prettier' },
  { kind: 'build', pattern: pm('bun|npm|pnpm|yarn', 'build'), name: m => `${m[1]} build` },
  { kind: 'build', pattern: /\b(cargo|go|swift)\s+build\b/, name: m => `${m[1]} build` },
  { kind: 'build', pattern: /\bxcodebuild\b(?![^|;&]*\btest\b)/, name: () => 'xcodebuild' },
  { kind: 'build', pattern: /\b(?:next|vite)\s+build\b/, name: m => m[0] },
  {
    kind: 'validate',
    pattern: /(?:^|\s)(?:\S*\/)?[\w.-]*(?:validate|doctor)[\w.-]*\.sh\b/,
    name: m => m[0].trim().replace(/^.*\//, ''),
  },
]

/**
 * The pieces of a shell command that run one after another or in a pipe, with
 * heredoc bodies and quoted strings blanked, so `git commit -m "fix tsc"`
 * runs no tsc.
 */
function segments(command: string): string[] {
  return command
    .replace(/<<-?\s*(["']?)(\w+)\1[^\n]*\n[\s\S]*?\n\2\b/g, ' ')
    .replace(/(["'])(?:\\.|(?!\1)[\s\S])*\1/g, '""')
    .split(/&&|\|\||;|\n|\|/)
    .map(s => s.trim())
    .filter(Boolean)
}

/** Commands that only show text or move around; a check named in one of them is not run. */
const NOT_A_CHECK = /^(?:echo|printf|cat|grep|rg|tail|head|less|ls|cd|git|gh|brew|man|which|type|open)\b/

/** The checks a command runs, in order, at most one per segment. */
export function checksIn(command: string): CheckCall[] {
  const found: CheckCall[] = []
  for (const segment of segments(command)) {
    if (NOT_A_CHECK.test(segment)) continue
    for (const c of CHECKS) {
      const m = segment.match(c.pattern)
      if (!m) continue
      const name = c.name(m)
      if (!found.some(f => f.name === name)) found.push({ name, kind: c.kind })
      break
    }
  }

  return found
}

const FAIL_COUNT = /\b([1-9]\d*)\s+(?:fail(?:ed|ing|ures?|s)?|errors?|problems?)\b|^[ℹ#]\s*fail\s+[1-9]\d*\s*$/im
const ZERO_FAIL = /\b0\s+(?:fail(?:ed|ing|ures?|s)?|errors?)\b|^[ℹ#]\s*fail\s+0\s*$/im
const PASS_COUNT = /\b(\d+)\s+(?:pass(?:ed|ing|es)?|tests? passed|ok)\b/i
const TS_ERROR = /\berror\s+TS\d+\b/
const FAIL_WORD = /^\s*(?:FAIL|FAILED|✗|×|✘)\b|\bTests?:\s+\d+\s+failed\b|^error(?:\[E\d+\])?:/im
const SUMMARY = [
  /^.*\b\d+\s+(?:pass(?:ed|ing)?|fail(?:ed|ing)?)\b.*$/im,
  /^.*\bRan \d+ tests?\b.*$/im,
  /^.*\bTests?:\s+.*$/im,
  /^.*\bFound \d+ (?:errors?|problems?)\b.*$/im,
  /^.*\b\d+ (?:errors?|warnings?|problems?)\b.*$/im,
]

/** "<label> exit N" lines a command printed, such as `echo "tsc exit $?"`, `exit: 1` or `exit=1`. */
function exitLines(output: string): { label: string; code: number }[] {
  return [...output.matchAll(/^\s*(?:(\S[^\n]*?)\s+)?exit(?:\s+code)?(?:\s*[:=]\s*|\s+)(\d+)\s*$/gim)].map(m => ({
    label: (m[1] ?? '').toLowerCase(),
    code: Number(m[2]),
  }))
}

/** The status a bare `echo $?` printed, the only line of its kind. */
function bareExit(command: string, output: string): number | null {
  if (!/\becho\s+["']?\$\?["']?\s*(?:$|[;&|\n])/.test(command)) return null
  const lines = output.match(/^\s*\d+\s*$/gm) ?? []

  return lines.length === 1 ? Number(lines[0]) : null
}

/** Whether the segment that runs a check sends its output to a file, so the output here is not the check's. */
function isRedirected(command: string, call: CheckCall): boolean {
  const segment = segments(command).find(s => checksIn(s).some(c => c.name === call.name)) ?? ''

  return /(?:^|[^\d&])>>?\s*[^&\s]/.test(segment)
}

/** Pass and fail counts on lines of their own: bun's " 24 pass", node's "ℹ pass 24", TAP's "# pass 24". */
function counts(output: string): string | null {
  const count = (word: string) =>
    output.match(new RegExp(`^\\s*(\\d+)\\s+${word}\\s*$|^[ℹ#]\\s*${word}\\s+(\\d+)\\s*$`, 'm'))
  const pass = count('pass')
  const fail = count('fail')
  if (!pass || !fail) return null

  return `${pass[1] ?? pass[2]} pass, ${fail[1] ?? fail[2]} fail`
}

function summaryOf(output: string): string {
  const both = counts(output)
  if (both) return both
  for (const p of SUMMARY) {
    const m = output.match(p)
    if (m) return m[0].trim().slice(0, 120)
  }
  const firstError = output.split('\n').find(line => /\berror\b/i.test(line))

  return (firstError ?? '').trim().slice(0, 120)
}

/**
 * How each check in a command ended. An explicit "<name> exit N" line wins.
 * Then the command's own exit status, when a lone check ends the command and
 * nothing filters it. Then failure or pass counts in the output.
 */
export function readResults(
  command: string,
  calls: CheckCall[],
  output: string,
  isError: boolean,
): { call: CheckCall; result: Check['result']; summary: string }[] {
  const exits = exitLines(output)
  const isFiltered = /\|\s*(tail|head|grep|rg|sed|awk|cut|wc|tee|less)\b/.test(command)
  const summary = summaryOf(output)
  const last = segments(command).at(-1) ?? ''

  return calls.map(call => {
    const words = call.name.toLowerCase().split(/\s+/)
    const labeled = exits.find(
      x =>
        x.label !== '' && words.some(w => x.label.includes(w) || (call.kind === 'tests' && x.label.includes('test'))),
    )
    const bare = calls.length === 1 && exits.length === 0 ? bareExit(command, output) : null
    const only =
      calls.length === 1 && exits.length === 1 ? exits[0] : bare === null ? undefined : { label: '', code: bare }
    const exit = labeled ?? only
    if (exit) return { call, result: exit.code === 0 ? 'pass' : 'fail', summary: summary || `exit ${exit.code}` }
    if (calls.length === 1 && !isFiltered && checksIn(last).some(c => c.name === call.name)) {
      return { call, result: isError ? 'fail' : 'pass', summary: summary || (isError ? 'exited with an error' : '') }
    }
    if (calls.length === 1) {
      if (FAIL_COUNT.test(output) || TS_ERROR.test(output) || FAIL_WORD.test(output))
        return { call, result: 'fail', summary }
      if (ZERO_FAIL.test(output) || PASS_COUNT.test(output)) return { call, result: 'pass', summary }
    }
    if (isError) return { call, result: 'fail', summary: summary || 'exited with an error' }
    if (isFiltered || isRedirected(command, call)) return { call, result: 'unknown', summary }

    return { call, result: 'pass', summary }
  })
}

/** Keeps each check's latest result. */
export function recordCheck(results: Check[], check: Check): Check[] {
  return [...results.filter(c => c.name !== check.name), check]
}

/** Whether a file the check depends on changed after it ran. A Markdown edit leaves tests, types and builds current. */
export function isStale(check: Check, checks: Checks): boolean {
  const changedAt = check.kind === 'lint' || check.kind === 'validate' ? checks.changedAt : checks.codeChangedAt

  return changedAt > check.ranAt
}

/** "✓ npm test, 24 pass", with ", before the last edit" when the files changed after it ran. */
export function checkLine(check: Check, checks: Checks): string {
  const mark = check.result === 'pass' ? '✓' : check.result === 'fail' ? '✗' : '·'

  return `${mark} ${check.name}${check.summary ? `, ${check.summary}` : ''}${isStale(check, checks) ? ', before the last edit' : ''}`
}

/** The reply's prose, as its sentences, without code blocks and inline code. */
function sentences(reply: string): string[] {
  return reply
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .split(/\n+|(?<=[.!?])\s+/)
    .map(s =>
      s
        .replace(/^[\s>#*-]*(?:\d+[.)]\s*)?/, '')
        .replace(/[*_]+/g, '')
        .trim(),
    )
    .filter(Boolean)
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
 * The first success the reply claims that the latest check of that kind
 * contradicts: it failed, or the files changed after it ran. A claim with no
 * check of its kind is left alone, since the check may have run in a way the
 * mod cannot see.
 */
export function contradictedClaim(reply: string, checks: Checks): Contradiction | null {
  for (const s of sentences(reply)) {
    if (HEDGE.test(s)) continue
    for (const { kind, pattern } of CLAIMS) {
      if (!pattern.test(s)) continue
      const latest = checks.results.filter(c => c.kind === kind).sort((a, b) => b.ranAt - a.ranAt)[0]
      if (!latest) continue
      if (latest.result === 'fail')
        return {
          claim: s,
          problem: `${latest.name} failed when it last ran${latest.summary ? ` (${latest.summary})` : ''}`,
        }
      if (isStale(latest, checks)) return { claim: s, problem: `the files changed after ${latest.name} last ran` }
    }
  }

  return null
}

/** What sends Claude back to correct a claim before its turn ends. */
export function claimMessage(c: Contradiction): string {
  return `Session inbox check, before you end your turn: your reply says "${c.claim}", but ${c.problem}. Run the check now and report what it shows, or say plainly that the latest change is untested.`
}
