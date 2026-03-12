# Audit Templates

Use these templates when starting the audit or writing the final report.

## Scope Brief

```markdown
# Audit Scope Brief

- System:
- Goal:
- Output mode: chat-first | artifact mode
- Critical workflows:
- External surfaces:
- High-risk surfaces:
- Out of scope:
- Notes:
```

## Coverage Ledger

```markdown
| # | Subsystem | Entrypoints | Files In Scope | Invariants / Promises | Side Effects | Risk | Status |
|---|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  | High | planned |
```

Add one short note per subsystem describing why it has its current risk level.

## Finding Format

```markdown
### [Subsystem] Finding N: Brief Title

- Severity: Critical | High | Medium | Low
- Status: Confirmed | Likely | Needs follow-up
- Confidence: High | Medium | Low
- Type: Bug | Race condition | Security | Stale docs | Dead code | Design flaw | Reliability
- Location: `path/to/file.ext:line` or `path/to/file.ext:function`
- Impacted behavior:
- Observed evidence:
- Inference:
- What I checked:
- Recommendation:
- Next verification step:
```

Omit `Next verification step` only when the finding is already confirmed.

## Chat-First Summary

```markdown
## Findings

### Critical
- ...

### High
- ...

### Medium
- ...

### Low
- ...

## Coverage Summary
- Subsystems covered:
- Residue queries or notable searches:
- Unverified surfaces:

## Recommended Fix Order
1. ...
2. ...
3. ...
```

## Artifact-Mode Layout

```text
docs/audit/ or .claude/docs/audit/
├── 00-plan.md
├── 01-subsystem-name.md
├── 02-another-subsystem.md
├── SUMMARY.md
└── HANDOFF.md
```

Use artifact mode only when the audit is large enough to benefit from resumable files.
