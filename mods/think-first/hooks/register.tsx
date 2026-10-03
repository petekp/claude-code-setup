import { atom, read, update } from 'claude-code'
import type { EngineInterface, PromptOrigin, Register } from 'claude-code'

import type { Entry, Gate, Open, Prediction, Rating, Take } from '../types'

const PANE = 'think-first'
const MARKER = 'My take:'
const EXPECT_LINE = /^[ \t]*expect:[ \t]*(.*)$/gim
/** Shorter prompts are replies in a conversation, not questions worth a take. */
const MIN_QUESTION_CHARS = 20
const QUIET_AFTER_SKIP_MS = 30 * 60_000
const HISTORY_WEEKS = 6
const OFF_LIST = 10
const DAY_MS = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const RATING_LABELS: Record<Rating, string> = { hit: 'Hit', partly: 'Partly right', miss: 'Miss', vague: 'Too vague to check' }

const CLASSIFY = `You sort a message a person sent to their coding agent. The message is inside <message> tags. Do not answer or act on it. Reply with one word, THINK or BUILD.

THINK: the message asks for judgment about the person's business or its users: what users need, do, or feel and why; how the business works, makes money, or grows; strategy; priorities; product direction; or whether a product decision is right.

BUILD: anything else, including writing, fixing, reviewing, explaining, or running code; configuration and tooling; chores; and short replies within a conversation.`

const CHECK = `You check a person's prediction against what actually happened. The person wrote the prediction before an AI agent did the work. Reply in exactly two lines:

RATING: hit, partly, miss, or vague
GAP: one sentence

hit: the result matches the prediction's specific claim.
partly: some of its claims matched and some did not. A prediction with one right claim and one wrong claim is partly.
miss: the result contradicts all of it.
vague: it is too general to check against the result, such as "it will work".

GAP, for partly or miss: what the person expected versus what turned out to be true, concretely. For hit: what made the prediction right. For vague: what a checkable prediction would have named. Address the person as "you".`

const TAKE_NOTE =
  'think-first: the user wrote their own take after "My take:" before seeing yours. Before giving your answer, respond to their take: say what holds up, what is wrong or missing, and what evidence would settle it. Do not simply agree with it.'

const NOTICE = `Your take first: write it after "${MARKER}" and press Enter. To skip, press Enter with it empty.`

const GATE = atom({ plugin: 'think-first', key: 'gate' } as const, null as Gate | null)
const OPEN = atom({ plugin: 'think-first', key: 'open' } as const, null as Open | null)
const HISTORY = atom({ plugin: 'think-first', key: 'history' } as const, [] as Entry[])

let isOn = false
let dir = ''
let sessionId = ''
let folder = ''
let quietUntil = 0
// The full prompt behind the open prediction, for the check. A reload loses it,
// and the check then reads the prediction's shortened copy.
let predictedPrompt: string | null = null

function isPersonsWords(origin: PromptOrigin): boolean {
  return origin.kind === 'composer' || origin.kind === 'bridge' || (origin.kind === 'plugin' && origin.asUser === true)
}

/** Takes the `expect:` lines out of a prompt. */
function splitExpect(text: string): { text: string; expect: string | null } {
  const found = [...text.matchAll(EXPECT_LINE)].map(m => (m[1] ?? '').trim()).filter(Boolean)
  if (found.length === 0) return { text, expect: null }

  return { text: text.replace(EXPECT_LINE, '').replace(/\n{3,}/g, '\n\n').trim(), expect: found.join(' ') }
}

/** Splits a prompt at its last `My take:` line, or returns null when it has none. */
function splitTake(text: string): { question: string; take: string } | null {
  const at = text.lastIndexOf(MARKER)
  if (at === -1 || (at > 0 && text[at - 1] !== '\n')) return null

  return { question: text.slice(0, at).trim(), take: text.slice(at + MARKER.length).trim() }
}

// One prompt can make a take and a prediction in the same millisecond, so the kind is part of the id.
async function newId($: EngineInterface, kind: Entry['kind']): Promise<{ id: string; at: number }> {
  const at = await $.clock.now()

  return { id: `${at}-${sessionId.slice(0, 8)}-${kind}`, at }
}

// Each record is its own file, written only by the session that made it, so
// sessions running at once never overwrite each other's records.
async function save($: EngineInterface, entry: Entry) {
  await $.fs.write(`${dir}/${entry.id}.json`, JSON.stringify(entry))
  await update($, HISTORY, h => [entry, ...h.filter(one => one.id !== entry.id)])
}

async function saveTake($: EngineInterface, question: string, take: string | null) {
  const { id, at } = await newId($, 'take')
  const entry: Take = { kind: 'take', id, at, folder, question: question.slice(0, 300), take }
  await save($, entry)
}

async function isThinkingQuestion($: EngineInterface, text: string): Promise<boolean> {
  $.ui.status('Checking whether this asks for your take…')
  const r = await $.model.complete({ model: 'haiku', system: CLASSIFY, prompt: `<message>\n${text.slice(0, 4000)}\n</message>`, maxTokens: 5, effort: 'low', timeoutMs: 3000 })
  $.ui.status(undefined)

  return r.isAnswered && /THINK/i.test(r.text)
}

