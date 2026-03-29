---
title: Progress Bars for Deterministic Operations
category: Loading & Performance Perception
tags: [loading, wizard, feedback-loop, trust]
priority: situational
applies_when: "When an operation's completion percentage can be calculated or estimated (file uploads, batch processing) and a progress bar should replace the spinner."
---

## Principle
When the system can calculate or estimate the percentage completion of an operation, a progress bar must be used instead of an indeterminate spinner — deterministic operations deserve deterministic feedback.

## Why It Matters
Progress bars are the most effective loading indicator for operations where completion can be tracked: file uploads, data imports, batch processing, multi-step workflows, and export generation. They communicate three critical things simultaneously: the operation is in progress (motion), how much is complete (position), and how much remains (the unfilled portion). This triad of information reduces uncertainty, enables the user to make rational decisions about whether to wait or multitask, and provides early warning if an operation stalls. Progress bars convert anxious waiting into informed waiting.

## Application Guidelines
- Use progress bars for any operation where the total work is known or estimable: file uploads (bytes transferred vs. total), record processing (items processed vs. total count), multi-step workflows (step N of M)
- Always pair the visual bar with a text annotation: percentage, item count ("142 of 500 records"), or time remaining — the bar alone is imprecise
- Animate the bar smoothly rather than jumping in large increments — smooth animation preserves the perception of continuous progress even when actual progress arrives in chunks
- For multi-phase operations, show both the current phase and overall progress: "Phase 2 of 3: Processing records (67%)" with a bar that reflects only the current phase or the overall operation, chosen based on what is most meaningful to the user
- If the operation stalls (no progress for 5+ seconds), update the text to acknowledge the pause: "Processing large batch, this step may take longer..." rather than leaving the bar frozen with no explanation

## Anti-Patterns
- Using an indeterminate spinner for an operation where progress is trackable (file upload, batch import), throwing away valuable progress information
- Showing a progress bar that fills to 100% but the operation is not actually complete — the bar should only reach 100% when the operation is truly done
- Using a "fake" progress bar that moves at a predetermined rate regardless of actual progress, creating a false sense of completion that the real operation does not match
- Jumping the progress bar from 0% to 90% instantly and then crawling from 90% to 100% over the remaining duration, which distorts the user's time perception and feels dishonest
