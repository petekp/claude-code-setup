import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

const BAND = {
  component: 'AbovePrompt' as const,
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 16,
    bodyColumns: 120,
    scroll: { offset: 0, bodyRows: 15 },
    view: {},
  },
}

const PANE = {
  component: 'Pane' as const,
  requestId: 'think-first',
  props: { title: 'Your thinking', isFocused: true, bodyColumns: 80, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} },
}

const QUESTION = 'Why do small teams cancel in their second month?'

// The record files, by path, as the mod wrote them.
let files = new Map<string, string>()
// What reached Claude: each prompt's text and the context beside it.
let sent: { text: string; context: readonly string[] }[] = []
// What the mod put in the prompt box.
let filled: string[] = []
// How many times the classifier ran, and what it and the check answer.
let classified = 0
let sortAs = 'THINK'
let checkReply = 'RATING: miss\nGAP: You expected churn from pricing, but the cancellations followed failed onboarding calls.'

function world(on: On) {
  files = new Map()
  sent = []
  filled = []
  classified = 0
  sortAs = 'THINK'
  mock.store(on)
  mock.env(on, { HOME: '/home/pete' })
  on('session.id', () => ({ value: 'abcdef123456' }))
  on('session.root', () => ({ value: '/Users/pete/Code/shop' }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('prompt.fill', ($, e) => {
    filled.push(e.text)

    return { isFilled: true }
  })
  on('model.complete', ($, e) => {
    const isClassify = (e.system ?? '').startsWith('You sort')
    if (isClassify) classified += 1
    const text = isClassify ? sortAs : checkReply

    return { value: { isAnswered: true, text, usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } } }
  })
  on('fs.write', ($, e) => {
    files.set(e.path, e.text)

    return { value: undefined }
  })
  on('fs.list', ($, e) => ({
    value: [...files.keys()]
      .filter(path => path.startsWith(`${e.path}/`))
      .map(path => ({ name: path.slice(e.path.length + 1), kind: 'file' as const, size: 1, mtimeMs: 0, isLink: false })),
  }))
  on('fs.read', ($, e) => ({ value: files.get(e.path) ?? '' }))
  // The engine draws nothing of its own in the band; an empty Box stands for that.
  on('ui.render', ($, e) => $.ui.resolve(e).Box({}))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('prompt.submit', ($, e) => {
    sent.push({ text: e.text, context: e.context ?? [] })

    return { text: e.text, context: e.context }
  })
  on('turn.complete', ($, e) => ({ text: e.answer }))
}

function records() {
  return [...files.values()].map(text => JSON.parse(text))
}

async function start($: Engine) {
  await $.session.start({ cwd: '/Users/pete/Code/shop', surface: 'terminal', isInteractive: true })
}

function submit($: Engine, text: string) {
  return $.prompt.submit({ text, wait: false, origin: { kind: 'composer' } })
}

async function finish($: Engine, answer: string) {
  await $.turn.complete({ answer, durationMs: 5_000, isAborted: false, turnId: 't', reason: 'answer' })
}

test('a thinking question waits for your take, and Claude is asked to critique it', async ($, on) => {
  const clock = mock.clock(on, { now: Date.UTC(2026, 9, 3, 15) })
  world(on)
  await start($)

  const held = await submit($, QUESTION)
  expect(held.drop).toMatch(/Your take first/)
  expect(sent).toEqual([])
  await clock.advance(100)
  expect(filled).toEqual([`${QUESTION}\n\nMy take: `])

  await submit($, `${QUESTION}\n\nMy take: onboarding is too slow for them`)
  expect(sent[0]?.text).toContain('My take: onboarding is too slow for them')
  expect(sent[0]?.context.join('\n')).toMatch(/respond to their take/)
  expect(records()).toMatchObject([{ kind: 'take', question: QUESTION, take: 'onboarding is too slow for them' }])
})

test('an empty take sends the question as it was and quiets the gate for 30 minutes', async ($, on) => {
  const clock = mock.clock(on, { now: Date.UTC(2026, 9, 3, 15) })
  world(on)
  await start($)

  await submit($, QUESTION)
  await submit($, `${QUESTION}\n\nMy take: `)
  expect(sent.map(s => s.text)).toEqual([QUESTION])
  expect(records()).toMatchObject([{ kind: 'take', take: null }])

  const asked = classified
  const quiet = await submit($, 'Which pricing tier should we drop first?')
  expect(quiet.drop).toBeUndefined()
  expect(classified).toBe(asked)

  await clock.advance(31 * 60_000)
  expect((await submit($, 'Which pricing tier should we drop first?')).drop).toMatch(/Your take first/)
})

test('a coding prompt goes straight through', async ($, on) => {
  mock.clock(on, { now: Date.UTC(2026, 9, 3, 15) })
  world(on)
  sortAs = 'BUILD'
  await start($)

  const r = await submit($, 'Fix the failing test in cart.test.ts')
  expect(r.drop).toBeUndefined()
  expect(sent.map(s => s.text)).toEqual(['Fix the failing test in cart.test.ts'])
  expect(files.size).toBe(0)
})

test('an expect: line is hidden from Claude and checked against the result', async ($, on) => {
  mock.clock(on, { now: Date.UTC(2026, 9, 3, 15) })
  world(on)
  sortAs = 'BUILD'
  await start($)

  await submit($, 'Find out why cancellations rose in September\nexpect: the price change drove it')
  expect(sent[0]?.text).toBe('Find out why cancellations rose in September')

  const band = await $.ui.mount({ plugin: 'think-first', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /You expect: the price change drove it/ })).toBeDefined()

  await finish($, 'Cancellations followed failed onboarding calls; pricing had no effect.')
  expect(await band.find({ text: /Miss\./ })).toBeDefined()
  expect(records()).toMatchObject([{ kind: 'prediction', expect: 'the price change drove it', rating: 'miss' }])

  await band.press({ key: 'discuss' })
  expect(filled.at(-1)).toMatch(/^Before that turn I predicted: "the price change drove it"\. A check rated it "Miss"/)
  expect(await band.find({ text: /You expected/ })).toBeUndefined()
})

test('the pane shows takes given and where predictions were off', async ($, on) => {
  mock.clock(on, { now: Date.UTC(2026, 9, 3, 15) })
  world(on)
  await start($)

  await submit($, QUESTION)
  await submit($, `${QUESTION}\n\nMy take: onboarding is too slow`)
  sortAs = 'BUILD'
  await submit($, 'Find out why cancellations rose\nexpect: the price change drove it')
  await finish($, 'Onboarding calls failed.')

  await $.command.run({ command: 'think', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 200 } })
  const pane = await $.ui.mount({ plugin: 'think-first', surface: 'terminal', ...PANE })
  expect(await pane.find({ text: /Your take first on 1 of 1 thinking questions/ })).toBeDefined()
  expect(await pane.find({ text: /1 predictions: 0 hit · 0 partly · 1 miss/ })).toBeDefined()
  expect(await pane.find({ text: /cancellations followed failed onboarding calls/ })).toBeDefined()
})
