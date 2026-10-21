import { describe, expect, test } from 'claude-code/testing'

import { outward, wasAsked } from '../hooks/acts'
import { parseCatchUp } from '../hooks/catchup'

const bash = (command: string) => outward('Bash', { command })
const said = (words: string, question: string | null = null) => ({ words, question })

describe('outward', () => {
  test('holds pushes and names where they go', () => {
    expect(bash('git push origin feature-x')).toEqual([{ verb: 'push', summary: 'Push feature-x to origin' }])
    expect(bash('git push --force-with-lease')[0]).toEqual({ verb: 'force-push', summary: 'Force-push' })
    expect(bash('git -C ../other push origin main')[0]?.summary).toBe('Push main to origin')
    expect(bash('git push origin --delete old')[0]?.verb).toBe('delete')
  })

  test('holds PR writes, comments, publishes and deploys', () => {
    expect(bash('gh pr create --fill')[0]?.verb).toBe('pr')
    expect(bash('gh pr comment 12 --body hi')[0]?.verb).toBe('post')
    expect(bash('npm publish --access public')[0]).toEqual({
      verb: 'publish',
      summary: 'Run npm publish --access public',
    })
    expect(bash('vercel deploy --prod')[0]?.verb).toBe('deploy')
  })

  test('holds discarded local work and GitHub API writes', () => {
    expect(bash('git reset --hard HEAD~1')[0]?.verb).toBe('discard')
    expect(bash('git checkout -- src/a.ts')[0]?.verb).toBe('discard')
    expect(bash('gh api repos/o/r/pulls/1/comments/2/replies -f body=thanks')[0]?.verb).toBe('post')
    expect(bash('gh api -X DELETE repos/o/r/git/refs/heads/x')[0]?.verb).toBe('delete')
  })

  test('finds acts inside scripts handed to a shell', () => {
    expect(bash('bash -c "git push origin main"')[0]?.verb).toBe('push')
    expect(bash("sh <<'EOF'\ngit push\nEOF")[0]?.verb).toBe('push')
  })

  test('lets reads, dry runs and local work through', () => {
    expect(bash('gh pr view 12 --json title')).toEqual([])
    expect(bash('gh api repos/o/r/pulls')).toEqual([])
    expect(bash('npm publish --dry-run')).toEqual([])
    expect(bash('git push --dry-run origin main')).toEqual([])
    expect(bash('git commit -m "push the button"')).toEqual([])
    expect(bash("cat <<'EOF' > notes.md\nthen git push\nEOF")).toEqual([])
    expect(bash('git restore --staged a.ts')).toEqual([])
    expect(outward('Read', { file_path: 'a.ts' })).toEqual([])
  })

  test('holds MCP tools that write, and never the briefing’s own', () => {
    expect(outward('mcp__plugin_slack_slack__slack_send_message', {})[0]?.verb).toBe('send')
    expect(outward('mcp__plugin_linear_linear__delete_comment', {})[0]?.verb).toBe('delete')
    expect(outward('mcp__plugin_slack_slack__slack_read_channel', {})).toEqual([])
    expect(outward('mcp__briefing__record', {})).toEqual([])
  })
})

describe('wasAsked', () => {
  test('matches the person’s own words for the act', () => {
    expect(wasAsked('push', [said('commit and push it')])).toBe(true)
    expect(wasAsked('push', [said('commit it')])).toBe(false)
    expect(wasAsked('pr', [said('open a PR when done')])).toBe(true)
  })

  test('refusals, questions and pasted output ask for nothing', () => {
    expect(wasAsked('push', [said("Commit it, but don't push yet.")])).toBe(false)
    expect(wasAsked('push', [said('Why did you push?')])).toBe(false)
    expect(wasAsked('push', [said('Hold the push until review.')])).toBe(false)
    expect(wasAsked('push', [said('error: failed to push some refs')])).toBe(false)
    expect(wasAsked('push', [said("Don't touch main. Push the branch when tests pass.")])).toBe(true)
  })

  test('a short yes asks for what its question named, and any other answer does not', () => {
    expect(wasAsked('push', [said('yes', 'Push to origin now?')])).toBe(true)
    expect(wasAsked('push', [said('push when done'), said('Not yet', 'Push to origin now?')])).toBe(false)
    expect(wasAsked('push', [said("ok, but don't push yet", 'Push now?')])).toBe(false)
  })

  test('force-pushes, discards and messages always wait for a press', () => {
    expect(wasAsked('force-push', [said('force push it')])).toBe(false)
    expect(wasAsked('discard', [said('reset the branch')])).toBe(false)
    expect(wasAsked('send', [said('send the message')])).toBe(false)
  })
})

describe('parseCatchUp', () => {
  test('keeps up to three LINE rows and ignores the rest', () => {
    expect(
      parseCatchUp(
        'Sure.\nLINE: Fixes built; waiting on d3.\nLINE: Tests pass after the last edit.\nnoise\nLINE: a\nLINE: b',
      ),
    ).toEqual(['Fixes built; waiting on d3.', 'Tests pass after the last edit.', 'a'])
    expect(parseCatchUp('no lines here')).toBe(null)
  })
})
