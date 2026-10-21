import { describe, expect, test } from 'claude-code/testing'

import type { Check } from '../types'
import { EMPTY, applyRecord, readInput, recordCheck, waitingOn } from '../hooks/record'
import { checkMessage, contradictedClaim, unrecordedQuestions } from '../hooks/turn-check'
import { awaySummary, checkProblem, lineText } from '../hooks/views'

const brief = applyRecord(
  EMPTY,
  readInput({
    ask: [
      {
        question: 'Publish version 0.3.0 of the CLI to npm now?',
        label: 'Publish to npm',
        options: ['Yes', 'No'],
        recommend: 'No',
        reason: 'Docs first',
      },
    ],
    task: [{ what: 'Sign in to the npm registry from this machine', run: 'npm login' }],
  }),
  1000,
).brief

describe('lineText', () => {
  test('names the first thing waiting by its label, with how many more', () => {
    expect(lineText(waitingOn(brief, []))).toBe('? Publish to npm +1')
  })

  test('cuts an item without a label to fit the sidebar', () => {
    const line = lineText(waitingOn({ ...brief, decisions: [] }, []))
    expect(line).toBe('? Sign in to the npm…')
    expect(line.length).toBeLessThanOrEqual(22)
  })

  test('a stop names its fix, and nothing waiting is an empty line', () => {
    expect(
      lineText(waitingOn({ ...EMPTY, stop: { kind: 'sign-in', detail: 'authentication_failed', at: 1 } }, [])),
    ).toBe('! Signed out: /login')
    expect(lineText(waitingOn(EMPTY, []))).toBe('')
  })
})

describe('awaySummary', () => {
  test('counts what changed while the person was away, not a list', () => {
    const chose = applyRecord(
      brief,
      readInput({
        chose: [
          { question: 'Language', took: 'Node' },
          { question: 'Port', took: '3000' },
        ],
      }),
      5000,
    ).brief
    const failed = recordCheck(chose, { name: 'tsc', kind: 'types', result: 'fail', summary: '3 errors', ranAt: 6000 })
    expect(awaySummary(failed.log, 2000, 2000 + 90 * 60_000)).toBe('Away 1h 30m: Claude chose 2 things, 1 check failed')
    expect(awaySummary(failed.log, 7000, 8000)).toBe(null)
  })
})

// A check that ran at 10; the files last changed at 5 (before it) or 20 (after it).
const ran = (result: Check['result']): Check => ({
  name: 'bun test',
  kind: 'tests',
  result,
  summary: result === 'fail' ? '2 fail' : '25 pass',
  ranAt: 10,
})

describe('checkProblem', () => {
  test('a failed check comes first, then a passing one that predates the last edit', () => {
    expect(checkProblem([ran('fail')], 5)).toEqual({ text: '✗ bun test failed', isFailure: true })
    expect(checkProblem([ran('pass')], 20)).toEqual({ text: 'Not checked since the last edit', isFailure: false })
    expect(checkProblem([ran('pass')], 5)).toBe(null)
  })
})

describe('the end-of-turn check', () => {
  test('finds a choice put to the person that no item records', () => {
    expect(
      unrecordedQuestions('Done with the parser.\n\nShould I also migrate the old configs, or leave them?', []),
    ).toEqual(['Should I also migrate the old configs, or leave them?'])
  })

  test('leaves questions about what the person saw, answered ones, recorded items, and code alone', () => {
    expect(unrecordedQuestions('What do you see when you click Save?', [])).toEqual([])
    expect(unrecordedQuestions('Should I keep the old flag? No: nothing reads it, so I removed it.', [])).toEqual([])
    expect(unrecordedQuestions('d3 waits on you: publish now?', [])).toEqual([])
    expect(unrecordedQuestions('```\nshould I? or not?\n```\nAll set.', [])).toEqual([])
    const waiting = applyRecord(
      EMPTY,
      readInput({
        ask: [{ question: 'Migrate the old configs now?', options: ['Yes', 'No'], recommend: 'No', reason: 'Risky' }],
      }),
      1,
    ).brief.decisions
    expect(unrecordedQuestions('Should I migrate the old configs now?', waiting)).toEqual([])
  })

  test('catches a success claim the latest check contradicts', () => {
    expect(contradictedClaim('All tests pass now.', [ran('fail')], 5)?.problem).toBe(
      'bun test failed when it last ran (2 fail)',
    )
    expect(contradictedClaim('All tests pass.', [ran('pass')], 20)?.problem).toBe(
      'the files changed after bun test last ran',
    )
    expect(contradictedClaim('All tests pass.', [ran('pass')], 5)).toBe(null)
  })

  test('leaves hedged claims and claims with no measured check alone', () => {
    expect(contradictedClaim('The tests should pass once CI runs.', [ran('fail')], 5)).toBe(null)
    expect(contradictedClaim('Types are clean.', [ran('fail')], 5)).toBe(null)
  })

  test('sends the agent back once, with everything it must fix in one message', () => {
    expect(checkMessage([], null, [])).toBe(null)
    const message =
      checkMessage(
        ['Should I bump the version?'],
        { claim: 'All tests pass.', problem: 'the files changed after bun test last ran' },
        [],
      ) ?? ''
    expect(message).toContain('"Should I bump the version?"')
    expect(message).toContain('the files changed after bun test last ran')
  })
})
