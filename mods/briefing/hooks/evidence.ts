// Facts measured from the agent's tool calls and the engine's events: which
// commands were checks and how they ended, what the agent is doing now, and
// why a session stopped. Nothing here asks a model.

export type CheckKind = 'tests' | 'types' | 'lint' | 'build' | 'validate'

/** One recognized check inside a command, such as `bun test` or `tsc`. */
export type CheckCall = { name: string; kind: CheckKind }

export type CheckResult = 'pass' | 'fail' | 'unknown'

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

/** "<label> exit N" lines a command printed, such as `echo "tsc exit $?"`. */
function exitLines(output: string): { label: string; code: number }[] {
  return [...output.matchAll(/^\s*(?:(\S[^\n]*?)\s+)?exit(?:\s+code)?[:=]?\s+(\d+)\s*$/gim)].map(m => ({
    label: (m[1] ?? '').toLowerCase(),
    code: Number(m[2]),
  }))
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
): { call: CheckCall; result: CheckResult; summary: string }[] {
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
    const only = calls.length === 1 && exits.length === 1 ? exits[0] : undefined
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
    if (isFiltered) return { call, result: 'unknown', summary }

    return { call, result: 'pass', summary }
  })
}

/**
 * The agent's current step in plain words, from a tool call: a Bash call's
 * own description when it has one.
 */
export function doingNow(tool: string, args: Record<string, unknown>): string | null {
  const text = (key: string) => (typeof args[key] === 'string' ? (args[key] as string) : '')
  const file = (key: string) => text(key).replace(/^.*\//, '')
  switch (tool) {
    case 'Bash': {
      const description = text('description').trim()
      if (description) return description
      const command = text('command').trim().split('\n')[0] ?? ''

      return command ? `Running ${command.slice(0, 60)}` : null
    }
    case 'Edit':
    case 'MultiEdit':
    case 'Write':
    case 'NotebookEdit':
      return `Editing ${file('file_path') || file('notebook_path')}`
    case 'Read':
      return `Reading ${file('file_path')}`
    case 'Grep':
    case 'Glob':
      return 'Searching the code'
    case 'WebSearch':
      return `Searching the web for ${text('query').slice(0, 50)}`
    case 'WebFetch': {
      const host = text('url')
        .replace(/^https?:\/\//, '')
        .split('/')[0]

      return host ? `Reading ${host}` : 'Reading a web page'
    }
    case 'Agent':
    case 'Task':
      return text('description') ? `Running an agent: ${text('description')}` : 'Running an agent'
    case 'Skill':
      return `Using the ${text('skill')} skill`
    case 'AskUserQuestion':
      return 'Asking you a question'
    default:
      return tool.startsWith('mcp__') ? `Calling ${tool.slice(5).replace(/__/g, ' ')}` : null
  }
}

/** A stop the person has to clear, from the error Claude Code classified it with. */
export type StopKind = 'sign-in' | 'billing' | 'usage-limit' | 'api-error'

export function stopKindOf(error: string): StopKind {
  switch (error) {
    case 'authentication_failed':
    case 'oauth_org_not_allowed':
    case 'verification_required':
    case 'cloud_credential_error':
      return 'sign-in'
    case 'billing_error':
    case 'account_on_hold':
      return 'billing'
    case 'rate_limit':
      return 'usage-limit'
    default:
      return 'api-error'
  }
}

/** A row the person's own command added: a `!` command, its output, or a slash command. */
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
