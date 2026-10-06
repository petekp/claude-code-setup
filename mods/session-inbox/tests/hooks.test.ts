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

// What the per-turn ledger model answers; a test can make it fail.
let ledgerReply = LEDGER_REPLY

// Prompts the mod sent as the person's own, as the engine's chain received them.
let sent: string[] = []

// Every command the mod ran, such as the herdr call that publishes the sidebar line.
let ran: string[][] = []

// What a tool call Claude makes answers; a test can make it fail.
let toolAnswer: { text: string; isError: boolean } = { text: 'ok', isError: false }

// gh's answers by command; anything else fails, as gh does outside a repo with no PR.
let ghAnswers: { match: (argv: readonly string[]) => boolean; stdout: string }[] = []

function gh(argv: readonly string[]) {
  const hit = ghAnswers.find(a => a.match(argv))

  return {
    exitCode: hit ? 0 : 1,
    stdout: hit?.stdout ?? '',
    stderr: hit ? '' : 'no pull requests found',
    isStdoutTruncated: false,
    isStderrTruncated: false,
  }
}

const PANE = {
  plugin: 'session-inbox',
  surface: 'terminal' as const,
  component: 'Pane' as const,
  requestId: 'session-inbox',
  props: {
    title: 'Session inbox',
    isFocused: true,
    bodyColumns: 80,
    placement: 'dock' as const,
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
}

function world(on: On, prompts: string[], vars: Record<string, string> = {}) {
  sent = []
  ran = []
  toolAnswer = { text: 'ok', isError: false }
  ghAnswers = []
  ledgerReply = LEDGER_REPLY
  mock.store(on)
  on('session.id', () => ({ value: 'session-1' }))
  on('session.root', () => ({ value: '/tmp/project' }))
  // Outside Herdr unless a test passes HERDR_PANE_ID.
  on('env.get', ($, e) => ({ value: vars[e.name] }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('tool.register', ($, e) => ({ value: { tool: `mcp__session-inbox__${e.name}` } }))
  on('process.run', ($, e) => {
    ran.push([...e.argv])
    return { value: gh(e.argv) }
  })
  on('model.complete', ($, e) => {
    prompts.push(e.prompt)

    return {
      value: {
        isAnswered: true,
        text: ledgerReply,
        usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
      },
    }
  })
  on('prompt.submit', ($, e) => {
    if (e.origin.kind === 'plugin') sent.push(e.text)

    return { text: e.text, context: e.context }
  })
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('classic.StopFailure', () => ({}))
  on('classic.PermissionRequest', () => ({}))
  on('classic.Stop', () => ({}))
  on('tool.call', () =>
    toolAnswer.isError
      ? { isError: true as const, result: toolAnswer.text, text: toolAnswer.text }
      : { result: toolAnswer.text, text: toolAnswer.text },
  )
  // The band with nothing to show falls through to the engine's own, drawn empty here.
  on('ui.render', ($, e) => $.ui.resolve(e).Box({}))
}

/** The sidebar lines the mod published to Herdr, in order. */
function sidebarLines(): string[] {
  return ran.filter(argv => argv[0] === 'herdr').map(argv => argv.find(a => a.startsWith('inbox='))?.slice(6) ?? '')
}

test('a reply becomes a card and open items, and "1. yes" carries the question', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  const prompts: string[] = []
  world(on, prompts)

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'add a greeting cli', wait: false, origin: { kind: 'composer' } })
  await $.turn.complete({
    answer: 'Plan ready. 1. Node or Python? 2. Call it greet?',
    durationMs: 5,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })
  await clock.settle()

  expect(prompts.length).toBe(1)
  expect(prompts[0]).toContain('<person>\nadd a greeting cli\n</person>')

  // The band counts what waits; the items themselves are in /inbox.
  const band = await $.ui.mount({ plugin: 'session-inbox', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /2 waiting on you in \/inbox/ })).toBeDefined()
  expect(await band.find({ text: /Use Node or Python\?/ })).toBeUndefined()

  const answered = await $.prompt.submit({ text: '1. node\n2. yes', wait: false, origin: { kind: 'composer' } })
  expect(answered.context?.join('\n')).toContain('1 → "Use Node or Python?"')
  // Claude reads the open items beside a prompt, and again only after they change.
  expect(answered.context?.join('\n')).toContain('Waiting on the user:\n- [i1] (1) "Use Node or Python?"')
  const unchanged = await $.prompt.submit({ text: 'also add a --loud flag', wait: false, origin: { kind: 'composer' } })
  expect(unchanged.context?.join('\n') ?? '').not.toContain('Waiting on the user')

  // Pressing an answer in the pane sends it as the person's message and closes the item.
  const pane = await $.ui.mount(PANE)
  await pane.press({ key: 'answer-i1-0' })
  expect(sent).toEqual(['Re "Use Node or Python?": Node'])
  expect(await pane.find({ key: 'row-i1' })).toBeUndefined()
  // The per-turn update reads the pressed answer as the person's message.
  await $.turn.complete({ answer: 'Using Node.', durationMs: 5, isAborted: false, turnId: 't2', reason: 'answer' })
  await clock.settle()
  expect(prompts.at(-1)).toContain('Re "Use Node or Python?": Node\n</person>')
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

test('after a failed update, the next reply catches up over the whole conversation', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on, [])
  on('model.fork', () => ({
    value: {
      isAnswered: true,
      text: 'GOAL: Ship the onboarding flow\nNOW: Waiting on copy review\nCLOSED: i1 | Node\nCLOSED: n3 | fixed\nNEW: do | - | Review the welcome copy | - | -',
      usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    },
  }))

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'add a greeting cli', wait: false, origin: { kind: 'composer' } })
  await $.turn.complete({ answer: 'Plan ready.', durationMs: 5, isAborted: false, turnId: 't1', reason: 'answer' })
  await clock.settle()
  // Notes and items share one id counter, so after i1 and i2 this note is n3.
  await $.tool.call({
    tool: 'mcp__session-inbox__note',
    kind: 'issue',
    title: 'README is stale',
    detail: 'It names the old command.',
  })

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

  // This turn's update fails, so the next reply re-reads the whole conversation.
  ledgerReply = 'not a ledger'
  await $.turn.complete({ answer: 'Using Node.', durationMs: 5, isAborted: false, turnId: 't2', reason: 'answer' })
  await clock.settle()
  expect(await pane.find({ text: /update failed/ })).toBeDefined()
  await $.turn.complete({
    answer: 'Fixed the README too.',
    durationMs: 5,
    isAborted: false,
    turnId: 't3',
    reason: 'answer',
  })
  await clock.settle()
  const band = await $.ui.mount({ plugin: 'session-inbox', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /Ship the onboarding flow/ })).toBeDefined()
  // It closes what the conversation handled, keeps what still waits, and adds what is new.
  expect(await pane.find({ key: 'row-i1' })).toBeUndefined()
  // Closed shows the question with its outcome under it.
  expect(await pane.find({ text: /^Use Node or Python\?$/ })).toBeDefined()
  expect(await pane.find({ text: /^Node$/ })).toBeDefined()
  expect(await pane.find({ text: /Name the command greet\?/ })).toBeDefined()
  expect(await pane.find({ text: /Review the welcome copy/ })).toBeDefined()
  expect(await pane.find({ text: /update failed/ })).toBeUndefined()
  await pane.press({ key: 'tab-notes' })
  expect(await pane.find({ text: /README is stale/ })).toBeUndefined()
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

