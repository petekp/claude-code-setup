#!/bin/sh
#
# Reports how often each skill was used, from Claude Code and Codex session
# logs. Use it before removing a skill.
#
# Claude Code counts Skill tool calls and typed /slash commands. Codex has no
# skill tool, so it counts commands that read a skills/<name>/SKILL.md file.
# Claude Code deletes transcripts after cleanupPeriodDays (default 30), so a
# longer window can undercount Claude. Cloud sessions are not on disk.
#
# Usage: skill-usage.sh [days]   (default 30)

set -eu

exec python3 - "${1:-30}" <<'PY'
import collections, datetime, json, pathlib, re, sys, time

days = int(sys.argv[1])
cutoff = time.time() - days * 86400
home = pathlib.Path.home()

uses = collections.defaultdict(lambda: {"claude": 0, "codex": 0, "last": ""})
SLASH = re.compile(r"<command-name>/?([\w:.-]+)</command-name>")
SKILL_FILE = re.compile(r"skills/([\w.-]+)/SKILL\.md")

def recent(root, pattern):
    if not root.is_dir():
        return []
    return [p for p in root.glob(pattern) if p.stat().st_mtime >= cutoff]

def record(name, agent, stamp):
    entry = uses[name]
    entry[agent] += 1
    entry["last"] = max(entry["last"], (stamp or "")[:10])

for path in recent(home / ".claude/projects", "**/*.jsonl"):
    for line in path.open(errors="replace"):
        if '"Skill"' not in line and "<command-name>" not in line:
            continue
        try:
            row = json.loads(line)
        except ValueError:
            continue
        content = (row.get("message") or {}).get("content")
        stamp = row.get("timestamp")
        if row.get("type") == "assistant" and isinstance(content, list):
            for item in content:
                if item.get("type") == "tool_use" and item.get("name") == "Skill":
                    name = (item.get("input") or {}).get("skill")
                    if name:
                        record(name, "claude", stamp)
        elif row.get("type") == "user" and isinstance(content, str):
            for name in SLASH.findall(content):
                record(name, "claude", stamp)

# One Codex session reads a SKILL.md several times; count it once per session.
for path in recent(home / ".codex/sessions", "**/*.jsonl"):
    seen = {}
    for line in path.open(errors="replace"):
        if "SKILL.md" not in line:
            continue
        try:
            row = json.loads(line)
        except ValueError:
            continue
        payload = row.get("payload") or {}
        if payload.get("type") not in ("function_call", "custom_tool_call", "local_shell_call"):
            continue
        text = json.dumps(payload.get("arguments") or payload.get("input") or payload.get("action") or "")
        for name in SKILL_FILE.findall(text):
            seen.setdefault(name, row.get("timestamp"))
    for name, stamp in seen.items():
        record(name, "codex", stamp)

installed = set()
for folder in (home / ".claude/skills", home / ".agents/skills", home / ".codex/skills"):
    if folder.is_dir():
        installed.update(p.name for p in folder.iterdir() if (p / "SKILL.md").is_file())
# Account skills synced from claude.ai sit in folders named by id.
for path in (home / ".claude/skills/synced").glob("*/SKILL.md"):
    found = re.search(r"^name:\s*(\S+)", path.read_text(errors="replace"), re.M)
    if found:
        installed.add(found.group(1).strip("'\""))

# Slash commands include built-ins like /clear. Keep installed skills and
# plugin skills, which are namespaced as plugin:skill.
rows = sorted(
    ((name, u) for name, u in uses.items() if name in installed or ":" in name),
    key=lambda kv: -(kv[1]["claude"] + kv[1]["codex"]),
)
print(f"Skill use in the last {days} days. Codex counts sessions.\n")
print(f"{'skill':40} {'claude':>6} {'codex':>6}  last used")
for name, u in rows:
    print(f"{name:40} {u['claude']:>6} {u['codex']:>6}  {u['last']}")
unused = sorted(installed - set(uses))
if unused:
    print(f"\nInstalled with no recorded use ({len(unused)}):")
    for name in unused:
        print(f"  {name}")
PY
