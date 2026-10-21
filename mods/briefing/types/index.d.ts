/**
 * A decision about the work. The agent asks one the person must make, or
 * makes one itself and records it so the person can change it.
 */
export type Decision = {
  /** "d1", stable for the session; the reply and the pane both use it. */
  id: string
  question: string
  /** At most 16 characters, written by the agent, for the sidebar line. */
  label: string | null
  /** Two to four choices. A made decision includes the option it took. */
  options: string[]
  /** The recommended option of an asked decision, or the taken one of a made decision. */
  pick: string | null
  /** Why that pick, or why there is none. */
  reason: string
  /** What each option leads to, when it is not obvious from the option. */
  detail: string | null
  /** waiting: asked, open. made: the agent decided. The rest are closed. */
  status: 'waiting' | 'made' | 'answered' | 'switched' | 'withdrawn'
  /** The answer, the option switched to, or why it was withdrawn. */
  outcome: string | null
  /** Who settled it, once it is closed. */
  settledBy: 'person' | 'agent' | null
  /** Asked in a Claude Code question dialog rather than recorded with the tool. */
  isDialog: boolean
  /** A question dialog that resolved on its own while the person was away, so the answer is not theirs. */
  isTimedOut?: boolean
  at: number
  settledAt: number | null
}

/** One step a helper takes toward finishing a task, with one press. */
export type Helper = { kind: 'run'; command: string } | { kind: 'open'; path: string } | { kind: 'link'; url: string }

/** Something only the person can do: sign in, check on their phone, reply to a teammate. */
export type Task = {
  /** "t1" */
  id: string
  what: string
  /** At most 16 characters, written by the agent, for the sidebar line. */
  label: string | null
  helper: Helper | null
  status: 'open' | 'done' | 'wont' | 'withdrawn'
  settledBy: 'person' | 'agent' | 'measured' | null
  at: number
  settledAt: number | null
}

/** An outward or irreversible tool call the mod held until the person runs it. */
export type HeldAct = {
  /** "a1" */
  id: string
  /** "Push feature-x to origin" */
  summary: string
  /** The kind of act, such as push or discard. A discard waits only while the files stay as they were. */
  verb: string
  tool: string
  input: { [key: string]: unknown }
  status: 'held' | 'running' | 'ran' | 'declined' | 'failed'
  result: string | null
  at: number
  settledAt: number | null
}

export type CheckKind = 'tests' | 'types' | 'lint' | 'build' | 'validate'

/** The last run of one check command, measured from the agent's tool calls. */
export type Check = {
  name: string
  kind: CheckKind
  result: 'pass' | 'fail' | 'unknown'
  summary: string
  ranAt: number
}

/**
 * The working tree's content, read without writing to the repo: HEAD, and the
 * content hash of each path that differs from it ('' for a deleted path).
 */
export type Snapshot = { head: string | null; dirty: { [path: string]: string } }

/** What the working tree held when last read, and when its content last changed. Measured. */
export type Work = { snapshot: Snapshot | null; changedAt: number }

/** Why a session halted outside the conversation. */
export type Stop = {
  kind: 'sign-in' | 'billing' | 'usage-limit' | 'api-error'
  /** The engine's word for the error. */
  detail: string
  at: number
}

/** A dialog in the session that waits on the person. */
export type Dialog = {
  kind: 'permission' | 'question'
  text: string
  /** A short name for the sidebar: a question dialog's own header. */
  label: string | null
  /** The tool call the dialog is for, so it clears when that call ends. */
  key: string
  since: number
}

/** One message or press from the person: their words, and the question they answer, if any. */
export type Request = { words: string; question: string | null }

/** One change to the record, so the agent and the catch-up know who did what. */
export type Change = {
  at: number
  by: 'person' | 'agent' | 'measured'
  text: string
}

export type CatchUp = {
  lines: string[]
  /** When the window it covers began: the person's prompt before it. */
  since: number
  at: number
}

/** One session's shared record of the work. */
export type Brief = {
  goal: string | null
  decisions: Decision[]
  tasks: Task[]
  acts: HeldAct[]
  checks: Check[]
  stop: Stop | null
  catchUp: CatchUp | null
  work: Work
  log: Change[]
  /** The next number for each kind of id. */
  next: { d: number; t: number; a: number }
  /** Prompts the person has sent. */
  turn: number
}

/** What the person is doing, measured from their input. */
export type Presence = {
  /** Their last keystroke, prompt, press or command in this session. */
  lastActiveAt: number
  /** Their last typed prompt in this session: the catch-up's window starts here. */
  lastPromptAt: number
  /** When they left, once they were idle long enough to count as away; cleared by their next typed prompt. */
  awayFrom: number | null
  /** Their first input after awayFrom, which ends the time the Away line counts. */
  returnedAt: number | null
}

/** Where the work lives, read from git. */
export type GitView = {
  branch: string | null
  /** Paths with uncommitted changes, untracked files included. */
  changed: number
  /** Commits the upstream lacks; null with no upstream. */
  ahead: number | null
}

/** What is happening now. Measured; never saved. */
export type Live = {
  isWorking: boolean
  /** Dialogs open now, oldest first. */
  dialogs: Dialog[]
  git: GitView | null
  isSummarizing: boolean
  summaryError: string | null
}

/** An Explain answer shown under its item. */
export type Explained = { text: string | null; isLoading: boolean; error: string | null }

/**
 * One press's message for the agent, and what it asked for in the person's
 * terms: an answer carries its question, so "Yes" to "Push now?" asks for a push.
 */
export type PressLine = { text: string; request: Request | null }

/** Presses waiting to go to the agent as one message. */
export type Outbox = { lines: PressLine[]; firstAt: number; lastAt: number }

/**
 * The selected row: its id, its position, and its section. When the row
 * closes or moves to another section, the row now at its position is selected.
 */
export type Cursor = { id: string | null; index: number; section: 'needs' | 'chose' | 'earlier' | null }

declare module 'claude-code' {
  interface PluginState {
    briefing: {
      brief: Brief
      presence: Presence
      live: Live
      selected: Cursor
      explained: { [id: string]: Explained }
      outbox: Outbox | null
      /** Press messages for the agent while it works, attached to its next tool result. */
      pending: PressLine[]
      /** Changes the agent has not heard of, told with the person's next prompt or press. */
      news: string[]
      isDarkTheme: boolean
    }
  }
}