test('t opens a field for the person’s own words: an answer closes its question, a reply sends a note back', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on, [])
  on('ui.focus', () => ({}))

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'add a greeting cli', wait: false, origin: { kind: 'composer' } })
  await $.turn.complete({
    answer: 'Plan ready. 1. Node or Python? 2. Call it greet?',
    durationMs: 5,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })
  await clock.settle()
  await $.tool.call({
    tool: 'mcp__session-inbox__note',
    kind: 'issue',
    title: 'README is stale',
    detail: 'It names the old command.',
  })

  const pane = await $.ui.mount(PANE)
  expect(await pane.find({ key: 'type-i1' })).toBeUndefined()
  await pane.press({ key: 'typekey-i1' })
  await pane.input({ key: 'type-i1', text: 'Deno, actually' })
  expect(sent.at(-1)).toBe('Re "Use Node or Python?": Deno, actually')
  expect(await pane.find({ key: 'row-i1' })).toBeUndefined()

  await pane.press({ key: 'tab-notes' })
  await pane.press({ key: 'typekey-n3' })
  await pane.input({ key: 'type-n3', text: 'Fix it after the CLI ships.' })
  expect(sent.at(-1)).toBe(
    'About this note you recorded:\nIssue: README is stale\nIt names the old command.\n\nFix it after the CLI ships.',
  )
  expect(await pane.find({ text: /README is stale/ })).toBeUndefined()
})

