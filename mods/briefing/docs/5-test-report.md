# Briefing: test report

Briefing is ready for daily use. Two live sessions, a code review, and 70
automated tests found 24 problems, and all 24 are fixed. The second live
session confirmed 15 of the fixes, and tests cover 3 more. The other 6 are
timing and locking fixes, a removed feature, and two small cases the session
did not reach.
Eight smaller issues remain open, listed below with what each costs.

## How it was tested

- **Code review** of the first build, ranked by harm.
- **Live session 1**: a toy CLI, `greet`. Claude added two flags, bumped the
  version and prepared a publish. Pete's part was played through the pane:
  answers, batched presses, a press while Claude worked, Explain, and a held
  push.
- **Live session 2**: a toy CLI, `tally`, after the fixes. Claude added a
  `--mean` flag with a test and committed it. Then came an implied push, a
  question dialog, a discard of local work, `/clear` and `/resume`, and a
  decision put to Pete.
- **Automated**: `claude plugin test .` with 70 passing tests, `tsc
  --noEmit`, and `claude plugin validate .`.

Both live sessions loaded only this mod, in tmux, with a stand-in `herdr`
that logged each sidebar line the mod published.

## Problems found and fixed, worst first

1. **Checks went stale on every commit.** The mod compared file times from
   `git status`, so a commit made every check read "before the last edit".
   The catch-up then told Pete the latest change was untested when Claude had
   tested it. The mod now compares content: HEAD plus a hash of each
   uncommitted file, read with git without writing to the repo. A commit
   moves content into HEAD and changes nothing. Live: tests passed, Claude
   committed, and the check stayed current. A later edit marked it "before
   the last edit".
2. **Ordinary words released held acts.** "Clean up this function" released
   `git reset --hard`. "Why did you push?" and a pasted "failed to push some
   refs" each released a push. Answering "ok, but don't push yet" to "Push
   now?" released it too. The gate now reads only Pete's prose, without code,
   quotes or pasted output. It skips questions and checks for refusal words
   near the verb. An answer to a question about the act counts only when it
   is a short yes. Live: "sync the remote" left the push held, and Run pushed
   it.
3. **Some outward commands were never held**: `gh api` writes, commands
   inside `bash -c "…"` and heredocs fed to a shell, and connector tools that
   write without the word "send". All are held now.
4. **Dry runs were held.** `npm publish --dry-run` waited for a press. Dry
   runs pass now, and a held command's summary names the command. Live: the
   dry run ran at once.
5. **A held discard could destroy newer work.** It ran whatever had changed
   since it was held. Now it runs only while the files are unchanged. Live:
   the file changed before Run, Run refused, and Claude removed only its own
   line.
6. **A new goal erased Claude's choices** from Claude chose before Pete saw
   them. Choices now stay until half a day after Claude made them. Live:
   Claude set new goals twice, and its earlier choices stayed listed.
7. **A press could be lost or sent twice.** Presses were read and cleared in
   two steps, and a press made as a turn ended could wait for the next turn.
   Both steps are now one, and the mod checks again after queuing.
8. **The catch-up could lose its window** when presses went out at the end
   of a turn, because the next message reset the window first. It now starts
   before they go.
9. **A held act could run twice**, on a double press or after Claude withdrew
   it. The record now marks it running before the call.
10. **`/resume` showed the wrong record.** When the resume event fires,
    `$.session.id()` still answers the old session, so the mod loaded that
    one. It now uses the id the event carries. `/clear` and `/resume` also
    stop work begun for the old session from landing in the new one. Live:
    the band emptied on `/clear` and came back on `/resume`.
11. **One dialog could clear another.** Dialogs were keyed by tool name, so a
    subagent's Bash call ending cleared the main agent's Bash prompt. Each
    dialog now closes with its own call. Live: the sidebar followed four
    prompts in a row and cleared after each.
