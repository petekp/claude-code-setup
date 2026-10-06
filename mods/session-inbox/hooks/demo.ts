// Sample entries for every section of the band and the /inbox pane, shown by
// `/inbox demo` for work on the layout. Nothing here reaches the session's
// real inbox, its store, or Claude.

import type { Checks, Ledger, PrViews, Settled, Stop } from '../types'

export type View = { ledger: Ledger; stop: Stop | null; checks: Checks; settled: Settled[]; prViews: PrViews }

const MIN = 60_000
const REPO = 'https://github.com/acme/reports'

export function demoView(now: number): View {
  return {
    ledger: {
      card: {
        goal: 'Add CSV export to the reports page',
        done: ['Export button added', 'CSV writer handles commas and quotes', 'PR #42 opened'],
        now: 'Waiting on the date format and an npm sign-in',
        running: ['dev server: http://localhost:5173', 'storybook: http://localhost:6006'],
        updatedAt: now - 2 * MIN,
      },
      items: [
        {
          id: 'd11',
          kind: 'decide',
          label: '1',
          ask: 'Export dates as ISO 8601 or in the viewer’s locale format?',
          options: ['ISO 8601', 'Locale format'],
          rec: 'ISO 8601',
          helps: [],
          turn: 9,
        },
        {
          id: 'd12',
          kind: 'decide',
          label: '2',
          ask: 'Include archived reports in the export?',
          options: ['Yes', 'No'],
          rec: 'No',
          helps: [],
          turn: 9,
        },
        {
          id: 'd13',
          kind: 'do',
          label: null,
          ask: 'Sign in to npm so the release can publish',
          options: [],
          rec: null,
          helps: [{ kind: 'terminal', command: 'npm login', name: 'npm login' }],
          turn: 9,
        },
        {
          id: 'd14',
          kind: 'do',
          label: null,
          ask: 'Add the export bucket name to .env.local',
          options: [],
          rec: null,
          helps: [
            { kind: 'copy', text: 'EXPORT_BUCKET=reports-exports', name: 'env line' },
            { kind: 'open', path: '.env.local' },
          ],
          turn: 9,
        },
        {
          id: 'd15',
          kind: 'decide',
          label: null,
          ask: 'Which page should link to the export first?',
          options: [],
          rec: null,
          helps: [],
          turn: 7,
        },
      ],
      decided: [
        { id: 'd5', ask: 'Name the button "Export" or "Download CSV"?', outcome: 'Download CSV', at: now - 50 * MIN },
        { id: 'd6', ask: 'Stream large exports, or build them in memory?', outcome: 'Stream them', at: now - 40 * MIN },
        {
          id: 'd7',
          ask: 'Fix the flaky date test in this PR?',
          outcome: 'closed by Claude: no longer applies: test removed',
          at: now - 20 * MIN,
        },
        { id: 'd8', ask: 'Add an export to the admin page too?', outcome: 'dismissed', at: now - 10 * MIN },
        { id: 'd10', ask: 'Use the existing date helper?', outcome: 'Yes, reuse it', at: now },
      ],
      notes: [
        {
          id: 'd16',
          kind: 'opportunity',
          title: 'One CSV helper could replace three copies',
          detail:
            'The reports, audit and billing pages each escape CSV fields their own way. One shared helper would fix the newline bug in all three.',
          path: null,
          at: now - 2 * 60 * MIN,
        },
        {
          id: 'd17',
          kind: 'issue',
          title: 'Report query runs twice per page load',
          detail:
            'The page fetches the report in both the loader and an effect. Dropping the effect halves the load on the database.',
          path: 'src/reports/query.ts',
          at: now - 30 * MIN,
        },
      ],
      prs: ['acme/reports#42', 'acme/reports#38'],
      nextId: 18,
      turn: 9,
      batchTurn: 9,
    },
    stop: null,
    checks: {
      results: [
        { name: 'eslint', kind: 'lint', result: 'pass', summary: '', ranAt: now - 30 * MIN },
        { name: 'npm test', kind: 'tests', result: 'pass', summary: '48 pass, 0 fail', ranAt: now - 6 * MIN },
        {
          name: 'tsc',
          kind: 'types',
          result: 'fail',
          summary: 'src/export.ts(12,5): error TS2322',
          ranAt: now - 5 * MIN,
        },
        { name: 'npm build', kind: 'build', result: 'unknown', summary: '', ranAt: now - 4 * MIN },
      ],
      snapshot: null,
      changedAt: now - 10 * MIN,
      codeChangedAt: now - 10 * MIN,
    },
    settled: [
      { id: 'd10', ask: 'Use the existing date helper?', outcome: 'Yes, reuse it', at: now, kind: 'decide', index: 1 },
    ],
    prViews: {
      branchRef: 'acme/reports#42',
      isFetching: false,
      views: {
        'acme/reports#42': {
          ref: 'acme/reports#42',
          number: 42,
          title: 'Add CSV export to the reports page',
          url: `${REPO}/pull/42`,
          isDraft: false,
          state: 'OPEN',
          base: 'main',
          mergeable: 'MERGEABLE',
          reviewDecision: 'CHANGES_REQUESTED',
          checks: [
            { name: 'build', bucket: 'pass', url: `${REPO}/actions/runs/1` },
            { name: 'unit tests', bucket: 'fail', url: `${REPO}/actions/runs/2` },
            { name: 'lint', bucket: 'pending', url: null },
          ],
          threads: [
            {
              id: 'DT1',
              author: 'sam',
              reply: null,
              isWaiting: true,
              isOutdated: false,
              path: 'src/export.ts',
              line: 24,
              body: 'Should this also escape newlines inside quoted fields?',
              replies: 0,
              url: `${REPO}/pull/42#discussion_r1`,
            },
            {
              id: 'DT2',
              author: 'sam',
              reply: {
                author: 'robin',
                body: 'Agreed, the shared helper in `utils/csv.ts` would be cleaner.',
                url: `${REPO}/pull/42#discussion_r3`,
              },
              isWaiting: true,
              isOutdated: true,
              path: 'src/csv.ts',
              line: 8,
              body: 'This duplicates the helper in utils.',
              replies: 1,
              url: `${REPO}/pull/42#discussion_r2`,
            },
            {
              id: 'DT3',
              author: 'robin',
              reply: { author: 'you', body: 'Done in the latest push.', url: `${REPO}/pull/42#discussion_r5` },
              isWaiting: false,
              isOutdated: false,
              path: 'src/export.ts',
              line: 40,
              body: 'Use the stream API here.',
              replies: 1,
              url: `${REPO}/pull/42#discussion_r4`,
            },
          ],
          fetchedAt: now - MIN,
          error: null,
        },
        'acme/reports#38': {
          ref: 'acme/reports#38',
          number: 38,
          title: 'Rename report filters to match the API',
          url: `${REPO}/pull/38`,
          isDraft: false,
          state: 'OPEN',
          base: 'main',
          mergeable: 'MERGEABLE',
          reviewDecision: 'APPROVED',
          checks: [
            { name: 'build', bucket: 'pass', url: null },
            { name: 'unit tests', bucket: 'pass', url: null },
          ],
          threads: [],
          fetchedAt: now - MIN,
          error: null,
        },
      },
    },
  }
}
