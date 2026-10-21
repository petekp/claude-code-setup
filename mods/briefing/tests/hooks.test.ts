import { expect, mock, test } from 'claude-code/testing'
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
  plugin: 'briefing',
  surface: 'terminal' as const,
  component: 'Pane' as const,
  requestId: 'briefing',
  props: {
    title: 'Briefing',
    isFocused: true,
    bodyColumns: 88,
    placement: 'inline' as const,
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
}

const START = { cwd: '/tmp/project', surface: 'terminal' as const, isInteractive: true }
const RECORD = 'mcp__briefing__record' as never
const USAGE = { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }

// Prompts the mod sent as the person's own.
let sent: string[] = []
// Each process the mod ran, such as Herdr's report-metadata.
let ran: string[][] = []
let files: Record<string, string> = {}
// Tool calls that reached the engine, and what the engine answers for a command.
let engineCalls: Record<string, unknown>[] = []
let bashAnswers: Record<string, { text: string; isError?: true }> = {}
let catchUp = 'LINE: Waiting on d1: publish now?'

function world(on: On, env: Record<string, string> = {}) {
  sent = []
  ran = []
  files = {}
  engineCalls = []
  bashAnswers = {}
  catchUp = 'LINE: Waiting on d1: publish now?'
  const vars: Record<string, string> = { HOME: '/tmp/home', ...env }
  on('session.id', () => ({ value: 'session-1' }))
  on('session.root', () => ({ value: '/tmp/project' }))
  on('env.get', ($, e) => ({ value: vars[e.name] }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('tool.register', ($, e) => ({ value: { tool: `mcp__briefing__${e.name}` } }))
  on('config.list', () => ({ value: [] }))
  // Outside git: `git rev-parse` fails, so there is no working tree to fingerprint.
  on('process.run', ($, e) => {
    ran.push([...e.argv])
    return {
      value: {
        exitCode: e.argv[0] === 'git' ? 128 : 0,
        stdout: '',
        stderr: '',
        isStdoutTruncated: false,
        isStderrTruncated: false,
      },
    }
  })
  on('fs.write', ($, e) => {
    files[e.path] = e.text
    return { value: undefined }
  })
  on('fs.read', ($, e) => {
    const text = files[e.path]
    if (text === undefined) throw new Error(`ENOENT: ${e.path}`)
    return { value: text }
  })
  on('model.complete', () => ({ value: { isAnswered: true, text: catchUp, usage: USAGE } }))
  on('prompt.submit', ($, e) => {
    if (e.origin.kind === 'plugin') sent.push(e.text)
    return { text: e.text, context: e.context }
  })
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.end', ($, e) => ({ sessionId: e.sessionId }))
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('ui.render', ($, e) => $.ui.resolve(e).Box({}))
  on('ui.panes', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.invalidate', () => ({ value: undefined }))
  on('ui.scroll', () => ({}))
  on('classic.Stop', () => ({}))
  on('classic.StopFailure', () => ({}))
  on('classic.PermissionRequest', () => ({}))
  on('tool.call', ($, e) => {
    engineCalls.push({ ...e })
    const command = String((e as { command?: unknown }).command ?? '')
    const answer = bashAnswers[command] ?? { text: 'ok' }
    return answer.isError
      ? { result: answer.text, text: answer.text, isError: true as const }
      : { result: answer.text, text: answer.text }
  })
}

const ask = {
  tool: RECORD,
  goal: 'Ship the greeting CLI',
  ask: [
    {
      question: 'Publish 0.3.0 to npm now?',
      label: 'Publish to npm',
      options: ['Yes', 'Not yet'],
      recommend: 'Not yet',
      reason: 'The docs are not written',
    },
  ],
}

test('a recorded question waits in the band, the sidebar line and the pane', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on, { HERDR_PANE_ID: 'p1' })

  await $.session.start(START)
  await $.prompt.submit({ text: 'ship the cli', wait: false, origin: { kind: 'composer' } })
  const r = await $.tool.call(ask)
  expect(String(r.result)).toContain('d1 asked')
  await clock.settle()

  expect(ran).toContainEqual([
    'herdr',
    'pane',
    'report-metadata',
    'p1',
    '--source',
    'briefing',
    '--token',
    'inbox=? Publish to npm',
  ])
  expect(JSON.parse(files['/tmp/home/.claude/briefing/sessions/session-1.json'] ?? '{}').brief.goal).toBe(
    'Ship the greeting CLI',
  )

  const band = await $.ui.mount({ plugin: 'briefing', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /Needs you:/ })).toBeDefined()
  expect(await band.find({ text: /Publish 0\.3\.0 to npm now\?/ })).toBeDefined()

  const pane = await $.ui.mount(PANE)
  expect(await pane.find({ text: /Recommended: / })).toBeDefined()
  // 1 is Claude's pick; the press is sent a moment later, with any others made close to it.
  await pane.press({ key: 'option-d1-0' })
  expect(sent).toEqual([])
  await clock.advance(2500)
  expect(sent).toEqual(['d1 "Publish 0.3.0 to npm now?": Not yet'])
  expect(await band.find({ text: /Needs you:/ })).toBeUndefined()
  expect(ran.at(-1)).toEqual([
    'herdr',
    'pane',
    'report-metadata',
    'p1',
    '--source',
    'briefing',
    '--clear-token',
    'inbox',
  ])
})

