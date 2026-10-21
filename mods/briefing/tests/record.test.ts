import { describe, expect, test } from 'claude-code/testing'

import {
  EMPTY,
  applyRecord,
  closeTasksRun,
  fullText,
  holdAct,
  matchOption,
  pressDismiss,
  pressOption,
  pressTask,
  pressYourCall,
  prune,
  readInput,
  recordDialog,
  settleAct,
  startAct,
  waitingOn,
} from '../hooks/record'

const asked = applyRecord(
  EMPTY,
  readInput({
    goal: 'Ship the greeting CLI',
    ask: [
      {
        question: 'Publish it to npm now?',
        options: ['Yes', 'No'],
        recommend: 'no',
        reason: 'Docs are not written yet',
      },
    ],
    chose: [
      {
        question: 'Language for the CLI',
        options: ['Node', 'Python'],
        took: 'Node',
        reason: 'The repo is already Node',
      },
    ],
    task: [{ what: 'Sign in to npm', run: 'npm login' }],
  }),
  1000,
)

describe('applyRecord', () => {
  test('assigns stable ids by kind and reports them', () => {
    expect(asked.reply).toContain('d1 asked')
    expect(asked.reply).toContain('d2 recorded')
    expect(asked.reply).toContain('t1 added')
    expect(asked.brief.decisions.map(d => [d.id, d.status, d.pick])).toEqual([
      ['d1', 'waiting', 'No'],
      ['d2', 'made', 'Node'],
    ])
  })

  test('refuses a decision with options but no recommendation and no reason', () => {
    const r = applyRecord(
      EMPTY,
      readInput({ ask: [{ question: 'Which database?', options: ['Postgres', 'SQLite'] }] }),
      1,
    )
    expect(r.brief.decisions).toHaveLength(0)
    expect(r.reply).toContain('no recommendation')
  })

  test('accepts one with a reason for having no recommendation', () => {
    const r = applyRecord(
      EMPTY,
      readInput({
        ask: [{ question: 'Which color for the logo?', options: ['Red', 'Blue'], reason: 'A matter of taste' }],
      }),
      1,
    )
    expect(r.brief.decisions[0]?.pick).toBe(null)
  })

  test('refuses a question that repeats an open one', () => {
    const r = applyRecord(
      asked.brief,
      readInput({ ask: [{ question: 'publish it to NPM now', options: ['Yes', 'No'], recommend: 'No' }] }),
      2,
    )
    expect(r.reply).toContain('repeats open d1')
    expect(r.brief.decisions).toHaveLength(2)
  })

  test('closing an item the person settled leaves their answer as it is', () => {
    const answered = pressOption(asked.brief, 'd1', 'Yes', 5).brief
    const r = applyRecord(answered, readInput({ close: [{ id: 'd1', reason: 'no longer applies' }] }), 6)
    expect(r.reply).toBe('Already settled, so left as they are: d1 (answered: Yes).')
    expect(r.brief.decisions[0]?.status).toBe('answered')
  })

  test('a close with an answer records the person’s words', () => {
    const r = applyRecord(asked.brief, readInput({ close: [{ id: 'd1', answer: 'yes, publish' }] }), 7)
    expect(r.brief.decisions[0]).toMatchObject({ status: 'answered', outcome: 'yes, publish', settledBy: 'person' })
  })

  test('a new goal keeps the choices the person has not reviewed', () => {
    const r = applyRecord(asked.brief, readInput({ goal: 'Write the docs' }), 9)
    expect(r.brief.decisions.find(d => d.id === 'd2')?.status).toBe('made')
  })

  test('a choice for an id the person did not leave to the agent is refused', () => {
    const r = applyRecord(asked.brief, readInput({ chose: [{ id: 'd1', took: 'Yes' }] }), 9)
    expect(r.reply).toContain('d1 is not a decision the person left to you')
    expect(r.brief.decisions[0]?.status).toBe('waiting')
  })
})

