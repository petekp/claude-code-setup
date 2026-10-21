// Tool calls that reach outside the machine or destroy work. The mod holds one
// until the person runs it, unless their own words this turn asked for it.
// Force-pushes, discards, deletions and outward messages always wait for a
// press: the press is the person's approval of that exact act.

import type { Request } from '../types'

export type Verb =
  'push' | 'force-push' | 'pr' | 'issue' | 'release' | 'publish' | 'deploy' | 'discard' | 'delete' | 'post' | 'send'

export type Outward = { verb: Verb; summary: string }

const ALWAYS_HELD: ReadonlySet<string> = new Set(['force-push', 'discard', 'delete', 'post', 'send'])

/** Acts that wait for the person's press whatever their messages said. */
export function isAlwaysHeld(verb: string): boolean {
  return ALWAYS_HELD.has(verb)
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim()

  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

const HEREDOC = /<<-?\s*(["']?)(\w+)\1[^\n]*\n([\s\S]*?)\n\2\b/g
const QUOTED = /(["'])(?:\\.|(?!\1)[\s\S])*\1/g

/**
 * The scripts a command runs: the command itself, with heredoc bodies and
 * quoted strings blanked so text that only mentions "git push" is ignored,
 * plus every script it hands to a shell (`bash -c "…"`, `eval '…'`, or a
 * heredoc fed to `sh`), read the same way.
 */
export function scripts(command: string, depth = 0): string[] {
  const inner: string[] = []
  if (depth < 3) {
    for (const m of command.matchAll(
      /\b(?:bash|sh|zsh|dash|ksh)\s+(?:-\w+\s+)*-\w*c\w*\s+(["'])((?:\\.|(?!\1)[\s\S])*)\1/g,
    ))
      inner.push(m[2] ?? '')
    for (const m of command.matchAll(/\beval\s+(["'])((?:\\.|(?!\1)[\s\S])*)\1/g)) inner.push(m[2] ?? '')
    for (const m of command.matchAll(
      /\b(?:bash|sh|zsh|dash|ksh)\b[^\n|;&]*<<-?\s*(["']?)(\w+)\1[^\n]*\n([\s\S]*?)\n\2\b/g,
    ))
      inner.push(m[3] ?? '')
  }
  const own = command.replace(HEREDOC, ' ').replace(QUOTED, '""')

  return [own, ...inner.flatMap(s => scripts(s, depth + 1))]
}

function segments(script: string): string[] {
  return script
    .split(/&&|\|\||;|\n|\|/)
    .map(s => s.trim())
    .filter(Boolean)
}

const GIT = String.raw`\bgit\s+(?:-[Cc]\s+\S+\s+|--?[\w-]+(?:=\S+)?\s+)*`

function pushAct(segment: string): Outward | null {
  const m = segment.match(new RegExp(`${GIT}push\\b(.*)$`))
  if (!m) return null
  const rest = ` ${m[1] ?? ''} `
  if (/\s(?:-n|--dry-run)\s/.test(rest)) return null
  const args = rest.split(/\s+/).filter(a => a && !a.startsWith('-'))
  const [remote, ...refs] = args
  const where = remote ? ` to ${remote}` : ''
  const what = refs.join(' ').replace(/^\+/, '')
  if (/\s(?:-d|--delete)\s/.test(rest) || refs.some(r => r.startsWith(':')))
    return {
      verb: 'delete',
      summary: `Delete ${refs.join(' ').replace(/^:/, '') || 'a branch'} on ${remote ?? 'the remote'}`,
    }
  if (
    /\s(?:-f|--force|--force-with-lease(?:=\S+)?|--force-if-includes)\s/.test(rest) ||
    refs.some(r => r.startsWith('+'))
  ) {
    return { verb: 'force-push', summary: `Force-push${what ? ` ${what}` : ''}${where}` }
  }

  return { verb: 'push', summary: `Push${what ? ` ${what}` : ''}${where}` }
}

function discardAct(segment: string): Outward | null {
  const patterns: [RegExp, string][] = [
    [new RegExp(`${GIT}reset\\b.*--hard\\b`), 'git reset --hard'],
    [new RegExp(`${GIT}clean\\b.*\\s-[a-zA-Z]*f`), 'git clean'],
    [new RegExp(`${GIT}checkout\\s+(?:\\S+\\s+)?--\\s+\\S`), 'git checkout --'],
    [new RegExp(`${GIT}checkout\\s+\\.(?:\\s|$)`), 'git checkout .'],
    [new RegExp(`${GIT}restore\\b(?!.*--staged)`), 'git restore'],
    [new RegExp(`${GIT}restore\\b.*--worktree\\b`), 'git restore'],
    [new RegExp(`${GIT}stash\\s+(?:drop|clear)\\b`), 'git stash drop'],
    [new RegExp(`${GIT}branch\\s+(?:.*\\s)?-D\\b`), 'git branch -D'],
  ]
  for (const [p, name] of patterns)
    if (p.test(segment)) return { verb: 'discard', summary: `Discard local work (${name})` }

  return null
}

/** Whether a `gh api` call writes: an explicit write method, fields without one (gh then POSTs), or a GraphQL mutation. */
function ghApiAct(segment: string, raw: string): Outward | null {
  if (!/\bgh\s+api\b/.test(segment)) return null
  const method = segment.match(/(?:\s-X\s*|\s--method[\s=]+)(\w+)/i)?.[1]?.toUpperCase()
  if (method === 'GET') return null
  if (method === 'DELETE') return { verb: 'delete', summary: 'Delete through the GitHub API' }
  if (method && ['POST', 'PATCH', 'PUT'].includes(method))
    return { verb: 'post', summary: `${method} to the GitHub API` }
  if (/\bgh\s+api\s+graphql\b/.test(segment))
    return /\bmutation\b/.test(raw) ? { verb: 'post', summary: 'Change GitHub through GraphQL' } : null
  if (/\s(?:-f|-F|--field|--raw-field|--input)[\s=]/.test(segment))
    return { verb: 'post', summary: 'POST to the GitHub API' }

  return null
}

const BASH_RULES: { pattern: RegExp; act: (m: RegExpMatchArray, segment: string) => Outward }[] = [
  {
    pattern: /\bgh\s+pr\s+(create|merge|close|comment|review|edit|ready|reopen)\b/,
    act: m => ({
      verb: m[1] === 'comment' || m[1] === 'review' ? 'post' : 'pr',
      summary: `${cap(m[1] ?? 'change')} a pull request`,
    }),
  },
  {
    pattern: /\bgh\s+issue\s+(create|comment|close|edit|reopen|delete|transfer|lock)\b/,
    act: m => ({
      verb: m[1] === 'delete' ? 'delete' : m[1] === 'comment' ? 'post' : 'issue',
      summary: `${cap(m[1] ?? 'change')} a GitHub issue`,
    }),
  },
  {
    pattern: /\bgh\s+release\s+(create|delete|edit|upload)\b/,
    act: m => ({
      verb: m[1] === 'delete' ? 'delete' : 'release',
      summary: `${cap(m[1] ?? 'change')} a GitHub release`,
    }),
  },
  {
    pattern: /\bgh\s+repo\s+(create|delete|archive|rename|edit)\b/,
    act: m => ({
      verb: m[1] === 'delete' ? 'delete' : 'post',
      summary: `${cap(m[1] ?? 'change')} a GitHub repository`,
    }),
  },
  {
    pattern:
      /\b(?:npm|pnpm|yarn|bun)\s+publish\b|\bcargo\s+publish\b|\btwine\s+upload\b|\bgem\s+push\b|\bpoetry\s+publish\b|\bdocker\s+push\b/,
    act: (_m, s) => ({ verb: 'publish', summary: `Run ${clip(s, 50)}` }),
  },
  {
    pattern:
      /\bvercel\b.*--prod\b|\bnetlify\s+deploy\b.*--prod\b|\b(?:fly|flyctl|wrangler|firebase|railway)\s+deploy\b|\bwrangler\s+publish\b|\bkubectl\s+apply\b|\bhelm\s+(?:install|upgrade)\b|\bterraform\s+apply\b/,
    act: (_m, s) => ({ verb: 'deploy', summary: `Run ${clip(s, 50)}` }),
  },
  {
    pattern: /\bterraform\s+destroy\b|\bkubectl\s+delete\b|\bhelm\s+uninstall\b/,
    act: (_m, s) => ({ verb: 'delete', summary: `Run ${clip(s, 50)}` }),
  },
]

const READ_WORDS =
  /^(?:get|list|read|search|fetch|query|view|describe|find|lookup|ask|check|status|whoami|download|export|guide|show|preview|count|retrieve|inspect|diff)$/i
const WRITE_WORDS =
  /^(?:rw|write|create|save|send|post|reply|comment|update|edit|set|add|merge|deploy|publish|schedule|upload|move|share|invite|submit|resolve|approve|run|batch|delete|remove|destroy|archive|trash|unshare|retire|stop|cancel)$/i
const DELETE_WORDS = /^(?:delete|remove|destroy|archive|trash|unshare|retire)$/i

function mcpAct(tool: string): Outward | null {
  const parts = tool.split('__')
  const name = parts.at(-1) ?? tool
  const words = name.split(/[^a-zA-Z0-9]+/).filter(Boolean)
  if (words.some(w => READ_WORDS.test(w)) && !words.some(w => WRITE_WORDS.test(w))) return null
  const where = (parts[1] ?? '').replace(/^(?:plugin|claude_ai)_/, '').replace(/_/g, ' ')

  return {
    verb: words.some(w => DELETE_WORDS.test(w)) ? 'delete' : 'send',
    summary: `Call ${name.replace(/[_-]+/g, ' ')}${where ? ` (${where})` : ''}`,
  }
}

/**
 * What a tool call does outside the machine or to the person's work, in plain
 * words; empty when it does neither. A dry run does neither.
 */
export function outward(tool: string, args: Record<string, unknown>): Outward[] {
  if (tool.startsWith('mcp__')) {
    if (tool.startsWith('mcp__briefing__')) return []
    const act = mcpAct(tool)

    return act ? [act] : []
  }
  if (tool !== 'Bash' || typeof args.command !== 'string') return []
  const raw = args.command
  const acts: Outward[] = []
  for (const script of scripts(raw)) {
    for (const segment of segments(script)) {
      if (/\s--dry-run\b/.test(` ${segment}`)) continue
      const act =
        pushAct(segment) ??
        discardAct(segment) ??
        ghApiAct(segment, raw) ??
        BASH_RULES.map(r => (segment.match(r.pattern) ? r.act(segment.match(r.pattern)!, segment) : null)).find(
          Boolean,
        ) ??
        null
      if (act) acts.push(act)
    }
  }

  return acts
}

// What the person asked for ------------------------------------------------------------

/** Words that ask for each kind of act that words can release. */
const ASKS: Partial<Record<Verb, RegExp>> = {
  push: /\bpush\b/i,
  pr: /\b(?:open|create|make|raise|file|update|merge|close|ready)\b[^.?!\n]{0,24}\b(?:pr|pull request)\b|\bmerge\b/i,
  issue: /\b(?:open|create|file|close|update|reopen)\b[^.?!\n]{0,24}\bissues?\b/i,
  release: /\b(?:cut|create|make|publish|ship|tag)\b[^.?!\n]{0,24}\brelease\b/i,
  publish: /\bpublish\b/i,
  deploy: /\b(?:deploy|ship)\b/i,
}

const REFUSAL =
  /\b(?:don'?t|do not|never|not|no|stop|wait|hold|without|avoid|skip|instead of|rather than|except|until|failed|unable|cannot|can'?t|couldn'?t)\b/i
const AFFIRMATIVE =
  /^\s*(?:yes|yep|yeah|y|ok|okay|sure|go|go ahead|do it|ship it|approved?|proceed|lgtm|please do|sounds good)\b/i

/** The person's prose: code, quotes and pasted output removed. */
function prose(text: string): string {
  return (
    text
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`\n]*`/g, ' ')
      .replace(/(["“])[^"”\n]*["”]/g, ' ')
      .split('\n')
      // Pasted command output, such as git's "error: failed to push some refs".
      .filter(line => !/^\s*(?:error|fatal|warning|hint|remote):|^\s*To\s+\S+[:/]|^\s*[>$!]\s/.test(line))
      .join('\n')
  )
}

/** Whether the text asks for the act, or refuses it; null when it says neither. */
function stance(verb: Verb, text: string): boolean | null {
  const pattern = ASKS[verb]
  if (!pattern) return null
  let result: boolean | null = null
  for (const sentence of prose(text).split(/(?<=[.!?\n])\s*/)) {
    const m = sentence.match(pattern)
    if (m?.index === undefined) continue
    // A question about the act asks for nothing.
    if (/\?\s*$/.test(sentence)) continue
    result = !REFUSAL.test(sentence.slice(0, m.index + m[0].length + 12))
  }

  return result
}

/**
 * Whether the person's latest words asked for this kind of act. The newest
 * message or answer that speaks to it decides. An answer to a question about
 * the act asks for it only when it is a short yes; any other answer does not.
 */
export function wasAsked(verb: Verb, requests: Request[]): boolean {
  if (ALWAYS_HELD.has(verb)) return false
  for (const r of [...requests].reverse()) {
    const own = stance(verb, r.words)
    if (own !== null) return own
    const asked = r.question ? stance(verb, r.question.replace(/\?+\s*$/, '.')) : null
    if (asked === null) continue
    const isShortYes = AFFIRMATIVE.test(r.words) && r.words.trim().split(/\s+/).length <= 5

    return isShortYes && asked
  }

  return false
}

/** The last question a reply asked: the one a short answer from the person most likely answers. */
export function lastQuestion(reply: string): string | null {
  const questions = reply
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\n+|(?<=[.!?])\s+/)
    .map(s => s.replace(/[*_]+/g, '').trim())
    .filter(s => /\?["')\]]*$/.test(s))

  return questions.at(-1) ?? null
}
