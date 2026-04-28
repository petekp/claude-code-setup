#!/usr/bin/env python3
"""
Per-session deep extraction, plus cross-session aggregation.

Per-session mode:  extract.py --sample audit/sample.json --out audit/extracted/
Aggregation mode:  extract.py --aggregate audit/extracted/    --out audit/aggregate.json

The per-session output includes everything the synthesis step will reason from.
Keep it machine-consumable but human-skimmable — we want the user to be able
to open one and understand what happened in that session.

Per-session schema (written to <session_id>.json):
{
  "session_id": "...",
  "path": "...",
  "project_cwd": "...",
  "first_ts": "...",
  "last_ts": "...",
  "duration_s": 367,
  "version": "...",
  "git_branch": "...",
  "tool_counts": {"Bash": 40, ...},
  "tool_sequence": ["Bash", "Read", "Bash", ...],     # capped at 200
  "tool_errors": [{"tool": "Bash", "idx": 12, "snippet": "..."}],
  "user_prompts": [
    {"idx": 0, "ts": "...", "text": "help me rebind...", "is_correction": false}
  ],
  "slash_commands": ["/clear", "/skill-creator", ...],
  "skill_invocations": ["skill-creator", ...],         # best-effort
  "hook_events": {"SessionStart:clear": 2, ...},
  "interrupts": 0,                                     # "[Request interrupted by user...]"
  "input_tokens": 655,
  "output_tokens": 56262,
  "correction_markers": [                              # heuristic detections
    {"idx": 3, "ts": "...", "text": "no don't do that, ...", "reason": "negation"}
  ],
  "friction_markers": [
    {"idx": 17, "ts": "...", "text": "ugh why", "reason": "frustration_word"}
  ],
  "outcome_hint": "likely_completed" | "likely_abandoned" | "unknown",
  "final_user_prompt": "...",
  "final_assistant_text_tail": "..."   # last 500 chars of assistant output
}
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


NEGATION_PATTERNS = [
    r"\bno\b",
    r"\bstop\b",
    r"\bdon'?t\b",
    r"\bnope\b",
    r"\bnot\b (?:quite|what|like)",
    r"\bwait\b",
    r"\bhold on\b",
    r"\bactually\b",
    r"\bnever mind\b",
    r"\bundo\b",
    r"\brevert\b",
    r"\bthat'?s not\b",
]

FRUSTRATION_PATTERNS = [
    r"\bugh\b",
    r"\bffs\b",
    r"\bwhy\b",
    r"\bagain\b",
    r"\?{2,}",
    r"!{2,}",
    r"\bi (?:already|just) (?:told|said|asked)",
    r"\bi keep\b",
    r"\bcome on\b",
    r"\bthat'?s wrong\b",
    r"\bbroken\b",
    r"\bstuck\b",
]

CORRECTION_PATTERNS = [
    r"\bi (?:said|meant|asked for|wanted)\b",
    r"\binstead\b",
    r"\brather than\b",
    r"\bnot (?:that|this|like that)\b",
    r"\btry (?:this|again|differently)\b",
]


def compile_any(patterns: list[str]) -> re.Pattern:
    return re.compile("|".join(patterns), re.IGNORECASE)


NEGATION_RE = compile_any(NEGATION_PATTERNS)
FRUSTRATION_RE = compile_any(FRUSTRATION_PATTERNS)
CORRECTION_RE = compile_any(CORRECTION_PATTERNS)
SLASH_RE = re.compile(r"(?:^|\s)(/[a-z][a-z0-9:_-]+)", re.IGNORECASE)


def is_command_wrapper(text: str) -> bool:
    return (
        text.startswith("<local-command")
        or text.startswith("<command-")
        or text.startswith("<bash-input>")
        or text.startswith("<bash-stdout>")
    )


def extract_from_session(path: Path) -> dict:
    tool_counts: Counter[str] = Counter()
    tool_sequence: list[str] = []
    tool_errors: list[dict] = []
    user_prompts: list[dict] = []
    hook_events: Counter[str] = Counter()
    slash_commands: list[str] = []
    correction_markers: list[dict] = []
    friction_markers: list[dict] = []
    interrupts = 0
    input_tokens = 0
    output_tokens = 0
    first_ts: str | None = None
    last_ts: str | None = None
    version: str | None = None
    git_branch: str | None = None
    session_id: str | None = None
    project_cwd: str | None = None
    final_user_prompt: str | None = None
    final_assistant_text: str | None = None

    user_prompt_idx = 0
    tool_idx = 0

    with path.open("r", encoding="utf-8") as f:
        for raw in f:
            raw = raw.strip()
            if not raw:
                continue
            try:
                obj = json.loads(raw)
            except json.JSONDecodeError:
                continue

            ts = obj.get("timestamp")
            if ts:
                if first_ts is None:
                    first_ts = ts
                last_ts = ts
            if session_id is None:
                session_id = obj.get("sessionId")
            if version is None:
                version = obj.get("version")
            if git_branch is None:
                git_branch = obj.get("gitBranch")
            if project_cwd is None:
                project_cwd = obj.get("cwd")

            t = obj.get("type")

            if t == "attachment":
                att = obj.get("attachment", {}) or {}
                event = att.get("hookEvent")
                hook_name = att.get("hookName")
                if event or hook_name:
                    key = f"{event}:{hook_name}" if event and hook_name else (event or hook_name)
                    hook_events[str(key)] += 1
                continue

            if t == "user":
                msg = obj.get("message", {})
                content = msg.get("content", "")
                text_parts: list[str] = []
                if isinstance(content, str):
                    text_parts = [content]
                elif isinstance(content, list):
                    # tool_result handling
                    tool_result_found = False
                    for c in content:
                        if c.get("type") == "tool_result":
                            tool_result_found = True
                            if c.get("is_error"):
                                tool_errors.append(
                                    {
                                        "idx": tool_idx,
                                        "ts": ts,
                                        "snippet": str(c.get("content", ""))[:200],
                                    }
                                )
                        elif c.get("type") == "text":
                            text_parts.append(c.get("text", ""))
                    if tool_result_found and not text_parts:
                        continue

                for text in text_parts:
                    if not text:
                        continue
                    if is_command_wrapper(text):
                        continue
                    if "[Request interrupted by user" in text:
                        interrupts += 1
                    slash_hits = SLASH_RE.findall(text)
                    for sh in slash_hits:
                        slash_commands.append(sh.strip())
                    is_correction = False
                    if user_prompt_idx > 0:
                        if NEGATION_RE.search(text) or CORRECTION_RE.search(text):
                            is_correction = True
                            correction_markers.append(
                                {
                                    "idx": user_prompt_idx,
                                    "ts": ts,
                                    "text": text[:500],
                                    "reason": "negation_or_correction_language",
                                }
                            )
                    if FRUSTRATION_RE.search(text):
                        friction_markers.append(
                            {
                                "idx": user_prompt_idx,
                                "ts": ts,
                                "text": text[:500],
                                "reason": "frustration_language",
                            }
                        )
                    user_prompts.append(
                        {
                            "idx": user_prompt_idx,
                            "ts": ts,
                            "text": text[:800],
                            "is_correction": is_correction,
                        }
                    )
                    final_user_prompt = text[:800]
                    user_prompt_idx += 1

            elif t == "assistant":
                msg = obj.get("message", {})
                content = msg.get("content", [])
                if isinstance(content, list):
                    for c in content:
                        if c.get("type") == "tool_use":
                            name = c.get("name", "unknown")
                            tool_counts[name] += 1
                            tool_sequence.append(name)
                            tool_idx += 1
                        elif c.get("type") == "text":
                            text = c.get("text", "")
                            if text:
                                final_assistant_text = text
                usage = msg.get("usage", {}) if isinstance(msg, dict) else {}
                input_tokens += usage.get("input_tokens", 0) or 0
                output_tokens += usage.get("output_tokens", 0) or 0

    duration_s: int | None = None
    if first_ts and last_ts:
        try:
            first_dt = datetime.fromisoformat(first_ts.replace("Z", "+00:00"))
            last_dt = datetime.fromisoformat(last_ts.replace("Z", "+00:00"))
            duration_s = int((last_dt - first_dt).total_seconds())
        except ValueError:
            pass

    outcome = "unknown"
    if interrupts > 0:
        outcome = "likely_abandoned"
    elif user_prompts:
        tail = (final_user_prompt or "").lower()
        if any(w in tail for w in ["thanks", "perfect", "great", "nice", "looks good", "done"]):
            outcome = "likely_completed"
        elif any(w in tail for w in ["still broken", "still doesn't", "still not", "argh", "ugh"]):
            outcome = "likely_abandoned"
        elif tool_errors and tool_counts.get("Bash", 0) > 0 and duration_s and duration_s > 60:
            pass

    skill_invocations: list[str] = []
    for sc in slash_commands:
        skill_invocations.append(sc.lstrip("/"))

    assistant_tail = (final_assistant_text or "")[-500:] if final_assistant_text else None

    return {
        "session_id": session_id or path.stem,
        "path": str(path),
        "project_cwd": project_cwd,
        "first_ts": first_ts,
        "last_ts": last_ts,
        "duration_s": duration_s,
        "version": version,
        "git_branch": git_branch,
        "tool_counts": dict(tool_counts),
        "tool_sequence": tool_sequence[:200],
        "tool_errors": tool_errors[:30],
        "user_prompts": user_prompts,
        "slash_commands": slash_commands,
        "skill_invocations": skill_invocations,
        "hook_events": dict(hook_events),
        "interrupts": interrupts,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "correction_markers": correction_markers,
        "friction_markers": friction_markers,
        "outcome_hint": outcome,
        "final_user_prompt": final_user_prompt,
        "final_assistant_text_tail": assistant_tail,
    }


def do_extract(sample_path: Path, out_dir: Path) -> None:
    sample = json.loads(sample_path.read_text())
    records = sample.get("sample", sample) if isinstance(sample, dict) else sample
    out_dir.mkdir(parents=True, exist_ok=True)

    wrote = 0
    for rec in records:
        spath = Path(rec["path"])
        if not spath.exists():
            print(f"warn: missing {spath}", file=sys.stderr)
            continue
        try:
            data = extract_from_session(spath)
        except Exception as e:
            print(f"error: extracting {spath}: {e}", file=sys.stderr)
            continue
        out = out_dir / f"{data['session_id']}.json"
        out.write_text(json.dumps(data, indent=2))
        wrote += 1

    print(f"extracted {wrote} sessions to {out_dir}")


def do_aggregate(extracted_dir: Path, out_path: Path) -> None:
    files = sorted(extracted_dir.glob("*.json"))
    if not files:
        print("error: no extracted files", file=sys.stderr)
        sys.exit(1)

    total_sessions = 0
    total_user_prompts = 0
    total_tool_uses = 0
    total_tokens_in = 0
    total_tokens_out = 0
    total_errors = 0
    total_interrupts = 0
    total_duration = 0
    total_corrections = 0
    total_friction = 0

    tool_counts: Counter[str] = Counter()
    slash_counter: Counter[str] = Counter()
    hook_counter: Counter[str] = Counter()
    outcome_counter: Counter[str] = Counter()
    per_project: dict[str, dict] = defaultdict(
        lambda: {"sessions": 0, "tool_uses": 0, "errors": 0, "corrections": 0, "duration_s": 0}
    )
    bigram_counter: Counter[str] = Counter()
    first_prompts: list[str] = []
    correction_samples: list[dict] = []
    friction_samples: list[dict] = []
    high_error_sessions: list[dict] = []
    likely_abandoned: list[dict] = []

    for fp in files:
        try:
            s = json.loads(fp.read_text())
        except json.JSONDecodeError:
            continue
        total_sessions += 1
        total_user_prompts += len(s.get("user_prompts", []))
        total_tool_uses += sum(s.get("tool_counts", {}).values())
        total_tokens_in += s.get("input_tokens") or 0
        total_tokens_out += s.get("output_tokens") or 0
        total_errors += len(s.get("tool_errors", []))
        total_interrupts += s.get("interrupts") or 0
        total_duration += s.get("duration_s") or 0
        total_corrections += len(s.get("correction_markers", []))
        total_friction += len(s.get("friction_markers", []))

        for name, count in (s.get("tool_counts") or {}).items():
            tool_counts[name] += count
        for sc in s.get("slash_commands") or []:
            slash_counter[sc] += 1
        for hook, count in (s.get("hook_events") or {}).items():
            hook_counter[hook] += count
        outcome_counter[s.get("outcome_hint") or "unknown"] += 1

        cwd = s.get("project_cwd") or "unknown"
        per_project[cwd]["sessions"] += 1
        per_project[cwd]["tool_uses"] += sum(s.get("tool_counts", {}).values())
        per_project[cwd]["errors"] += len(s.get("tool_errors", []))
        per_project[cwd]["corrections"] += len(s.get("correction_markers", []))
        per_project[cwd]["duration_s"] += s.get("duration_s") or 0

        seq = s.get("tool_sequence") or []
        for a, b in zip(seq, seq[1:]):
            bigram_counter[f"{a} -> {b}"] += 1

        fp_txt = (s.get("user_prompts") or [{}])[0].get("text") if s.get("user_prompts") else None
        if fp_txt:
            first_prompts.append(fp_txt)

        for cm in s.get("correction_markers") or []:
            correction_samples.append({**cm, "session_id": s["session_id"]})
        for fm in s.get("friction_markers") or []:
            friction_samples.append({**fm, "session_id": s["session_id"]})

        if len(s.get("tool_errors") or []) >= 3:
            high_error_sessions.append(
                {
                    "session_id": s["session_id"],
                    "path": s["path"],
                    "errors": len(s.get("tool_errors") or []),
                    "tool_counts": s.get("tool_counts"),
                    "first_prompt": fp_txt[:200] if fp_txt else None,
                }
            )
        if s.get("outcome_hint") == "likely_abandoned":
            likely_abandoned.append(
                {
                    "session_id": s["session_id"],
                    "path": s["path"],
                    "interrupts": s.get("interrupts"),
                    "first_prompt": fp_txt[:200] if fp_txt else None,
                    "final_prompt": (s.get("final_user_prompt") or "")[:200],
                }
            )

    agg = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "totals": {
            "sessions": total_sessions,
            "user_prompts": total_user_prompts,
            "tool_uses": total_tool_uses,
            "input_tokens": total_tokens_in,
            "output_tokens": total_tokens_out,
            "tool_errors": total_errors,
            "interrupts": total_interrupts,
            "duration_hours": round(total_duration / 3600, 2),
            "correction_markers": total_corrections,
            "friction_markers": total_friction,
        },
        "per_session_means": {
            "user_prompts": round(total_user_prompts / max(1, total_sessions), 2),
            "tool_uses": round(total_tool_uses / max(1, total_sessions), 2),
            "errors": round(total_errors / max(1, total_sessions), 2),
            "corrections": round(total_corrections / max(1, total_sessions), 2),
            "duration_min": round((total_duration / 60) / max(1, total_sessions), 2),
        },
        "outcome_distribution": dict(outcome_counter),
        "top_tools": tool_counts.most_common(25),
        "top_tool_bigrams": bigram_counter.most_common(25),
        "top_slash_commands": slash_counter.most_common(25),
        "hook_events": hook_counter.most_common(25),
        "per_project": {
            name: data
            for name, data in sorted(
                per_project.items(), key=lambda kv: -kv[1]["sessions"]
            )[:20]
        },
        "correction_samples": correction_samples[:40],
        "friction_samples": friction_samples[:40],
        "high_error_sessions": sorted(
            high_error_sessions, key=lambda r: -r["errors"]
        )[:20],
        "likely_abandoned_sessions": likely_abandoned[:20],
        "first_prompt_samples": first_prompts[:80],
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(agg, indent=2))
    print(f"wrote {out_path}")
    print(f"  sessions aggregated: {total_sessions}")
    print(f"  tool uses: {total_tool_uses:,}")
    print(f"  errors:    {total_errors:,}")
    print(f"  correction markers: {total_corrections}")
    print(f"  friction markers:   {total_friction}")
    print(f"  outcomes: {dict(outcome_counter)}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sample", help="path to sample.json (per-session mode)")
    parser.add_argument("--aggregate", help="path to extracted/ dir (aggregation mode)")
    parser.add_argument("--out", required=True, help="output path (dir for extract, file for aggregate)")
    args = parser.parse_args()

    if args.sample and args.aggregate:
        print("error: pick one of --sample / --aggregate", file=sys.stderr)
        return 2
    if args.sample:
        do_extract(Path(args.sample), Path(args.out))
        return 0
    if args.aggregate:
        do_aggregate(Path(args.aggregate), Path(args.out))
        return 0
    print("error: need --sample or --aggregate", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