/** Fills the prompt box once the engine has cleared it of the dropped prompt. */
function refill($: EngineInterface, text: string) {
  $.clock.after(50, () => {
    void $.prompt.fill({ text: `${text.trimEnd()}\n\n${MARKER} `, mode: 'replace' })
  })
}

function parseCheck(text: string): { rating: Rating; gap: string } | null {
  const rating = /RATING:\s*(hit|partly|miss|vague)/i.exec(text)?.[1]?.toLowerCase() as Rating | undefined
  const gap = /GAP:\s*(.+)/i.exec(text)?.[1]?.trim()

  return rating && gap ? { rating, gap } : null
}

async function check($: EngineInterface, p: Prediction, prompt: string, answer: string) {
  const r = await $.model.complete({
    model: 'sonnet',
    system: CHECK,
    prompt: `<request>\n${prompt.slice(0, 6000)}\n</request>\n<prediction>\n${p.expect}\n</prediction>\n<result>\n${answer.slice(0, 12_000)}\n</result>`,
    maxTokens: 300,
    effort: 'low',
    timeoutMs: 60_000,
  })
  const parsed = r.isAnswered ? parseCheck(r.text) : null
  const checked: Prediction = { ...p, rating: parsed?.rating ?? null, gap: parsed?.gap ?? null }
  await save($, checked)
  await update($, OPEN, o => (o?.prediction.id === p.id ? { prediction: checked, phase: 'checked' as const } : o))
}

async function discuss($: EngineInterface) {
  const o = await read($, OPEN)
  if (!o) return
  await update($, OPEN, () => null)
  const p = o.prediction
  const verdict = p.rating ? ` A check rated it "${RATING_LABELS[p.rating]}": ${p.gap}` : ''
  await $.prompt.fill({ text: `Before that turn I predicted: "${p.expect}".${verdict} Where was my thinking off, and what should I have looked at?`, mode: 'replace' })
}

function parseEntry(text: string): Entry | null {
  try {
    const e = JSON.parse(text) as Entry
    if (typeof e.id !== 'string' || typeof e.at !== 'number') return null

    return e.kind === 'take' || e.kind === 'prediction' ? e : null
  } catch {
    return null
  }
}

async function loadHistory($: EngineInterface) {
  const since = (await $.clock.now()) - HISTORY_WEEKS * 7 * DAY_MS
  const files = await $.fs.list(dir).catch(() => [])
  const names = files.map(f => f.name).filter(name => name.endsWith('.json') && Number(name.split('-')[0]) >= since)
  const texts = await Promise.all(names.map(name => $.fs.read(`${dir}/${name}`).catch(() => '')))
  const list = texts
    .map(t => parseEntry(String(t)))
    .filter((e): e is Entry => e !== null)
    .sort((a, b) => b.at - a.at)
  await update($, HISTORY, () => list)
}

function day(at: number): string {
  const d = new Date(at)

  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** Midnight of the Monday that starts the week holding `at`, local time. */
function weekStart(at: number): number {
  const d = new Date(at)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))

  return d.getTime()
}

function counts(list: Entry[]) {
  const takes = list.filter((e): e is Take => e.kind === 'take')
  const predictions = list.filter((e): e is Prediction => e.kind === 'prediction')
  const rated = (rating: Rating) => predictions.filter(p => p.rating === rating).length

  return {
    asked: takes.length,
    given: takes.filter(t => t.take !== null).length,
    predictions: predictions.length,
    hit: rated('hit'),
    partly: rated('partly'),
    miss: rated('miss'),
    vague: rated('vague'),
  }
}

