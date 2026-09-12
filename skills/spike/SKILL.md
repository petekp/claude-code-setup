---
name: spike
description: "Run a disposable experiment to resolve a specific feasibility question. Use for an explicit spike or when inspection cannot resolve an implementation-blocking uncertainty."
---

# Spike

State the question, what result would change the decision, and a small experiment budget. Use inspection alone when it can answer the question. A request for a prototype or an estimate does not by itself authorize disposable code or a larger experiment.

Keep experiment code separate from the implementation. Use a temporary directory for self-contained checks. If real project imports are needed, use a task-owned, locally ignored scratch directory or an isolated worktree. Preserve unrelated work and the existing scope and approval boundaries.

Build only enough to measure the unknown. Do not mock the behavior being measured. Include realistic inputs and failure cases when they could change the answer; skip unrelated production polish. Do not use production credentials or mutate shared data without authorization.

Report the observed result, the evidence, its limits, and what it implies for the proposed implementation. A negative result is a valid outcome. Stop when the question is answered or the stated budget is exhausted; do not turn the experiment into an unrequested feature.

Record useful findings before removing task-created scratch code. Treat the implementation as separate work; do not silently promote experimental code. If the user asks to retain the prototype or measurement artifact, preserve it and clearly identify its limitations. Never remove someone else's files, branch, or worktree.
