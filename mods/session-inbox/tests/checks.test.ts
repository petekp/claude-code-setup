import { describe, expect, test } from 'claude-code/testing'

import type { Check, Checks } from '../types'
import { checksIn, contradictedClaim, readResults } from '../hooks/checks'
import { candidates, changedPaths, readChanged, readLsTree } from '../hooks/git'

describe('checksIn', () => {
  test('finds each check in a compound command, once', () => {
    const command =
      'cd mods/x && claude plugin test . > t.log 2>&1; echo "test exit $?"; npx -y -p typescript tsc --noEmit -p . > c.log 2>&1; echo "tsc exit $?"'
    expect(checksIn(command).map(c => c.name)).toEqual(['plugin tests', 'tsc'])
  })

  test('ignores commands that only read or print, and checks named inside quotes', () => {
    expect(checksIn('cat t.log | grep pass')).toEqual([])
    expect(checksIn('echo "run bun test later"')).toEqual([])
    expect(checksIn('git commit -m "Fix tsc errors and jest setup"')).toEqual([])
  })

  test('names common runners by kind, behind a package manager’s options', () => {
    expect(checksIn('npm run build')).toEqual([{ name: 'npm build', kind: 'build' }])
    expect(checksIn('./scripts/validate.sh')).toEqual([{ name: 'validate.sh', kind: 'validate' }])
    expect(checksIn('npm --prefix /work/app test > t.log 2>&1')).toEqual([{ name: 'npm test', kind: 'tests' }])
    expect(checksIn('pnpm -C app run lint')).toEqual([{ name: 'lint', kind: 'lint' }])
  })
})

describe('readResults', () => {
  test('a labeled exit line decides each check', () => {
    const command = 'bun test > t.log; echo "test exit $?"; tsc > c.log; echo "tsc exit $?"'
    expect(readResults(command, checksIn(command), 'test exit 0\ntsc exit 2\n', false).map(r => r.result)).toEqual([
      'pass',
      'fail',
    ])
  })

  test('a lone check that ends the command is decided by its exit status; counts describe it', () => {
    const [failed] = readResults(
      'bun test',
      [{ name: 'bun test', kind: 'tests' }],
      ' 24 pass\n 1 fail\nRan 25 tests across 3 files.',
      true,
    )
    expect(failed).toMatchObject({ result: 'fail', summary: '24 pass, 1 fail' })
    // A test named after errors does not fail a clean run.
    const [passed] = readResults(
      'bun test',
      [{ name: 'bun test', kind: 'tests' }],
      '(pass) reports 2 errors\n 25 pass\n 0 fail\n',
      false,
    )
    expect(passed).toMatchObject({ result: 'pass', summary: '25 pass, 0 fail' })
  })

  test('reads an exit status printed as exit=N or by a bare echo', () => {
    const command = 'npm test > /tmp/t.log 2>&1; echo "exit=$?"'
    expect(readResults(command, checksIn(command), 'exit=1', false)[0]?.result).toBe('fail')
    const bare = 'npm test > /tmp/t.log 2>&1; echo $?'
    expect(readResults(bare, checksIn(bare), '1\n', false)[0]?.result).toBe('fail')
  })

  test('output sent to a file with no exit status shown is unknown', () => {
    const command = 'npm test > /tmp/t.log 2>&1; echo done'
    expect(readResults(command, checksIn(command), 'done', false)[0]?.result).toBe('unknown')
  })

  test('a filtered command without counts is unknown, since the exit status is the filter’s', () => {
    const [r] = readResults('npm run build | tail -3', [{ name: 'npm build', kind: 'build' }], 'done in 2s', false)
    expect(r?.result).toBe('unknown')
  })
})

describe('contradictedClaim', () => {
  const ran = (result: Check['result']): Check => ({
    name: 'bun test',
    kind: 'tests',
    result,
    summary: result === 'fail' ? '2 fail' : '',
    ranAt: 10,
  })
  const checks = (result: Check['result'], changedAt: number, codeChangedAt: number): Checks => ({
    results: [ran(result)],
    snapshot: null,
    changedAt,
    codeChangedAt,
  })

  test('a success claim meets a failed or older run', () => {
    expect(contradictedClaim('All tests pass now.', checks('fail', 5, 5))?.problem).toBe(
      'bun test failed when it last ran (2 fail)',
    )
    expect(contradictedClaim('All tests pass.', checks('pass', 20, 20))?.problem).toBe(
      'the files changed after bun test last ran',
    )
    expect(contradictedClaim('All tests pass.', checks('pass', 5, 5))).toBe(null)
  })

  test('a Markdown edit after the run leaves tests current', () => {
    expect(contradictedClaim('All tests pass.', checks('pass', 20, 5))).toBe(null)
  })

  test('leaves hedged claims and claims with no check of their kind alone', () => {
    expect(contradictedClaim('The tests should pass once CI runs.', checks('fail', 5, 5))).toBe(null)
    expect(contradictedClaim('Types are clean.', checks('fail', 5, 5))).toBe(null)
  })
})

const z = (...fields: string[]) => `${fields.join('\0')}\0`

describe('git', () => {
  test('reads changed paths, with a rename’s old path as deleted', () => {
    expect(readChanged(z(' M hooks/a.ts', '?? docs/new.md', 'R  new.ts', 'old.ts', ' D gone.ts'))).toEqual([
      { path: 'hooks/a.ts', isDeleted: false },
      { path: 'docs/new.md', isDeleted: false },
      { path: 'new.ts', isDeleted: false },
      { path: 'old.ts', isDeleted: true },
      { path: 'gone.ts', isDeleted: true },
    ])
    expect(readLsTree(z('100644 blob abc123\ta.ts', '100644 blob def456\tdir/b c.ts'))).toEqual({
      'a.ts': 'abc123',
      'dir/b c.ts': 'def456',
    })
  })

  test('a commit only moves content into HEAD, so nothing changed', () => {
    const head = { 'a.ts': 'A1', 'b.ts': 'B1' }
    const edited = { head: 'h1', dirty: { 'a.ts': 'A2' } }
    const committed = { head: 'h2', dirty: {} }
    expect(
      changedPaths(edited, committed, candidates(edited, committed, ['a.ts']), head, { ...head, 'a.ts': 'A2' }),
    ).toEqual([])
  })

  test('an edit, a new file, a deletion and an undone edit each change the content', () => {
    const head = { 'a.ts': 'A1', 'b.ts': 'B1' }
    const clean = { head: 'h1', dirty: {} }
    expect(changedPaths(clean, { head: 'h1', dirty: { 'a.ts': 'A2' } }, ['a.ts'], head, head)).toEqual(['a.ts'])
    expect(changedPaths(clean, { head: 'h1', dirty: { 'new.ts': 'N1' } }, ['new.ts'], head, head)).toEqual(['new.ts'])
    expect(changedPaths(clean, { head: 'h1', dirty: { 'b.ts': '' } }, ['b.ts'], head, head)).toEqual(['b.ts'])
    expect(changedPaths({ head: 'h1', dirty: { 'a.ts': 'A2' } }, clean, ['a.ts'], head, head)).toEqual(['a.ts'])
  })
})