test('a press made while Claude works reaches it with its next tool result', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on)

  await $.session.start(START)
  await $.prompt.submit({ text: 'ship the cli', wait: false, origin: { kind: 'composer' } })
  await $.tool.call(ask)
  await $.turn.start({ text: 'ship the cli', turnId: 't1' })
  const pane = await $.ui.mount(PANE)
  await pane.press({ key: 'option-d1-1' })
  await clock.advance(2500)
  expect(sent).toEqual([])

  const next = await $.tool.call({ tool: 'Read', file_path: '/tmp/project/README.md' })
  expect(next.context?.join('\n')).toContain(
    'The person answered in their briefing while you worked:\nd1 "Publish 0.3.0 to npm now?": Yes',
  )
})

test('an outward act the person did not ask for is held until they run it', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on)

  await $.session.start(START)
  await $.prompt.submit({ text: 'commit the fix', wait: false, origin: { kind: 'composer' } })
  const held = await $.tool.call({ tool: 'Bash', command: 'git push origin main', description: 'Push main' })
  expect(held.deny).toContain('held this for the person as a1')
  expect(engineCalls).toEqual([])

  const pane = await $.ui.mount(PANE)
  expect(await pane.find({ text: /Push main to origin/ })).toBeDefined()
  await pane.press({ key: 'run-a1' })
  expect(engineCalls[0]).toMatchObject({ tool: 'Bash', command: 'git push origin main' })
  await clock.advance(2500)
  expect(sent[0]).toContain('I ran held a1, "Push main to origin".')

  // Asked for in the person's own words, it runs at once.
  await $.prompt.submit({ text: 'now push it', wait: false, origin: { kind: 'composer' } })
  const pushed = await $.tool.call({ tool: 'Bash', command: 'git push origin main', description: 'Push main' })
  expect(pushed.deny).toBeUndefined()
  // "yes" to the reply's question asks for what the question named.
  await $.turn.complete({
    answer: 'Pushed. Should I also push the tag?',
    durationMs: 5,
    isAborted: false,
    turnId: 't9',
    reason: 'answer',
  })
  await $.prompt.submit({ text: 'yes', wait: false, origin: { kind: 'composer' } })
  const tag = await $.tool.call({ tool: 'Bash', command: 'git push origin v0.3.0', description: 'Push the tag' })
  expect(tag.deny).toBeUndefined()
})

