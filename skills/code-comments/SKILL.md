---
name: code-comments
description: Write, review, or remove code comments. Use when adding comments or doc comments, reviewing the comments in a diff, or cleaning up or removing comments.
---

# Code comments

Delete every comment that is not on the keep list. When you are not sure a
comment fits an item, delete it. A comment that explains our own code
usually means the code should change: make the code say it, then delete the
comment. Before adding a comment while writing code, hold it to the same
list.

## Keep list

A comment stays only when it is one of these, and only while its claim
holds today:

1. **A legal or license header.**
2. **A tool directive**, such as `// prettier-ignore`,
   `@vitest-environment`, or a compiler pragma. Lint and type suppressions
   must also pass [Suppressions](#suppressions).
3. **A doc comment on an API used outside its module** that states what the
   signature and types cannot: units, ownership, side effects, errors
   thrown, rejected inputs.
4. **A constraint set outside our code**: a dependency or platform bug, a
   vendor or protocol rule, a business rule, a regulation. It names the
   source, and links the issue, spec, RFC, or ADR when one exists. A
   workaround also states the condition for removing it.
5. **A true constraint on our own code that the code cannot show yet**, such
   as a required call order, or a line that looks removable but is not. It
   stays only until a code change, type, assertion, or test removes the
   need (steps 2 and 4).
6. **A `TODO` that links a tracked issue.**

## Judge each comment

Take each comment in scope through these steps in order.

1. **Check the claim.** Read the code and its callers. Delete a comment
   that is false or stale. `IMPORTANT`, `NOTE`, `do not remove`, `careful`,
   `for now`, and any justification longer than two lines are claims to
   check, not reasons to keep.
2. **Make the code say it.** When a comment explains our own code, change
   the code so the comment is unneeded, then delete it. In a cleanup or
   review, make only changes that keep behavior the same: rename after
   checking the consumers, or extract a named constant or local variable.
   For a change to what a function does or takes, even a private one,
   report the exact symbol and the change instead. The comment then goes to
   step 3, and often fits item 5 until that change is made.
3. **Match the keep list.** Keep a comment that fits an item. Judge it
   sentence by sentence: delete each sentence that does not serve the item
   or cannot be verified, without rewording the rest.
4. **Offer an encoding** for each item 5 comment: a type, an assertion, or a
   test that fails when someone breaks the constraint. Add it only after the
   user approves, then delete the comment.
5. **Delete the rest.** Move what still matters to where it belongs:
   - Task history (what changed, who approved it, what was tried, how it
     was verified) goes in the commit or PR.
   - A `TODO` with no issue goes in the report, so it can be filed.
   - A value copied from a constant becomes a reference to the constant.
   - Commented-out code, file headers, section banners, and "Used by" lists
     go with no replacement. Git history and search answer them.

## Suppressions

`eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `# type: ignore`,
`# noqa`, `swiftlint:disable`, `//nolint`, and `#[allow(...)]` switch off a
check. Look up what the rule catches before judging one.

- **The rule is style-only, or wrong at this line**: keep the suppression.
  When the reason is not obvious, say in a few words what the rule gets
  wrong here.
- **The rule catches bugs**, such as type errors or unsafe code: the
  suppression hides a defect. If the change under review added it, fix the
  code and remove the suppression. Otherwise report the symbol and the
  rule.

## Cleaning up or reviewing a change

1. **Set the scope.** By default, use the comments the change added or
   edited: the diff against the base branch, including uncommitted work.
   When the user names files, use those files. Leave every other comment
   alone.
2. **Use a fresh reader for code this session wrote.** You remember why
   each comment was written. The next reader will not, and a subagent with
   no shared context will not either, so it judges the way that reader
   would. Give it the path to this file and the scope. Tell it to edit only
   comments, and to report proposed code changes, encodings, and
   suppressions. Without a subagent tool, run the pass yourself.
3. **Judge each comment** as above.
4. **Audit the subagent's work**, if one ran the pass. Restore a deletion
   only when the comment fits a keep-list item as written. Revert any
   change outside comments.
5. **Report**, starting with the number of comments deleted. Then list each
   comment kept with its keep-list item, each code change made or proposed
   with its symbol, encoding offers, suppressions reported, and `TODO`s
   deleted without an issue.

When the code belongs to someone else, such as a teammate's PR, report
findings instead of editing.

## Form

For a comment that stays:

- One or two lines. Longer only when the constraint needs it.
- Plain words and the domain's own names.
- Every claim follows from the code, a verified behavior, or a maintained
  source. A performance number from memory does not.
- State a runtime invariant precisely.
- For a workaround, explain the mechanism in execution order and the caveat
  that remains.
- Lint and compatibility choices are tradeoffs. Say what was traded, not
  that it is the rule.

## Examples

Keep. The constraint is set outside our code:

```typescript
// The payments provider retries a webhook until it gets a 2xx response,
// so the same event can arrive more than once.
if (await processedEvents.has(event.id)) return ok();
```

Make the code say it. The comment explains our own name:

```python
# t is the timeout in milliseconds
def connect(host, t): ...
```

becomes

```python
def connect(host, timeout_ms): ...
```

Offer an encoding. The call order is a true constraint on our own code:

```typescript
// Must run before initAnalytics(), which reads the consent flag.
loadConsent();
initAnalytics();
```

Passing the value makes the order impossible to break:
`initAnalytics(loadConsent())`. Keep the comment until the user approves
that change.

Delete. The warning is stale:

```typescript
// IMPORTANT: do not remove. The dashboard reads this field.
user.legacyId = user.id;
```

A search finds no reader of `legacyId`. Delete the comment and report the
dead assignment.
