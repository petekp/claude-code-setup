#!/usr/bin/env python3
"""
Fixes claude-code session index desync (github.com/anthropics/claude-code/issues/33912)
Scans .jsonl session files and rebuilds the per-project sessions-index.json so
--continue and --resume find all sessions.

Run: python3 ~/.claude/scripts/rebuild-session-index.sh [project-dir-name]
  No args: rebuilds all projects missing sessions or with orphaned .jsonl files
  With arg: rebuilds only that project (e.g. -Users-petepetrash-Code-ever-arc-design-studio)
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

CLAUDE_DIR = Path.home() / ".claude"
PROJECTS_DIR = CLAUDE_DIR / "projects"
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


def decode_cwd(dirname: str) -> str:
    """Decode project dir name to absolute path, walking filesystem to handle hyphens."""
    parts = dirname.lstrip("-").split("-")
    resolved = "/"
    i = 0
    while i < len(parts):
        matched = False
        for end in range(len(parts), i, -1):
            candidate = "-".join(parts[i:end])
            test_path = os.path.join(resolved, candidate)
            if os.path.isdir(test_path):
                resolved = test_path
                i = end
                matched = True
                break
        if not matched:
            resolved = os.path.join(resolved, parts[i])
            i += 1
    return resolved


def extract_session_meta(jsonl_path: Path, project_path: str) -> dict | None:
    """Build a session index entry from a .jsonl file.

    Reads the first 50 lines for header metadata (created, first_prompt, git_branch),
    then seeks to the end for summary/modified. Avoids reading entire multi-MB files.
    """
    session_id = jsonl_path.stem
    first_prompt = None
    summary = None
    message_count = 0
    created = None
    modified = None
    git_branch = None

    try:
        with open(jsonl_path) as f:
            # Pass 1: read head for created, first_prompt, git_branch, and count messages
            for line in f:
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue

                record_type = obj.get("type")

                if record_type in ("user", "assistant"):
                    message_count += 1

                if record_type == "user" and first_prompt is None:
                    msg = obj.get("message", {})
                    content = msg.get("content", "")
                    if isinstance(content, str) and content and not content.startswith("<"):
                        first_prompt = content[:200]

                if record_type == "custom-title":
                    summary = obj.get("customTitle")

                if git_branch is None and obj.get("gitBranch"):
                    git_branch = obj["gitBranch"]

                ts = None
                if "snapshot" in obj:
                    ts = obj["snapshot"].get("timestamp")
                if not ts:
                    ts = obj.get("timestamp")
                if ts:
                    if created is None:
                        created = ts
                    modified = ts

    except Exception as e:
        print(f"  warning: failed to parse {jsonl_path.name}: {e}", file=sys.stderr)
        return None

    if message_count == 0:
        return None

    # Fallback timestamps from file stat (use UTC)
    stat = jsonl_path.stat()
    if not created:
        created = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()
    if not modified:
        modified = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()

    return {
        "sessionId": session_id,
        "fullPath": str(jsonl_path),
        "fileMtime": int(stat.st_mtime * 1000),
        "firstPrompt": first_prompt or "No prompt",
        "summary": summary or "Untitled session",
        "messageCount": message_count,
        "created": created,
        "modified": modified,
        "gitBranch": git_branch or "unknown",
        "projectPath": project_path,
        "isSidechain": False,
    }


def rebuild_project(project_dir: Path) -> tuple[int, int]:
    """Rebuild sessions-index.json for a single project directory."""
    cwd = decode_cwd(project_dir.name)

    # Load existing index
    index_path = project_dir / "sessions-index.json"
    existing_entries = {}
    if index_path.exists():
        try:
            data = json.loads(index_path.read_text())
            for entry in data.get("entries", []):
                existing_entries[entry["sessionId"]] = entry
        except (json.JSONDecodeError, KeyError):
            pass

    # Scan for .jsonl files
    added = 0
    skipped = 0
    for jsonl in project_dir.glob("*.jsonl"):
        session_id = jsonl.stem
        if not UUID_RE.match(session_id):
            continue
        if session_id in existing_entries:
            skipped += 1
            continue

        meta = extract_session_meta(jsonl, cwd)
        if meta:
            existing_entries[session_id] = meta
            added += 1

    if added > 0:
        index_data = {
            "version": 1,
            "entries": sorted(existing_entries.values(), key=lambda e: e.get("created", "")),
            "originalPath": cwd,
        }
        index_path.write_text(json.dumps(index_data, indent=2))

    return added, skipped


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else None
    total_added = 0
    total_skipped = 0

    for project_dir in sorted(PROJECTS_DIR.iterdir()):
        if not project_dir.is_dir():
            continue
        if target and project_dir.name != target:
            continue

        # Only process dirs that have .jsonl files
        jsonl_files = list(project_dir.glob("*.jsonl"))
        uuid_files = [f for f in jsonl_files if UUID_RE.match(f.stem)]
        if not uuid_files:
            continue

        added, skipped = rebuild_project(project_dir)
        if added > 0:
            print(f"  {project_dir.name}: +{added} sessions ({skipped} already indexed)")
        total_added += added
        total_skipped += skipped

    print()
    print(f"Done. Added {total_added} orphaned sessions, {total_skipped} already indexed.")
    if total_added > 0:
        print("'claude --continue' and 'claude --resume' should now find all sessions.")


if __name__ == "__main__":
    main()
