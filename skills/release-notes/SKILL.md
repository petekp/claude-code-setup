---
name: release-notes
description: "Write release notes or a changelog entry that tell existing users what they will notice after updating, with the technical detail after it. Use when publishing a release, writing a changelog, or editing release notes."
---

# Release notes

Write for someone who already uses the product. They want to know what will feel different after they update, and whether they have to do anything. Most read the first line and stop. Some read the next section. Few read further.

## Gather

- List the changes since the last release, such as with `git log --oneline <last tag>..HEAD`. Read the PRs and issues they reference.
- Read a change's diff when its commit subject doesn't make the user's experience clear. Describe only effects you can trace to a change.
- Find the project's update steps and the apps or platforms it ships to. Look in its release doc, its README, and the last release's notes.

## Shape

In this order:

1. **One line on the effect users will notice most.** Name the effect, not the area: "Other mods' notes come back above your prompt", not "Fixes for the band".
2. **A picture of the headline change** when it is visible. Reuse the before-and-after image from the PR that made the change when there is one.
3. **What you'll notice.** One item per change, as described below.
4. **Update.** The project's update steps, as the last release gave them, changed only where this release changes them.
5. **Under the hood.** One line per change that a technical user or contributor would want to know: the mechanism behind a change above, a fix with no visible effect, a changed file format or API. Link the issue or PR when there is one, and thank the person who reported it. Work that does not ship in the product, such as a video, a plan, or a refactor with no effect, stays out.

When nothing in a release is visible, say so in the first line, and keep only Update and Under the hood.

## What you'll notice

- **Start each item with a bold sentence that says what the user sees or does now.** Follow it with one sentence on how it was before, when that helps them recognize the change.
- **Name the app or platform** when a change reaches only some of them, such as "Codex:". When an app has no changes, say "Nothing changed in Claude Code."
- **Put anything the user must do inside the item it belongs to,** such as "quit and reopen the app once". A step that applies to the whole release goes in Update.
- **Use the names users see on screen:** button labels, tab names, and messages, quoted exactly. Name the place in plain words, such as "the terminal" or "the Codex tab". Code names and the project's own terms for its parts belong under the hood.
- **Order items by how often users run into them.** A change everyone sees comes before an edge case. A removed feature or a change that breaks a workflow comes first, with what to do instead.

## Check

Before publishing, give only the notes to a reader with no other context. Ask what they will notice after updating and whether they must do anything. Rewrite when either answer is wrong. When you have no way to hand the notes to a separate reader, skip this step and say so in your handoff.

## Example

Not text to copy:

```markdown
Other mods' notes come back above your prompt, and commands only you can run now copy to your clipboard.

## What you'll notice

**Claude Code: other mods' notes show again.** The band above the prompt shows the inbox's line, then other mods' notes under it, such as "You should know". Before, the inbox's line hid them.

**Commands you have to run yourself copy when you press them.** When the agent needs you to run something on your own device, such as a phone plugged into your computer, the step copies the command. Before, it often sent the command back to the agent.

**Codex: updates stop breaking the Inbox tab.** After this update, quit and reopen the ChatGPT app once. Later updates won't need that.

## Update

- **Claude Code:** run `claude plugin marketplace update inbox`, then `claude plugin update inbox`, then `/reload-plugins` in any session that's already open.
- **Codex:** run `codex plugin marketplace upgrade`, then `codex plugin add inbox@inbox`.

## Under the hood

- The band keeps what later mods draw in it (#4, reported by @fahadjibransheikh).
- A command the agent asks you to run is marked as a terminal step, so it copies instead of going to the agent.
- Codex deletes a plugin's old folder when it updates. The Codex server now loads the newest installed version after that, instead of failing with a module error.
```

## Publishing

Follow the project's release doc for when and how to publish. Writing the notes does not authorize publishing them. Publish with `gh release create <tag> --notes-file <file>` or `gh release edit <tag> --notes-file <file>`, then re-read the published body with `gh release view <tag> --json body`.
