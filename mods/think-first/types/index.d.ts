export type Rating = 'hit' | 'partly' | 'miss' | 'vague'

/** A thinking question the mod held back for the person's own take. `take` is null when they skipped. */
export type Take = {
  kind: 'take'
  id: string
  at: number
  /** The session's project folder. */
  folder: string
  question: string
  take: string | null
}

/** A prediction from an `expect:` line. `rating` and `gap` stay null until the check answers. */
export type Prediction = {
  kind: 'prediction'
  id: string
  at: number
  folder: string
  /** The start of the prompt, without its `expect:` line. */
  prompt: string
  expect: string
  rating: Rating | null
  /** One sentence from the check: where the person's thinking was off, or what made it right. */
  gap: string | null
}

export type Entry = Take | Prediction

/** A thinking question waiting in the prompt box for the person's take. */
export type Gate = { question: string; at: number }

/**
 * The prediction the band shows: `running` while its turn runs, `checking`
 * while the check reads the result, `checked` once it answered or failed.
 */
export type Open = { prediction: Prediction; phase: 'running' | 'checking' | 'checked' }

declare module 'claude-code' {
  interface PluginState {
    'think-first': { gate: Gate | null; open: Open | null; history: Entry[] }
  }
}