test('a failed check shows in the band after the reply, and a claim it contradicts is sent back once', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on)
  bashAnswers['npm test'] = { text: 'Tests: 2 failed, 10 passed, 12 total', isError: true }
  catchUp = 'LINE: The parser is fixed, but two tests fail.'

  await $.session.start(START)
  await $.prompt.submit({ text: 'fix the parser', wait: false, origin: { kind: 'composer' } })
  await $.turn.start({ text: 'fix the parser', turnId: 't1' })
  await $.tool.call({ tool: 'Bash', command: 'npm test', description: 'Run the tests' })

  const claim = await $.classic.Stop({
    stop_hook_active: false,
    last_assistant_message: 'Fixed the parser. All tests pass.',
  } as never)
  expect(claim.block).toContain('npm test failed when it last ran')
  const again = await $.classic.Stop({
    stop_hook_active: true,
    last_assistant_message: 'Fixed the parser. All tests pass.',
  } as never)
  expect(again.block).toBeUndefined()

  await $.turn.complete({
    answer: 'Fixed the parser; two tests still fail.',
    durationMs: 5,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })
  await clock.settle()
  const band = await $.ui.mount({ plugin: 'briefing', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /Now: The parser is fixed, but two tests fail\./ })).toBeDefined()
  expect(await band.find({ text: /✗ npm test failed/ })).toBeDefined()
})

test('a question the reply asks without recording it sends Claude back once', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  world(on)

  await $.session.start(START)
  const blocked = await $.classic.Stop({
    stop_hook_active: false,
    last_assistant_message: 'Parser done. Should I also migrate the old configs, or leave them?',
  } as never)
  expect(blocked.block).toContain('"Should I also migrate the old configs, or leave them?"')
  const diagnostic = await $.classic.Stop({
    stop_hook_active: false,
    last_assistant_message: 'What do you see when you click Save?',
  } as never)
  expect(diagnostic.block).toBeUndefined()
})

test('a sign-in stop shows its fix until the session runs again', async ($, on) => {
  mock.clock(on, { now: 1_000_000 })
  world(on, { HERDR_PANE_ID: 'p1' })

  await $.session.start(START)
  await $.classic.StopFailure({ error: 'authentication_failed' } as never)
  expect(ran).toContainEqual([
    'herdr',
    'pane',
    'report-metadata',
    'p1',
    '--source',
    'briefing',
    '--token',
    'inbox=! Signed out: /login',
  ])
  const band = await $.ui.mount({ plugin: 'briefing', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /Stopped .*: sign-in expired\./ })).toBeDefined()

  // The agent hears of it with the person's next prompt.
  const next = await $.prompt.submit({ text: 'logged in, go on', wait: false, origin: { kind: 'composer' } })
  expect(next.context?.join('\n')).toContain('Your last turn stopped: sign-in expired.')
  await $.turn.start({ text: 'logged in, go on', turnId: 't2' })
  expect(await band.find({ text: /Stopped/ })).toBeUndefined()
})

test('after 15 idle minutes the band says what changed while the person was away', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  world(on)

  await $.session.start(START)
  await $.prompt.submit({ text: 'build it overnight', wait: false, origin: { kind: 'composer' } })
  await clock.advance(16 * 60_000)
  await $.tool.call({
    tool: RECORD,
    chose: [{ question: 'Database', options: ['SQLite', 'Postgres'], took: 'SQLite', reason: 'One user' }],
  })
  const band = await $.ui.mount({ plugin: 'briefing', surface: 'terminal', ...BAND })
  expect(await band.find({ text: /Away 16m: Claude chose 1 thing/ })).toBeDefined()

  // Pressing keys does not clear it; the person's next message does.
  await $.prompt.submit({ text: 'thanks', wait: false, origin: { kind: 'composer' } })
  expect(await band.find({ text: /Away/ })).toBeUndefined()
})

test('a headless run does nothing', async ($, on) => {
  mock.clock(on, { now: 1 })
  world(on)

  await $.session.start({ cwd: '/tmp/project', surface: null, isInteractive: false })
  await $.prompt.submit({ text: 'hi', wait: false, origin: { kind: 'sdk' } })
  const held = await $.tool.call({ tool: 'Bash', command: 'git push', description: 'Push' })
  expect(held.deny).toBeUndefined()
  expect(Object.keys(files)).toEqual([])
})