12. **A question dialog showed as "Allow AskUserQuestion".** The dialog also
    raises a permission request, which overwrote the question. That request
    is ignored now, and the dialog's own header is the sidebar label. Live:
    `? Next feature +1`.
13. **A dialog that timed out was recorded as Pete's answer.** It is now
    Claude's choice, which he can switch.
14. **Checks behind package-manager options were missed.** `npm --prefix app
    test` recorded nothing, so the catch-up called passing tests unverified.
    Options are allowed now, and `node --test` is recognized. Live: `npm
    test` recorded as passing.
15. **Unfinished commands counted as checks.** Interrupted, timed-out and
    backgrounded commands are skipped now.
16. **The record tool filled the transcript with JSON.** Its row now shows
    only the reply, such as "Recorded: d1 asked."
17. **The pane opened too small and could open with nothing selected.** It
    now opens sized to its content, on its first row. When the selected row
    moves to another section, the row now in its place is selected.
18. **Claude chose rows hid the choice** in a narrow pane, since it came last
    and the row was cut. Rows wrap now and read "question → choice, not
    alternative".
19. **Closing a settled item answered "Refused"**, which read like an error.
    It is acknowledged now, and the guidance says briefing answers are
    recorded already.
20. **Permission prompts for reads said only "Allow Read".** They name the
    file or pattern now.
21. **After a held push ran, the pane still said "2 commits not pushed".**
    The mod reads git again after a held act runs. Live: the line changed to
    "nothing to commit" as the push finished.
22. **"Interrupted while you were away" was removed.** An interrupted turn is
    almost always Pete's own Esc, so there is nothing for him to clear.
23. **An open question with a recommendation had no 1 key.** It has one now.
24. **`git status` could take the index lock** while Claude committed, and
    make the commit fail. The mod's git calls no longer take optional locks.

## Still open, worst first

1. **session-inbox and Briefing write the same Herdr token.** Loaded
   together, they overwrite each other's sidebar line. Load one. Briefing is
   meant to replace session-inbox.
2. **A fresh session starts a PAPERCUTS triage agent.** Pete's SessionStart
   hook asks for it when the file has over 40 entries. In a new repo the
   agent asks to read `~/.claude`, and Claude may record a task about it.
   This is not the mod, but it shows up in the briefing.
3. **An implied push still waits for a press.** "Sync the remote" did not
   count as asking for a push, and Claude's reply said "even though you
   asked for it". The cost is one press. Releasing on implied words would
   reopen problem 2.
4. **The end-of-turn question check fired live once,** on 2026-10-04, when
   Claude ended a reply with "Want me to look into the resumed-session
   problem first?" without recording it. It was right to block.
5. **The Away line and news after a dismiss were not seen live.** Tests
   cover them. Neither is being moved into session-inbox. Stops were seen
   live after they moved there: a sign-in failure, a usage limit and a busy
   server, each against a stand-in API.
6. **Only the first open dialog shows,** with no count of others. Claude
   Code shows them one at a time too, so this matches what Pete can act on.
7. **Snapshots stop at 2000 uncommitted paths.** A dirtier tree misses
   changes past that. A committed symlink may read as a change once, since
   git hashes the link and the mod hashes its target.
8. **Each `/clear` leaves a small record file.** Records older than 30 days
   are deleted when a session starts.

## Decisions changed during testing

Each one changes the reviewed requirements. Pete can overrule any of them.

- **A goal no longer settles Claude's choices.** It erased choices Pete had
  not reviewed. Choices now leave the list half a day after Claude made
  them.
- **Force-pushes, discards, deletions and messages to people always wait for
  a press**, whatever Pete wrote. Reading consent from words is not reliable
  enough for acts that cannot be undone or that speak for him.
- **Claude is not told whether the pane is open.** Requirement R4 asked for
  it, but nothing Claude does depends on it.
- **The "interrupted while away" stop is gone,** for the reason in problem
  22.
- **Staleness compares file content, not file times,** for the reason in
  problem 1.
