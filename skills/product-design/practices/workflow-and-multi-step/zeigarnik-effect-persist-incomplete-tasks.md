---
title: Zeigarnik Effect — Persist Incomplete Tasks and Draft States
category: Workflow & Multi-Step Processes
tags: [form, wizard, motivation, trust]
priority: situational
applies_when: "When users may be interrupted during multi-step flows and the application should auto-save drafts and surface incomplete work for easy resumption."
---

## Principle
Automatically save and surface incomplete tasks, partially filled forms, and abandoned workflows so users can resume them seamlessly, leveraging the psychological tendency to want to complete unfinished work.

## Why It Matters
The Zeigarnik Effect describes the human tendency to remember and feel compelled to complete unfinished tasks more than completed ones. When an application discards incomplete work (an abandoned form, an unfinished wizard, a half-written message), it wastes the user's invested effort and eliminates the natural motivation to return and finish. Persisting draft states turns interruptions from a loss event into a pause — users see their incomplete work waiting for them and feel drawn to finish it, increasing completion rates.

## Application Guidelines
- Auto-save form data to draft state as users type, without requiring explicit "Save Draft" actions
- Show a "Drafts" or "In Progress" section in relevant navigation areas that surfaces all incomplete work items
- Display a prominent "Continue where you left off" prompt when users return after an interruption, with a preview of the incomplete work
- Include timestamps and progress indicators on draft items: "Started 2 hours ago — Step 3 of 5 complete"
- Allow users to explicitly discard drafts they no longer intend to finish, keeping the drafts section clean
- For multi-step workflows, save progress at each step boundary so users never lose more than the current step's work

## Anti-Patterns
- Discarding all form data when users navigate away, close the browser, or experience a timeout
- Saving drafts but not surfacing them — users must remember the exact URL or navigation path to find their incomplete work
- Draft states that persist indefinitely without any cleanup mechanism, accumulating stale incomplete items
- Resuming a draft that opens to step 1 instead of the step where the user left off, forcing them to click through completed steps