test('Claude closes an item or note that no longer applies, by the id it reads beside the prompt', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on, [])

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'add a greeting cli', wait: false, origin: { kind: 'composer' } })
  await $.turn.complete({
    answer: 'Plan ready. 1. Node or Python? 2. Call it greet?',
    durationMs: 5,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })
  await clock.settle()
  await $.tool.call({
    tool: 'mcp__session-inbox__note',
    kind: 'issue',
    title: 'README is stale',
    detail: 'It names the old command.',
  })
  const told = await $.prompt.submit({ text: 'where are we?', wait: false, origin: { kind: 'composer' } })
  expect(told.context?.join('\n')).toContain('- [i2] (2) "Name the command greet?"')
  expect(told.context?.join('\n')).toContain('- [n3] issue: README is stale')

  const close = (input: Record<string, string>) => $.tool.call({ tool: 'mcp__session-inbox__close', ...input } as never)
  const pane = await $.ui.mount(PANE)
  const band = await $.ui.mount({ plugin: 'session-inbox', surface: 'terminal', ...BAND })
  // The user answered i1 in their own message: it closes with their answer, shown in place.
  expect((await close({ id: 'i1', answer: 'Deno' })).result).toBe('Closed i1. The user sees it in /inbox under Closed.')
  expect(await pane.find({ key: 'row-i1' })).toBeUndefined()
  expect(await pane.find({ key: 'settled-i1' })).toBeDefined()
  expect(await band.find({ text: /✓ Use Node or Python\? → Deno/ })).toBeDefined()
  expect((await close({ id: 'i2', reason: 'no longer applies' })).result).toBe(
    'Closed i2. The user sees it in /inbox under Closed.',
  )
  expect((await close({ id: 'n3', reason: 'fixed' })).result).toBe('Closed note n3.')
  expect((await close({ id: 'i9', reason: 'done' })).result).toContain(
    'Not closed: no open item or note has the id i9.',
  )

  // After a few seconds the rows leave, and Closed holds both outcomes.
  await clock.advance(9000)
  expect(await pane.find({ key: 'settled-i1' })).toBeUndefined()
  expect(await band.find({ text: /✓/ })).toBeUndefined()
  expect(await pane.find({ text: /^Deno$/ })).toBeDefined()
  expect(await pane.find({ text: /^Closed by Claude: no longer applies$/ })).toBeDefined()
})

test('a PR linked in a reply shows in the PRs tab, and Address sends its thread', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on, [])
  ghAnswers.push(
    {
      match: argv => argv.includes('view') && argv.includes('12'),
      stdout: JSON.stringify({
        number: 12,
        title: 'Add a greeting CLI',
        url: 'https://github.com/acme/greet/pull/12',
        isDraft: false,
        state: 'OPEN',
        baseRefName: 'main',
        mergeable: 'MERGEABLE',
        reviewDecision: 'REVIEW_REQUIRED',
        statusCheckRollup: [],
      }),
    },
    {
      match: argv => argv.includes('graphql'),
      stdout: JSON.stringify({
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                nodes: [
                  {
                    id: 'T1',
                    isResolved: false,
                    isOutdated: false,
                    path: 'bin/greet',
                    line: 4,
                    originalLine: 4,
                    comments: {
                      totalCount: 1,
                      nodes: [
                        {
                          author: { login: 'sam' },
                          body: 'Quote the name.',
                          url: 'https://github.com/acme/greet/pull/12#r1',
                        },
                      ],
                    },
                    last: { nodes: [{ author: { login: 'sam' }, body: 'Quote the name.', url: '' }] },
                  },
                ],
              },
            },
          },
        },
      }),
    },
  )

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'open the PR', wait: false, origin: { kind: 'composer' } })
  await $.turn.complete({
    answer: 'Opened https://github.com/acme/greet/pull/12.',
    durationMs: 5,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })
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

