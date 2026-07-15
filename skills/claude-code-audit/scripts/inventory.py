#!/usr/bin/env python3
"""
Inventory every Claude Code session on this machine.

Fast pass: walks ~/.claude/projects/**/*.jsonl, records metadata per session,
writes JSON to --out. Does NOT fully parse messages — uses cheap counts
(line count, bytes, mtime) plus a light scan for tool-use names and token
totals.

Output shape (one object per session):
{
  "session_id": "...",
  "path": "/abs/path.jsonl",
  "project_key": "-Users-petepetrash-Code-my-project",
  "project_cwd": "/Users/petepetrash/Code/my-project",
  "mtime": 1745432400.0,
  "mtime_iso": "2026-04-23T12:32:00",
  "size_bytes": 123456,
  "line_count": 562,
  "user_turns": 10,
  "assistant_turns": 30,
  "tool_uses": 51,
  "tool_names": {"Bash": 40, "Read": 7, ...},
  "errors_seen": 3,
  "input_tokens": 655,
  "output_tokens": 56262,
  "first_ts": "2026-04-21T20:39:05",
  "last_ts": "2026-04-21T20:45:12",
  "duration_s": 367,
  "version": "2.1.116",
  "git_branch": "main",
  "first_user_prompt": "help me rebind the 'code' cli..."
}
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path


def decode_project_cwd(project_key: str) -> str:
    """~/.claude/projects uses `-` as path-separator encoding for cwd."""
    if not project_key.startswith("-"):
        return project_key
    return "/" + project_key[1:].replace("-", "/")


def scan_session(path: Path) -> dict | None:
    size = path.stat().st_size
    mtime = path.stat().st_mtime
    line_count = 0
    user_turns = 0
    assistant_turns = 0
    tool_uses = 0
    tool_names: Counter[str] = Counter()
    errors_seen = 0
    input_tokens = 0
    output_tokens = 0
    first_ts: str | None = None
    last_ts: str | None = None
    version: str | None = None
    git_branch: str | None = None
    first_user_prompt: str | None = None
    session_id: str | None = None

    try:
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                line_count += 1
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
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

                t = obj.get("type")
                if t == "user":
                    msg = obj.get("message", {})
                    content = msg.get("content", "")
                    if isinstance(content, list):
                        # tool_result batches are userType messages too
                        if any(c.get("type") == "tool_result" for c in content):
                            for c in content:
                                if c.get("type") == "tool_result" and c.get("is_error"):
                                    errors_seen += 1
                            continue
                        for c in content:
                            if c.get("type") == "text":
                                text = c.get("text", "")
                                if first_user_prompt is None and text and not text.startswith("<"):
                                    first_user_prompt = text[:400]
                                if text and not text.startswith("<"):
                                    user_turns += 1
                    elif isinstance(content, str):
                        if content.startswith("<local-command") or content.startswith("<command-"):
                            continue
                        if first_user_prompt is None and content:
                            first_user_prompt = content[:400]
                        user_turns += 1
                elif t == "assistant":
                    assistant_turns += 1
                    msg = obj.get("message", {})
                    content = msg.get("content", [])
                    if isinstance(content, list):
                        for c in content:
                            if c.get("type") == "tool_use":
                                tool_uses += 1
                                tool_names[c.get("name", "unknown")] += 1
                    usage = msg.get("usage", {}) if isinstance(msg, dict) else {}
                    input_tokens += usage.get("input_tokens", 0) or 0
                    output_tokens += usage.get("output_tokens", 0) or 0
    except OSError as e:
        print(f"warn: could not read {path}: {e}", file=sys.stderr)
        return None

    duration_s: int | None = None
    if first_ts and last_ts:
        try:
            first_dt = datetime.fromisoformat(first_ts.replace("Z", "+00:00"))
            last_dt = datetime.fromisoformat(last_ts.replace("Z", "+00:00"))
            duration_s = int((last_dt - first_dt).total_seconds())
        except ValueError:
            pass

    project_key = path.parent.name
    return {
        "session_id": session_id or path.stem,
        "path": str(path),
        "project_key": project_key,
        "project_cwd": decode_project_cwd(project_key),
        "mtime": mtime,
        "mtime_iso": datetime.fromtimestamp(mtime).isoformat(timespec="seconds"),
        "size_bytes": size,
        "line_count": line_count,
        "user_turns": user_turns,
        "assistant_turns": assistant_turns,
        "tool_uses": tool_uses,
        "tool_names": dict(tool_names),
        "errors_seen": errors_seen,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "first_ts": first_ts,
        "last_ts": last_ts,
        "duration_s": duration_s,
        "version": version,
        "git_branch": git_branch,
        "first_user_prompt": first_user_prompt,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--projects-dir",
        default=str(Path.home() / ".claude" / "projects"),
        help="root directory to scan (default: ~/.claude/projects)",
    )
    parser.add_argument(
        "--out",
        default="audit/inventory.json",
        help="output path for inventory JSON (default: audit/inventory.json)",
    )
    parser.add_argument(
        "--min-user-turns",
        type=int,
        default=1,
        help="skip sessions with fewer real user prompts than this (default: 1)",
    )
    args = parser.parse_args()

    projects_dir = Path(args.projects_dir)
    if not projects_dir.is_dir():
        print(f"error: {projects_dir} is not a directory", file=sys.stderr)
        return 1

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    sessions: list[dict] = []
    for session_path in sorted(projects_dir.glob("*/*.jsonl")):
        rec = scan_session(session_path)
        if rec is None:
            continue
        if rec["user_turns"] < args.min_user_turns:
            continue
        sessions.append(rec)

    sessions.sort(key=lambda r: r["mtime"], reverse=True)

    out_path.write_text(json.dumps(sessions, indent=2))

    total_tool_uses = sum(s["tool_uses"] for s in sessions)
    total_tokens_out = sum(s["output_tokens"] for s in sessions)
    projects = Counter(s["project_key"] for s in sessions)

    print(f"wrote {out_path}")
    print(f"  sessions: {len(sessions)}")
    print(f"  projects: {len(projects)}")
    print(f"  total tool uses (scanned): {total_tool_uses:,}")
    print(f"  total output tokens:       {total_tokens_out:,}")
    if sessions:
        print(f"  most recent: {sessions[0]['mtime_iso']}  ({sessions[0]['project_key']})")
        print(f"  oldest:      {sessions[-1]['mtime_iso']}  ({sessions[-1]['project_key']})")
    print("  top projects:")
    for name, count in projects.most_common(5):
        print(f"    {count:>4}  {name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