function lastSegment(path: string): string {
  return path.split('/').filter(Boolean).at(-1) ?? path
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    isOn = e.isInteractive
    if (!isOn) return r
    sessionId = await $.session.id()
    folder = await $.session.root()
    dir = `${(await $.env.get('HOME')) ?? ''}/.claude/think-first/records`
    await $.command.register({ name: 'think', description: 'Show your takes and where your predictions were off' })

    return r
  })

  on('session.end', async ($, e, next) => {
    if (isOn && e.reason === 'clear') {
      await update($, GATE, () => null)
      await update($, OPEN, () => null)
      predictedPrompt = null
    }

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    // A prompt sent while a turn runs reaches that turn directly; it is left alone.
    if (!isOn || e.turnId || !isPersonsWords(e.origin)) return next(e)
    const { text, expect } = splitExpect(e.text)
    const take = splitTake(text)
    let context = e.context
    let sent = text

    if (await read($, GATE)) {
      await update($, GATE, () => null)
      if (take?.take) {
        await saveTake($, take.question, take.take)
        context = [...(context ?? []), TAKE_NOTE]
      } else {
        // An empty take, or a prompt rewritten without one: a skip.
        await saveTake($, take?.question ?? text, null)
        quietUntil = (await $.clock.now()) + QUIET_AFTER_SKIP_MS
        if (take) sent = take.question
      }
    } else if (take?.take) {
      // A take the person wrote without being asked.
      await saveTake($, take.question, take.take)
      context = [...(context ?? []), TAKE_NOTE]
    } else if (!take && text.length >= MIN_QUESTION_CHARS && (await $.clock.now()) >= quietUntil && (await isThinkingQuestion($, text))) {
      const at = await $.clock.now()
      await update($, GATE, () => ({ question: text, at }))
      refill($, e.text)

      return { drop: NOTICE }
    }

    if (expect && sent) {
      const { id, at } = await newId($, 'prediction')
      const prediction: Prediction = { kind: 'prediction', id, at, folder, prompt: sent.slice(0, 300), expect, rating: null, gap: null }
      predictedPrompt = sent
      await update($, OPEN, () => ({ prediction, phase: 'running' as const }))
    }

    return next({ ...e, text: sent || e.text, context })
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (!isOn || e.agentId) return r
    const o = await read($, OPEN)
    if (o?.phase !== 'running') return r
    const p = o.prediction
    const prompt = predictedPrompt ?? p.prompt
    predictedPrompt = null
    if (e.reason === 'answer' && !e.isAborted && e.answer.trim()) {
      await update($, OPEN, () => ({ prediction: p, phase: 'checking' as const }))
      void check($, p, prompt, e.answer)
    } else {
      // An interrupted turn has no result to check the prediction against.
      await update($, OPEN, () => null)
      await save($, p)
    }

    return r
  })

  on('command.run', { command: 'think' }, async $ => {
    await loadHistory($)
    await $.ui.open({ id: PANE, title: 'Your thinking', focus: true, closeOnEscape: true })

    return { text: 'Opened your thinking record.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!isOn || e.props.hasSurvey) return next(e)
    const o = await read($, OPEN)
    if (!o) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const p = o.prediction

    if (o.phase !== 'checked') {
      return (
        <Text dimColor wrap="truncate-end">
          You expect: {p.expect}
          {o.phase === 'checking' ? ' · checking it against the result…' : ''}
        </Text>
      )
    }

    return (
      <Box flexDirection="column">
        <Text wrap="truncate-end">
          <Text bold>You expected:</Text> {p.expect}
        </Text>
        {p.rating ? (
          <Text wrap="wrap">
            <Text bold>{RATING_LABELS[p.rating]}.</Text> {p.gap}
          </Text>
        ) : (
          <Text dimColor>The check didn't answer.</Text>
        )}
        <Box flexDirection="row" gap={2}>
          <Button key="discuss" label="Discuss" hotkey="d" plain onPress={() => discuss($)} />
          <Button key="dismiss" label="Dismiss" hotkey="x" plain onPress={() => update($, OPEN, () => null)} />
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, HISTORY)

    if (list.length === 0) {
      return (
        <Box flexDirection="column">
          <Text>Nothing recorded in the last {HISTORY_WEEKS} weeks.</Text>
          <Text dimColor>A question about your business or users asks for your take first.</Text>
          <Text dimColor>To make a prediction, add a line starting "expect:" to a prompt.</Text>
        </Box>
      )
    }

    const all = counts(list)
    const weeks = new Map<number, Entry[]>()
    for (const entry of list) {
      const w = weekStart(entry.at)
      weeks.set(w, [...(weeks.get(w) ?? []), entry])
    }
    const off = list
      .filter((p): p is Prediction => p.kind === 'prediction' && (p.rating === 'miss' || p.rating === 'partly' || p.rating === 'vague'))
      .slice(0, OFF_LIST)

    return (
      <Box flexDirection="column">
        <Text dimColor>Last {HISTORY_WEEKS} weeks, all projects</Text>
        <Text>
          Your take first on <Text bold>{all.given}</Text> of {all.asked} thinking questions
        </Text>
        <Text>
          {all.predictions} predictions: {all.hit} hit · {all.partly} partly · {all.miss} miss · {all.vague} too vague
        </Text>
        <Text> </Text>
        <Text bold>{'Week of'.padEnd(10)}{'Takes'.padEnd(10)}Predictions</Text>
        {[...weeks.entries()].map(([w, entries]) => {
          const c = counts(entries)

          return (
            <Text>
              {day(w).padEnd(10)}
              {`${c.given} of ${c.asked}`.padEnd(10)}
              {c.predictions}
            </Text>
          )
        })}
        <Text> </Text>
        <Text bold>Where your thinking was off</Text>
        {off.length === 0 && <Text dimColor>No missed, partial, or vague predictions yet.</Text>}
        {off.map(p => (
          <Box flexDirection="column" marginBottom={1}>
            <Text wrap="wrap">
              <Text bold>{p.rating ? RATING_LABELS[p.rating] : ''}:</Text> you expected "{p.expect}"
            </Text>
            <Text wrap="wrap">{p.gap}</Text>
            <Text dimColor wrap="truncate-end">
              {day(p.at)} · {lastSegment(p.folder)} · {p.prompt.replace(/\s+/g, ' ')}
            </Text>
          </Box>
        ))}
      </Box>
    )
  })
}