test('a stop and an open permission prompt lead the sidebar line until they clear', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on, [], { HERDR_PANE_ID: 'p1' })

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.classic.PermissionRequest({
    tool_name: 'Bash',
    tool_input: { command: 'git push', description: 'Push main to origin' },
  } as never)
  await clock.settle()
  expect(sidebarLines().at(-1)).toBe('Allow push main to origin?')
  // The prompt closes when its own call returns.
  await $.tool.call({ tool: 'Bash', command: 'git push', description: 'Push main to origin' } as never)
  await clock.settle()
  expect(sidebarLines().at(-1)).toBe('')

  await $.classic.StopFailure({ error: 'authentication_failed' } as never)
  await clock.settle()
  expect(sidebarLines().at(-1)).toBe('! Signed out: /login')
  const band = await $.ui.mount({ plugin: 'session-inbox', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /Run \/login, then send a message to resume\./ })).toBeDefined()
  // The next turn means the session runs again.
  await $.turn.start({ text: 'logged in, go on', turnId: 't2' })
  await clock.settle()
  expect(await band.find({ text: /Stopped/ })).toBeUndefined()
  expect(sidebarLines().at(-1)).toBe('')
})

test('a failing test run shows in the band, reaches the per-turn call, and stops a claim that tests pass', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  const prompts: string[] = []
  world(on, prompts)

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'fix the parser', wait: false, origin: { kind: 'composer' } })
  toolAnswer = { text: ' 11 pass\n 1 fail\n', isError: true }
  await $.tool.call({ tool: 'Bash', command: 'npm test', description: 'Run the tests' } as never)

  const blocked = await $.classic.Stop({
    stop_hook_active: false,
    last_assistant_message: 'Fixed the parser. All tests pass.',
  } as never)
  expect(blocked.block).toContain('npm test failed when it last ran (11 pass, 1 fail)')
  // Sent back once: the second stop goes through.
  const again = await $.classic.Stop({
    stop_hook_active: true,
    last_assistant_message: 'Fixed the parser. All tests pass.',
  } as never)
  expect(again.block).toBeUndefined()

  await $.turn.complete({
    answer: 'The parser still fails one test.',
    durationMs: 5,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })
  await clock.settle()
  expect(prompts.at(-1)).toContain('<checks>\n✗ npm test, 11 pass, 1 fail\n</checks>')
  const band = await $.ui.mount({ plugin: 'session-inbox', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /✗ npm test, 11 pass, 1 fail/ })).toBeDefined()
  // In the pane, Checks starts folded and opens from its title.
  const pane = await $.ui.mount(PANE)
  expect((await pane.find({ key: 'toggle-checks-caret' }))?.text).toBe('▸')
  expect(await pane.find({ text: /npm test, 11 pass/ })).toBeUndefined()
  await pane.press({ key: 'toggle-checks' })
  expect(await pane.find({ text: /npm test, 11 pass/ })).toBeDefined()
  expect((await pane.find({ key: 'toggle-checks-caret' }))?.text).toBe('▾')
})

test('/inbox demo shows sample entries in every tab, sends nothing, and goes back', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  world(on, [])
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.toast', () => ({ value: undefined }))

  await $.session.start({ cwd: '/tmp/project', surface: 'terminal', isInteractive: true })
  expect((await $.command.run({ command: 'inbox', args: 'demo' } as never)).text).toContain('Showing sample entries')
  const pane = await $.ui.mount(PANE)
  expect(await pane.find({ text: /Export dates as ISO 8601/ })).toBeDefined()
  await pane.press({ key: 'answer-d11-0' })
  expect(sent).toEqual([])
  await pane.press({ key: 'tab-notes' })
  expect(await pane.find({ text: /Report query runs twice/ })).toBeDefined()
  await pane.press({ key: 'tab-prs' })
  expect(await pane.find({ text: /Add CSV export to the reports page/ })).toBeDefined()

  await $.command.run({ command: 'inbox', args: 'demo' } as never)
  expect(await pane.find({ text: /Add CSV export/ })).toBeUndefined()
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
