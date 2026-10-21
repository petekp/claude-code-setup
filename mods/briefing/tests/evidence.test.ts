import { describe, expect, test } from 'claude-code/testing'

import { checksIn, doingNow, readResults, stopKindOf } from '../hooks/evidence'

describe('checksIn', () => {
  test('finds each check in a compound command, once', () => {
    const command =
      'cd mods/x && claude plugin test . > t.log 2>&1; echo "test exit $?"; npx -y -p typescript tsc --noEmit -p . > c.log 2>&1; echo "tsc exit $?"'
    expect(checksIn(command).map(c => c.name)).toEqual(['plugin tests', 'tsc'])
  })

  test('ignores commands that only read or print', () => {
    expect(checksIn('cat t.log | grep pass')).toEqual([])
    expect(checksIn('git log --oneline -5')).toEqual([])
    expect(checksIn('echo "run bun test later"')).toEqual([])
  })

  test('names common runners by kind', () => {
    expect(checksIn('bun test tests/a.test.ts')).toEqual([{ name: 'bun test', kind: 'tests' }])
    expect(checksIn('npm run build')).toEqual([{ name: 'npm build', kind: 'build' }])
    expect(checksIn('./scripts/validate.sh')).toEqual([{ name: 'validate.sh', kind: 'validate' }])
    expect(checksIn('xcodebuild -scheme App test')).toEqual([{ name: 'xcodebuild test', kind: 'tests' }])
    expect(checksIn('node --test')).toEqual([{ name: 'node --test', kind: 'tests' }])
  })

  test('finds a package manager script behind its options', () => {
    expect(checksIn('npm --prefix /work/app test > t.log 2>&1')).toEqual([{ name: 'npm test', kind: 'tests' }])
    expect(checksIn('pnpm -C app run lint')).toEqual([{ name: 'lint', kind: 'lint' }])
    expect(checksIn('yarn --silent build')).toEqual([{ name: 'yarn build', kind: 'build' }])
  })
})

describe('readResults', () => {
  test('a labeled exit line decides each check', () => {
    const command = 'bun test > t.log; echo "test exit $?"; tsc > c.log; echo "tsc exit $?"'
    const results = readResults(command, checksIn(command), 'test exit 0\ntsc exit 2\n', false)
    expect(results.map(r => r.result)).toEqual(['pass', 'fail'])
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

  test('counts decide a check whose exit status is not its own', () => {
    const [r] = readResults(
      'npm test; echo done',
      [{ name: 'npm test', kind: 'tests' }],
      'ℹ tests 5\nℹ pass 4\nℹ fail 1\ndone\n',
      false,
    )
    expect(r).toMatchObject({ result: 'fail', summary: '4 pass, 1 fail' })
  })

  test('a check named only inside quotes or a commit message is not run', () => {
    expect(checksIn('git commit -m "Fix tsc errors and jest setup"')).toEqual([])
    expect(checksIn('brew doctor')).toEqual([])
  })

  test('a filtered command without counts is unknown, since the exit status is the filter’s', () => {
    const [r] = readResults('npm run build | tail -3', [{ name: 'npm build', kind: 'build' }], 'done in 2s', false)
    expect(r?.result).toBe('unknown')
  })

  test('tsc errors fail the check', () => {
    const [r] = readResults(
      'tsc --noEmit',
      [{ name: 'tsc', kind: 'types' }],
      "hooks/a.ts(3,1): error TS2304: Cannot find name 'x'.",
      true,
    )
    expect(r?.result).toBe('fail')
  })
})

describe('doingNow', () => {
  test('prefers a Bash call’s own description', () => {
    expect(doingNow('Bash', { command: 'bun test', description: 'Run the unit tests' })).toBe('Run the unit tests')
  })

  test('names the file being edited, without its folder', () => {
    expect(doingNow('Edit', { file_path: '/repo/hooks/pane.tsx' })).toBe('Editing pane.tsx')
  })
})

describe('stopKindOf', () => {
  test('maps the engine’s error words to what the person must do', () => {
    expect(stopKindOf('authentication_failed')).toBe('sign-in')
    expect(stopKindOf('rate_limit')).toBe('usage-limit')
    expect(stopKindOf('billing_error')).toBe('billing')
    expect(stopKindOf('overloaded')).toBe('api-error')
  })
})