describe('presses', () => {
  test('answering an asked decision closes it and quotes the question', () => {
    const p = pressOption(asked.brief, 'd1', 'Yes', 10)
    expect(p.message).toBe('d1 "Publish it to npm now?": Yes')
    expect(p.brief.decisions[0]?.status).toBe('answered')
  })

  test('picking another option of a made decision switches it', () => {
    const p = pressOption(asked.brief, 'd2', 'Python', 10)
    expect(p.message).toBe('Change d2 "Language for the CLI" to Python, instead of Node.')
    expect(p.brief.decisions[1]).toMatchObject({ status: 'switched', outcome: 'Python' })
  })

  test('a second press of the same option is stale and sends nothing', () => {
    const once = pressOption(asked.brief, 'd1', 'Yes', 10)
    const twice = pressOption(once.brief, 'd1', 'Yes', 11)
    expect(twice).toMatchObject({ isStale: true, message: null })
  })

  test('your call hands the decision back with the recommendation', () => {
    const p = pressYourCall(asked.brief, 'd1', 10)
    expect(p.message).toContain('You recommended No')
    expect(p.brief.decisions[0]?.status).toBe('made')
  })

  test('dismissing starts no turn; the agent hears of it with the next prompt', () => {
    const p = pressDismiss(asked.brief, 'd1', 10)
    expect(p.message).toBe(null)
    expect(p.news).toContain('dismissed d1')
  })

  test('a task closes when the person runs its exact command', () => {
    expect(closeTasksRun(asked.brief, 'npm   login', 12).brief.tasks[0]?.status).toBe('done')
    expect(closeTasksRun(asked.brief, 'npm login --scope x', 12).closed).toEqual([])
  })

  test('done on a task tells the agent', () => {
    expect(pressTask(asked.brief, 't1', 'done', 12).message).toBe('Done: t1 "Sign in to npm".')
  })
})

describe('views', () => {
  test('a stop comes first, then held acts, decisions and tasks', () => {
    const held = holdAct(asked.brief, {
      summary: 'Push main to origin',
      verb: 'push',
      tool: 'Bash',
      input: { command: 'git push' },
      at: 3,
    }).brief
    const stopped = { ...held, stop: { kind: 'sign-in' as const, detail: 'authentication_failed', at: 4 } }
    expect(waitingOn(stopped, []).map(w => w.kind)).toEqual(['stop', 'act', 'decision', 'task'])
  })

  test('a question dialog answer is recorded as a decision the person made', () => {
    const b = recordDialog(
      asked.brief,
      [{ question: 'Which port?', label: 'Port', options: ['3000', '8080'], answer: '8080' }],
      false,
      20,
    )
    expect(b.decisions.at(-1)).toMatchObject({
      id: 'd3',
      status: 'answered',
      outcome: '8080',
      settledBy: 'person',
      isDialog: true,
    })
  })

  test('a dialog that timed out while the person was away records Claude’s choice, which they can switch', () => {
    const b = recordDialog(
      asked.brief,
      [{ question: 'Which port?', label: 'Port', options: ['3000', '8080'], answer: '3000' }],
      true,
      20,
    )
    expect(b.decisions.at(-1)).toMatchObject({
      id: 'd3',
      status: 'made',
      pick: '3000',
      settledBy: null,
      isTimedOut: true,
    })
  })

  test('a held act runs once, however many presses reach it', () => {
    const held = holdAct(asked.brief, {
      summary: 'Push main to origin',
      verb: 'push',
      tool: 'Bash',
      input: { command: 'git push' },
      at: 3,
    }).brief
    const first = startAct(held, 'a1')
    expect(first.act?.status).toBe('running')
    expect(startAct(first.brief, 'a1').act).toBe(null)
    expect(settleAct(first.brief, 'a1', 'ran', 'ok', 5).acts[0]?.status).toBe('ran')
  })

  test('choices leave the record half a day after Claude made them; waiting items stay', () => {
    const later = prune(asked.brief, 1000 + 13 * 60 * 60_000)
    expect(later.decisions.map(d => d.id)).toEqual(['d1'])
  })

  test('the full copy lists open items by id', () => {
    const text = fullText(asked.brief) ?? ''
    expect(text).toContain('Goal: Ship the greeting CLI')
    expect(text).toContain('d1 waits on the person')
    expect(text).toContain('d2 you chose: Language for the CLI → Node')
  })

  test('matchOption accepts a short form of an option', () => {
    expect(matchOption(['Use Node 22', 'Python'], 'node')).toBe('Use Node 22')
    expect(matchOption(['Yes', 'No'], 'maybe')).toBe(null)
  })
})
