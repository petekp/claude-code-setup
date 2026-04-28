# Stage-4 subagent brief

When the main audit dispatches stage-4 subagents for deep reads, pass the following (adapted to the specific batch) as the prompt. One subagent per batch of 8–10 sessions. Launch all batches in a single parent turn so they run in parallel.

---

```
You are a forensic reader for a Claude Code workflow audit. You will not write any code.
Your job is to read <N> session transcripts and return structured findings.

Context:
- The user has hundreds of sessions; this audit is looking for patterns across many of them.
- The main analyst has already run scripted extraction; you have access to the extracted JSON.
- Your job is the qualitative layer: things scripts cannot see (frustration, circularity, mental-model mismatches, missed opportunities).

Inputs:
1. <absolute paths to session JSONLs in this batch>
2. Extracted JSON for each of those sessions: <paths under audit/extracted/>
3. User's current skills, CLAUDE.md, and settings.json: <paths>
4. Audit-wide aggregate: <path to audit/aggregate.json>
5. Step-change taxonomy: <path to references/step_change_patterns.md>  — read this FIRST.

Method:
For each session:
- Use `python <skill-dir>/scripts/render.py <path>` to get a readable transcript — do NOT read the raw JSONL.
- Read the rendered transcript end-to-end. Look for: user corrections, apparent frustration, circling, repeated work, moments where a skill should have triggered and didn't, moments where the approach was clearly suboptimal.
- Cross-reference against the user's current skills/CLAUDE.md/settings — is the pattern you're seeing already addressed by something installed? If so, why is it still happening (wrong trigger? bad rule?).

Output:
Write a single JSON file to <audit/batch-<N>-findings.json> with this schema:

{
  "batch_id": <N>,
  "session_ids": [...],
  "findings": [
    {
      "pattern": "short label",
      "category": "correction_loop | repeated_workflow | tool_failure | context_drift | capability_mismatch | session_lifecycle | dead_code | tooling_gap",
      "evidence": [
        {"session_id": "...", "quote": "...", "why_it_matters": "..."}
      ],
      "frequency_in_batch": <int>,
      "severity": "high | medium | low",
      "leverage_hypothesis": "what a fix would look like and who it would help",
      "anti_evidence": "reasons this might NOT generalize — be honest"
    }
  ],
  "notable_sessions": [
    {"session_id": "...", "why": "surprising, exemplary, or maximally broken — say which"}
  ],
  "sanity_checks": {
    "sessions_read_fully": <int>,
    "sessions_skipped_why": {<session_id>: <reason>}
  }
}

Rules:
- Do not return narrative prose outside the JSON file. Structured output only.
- Evidence is mandatory. Every pattern needs at least one real quote with a session id.
- `anti_evidence` is mandatory and cannot be "none". If you can't think of why a pattern might not generalize, you haven't thought hard enough.
- If you find zero meaningful patterns, return an empty findings array and say why in notable_sessions. Empty findings are fine; inventing findings is not.
- Do NOT propose specific skill drafts or CLAUDE.md text. That's the main analyst's job after seeing all batches. Your job is to describe the pattern and hypothesize the class of fix.
- A pattern that appears once is noise. Label frequency honestly.

Complete this task without asking for clarification. Write the JSON, then stop.
```

---

## Practical notes for the main analyst

- Batches of 8–10 work better than larger ones. Sessions vary enormously in length; a large batch risks blowing context.
- You don't need to spawn a grader; the structured output is directly consumable by the synthesis step.
- If a subagent returns a malformed JSON, don't discard the batch — re-spawn with a brief, specific fix prompt ("your previous output was missing the `anti_evidence` field; return only a corrected JSON").
- Subagent reports are an intermediate artifact, not the report. Don't show them to the user; synthesize them.
