# React review checks

Choose checks from the changed behavior and its consumers:

| Changed behavior | Failure to investigate |
| --- | --- |
| Effect or subscription | Stale closure, unstable dependency, duplicate work, missing cleanup |
| Async request or state restore | Late results overwrite newer input; incorrect cancellation or ordering |
| Shared component, hook, or type | Another caller, input mode, or package loses supported behavior |
| Server/client boundary | Invalid serialization, hydration mismatch, shared server state, missing authorization |
| Data fetching | Avoidable serial requests, duplicate fetching, stale or incorrectly scoped cache |
| Rendering or imports | Measurable render work or unnecessary client bundle growth |
| Interaction | Keyboard, focus, accessibility, empty, loading, and error states regress |
| Stored values or links | Older inputs change meaning or no longer open the intended surface |

Prefer an observable failure or a clear violated contract over a style preference. Check how the old and new behavior differ. Existing tests, a focused temporary check, or the real product route may settle the concern; do not retain a new harness merely to prove the patch.

Use the repository's existing diagnostic command if available. If a tool disagrees with manual inspection, explain the evidence rather than reporting its score as a defect. Use one concise note per root cause, including distinct affected callers where relevant.
