import { describe, expect, test } from 'claude-code/testing'

import { EMPTY, answerNote, applyUpdate, carryText, latestBatch, olderItems, parseReply, readCommandRow, statusLine, tasksRunBy } from '../hooks/ledger'

const REPLY = `GOAL: Move annotation queue logic into a tested reducer
DONE: Reducer built on its own branch
DONE: 422 unit tests pass
NOW: Waiting on approval to run input tests
RUNNING: vite dev: http://localhost:5173
NEW: decide | 1 | Rename Send.swift to Herdr? | Yes / No | yes
NEW: decide | 2 | Cut TODOS.md down to open items? | - | -
NEW: do | - | Test pinch zoom on your Mac | - | -`

describe('parseReply', () => {
  test('reads every key of the line format', () => {
    const u = parseReply(REPLY)
    expect(u?.card.goal).toBe('Move annotation queue logic into a tested reducer')
    expect(u?.card.done).toEqual(['Reducer built on its own branch', '422 unit tests pass'])
    expect(u?.card.running).toEqual(['vite dev: http://localhost:5173'])
    expect(u?.added.map(a => [a.kind, a.label, a.rec])).toEqual([
      ['decide', '1', 'yes'],
      ['decide', '2', null],
      ['do', null, null],
    ])
    expect(u?.added[0]?.options).toEqual(['Yes', 'No'])
  })

  test('keeps HELP lines quoted from the reply, attached to the item they name', () => {
    const reply = [
      'Edit ~/.claude/settings.json and paste:',
      '```',
      'first',
      '```',
      '```json',
      '{ "env": {} }',
      '```',
      'Then run `! node --version` and `npm login`. Docs: https://example.com/tokens',
    ].join('\n')
    const u = parseReply(
      [
        'NEW: do | - | Add the plugin folder to settings.json | - | -',
        'NEW: decide | - | Move the mod into the repo? | Yes / No | Yes',
        'HELP: new 1 | open | ~/.claude/settings.json | -',
        'HELP: new 1 | copy | block 2 | settings snippet',
        'HELP: new 1 | copy | ! node --version | -',
        'HELP: new 1 | run | `! node --version` | -',
        'HELP: new 1 | link | https://example.com/invented | -',
        'HELP: new 2 | open | ~/somewhere/else.md | -',
        'HELP: new 2 | run | npm login | -',
        'HELP: i4 | link | https://example.com/tokens | token page',
      ].join('\n'),
      reply,
    )
    expect(u?.added[0]?.helps).toEqual([
      { kind: 'open', path: '~/.claude/settings.json' },
      { kind: 'copy', text: '{ "env": {} }', name: 'settings snippet' },
      { kind: 'run', command: 'node --version', name: null },
    ])
    // A sign-in command needs the person's terminal, so it becomes a copy button.
    expect(u?.added[1]?.helps).toEqual([{ kind: 'terminal', command: 'npm login', name: null }])
    expect(u?.helped).toEqual([{ id: 'i4', help: { kind: 'link', url: 'https://example.com/tokens', name: 'token page' } }])
  })

  test('returns null for prose with no keys', () => {
    expect(parseReply('Sure! Here is the ledger you asked for.')).toBe(null)
  })
})

describe('applyUpdate', () => {
  test('numbers new items, closes answered ones, and remembers the batch', () => {
    const first = applyUpdate({ ...EMPTY, turn: 1 }, parseReply(REPLY)!, 1000, 1)
    expect(first.items.map(i => i.id)).toEqual(['i1', 'i2', 'i3'])
    expect(latestBatch(first).length).toBe(3)

    const second = applyUpdate(
      { ...first, turn: 2 },
      parseReply('GOAL: same\nNOW: renamed\nCLOSED: i1 | yes, renamed\nNEW: decide | - | Push the branch? | - | yes')!,
      2000,
      2,
    )
    expect(second.items.map(i => i.id)).toEqual(['i2', 'i3', 'i4'])
    expect(second.decided).toEqual([{ id: 'i1', ask: 'Rename Send.swift to Herdr?', outcome: 'yes, renamed', at: 2000 }])
    expect(latestBatch(second).map(i => i.id)).toEqual(['i4'])
    expect(olderItems(second).map(i => i.id)).toEqual(['i2', 'i3'])
    expect(second.card?.done).toEqual(first.card?.done)
  })

  test('drops items left unanswered for more than 12 prompts', () => {
    const first = applyUpdate({ ...EMPTY, turn: 1 }, parseReply(REPLY)!, 1, 1)
    const later = applyUpdate({ ...first, turn: 14 }, parseReply('NOW: still going')!, 2, 14)
    expect(later.items.length).toBe(0)
    expect(applyUpdate({ ...first, turn: 13 }, parseReply('NOW: still going')!, 2, 13).items.length).toBe(3)
  })

  test('merges a reworded copy of an open item instead of adding it', () => {
    const first = applyUpdate(EMPTY, parseReply('NEW: decide | 2 | Make Papercuts backups use cp -n with a letter suffix? | Yes / No | Yes')!, 1, 1)
    const again = applyUpdate(
      first,
      parseReply(
        [
          'NEW: decide | - | Use cp -n and a letter suffix for same-day Papercuts backups? | Yes / No | Yes',
          'NEW: decide | - | Also back up TODOS.md before triage? | Yes / No | -',
        ].join('\n'),
      )!,
      2,
      2,
    )
    expect(again.items.map(i => i.ask)).toEqual(['Make Papercuts backups use cp -n with a letter suffix?', 'Also back up TODOS.md before triage?'])
  })

  test('does not add an item that is already open', () => {
    const first = applyUpdate(EMPTY, parseReply(REPLY)!, 1, 1)
    const again = applyUpdate(first, parseReply('NEW: decide | 1 | rename send.swift to herdr | - | -')!, 2, 2)
    expect(again.items.length).toBe(3)
  })
})

