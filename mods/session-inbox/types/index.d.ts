/** Where the session stands, as the ledger model last summarized it. */
export type Card = {
  goal: string
  done: string[]
  now: string
  running: string[]
  updatedAt: number
}

/** Something the agent put to the person that is still unanswered. */
export type Item = {
  id: string
  kind: 'decide' | 'do'
  /** The agent's own number or id for it ("1", "D3"), so "1. yes" maps back. */
  label: string | null
  ask: string
  options: string[]
  rec: string | null
  /** Steps the agent's reply spelled out, one press each. */
  helps: Help[]
  /** The person-prompt count when the agent asked it. */
  turn: number
}

/**
 * A one-press step toward finishing an item. The mod never runs a command:
 * `run` asks Claude to run it, under the usual permission checks, and
 * `terminal` copies one that only the person can run.
 */
export type Help =
  | { kind: 'open'; path: string }
  | { kind: 'copy'; text: string; name: string | null }
  | { kind: 'run'; command: string; name: string | null }
  | { kind: 'terminal'; command: string; name: string | null }
  | { kind: 'link'; url: string; name: string | null }

export type Decided = { id: string; ask: string; outcome: string; at: number }

/** An item that just closed, and where its row stood among the open items of its kind. */
export type Settled = Decided & { kind: Item['kind']; index: number }

/** Something Claude noticed outside the current task and recorded for the person. */
export type Note = {
  id: string
  kind: 'issue' | 'opportunity'
  title: string
  detail: string
  /** The file it is about, as Claude gave it. */
  path: string | null
  at: number
}

export type PrCheck = { name: string; bucket: 'pass' | 'fail' | 'pending' | 'skip'; url: string | null }

/** An unresolved review thread, told by its first comment. */
export type PrThread = {
  id: string
  author: string
  /** The thread's latest comment, when anyone answered the first. */
  reply: { author: string; body: string; url: string } | null
  /** Someone other than the viewer wrote its last comment, so it waits on them. */
  isWaiting: boolean
  isOutdated: boolean
  path: string
  line: number | null
  body: string
  replies: number
  url: string
}

/** A PR as gh last reported it. */
export type PrView = {
  /** "owner/repo#123" */
  ref: string
  number: number
  title: string
  url: string
  isDraft: boolean
  state: string
  base: string
  mergeable: string
  reviewDecision: string
  checks: PrCheck[]
  threads: PrThread[]
  fetchedAt: number
  /** Why the last fetch failed; the rest is from the fetch before. */
  error: string | null
}

export type Ledger = {
  card: Card | null
  items: Item[]
  decided: Decided[]
  notes: Note[]
  /** PRs this session created or linked, as "owner/repo#123". */
  prs: string[]
  nextId: number
  /** How many prompts the person has sent this session. */
  turn: number
  /** The turn whose reply added the newest items; 0 when none. */
  batchTurn: number
}

/** Why the session halted outside the conversation, from the error Claude Code classified it with. */
export type Stop = {
  kind: 'sign-in' | 'billing' | 'usage-limit' | 'api-error'
  /** Claude Code's word for the error, such as `authentication_failed`. */
  detail: string
  /** When a usage limit resets, as Claude Code said it: "7:33pm". */
  resets: string | null
  at: number
}

/** A permission prompt or question dialog in the session that waits on the person. */
export type Dialog = {
  kind: 'permission' | 'question'
  text: string
  /** The tool call it is for, so it closes when that call ends. */
  key: string
}

export type CheckKind = 'tests' | 'types' | 'lint' | 'build' | 'validate'

/** The latest result of one check command Claude ran, such as `npm test`. */
export type Check = {
  name: string
  kind: CheckKind
  result: 'pass' | 'fail' | 'unknown'
  /** The output's summary line, such as "24 pass, 1 fail". */
  summary: string
  ranAt: number
}

/**
 * The working tree's content, read without writing to the repo: HEAD, and the
 * blob id of each path that differs from it ('' for a deleted path).
 */
export type Snapshot = { head: string | null; dirty: Record<string, string> }

/** The checks Claude ran, and when the files they check last changed. */
export type Checks = {
  results: Check[]
  snapshot: Snapshot | null
  /** When any file's content last changed. */
  changedAt: number
  /** When a file other than Markdown last changed. Tests, types and builds go stale only then. */
  codeChangedAt: number
}

export type Presence = {
  lastActiveAt: number
  isAway: boolean
  isUpdating: boolean
  /** Why the last update failed. While set, the ledger may have missed a turn, so the next update re-reads the whole conversation. */
  error: string | null
  /** The minute of the last clock tick, so the "last active" text redraws. */
  minute: number
}

/** The most recent other session in this project, offered on a fresh start. */
export type Previous = {
  sessionId: string
  savedAt: number
  ledger: Ledger
  isBroughtIn: boolean
}

export type Tab = 'waiting' | 'notes' | 'prs'

/** A pane section the person can collapse. */
export type Section = 'questions' | 'tasks' | 'running' | 'checks' | 'done' | 'decided'

/** The sections the person folded (true) or opened (false); one never toggled keeps its default. */
export type Collapsed = Partial<Record<Section, boolean>>

/** A tab's selected row: its id, and its position for when that row goes away. */
export type Cursor = { id: string | null; index: number }

/** The PR tab's data: each PR's latest view, the current branch's PR, and whether a fetch runs. */
export type PrViews = { views: Record<string, PrView>; branchRef: string | null; isFetching: boolean }

declare module 'claude-code' {
  interface PluginState {
    'session-inbox': {
      isDarkTheme: boolean
      ledger: Ledger
      presence: Presence
      previous: Previous | null
      tab: Tab
      prViews: PrViews
      collapsed: Collapsed
      selection: Record<Tab, Cursor>
      stop: Stop | null
      dialogs: Dialog[]
      checks: Checks
      /** The row whose free-text field is open, if any. */
      typing: string | null
      /** Items that just closed, shown in place with their outcome for a few seconds. */
      settled: Settled[]
      /** The band and pane show sample entries instead of the session's own, for `/inbox demo`. */
      isDemo: boolean
    }
  }
}
