#!/usr/bin/env python3
"""
Render a Claude Code session JSONL as a compact, readable transcript.

Strips noise (file snapshots, raw hook payloads, thinking blocks, huge tool
result blobs), keeps signal (user prompts, assistant text, tool calls with
compact args, tool errors, interrupts).

Use this when you need to read a full session with a subagent — it keeps
transcripts short enough to not blow context. For a 500kb JSONL you typically
get a 30-60kb readable transcript.

  render.py <session.jsonl>
  render.py <session.jsonl> --max-chars 4000
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def clip(text: str, limit: int) -> str:
    if text is None:
        return ""
    text = str(text)
    if len(text) <= limit:
        return text
    return text[:limit] + f"  …[+{len(text) - limit} chars]"


def render(path: Path, max_chars: int) -> str:
    lines: list[str] = []
    session_id: str | None = None
    first_ts: str | None = None
    last_ts: str | None = None
    cwd: str | None = None

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
            if cwd is None:
                cwd = obj.get("cwd")

            t = obj.get("type")

            if t in {"file-history-snapshot", "last-prompt"}:
                continue

            if t == "attachment":
                att = obj.get("attachment", {}) or {}
                event = att.get("hookEvent")
                hook_name = att.get("hookName")
                exit_code = att.get("exitCode")
                if event or hook_name:
                    tag = f"[hook {event}:{hook_name} exit={exit_code}]"
                    stdout = att.get("stdout", "") or ""
                    tail = clip(stdout.strip().splitlines()[-1] if stdout.strip() else "", 120)
                    lines.append(f"{tag} {tail}".rstrip())
                continue

            if t == "system":
                sub = obj.get("subtype")
                content = obj.get("content", "")
                lines.append(f"[system:{sub}] {clip(content, 200)}")
                continue

            if t == "user":
                msg = obj.get("message", {})
                content = msg.get("content", "")
                if isinstance(content, str):
                    if (
                        content.startswith("<local-command")
                        or content.startswith("<command-")
                        or content.startswith("<bash-input>")
                    ):
                        continue
                    lines.append(f"\n=== USER ===\n{clip(content, max_chars)}")
                elif isinstance(content, list):
                    user_text_parts: list[str] = []
                    tool_result_parts: list[str] = []
                    for c in content:
                        if c.get("type") == "tool_result":
                            body = c.get("content", "")
                            if isinstance(body, list):
                                pieces = []
                                for b in body:
                                    if b.get("type") == "text":
                                        pieces.append(b.get("text", ""))
                                body = "\n".join(pieces)
                            err = " (ERROR)" if c.get("is_error") else ""
                            tool_use_id = c.get("tool_use_id", "")
                            tool_result_parts.append(
                                f"[tool_result{err} id={tool_use_id[:8]}]\n{clip(str(body), 1200)}"
                            )
                        elif c.get("type") == "text":
                            user_text_parts.append(c.get("text", ""))
                    if user_text_parts:
                        full = "\n".join(user_text_parts)
                        if not full.startswith("<"):
                            lines.append(f"\n=== USER ===\n{clip(full, max_chars)}")
                    for part in tool_result_parts:
                        lines.append(part)
                continue

            if t == "assistant":
                msg = obj.get("message", {})
                content = msg.get("content", [])
                if not isinstance(content, list):
                    continue
                prefix_written = False
                for c in content:
                    if c.get("type") == "text":
                        if not prefix_written:
                            lines.append("\n=== ASSISTANT ===")
                            prefix_written = True
                        lines.append(clip(c.get("text", ""), max_chars))
                    elif c.get("type") == "tool_use":
                        name = c.get("name", "?")
                        args = c.get("input", {})
                        args_compact = json.dumps(args, ensure_ascii=False)
                        if not prefix_written:
                            lines.append("\n=== ASSISTANT ===")
                            prefix_written = True
                        lines.append(f"[tool_use {name}] {clip(args_compact, 600)}")
                continue

    header = [
        f"# session {session_id}",
        f"# path {path}",
        f"# cwd  {cwd}",
        f"# first {first_ts}  last {last_ts}",
        "",
    ]
    return "\n".join(header + lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", help="session JSONL path")
    parser.add_argument("--max-chars", type=int, default=3000, help="per-message clip (default 3000)")
    parser.add_argument("--out", help="write to file instead of stdout")
    args = parser.parse_args()

    path = Path(args.path)
    if not path.is_file():
        print(f"error: no such file: {path}", file=sys.stderr)
        return 1

    text = render(path, args.max_chars)
    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(text)
        print(f"wrote {args.out}  ({len(text):,} chars)")
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
