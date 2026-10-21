import { describe, expect, test } from 'claude-code/testing'

import { candidates, contentDiffers, readLsTree, readStatus } from '../hooks/git'

const z = (...fields: string[]) => `${fields.join('\0')}\0`

describe('readStatus', () => {
  test('reads the branch, its upstream counts and the changed paths', () => {
    expect(
      readStatus(
        z(
          '## main...origin/main [ahead 3, behind 1]',
          ' M hooks/a.ts',
          '?? docs/new.md',
          'R  new.ts',
          'old.ts',
          ' D gone.ts',
        ),
      ),
    ).toEqual({
      branch: 'main',
      ahead: 3,
      behind: 1,
      changed: [
        { path: 'hooks/a.ts', isDeleted: false },
        { path: 'docs/new.md', isDeleted: false },
        { path: 'new.ts', isDeleted: false },
        { path: 'old.ts', isDeleted: true },
        { path: 'gone.ts', isDeleted: true },
      ],
      files: 4,
    })
  })

  test('a branch with no upstream has no counts, and one in step has zeros', () => {
    expect(readStatus(z('## feature/x'))).toEqual({
      branch: 'feature/x',
      ahead: null,
      behind: null,
      changed: [],
      files: 0,
    })
    expect(readStatus(z('## main...origin/main'))).toMatchObject({ ahead: 0, behind: 0 })
  })

  test('a detached head has no branch', () => {
    expect(readStatus(z('## HEAD (no branch)', ' M a')).branch).toBe(null)
  })
})

describe('readLsTree', () => {
  test('reads each path’s object id, spaces included', () => {
    expect(readLsTree(z('100644 blob abc123\ta.ts', '100644 blob def456\tdir/b c.ts'))).toEqual({
      'a.ts': 'abc123',
      'dir/b c.ts': 'def456',
    })
  })
})

describe('contentDiffers', () => {
  const head = { 'a.ts': 'A1', 'b.ts': 'B1' }
  const clean = { head: 'h1', dirty: {} }

  test('a commit only moves content into HEAD, so nothing changed', () => {
    const edited = { head: 'h1', dirty: { 'a.ts': 'A2' } }
    const committed = { head: 'h2', dirty: {} }
    expect(
      contentDiffers(edited, committed, candidates(edited, committed, ['a.ts']), head, { ...head, 'a.ts': 'A2' }),
    ).toBe(false)
  })

  test('an edit, a new file, a deletion and an undone edit each change the content', () => {
    expect(contentDiffers(clean, { head: 'h1', dirty: { 'a.ts': 'A2' } }, ['a.ts'], head, head)).toBe(true)
    expect(contentDiffers(clean, { head: 'h1', dirty: { 'new.ts': 'N1' } }, ['new.ts'], head, head)).toBe(true)
    expect(contentDiffers(clean, { head: 'h1', dirty: { 'b.ts': '' } }, ['b.ts'], head, head)).toBe(true)
    expect(contentDiffers({ head: 'h1', dirty: { 'a.ts': 'A2' } }, clean, ['a.ts'], head, head)).toBe(true)
  })
})
