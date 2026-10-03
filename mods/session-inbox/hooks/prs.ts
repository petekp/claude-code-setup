import type { PrCheck, PrThread, PrView } from '../types'

const NL = '\n'
const PR_URL = /https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/pull\/(\d+)/g

/** "owner/repo#123" for each GitHub PR link in the text, in order, without repeats. */
export function prRefs(text: string): string[] {
  return [...new Set([...text.matchAll(PR_URL)].map(m => `${m[1]}#${m[2]}`))]
}

/** "owner/repo#123" as its parts. */
export function parseRef(ref: string): { repo: string; owner: string; name: string; number: string } {
  const [repo = '', number = ''] = ref.split('#')
  const [owner = '', name = ''] = repo.split('/')

  return { repo, owner, name, number }
}

/** The fields `gh pr view --json` returns that the tab uses. */
export const VIEW_FIELDS = 'number,title,url,isDraft,state,baseRefName,mergeable,reviewDecision,statusCheckRollup'

/**
 * Unresolved review threads: the first comment, which states the finding, and
 * who wrote the last one, which says whose turn it is.
 */
export const THREADS_QUERY = `query($owner: String!, $repo: String!, $number: Int!) {
  viewer { login }
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          id isResolved isOutdated path line originalLine
          comments(first: 1) { totalCount nodes { author { login } body url } }
          last: comments(last: 1) { nodes { author { login } body url } }
        }
      }
    }
  }
}`

type RollupEntry = {
  __typename?: string
  name?: string
  context?: string
  status?: string
  conclusion?: string
  state?: string
  detailsUrl?: string
  targetUrl?: string
}

/** gh's check rollup as pass, fail, pending or skip; a check run and a commit status spell it differently. */
function bucket(e: RollupEntry): PrCheck['bucket'] {
  const result = (e.conclusion || e.state || '').toUpperCase()
  if (e.status && e.status.toUpperCase() !== 'COMPLETED') return 'pending'
  if (['SUCCESS', 'NEUTRAL'].includes(result)) return 'pass'
  if (['SKIPPED', 'STALE'].includes(result)) return 'skip'
  if (['PENDING', 'EXPECTED', 'QUEUED', 'IN_PROGRESS', ''].includes(result)) return 'pending'

  return 'fail'
}

/** Reads `gh pr view --json VIEW_FIELDS` output; null when it is not that. */
export function readView(ref: string, json: string): Omit<PrView, 'threads' | 'fetchedAt' | 'error'> | null {
  try {
    const v = JSON.parse(json) as Record<string, unknown>
    if (typeof v.number !== 'number') return null
    const rollup = Array.isArray(v.statusCheckRollup) ? (v.statusCheckRollup as RollupEntry[]) : []

    return {
      ref,
      number: v.number,
      title: String(v.title ?? ''),
      url: String(v.url),
      isDraft: v.isDraft === true,
      state: String(v.state ?? 'OPEN'),
      base: String(v.baseRefName ?? ''),
      mergeable: String(v.mergeable ?? 'UNKNOWN'),
      reviewDecision: String(v.reviewDecision ?? ''),
      checks: rollup.map(e => ({ name: e.name ?? e.context ?? 'check', bucket: bucket(e), url: e.detailsUrl ?? e.targetUrl ?? null })),
    }
  } catch {
    return null
  }
}

type ThreadNode = {
  id: string
  isResolved: boolean
  isOutdated: boolean
  path: string
  line: number | null
  originalLine: number | null
  comments: { totalCount: number; nodes: { author: { login: string } | null; body: string; url: string }[] }
  last: { nodes: { author: { login: string } | null; body: string; url: string }[] }
}

type ThreadsAnswer = {
  data?: { viewer?: { login: string }; repository?: { pullRequest?: { reviewThreads?: { nodes?: ThreadNode[] } } } }
}

