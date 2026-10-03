import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const LEDGER_REPLY = `GOAL: Add a greeting CLI
DONE: Plan written
NOW: Waiting on two choices
NEW: decide | 1 | Use Node or Python? | Node / Python | Node
NEW: decide | 2 | Name the command greet? | - | yes`

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

// Prompts the mod sent as the person's own, as the engine's chain received them.
let sent: string[] = []

// gh's answers by command; anything else fails, as gh does outside a repo with no PR.
let ghAnswers: { match: (argv: readonly string[]) => boolean; stdout: string }[] = []

function gh(argv: readonly string[]) {
  const hit = ghAnswers.find(a => a.match(argv))

  return { exitCode: hit ? 0 : 1, stdout: hit?.stdout ?? '', stderr: hit ? '' : 'no pull requests found', isStdoutTruncated: false, isStderrTruncated: false }
}

const PANE = {
  plugin: 'session-inbox',
  surface: 'terminal' as const,
  component: 'Pane' as const,
  requestId: 'session-inbox',
  props: { title: 'Session inbox', isFocused: true, bodyColumns: 80, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} },
}

function world(on: On, prompts: string[]) {
  sent = []
  ghAnswers = []
  mock.store(on)
  on('session.id', () => ({ value: 'session-1' }))
  on('session.root', () => ({ value: '/tmp/project' }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('tool.register', ($, e) => ({ value: { tool: `mcp__session-inbox__${e.name}` } }))
  on('process.run', ($, e) => ({ value: gh(e.argv) }))
  on('model.complete', ($, e) => {
    prompts.push(e.prompt)

    return { value: { isAnswered: true, text: LEDGER_REPLY, usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } } }
  })
  on('prompt.submit', ($, e) => {
    if (e.origin.kind === 'plugin') sent.push(e.text)

    return { text: e.text, context: e.context }
  })
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
}

test('a reply becomes a card and open items, and "1. yes" carries the question', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  const prompts: string[] = []
  world(on, prompts)

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'add a greeting cli', wait: false, origin: { kind: 'composer' } })
  await $.turn.complete({ answer: 'Plan ready. 1. Node or Python? 2. Call it greet?', durationMs: 5, isAborted: false, turnId: 't1', reason: 'answer' })
  await clock.settle()

  expect(prompts.length).toBe(1)
  expect(prompts[0]).toContain('<person>\nadd a greeting cli\n</person>')

  const band = await $.ui.mount({ plugin: 'session-inbox', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /Use Node or Python\?/ })).toBeDefined()
  expect(await band.find({ text: /Waiting on you/ })).toBeDefined()

  const answered = await $.prompt.submit({ text: '1. node\n2. yes', wait: false, origin: { kind: 'composer' } })
  expect(answered.context?.join('\n')).toContain('1 → "Use Node or Python?"')

  // Pressing an answer sends it as the person's message and closes the item.
  await band.press({ key: 'answer-i1-0' })
  expect(sent).toEqual(['Re "Use Node or Python?": Node'])
  expect(await band.find({ text: /Use Node or Python\?/ })).toBeUndefined()
})

test('after 15 idle minutes the band shows where the session stands', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on, [])

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'add a greeting cli', wait: false, origin: { kind: 'composer' } })
  await $.turn.start({ text: 'add a greeting cli', turnId: 't1' })
  await $.turn.complete({ answer: 'Plan ready.', durationMs: 5, isAborted: false, turnId: 't1', reason: 'answer' })
  await clock.settle()

  const band = await $.ui.mount({ plugin: 'session-inbox', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /last active/ })).toBeUndefined()

  await clock.advance(16 * 60_000)
  expect(await band.find({ text: /last active 16m ago/ })).toBeDefined()
  expect(await band.find({ text: /Add a greeting CLI/ })).toBeDefined()

  await $.prompt.submit({ text: 'ok back', wait: false, origin: { kind: 'composer' } })
  expect(await band.find({ text: /last active/ })).toBeUndefined()
})

