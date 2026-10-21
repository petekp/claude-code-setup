// Where the work lives and what it holds, read from git without writing to
// the repo: the branch, what is uncommitted and unpushed, and a snapshot of
// the files' content. Parsing is pure; register.tsx runs the commands.

import type { Snapshot } from '../types'

export type Status = {
  branch: string | null
  /** Commits on this branch that its upstream lacks; null with no upstream. */
  ahead: number | null
  behind: number | null
  /** Paths whose content differs from HEAD, untracked files included. A rename's old path is a deleted one. */
  changed: { path: string; isDeleted: boolean }[]
  /** Uncommitted files, counting a rename once. */
  files: number
}

function readBranch(line: string): Pick<Status, 'branch' | 'ahead' | 'behind'> {
  if (line.startsWith('No commits yet on '))
    return { branch: line.slice('No commits yet on '.length), ahead: null, behind: null }
  if (line.startsWith('HEAD (no branch)')) return { branch: null, ahead: null, behind: null }
  const m = line.match(/^(.+?)(?:\.\.\.(\S+))?(?: \[(.*)\])?$/)
  const hasUpstream = Boolean(m?.[2])

  return {
    branch: m?.[1] ?? null,
    ahead: hasUpstream ? Number(m?.[3]?.match(/ahead (\d+)/)?.[1] ?? 0) : null,
    behind: hasUpstream ? Number(m?.[3]?.match(/behind (\d+)/)?.[1] ?? 0) : null,
  }
}

/** Reads `git status --porcelain=v1 -z --branch -uall`. */
export function readStatus(stdout: string): Status {
  const fields = stdout.split('\0')
  let branch: Pick<Status, 'branch' | 'ahead' | 'behind'> = { branch: null, ahead: null, behind: null }
  const changed: Status['changed'] = []
  let files = 0
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i] ?? ''
    if (field === '') continue
    if (field.startsWith('## ')) {
      branch = readBranch(field.slice(3))
      continue
    }
    const x = field[0]
    const y = field[1]
    changed.push({ path: field.slice(3), isDeleted: y === 'D' || (x === 'D' && y === ' ') })
    files++
    // A rename or copy is followed by its source path, which a rename leaves absent.
    if (x === 'R' || x === 'C') {
      i++
      const source = fields[i]
      if (x === 'R' && source) changed.push({ path: source, isDeleted: true })
    }
  }

  return { ...branch, changed, files }
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

export function sameDirty(a: Snapshot['dirty'], b: Snapshot['dirty']): boolean {
  const keys = Object.keys(a)

  return keys.length === Object.keys(b).length && keys.every(k => b[k] === a[k])
}

/** The paths whose content can differ between two snapshots, given the paths the commits between their heads changed. */
export function candidates(a: Snapshot, b: Snapshot, committed: string[]): string[] {
  return [...new Set([...Object.keys(a.dirty), ...Object.keys(b.dirty), ...committed])]
}

/**
 * Whether two snapshots hold different content, given each candidate path's
 * object id in each one's HEAD. A path's content is its uncommitted hash, else
 * its id in HEAD; a missing path counts as empty either way. So a commit,
 * which moves content from uncommitted to HEAD, changes nothing.
 */
export function contentDiffers(
  a: Snapshot,
  b: Snapshot,
  paths: string[],
  before: Record<string, string>,
  after: Record<string, string>,
): boolean {
  return paths.some(p => (a.dirty[p] ?? before[p] ?? '') !== (b.dirty[p] ?? after[p] ?? ''))
}