/** Reads the THREADS_QUERY answer: open threads only, oldest first. */
export function readThreads(json: string): PrThread[] {
  try {
    const data = (JSON.parse(json) as ThreadsAnswer).data
    const viewer = data?.viewer?.login

    return (data?.repository?.pullRequest?.reviewThreads?.nodes ?? [])
      .filter(t => !t.isResolved)
      .map(t => {
        const first = t.comments.nodes[0]
        const last = t.comments.totalCount > 1 ? t.last.nodes[0] : undefined
        const reply = last ? { author: last.author?.login ?? 'ghost', body: last.body.trim(), url: last.url } : null

        return {
          id: t.id,
          author: first?.author?.login ?? 'ghost',
          reply,
          isWaiting: (reply?.author ?? first?.author?.login) !== viewer,
          isOutdated: t.isOutdated,
          path: t.path,
          line: t.line ?? t.originalLine,
          body: (first?.body ?? '').trim(),
          replies: Math.max(0, t.comments.totalCount - 1),
          url: first?.url ?? '',
        }
      })
  } catch {
    return []
  }
}

/** Open threads whose last comment someone else wrote: the ones waiting on the person. */
export function waitingThreads(pr: PrView): PrThread[] {
  return pr.threads.filter(t => t.isWaiting)
}

export function checkCounts(pr: PrView): Record<PrCheck['bucket'], number> {
  const counts = { pass: 0, fail: 0, pending: 0, skip: 0 }
  for (const c of pr.checks) counts[c.bucket] += 1

  return counts
}

/** What stands between the PR and merging, or that it is ready. */
export function readiness(pr: PrView): { isReady: boolean; text: string } {
  if (pr.state !== 'OPEN') return { isReady: false, text: pr.state === 'MERGED' ? 'Merged' : 'Closed' }
  const { fail: failing, pending } = checkCounts(pr)
  const open = waitingThreads(pr).length
  const blockers = [
    pr.isDraft ? 'draft' : null,
    pr.mergeable === 'CONFLICTING' ? `conflicts with ${pr.base}` : null,
    failing > 0 ? `${failing} failing ${failing === 1 ? 'check' : 'checks'}` : null,
    pr.reviewDecision === 'CHANGES_REQUESTED' ? 'changes requested' : null,
    open > 0 ? `${open} ${open === 1 ? 'thread' : 'threads'} waiting on you` : null,
    pr.reviewDecision === 'REVIEW_REQUIRED' ? 'needs approval' : null,
    pending > 0 ? `${pending} ${pending === 1 ? 'check' : 'checks'} running` : null,
  ].filter((b): b is string => b !== null)

  return blockers.length === 0
    ? { isReady: true, text: `Ready to merge${pr.reviewDecision === 'APPROVED' ? ': approved' : ''}, checks pass, no threads waiting on you` }
    : { isReady: false, text: `Blocked: ${blockers.join(', ')}` }
}

function threadText(t: PrThread): string {
  const where = `${t.path}${t.line ? `:${t.line}` : ''}`

  const opening = [`${where}, from @${t.author}${t.isOutdated ? ' (on an outdated diff)' : ''}:`, t.body, t.url]
  const reply = t.reply ? ['', `Latest reply, from @${t.reply.author}:`, t.reply.body, t.reply.url] : []

  return [...opening, ...reply].join(NL)
}

/** The message each PR button sends to Claude. */
export const prompts = {
  fix: (pr: PrView, check: PrCheck) =>
    [
      `The CI check "${check.name}" is failing on PR #${pr.number} (${pr.url}).`,
      'Find out why from its logs, fix it, and verify the fix. If the fix needs a change to CI configuration, ask me before making it.',
      ...(check.url ? [`Check details: ${check.url}`] : []),
    ].join(NL),
  address: (pr: PrView, threads: PrThread[]) =>
    [
      threads.length === 1
        ? `Address this review comment on PR #${pr.number} (${pr.url}). Fix it in code and verify.`
        : `Address these ${threads.length} review comments on PR #${pr.number} (${pr.url}). Fix each in code and verify.`,
      "Don't reply on GitHub or resolve the threads; tell me what you changed for each.",
      ...threads.map(t => NL + threadText(t)),
    ].join(NL),
  draft: (pr: PrView, t: PrThread) =>
    [`Draft a reply to this review comment on PR #${pr.number} (${pr.url}) for me to review. Don't post it.`, '', threadText(t)].join(NL),
  discuss: (pr: PrView, t: PrThread) =>
    [`Let's talk through this review comment on PR #${pr.number} (${pr.url}) before changing anything.`, '', threadText(t)].join(NL),
}