test('rebuilding from the whole conversation replaces the card and the open items', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on, [])
  on('model.fork', () => ({
    value: {
      isAnswered: true,
      text: 'GOAL: Ship the onboarding flow\nNOW: Waiting on copy review\nNEW: do | - | Review the welcome copy | - | -',
      usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    },
  }))
  on('ui.toast', () => ({ value: undefined }))

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'add a greeting cli', wait: false, origin: { kind: 'composer' } })
  await $.turn.complete({ answer: 'Plan ready.', durationMs: 5, isAborted: false, turnId: 't1', reason: 'answer' })
  await clock.settle()

  const pane = await $.ui.mount(PANE)
  expect(await pane.find({ text: /Use Node or Python\?/ })).toBeDefined()
  // Done collapses and expands from its title.
  expect(await pane.find({ text: /Plan written/ })).toBeDefined()
  await pane.press({ key: 'toggle-done' })
  expect(await pane.find({ text: /Plan written/ })).toBeUndefined()
  await pane.press({ key: 'toggle-done' })
  expect(await pane.find({ text: /Plan written/ })).toBeDefined()
  // Only the selected item shows its actions; Next moves the selection.
  expect(await pane.find({ key: 'explain-i2' })).toBeUndefined()
  await pane.press({ key: 'next' })
  expect(await pane.find({ key: 'explain-i2' })).toBeDefined()
  await pane.press({ key: 'previous' })
  // Explain asks Claude about the item and leaves it open.
  await pane.press({ key: 'explain-i1' })
  expect(sent.at(-1)).toContain('"Use Node or Python?"\nOptions: Node / Python')
  expect(await pane.find({ text: /Use Node or Python\?/ })).toBeDefined()
  await pane.press({ key: 'rebuild' })
  const band = await $.ui.mount({ plugin: 'session-inbox', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /Ship the onboarding flow/ })).toBeDefined()
  expect(await pane.find({ text: /Review the welcome copy/ })).toBeDefined()
  expect(await pane.find({ text: /Use Node or Python\?/ })).toBeUndefined()
})

test('a note Claude records shows in the Notes tab, and Address it sends it back', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  world(on, [])

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  const r = await $.tool.call({
    tool: 'mcp__session-inbox__note',
    kind: 'issue',
    title: 'Retry loop never backs off',
    detail: 'The fetch retry spins with no delay and can hammer the API.',
    path: 'src/api.ts',
  })
  expect(r.result).toBe('Noted. The user sees it in the Notes tab of /inbox.')

  const pane = await $.ui.mount(PANE)
  expect(await pane.find({ text: /Retry loop never backs off/ })).toBeUndefined()
  await pane.press({ key: 'tab-notes' })
  expect(await pane.find({ text: /Retry loop never backs off/ })).toBeDefined()

  await pane.press({ key: 'address-n1' })
  expect(sent.at(-1)).toContain('Please address this note you recorded:\nIssue: Retry loop never backs off')
  expect(await pane.find({ text: /Retry loop never backs off/ })).toBeUndefined()
})

test('a PR linked in a reply shows in the PRs tab, and Address sends its thread', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on, [])
  ghAnswers.push(
    {
      match: argv => argv.includes('view') && argv.includes('12'),
      stdout: JSON.stringify({ number: 12, title: 'Add a greeting CLI', url: 'https://github.com/acme/greet/pull/12', isDraft: false, state: 'OPEN', baseRefName: 'main', mergeable: 'MERGEABLE', reviewDecision: 'REVIEW_REQUIRED', statusCheckRollup: [] }),
    },
    {
      match: argv => argv.includes('graphql'),
      stdout: JSON.stringify({ data: { repository: { pullRequest: { reviewThreads: { nodes: [{ id: 'T1', isResolved: false, isOutdated: false, path: 'bin/greet', line: 4, originalLine: 4, comments: { totalCount: 1, nodes: [{ author: { login: 'sam' }, body: 'Quote the name.', url: 'https://github.com/acme/greet/pull/12#r1' }] }, last: { nodes: [{ author: { login: 'sam' }, body: 'Quote the name.', url: '' }] } }] } } } } }),
    },
  )

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'open the PR', wait: false, origin: { kind: 'composer' } })
  await $.turn.complete({ answer: 'Opened https://github.com/acme/greet/pull/12.', durationMs: 5, isAborted: false, turnId: 't1', reason: 'answer' })
  await clock.settle()

  const pane = await $.ui.mount(PANE)
  await pane.press({ key: 'tab-prs' })
  await clock.settle()
  expect(await pane.find({ text: /Add a greeting CLI/ })).toBeDefined()
  expect(await pane.find({ text: /Blocked: 1 thread waiting on you, needs approval/ })).toBeDefined()

  await pane.press({ key: 'address-T1' })
  expect(sent.at(-1)).toContain('Address this review comment on PR #12')
  expect(sent.at(-1)).toContain('bin/greet:4, from @sam:\nQuote the name.')
})

test('a headless run does nothing', async ($, on) => {
  const prompts: string[] = []
  mock.clock(on, { now: 1 })
  world(on, prompts)

  await $.session.start({ cwd: '/tmp/project', surface: null, isInteractive: false })
  await $.prompt.submit({ text: 'hi', wait: false, origin: { kind: 'sdk' } })
  await $.turn.complete({ answer: 'hello', durationMs: 5, isAborted: false, turnId: 't1', reason: 'answer' })

  expect(prompts.length).toBe(0)
})