describe('answerNote', () => {
  const ledger = applyUpdate({ ...EMPTY, turn: 1 }, parseReply(REPLY)!, 1, 1)

  test('maps numbered answers to the latest batch by label', () => {
    const note = answerNote({ ...ledger, turn: 2 }, '1. yes\n2. keep it', 2)
    expect(note).toContain('1 → "Rename Send.swift to Herdr?"')
    expect(note).toContain('2 → "Cut TODOS.md down to open items?"')
  })

  test('maps answers written on one line', () => {
    const note = answerNote({ ...ledger, turn: 2 }, '1. node 2. yes', 2)
    expect(note).toContain('2 → "Cut TODOS.md down to open items?"')
  })

  test('does not read a number mid-sentence as an answer', () => {
    expect(answerNote({ ...ledger, turn: 2 }, 'i was looking at bullet 2. it reads oddly', 2)).toBe(null)
  })

  test('offers the recommendations for a bare "go"', () => {
    expect(answerNote({ ...ledger, turn: 2 }, 'go', 2)).toContain('recommended: yes')
  })

  test('ignores numbers once the batch is a turn old', () => {
    expect(answerNote({ ...ledger, turn: 3 }, '1. yes', 3)).toBe(null)
  })

  test('recognizes an item quoted from the band', () => {
    expect(answerNote({ ...ledger, turn: 5 }, 'Re "Test pinch zoom on your Mac": done, works', 5)).toContain(
      'an action for the user',
    )
  })

  test('says nothing for an ordinary prompt', () => {
    expect(answerNote({ ...ledger, turn: 2 }, 'can you also fix the toolbar?', 2)).toBe(null)
  })
})

describe('carryText', () => {
  test('is empty for an empty ledger and lists open items otherwise', () => {
    expect(carryText(EMPTY, 'T')).toBe(null)
    const text = carryText(applyUpdate(EMPTY, parseReply(REPLY)!, 1, 1), 'T')
    expect(text).toContain('Goal: Move annotation queue logic')
    expect(text).toContain('(1) "Rename Send.swift to Herdr?"')
  })
})

describe("the person's own commands", () => {
  test('reads a ! command, its output and a slash command from their transcript rows', () => {
    expect(readCommandRow('<bash-input>npm login</bash-input>')).toEqual({ kind: 'shell', command: 'npm login' })
    expect(readCommandRow('<bash-stdout>Logged in</bash-stdout><bash-stderr></bash-stderr>')).toEqual({ kind: 'output', stdout: 'Logged in', stderr: '' })
    expect(readCommandRow('<command-name>/context</command-name>\n<command-message>context</command-message>\n<command-args></command-args>')).toEqual({
      kind: 'slash',
      name: 'context',
      args: '',
    })
    expect(readCommandRow('add a greeting cli')).toBeNull()
  })

  test('a command closes only the task whose step is that exact command', () => {
    const reply = 'Run `npm login`, then `npm publish`.'
    const ledger = applyUpdate(
      EMPTY,
      parseReply('GOAL: Publish\nNOW: Waiting on sign-in\nNEW: do | - | Sign in to npm | - | -\nHELP: new 1 | run | npm login | sign-in\nNEW: do | - | Publish the package | - | -\nHELP: new 2 | run | npm publish | publish', reply)!,
      1,
      1,
    )
    expect(tasksRunBy(ledger, '  npm   login ').map(i => i.ask)).toEqual(['Sign in to npm'])
    expect(tasksRunBy(ledger, 'npm login --scope=@me')).toEqual([])
  })
})

describe('statusLine', () => {
  test('names the first waiting item after the count, and says where the work stands when nothing waits', () => {
    const waiting = applyUpdate(EMPTY, parseReply(REPLY)!, 1, 1)
    expect(statusLine(waiting)).toBe('3 · Rename Send.swift to Herdr?')
    const settled = applyUpdate(waiting, parseReply('GOAL: g\nNOW: Reducer merged\nCLOSED: i1 | yes\nCLOSED: i2 | no\nCLOSED: i3 | done')!, 2, 2)
    expect(statusLine(settled)).toBe('Reducer merged')
    expect(statusLine(EMPTY)).toBe('')
  })
})
