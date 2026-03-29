---
title: Visibility of System Status
category: Feedback & Error Handling
tags: [notification, loading, feedback-loop, consistency]
priority: core
applies_when: "When designing any interaction where the user triggers an operation and needs to know whether it is in progress, succeeded, or failed."
---

## Principle
The system should always keep users informed about what is going on through appropriate, timely feedback within a reasonable time.

## Why It Matters
This is Jakob Nielsen's first usability heuristic because it is foundational: users cannot make good decisions if they do not know the current state of the system. When a user clicks a button and nothing happens for three seconds, they do not know if the system is processing, if their click registered, or if something broke. Visible system status reduces uncertainty, prevents duplicate actions, sets appropriate expectations for wait times, and builds the trust that comes from transparency.

## Application Guidelines
- Provide immediate feedback (within 100ms) for every user action — at minimum, a button state change, cursor change, or loading indicator
- For operations that take 1-10 seconds, show a spinner or progress bar; for operations over 10 seconds, show a progress indicator with estimated time remaining
- Display real-time status for background processes: upload progress, sync status, build progress, deployment state
- Show the current state of important system attributes: connection status (online/offline), save status (saved/saving/unsaved), user role, environment (staging/production)
- Use progressive status updates for long operations: "Uploading... Processing... Complete" rather than a single spinner for the entire duration
- After the operation completes, show the outcome (success or failure) clearly — do not just stop the spinner and return to the previous state

## Anti-Patterns
- Showing no feedback after a user clicks "Save" — no spinner, no disabled state on the button, no status message — forcing them to wonder if the click registered, often leading to repeated clicks and duplicate submissions
