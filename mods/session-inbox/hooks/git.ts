// Reading the working tree's content from git output, so a check can tell
// whether the files changed after it ran. Parsing is pure; register.tsx runs
// the commands, none of which write to the repo.

import type { Snapshot } from '../types'

/** Reads `git status --porcelain=v1 -z -uall`: each path whose content differs from HEAD. A rename's old path is a deleted one. */
export function readChanged(stdout: string): { path: string; isDeleted: boolean }[] {
  const fields = stdout.split('\0')
  const changed: { path: string; isDeleted: boolean }[] = []
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i] ?? ''
    if (field === '') continue
    const x = field[0]
    const y = field[1]
    changed.push({ path: field.slice(3), isDeleted: y === 'D' || (x === 'D' && y === ' ') })
    // A rename or copy is followed by its source path, which a rename leaves absent.
    if (x === 'R' || x === 'C') {
      i++
      const source = fields[i]
      if (x === 'R' && source) changed.push({ path: source, isDeleted: true })
    }
  }

  return changed
}

/** Reads `git ls-tree -z <tree> -- <paths>`: each path's object id. */
export function readLsTree(stdout: string): Record<string, string> {
  const ids: Record<string, string> = {}
  for (const entry of stdout.split('\0')) {
    const tab = entry.indexOf('\t')
    if (tab < 0) continue
    const id = entry.slice(0, tab).split(' ')[2]
    if (id) ids[entry.slice(tab + 1)] = id
  }

  return ids
}

export function sameSnapshot(a: Snapshot, b: Snapshot): boolean {
  const keys = Object.keys(a.dirty)

  return a.head === b.head && keys.length === Object.keys(b.dirty).length && keys.every(k => b.dirty[k] === a.dirty[k])
}

/** The paths whose content can differ between two snapshots, given the paths the commits between their heads changed. */
export function candidates(a: Snapshot, b: Snapshot, committed: string[]): string[] {
  return [...new Set([...Object.keys(a.dirty), ...Object.keys(b.dirty), ...committed])]
}

/**
 * The paths whose content differs between two snapshots, given each candidate
 * path's object id in each one's HEAD. A path's content is its uncommitted
 * hash, else its id in HEAD; a missing path counts as empty either way. So a
 * commit, which moves content from uncommitted to HEAD, changes nothing.
 */
export function changedPaths(
  a: Snapshot,
  b: Snapshot,
  paths: string[],
  before: Record<string, string>,
  after: Record<string, string>,
): string[] {
  return paths.filter(p => (a.dirty[p] ?? before[p] ?? '') !== (b.dirty[p] ?? after[p] ?? ''))
}
