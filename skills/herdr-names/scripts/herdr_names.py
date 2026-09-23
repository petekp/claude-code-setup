#!/usr/bin/env python3
"""
Snapshot and rename Herdr tabs, panes, and agents.

  herdr_names.py snapshot [--lines N] [--tail N]
      Print every workspace, tab, pane, and agent with current labels, cwd,
      git branch, terminal title, and the tail of each agent's recent output
      (the Claude Code recap line first when there is one). Also reports
      whether the Agents sidebar is configured to show tab or pane names.

  herdr_names.py apply PLAN.json [--dry-run]
      Rename tabs, panes, and agents from a plan. Validates the whole plan
      before touching anything, skips no-ops, prints before -> after.

Plan: a JSON list. Every name field is optional; omit one to leave it alone.
  {"pane_id": "wA:p1", "tab": "touch pinch-to-zoom",
   "pane": "touch pinch-to-zoom", "agent": "pinch-zoom"}
  {"tab_id": "w5:tP", "tab": "evercars backend shell"}
A pane_id entry renames that pane's own tab. Use tab_id for a tab with no
agent pane. An empty string for "pane" or "agent" clears that label.

Only reads and renames. Never sends input, focuses, or closes anything.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass

AGENT_NAME_RE = re.compile(r"^[a-z][a-z0-9_-]{0,31}$")
LABEL_SOFT_MAX = 24  # fits the sidebar without truncation
LABEL_HARD_MAX = 48
RULE_LINE_RE = re.compile(r"^[─━═\-_·]{5,}$")


# ---------------------------------------------------------------- herdr CLI


def require_herdr() -> None:
    if os.environ.get("HERDR_ENV") != "1":
        sys.exit("herdr_names: not running inside a Herdr pane (HERDR_ENV != 1)")
    if shutil.which("herdr") is None:
        sys.exit("herdr_names: herdr CLI not found in PATH")


def herdr_json(*args: str) -> dict:
    proc = subprocess.run(["herdr", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        msg = (proc.stderr or proc.stdout).strip()
        raise RuntimeError(f"herdr {' '.join(args)}: {msg}")
    return json.loads(proc.stdout).get("result", {})


def herdr_text(*args: str) -> tuple[bool, str]:
    proc = subprocess.run(["herdr", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        return False, (proc.stderr or proc.stdout).strip()
    return True, proc.stdout


def load_state() -> tuple[list, dict, dict, dict]:
    workspaces = herdr_json("workspace", "list")["workspaces"]
    tabs: dict[str, dict] = {}
    panes: dict[str, dict] = {}
    for w in workspaces:
        wid = w["workspace_id"]
        for t in herdr_json("tab", "list", "--workspace", wid)["tabs"]:
            tabs[t["tab_id"]] = t
        for p in herdr_json("pane", "list", "--workspace", wid)["panes"]:
            panes[p["pane_id"]] = p
    agents = {a["pane_id"]: a for a in herdr_json("agent", "list")["agents"]}
    return workspaces, tabs, panes, agents


# ---------------------------------------------------------------- snapshot


def git_branch(cwd: str) -> str:
    try:
        proc = subprocess.run(
            ["git", "-C", cwd, "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=5,
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    return proc.stdout.strip() if proc.returncode == 0 else ""


def home_rel(path: str) -> str:
    home = os.path.expanduser("~")
    if path == home or path.startswith(home + os.sep):
        return "~" + path[len(home):]
    return path


def read_tail(pane_id: str, is_agent: bool, lines: int, tail_n: int) -> tuple[str, list[str]]:
    """Return (recap, tail lines) from a pane's recent unwrapped output."""
    sub = "agent" if is_agent else "pane"
    ok, out = herdr_text(sub, "read", pane_id, "--source", "recent-unwrapped", "--lines", str(lines))
    if not ok:
        return "", [f"(read failed: {out[:200]})"]
    cleaned = [re.sub(r"\s+", " ", line).strip() for line in out.splitlines()]

    # Claude Code prints "※ recap: ..." after a turn; it is the best one-line
    # statement of what the session is for. Take the last one, with its
    # continuation lines up to the next blank line.
    recap = ""
    for i in range(len(cleaned) - 1, -1, -1):
        if cleaned[i].startswith("※ recap:"):
            block = [cleaned[i][len("※ recap:"):].strip()]
            j = i + 1
            while j < len(cleaned) and cleaned[j]:
                line = cleaned[j]
                if RULE_LINE_RE.match(line) or line.startswith(("❯", "new task?")):
                    break
                block.append(line)
                j += 1
            recap = " ".join(block)
            # The recap ends with a footer that is not part of the summary.
            recap = recap.split("(disable recaps", 1)[0].strip()
            recap = recap[:400]
            break

    nonempty = [line for line in cleaned if line and not RULE_LINE_RE.match(line)]
    tail = [line[:160] for line in nonempty[-tail_n:]]
    return recap, tail


def sidebar_check() -> tuple[str, bool | None]:
    """Say whether the Agents sidebar rows include a tab or pane token."""
    path = os.environ.get("HERDR_CONFIG_PATH") or os.path.expanduser("~/.config/herdr/config.toml")
    try:
        import tomllib
        with open(path, "rb") as fh:
            cfg = tomllib.load(fh)
    except FileNotFoundError:
        return "no config file, default rows", True
    except Exception as exc:  # noqa: BLE001 - report any parse problem, do not crash
        return f"could not parse {path}: {exc}", None

    agents_cfg = cfg.get("ui", {}).get("sidebar", {}).get("agents", {})

    def tokens(rows) -> list[str]:
        found = []
        for row in rows or []:
            for cell in row:
                found.append(cell.get("token", "?") if isinstance(cell, dict) else str(cell))
        return found

    problems = []
    rows = agents_cfg.get("rows")
    if rows is not None and not ({"tab", "pane"} & set(tokens(rows))):
        problems.append(f"rows={tokens(rows)}")
    for agent_id, agent_rows in (agents_cfg.get("rows_by_agent") or {}).items():
        if not ({"tab", "pane"} & set(tokens(agent_rows))):
            problems.append(f"rows_by_agent.{agent_id}={tokens(agent_rows)}")
    if problems:
        return "no tab/pane token in " + "; ".join(problems), False
    if rows is None:
        return "default rows", True
    return f"rows={tokens(rows)}", True


def cmd_snapshot(args: argparse.Namespace) -> int:
    require_herdr()
    this_pane = os.environ.get("HERDR_PANE_ID", "")
    workspaces, tabs, panes, agents = load_state()

    desc, ok = sidebar_check()
    if ok is True:
        verdict = "yes"
    elif ok is False:
        verdict = "NO. New names will exist but the Agents panel will not show them"
    else:
        verdict = "unknown"
    print(f"Herdr snapshot. This session's pane: {this_pane or 'unknown'}")
    print(f"Agents panel shows tab/pane names: {verdict}  [{desc}]")
    print()

    for w in workspaces:
        wid = w["workspace_id"]
        print(f"## workspace {wid} \"{w['label']}\"  ({w['tab_count']} tab(s), {w['pane_count']} pane(s))")
        for t in (t for t in tabs.values() if t["workspace_id"] == wid):
            print(f"  tab {t['tab_id']} \"{t['label']}\"  ({t['pane_count']} pane(s))")
            for p in (p for p in panes.values() if p["tab_id"] == t["tab_id"]):
                pid = p["pane_id"]
                agent = agents.get(pid)
                mark = "  [this session]" if pid == this_pane else ""
                label = f"\"{p['label']}\"" if p.get("label") else "(none)"
                if agent:
                    who = f"{agent['agent']} {agent['agent_status']}  agent-name={agent.get('name') or '(none)'}"
                else:
                    who = f"no agent, {p.get('agent_status', 'unknown')}"
                print(f"    pane {pid} label={label}  {who}{mark}")
                cwd = p.get("cwd") or ""
                branch = git_branch(cwd) if cwd else ""
                line = f"      cwd {home_rel(cwd)}" if cwd else "      cwd (unknown)"
                if branch:
                    line += f"  branch {branch}"
                print(line)
                print(f"      title \"{p.get('terminal_title_stripped', '')}\"")
                if pid == this_pane:
                    print("      (your own session: name it from the conversation, not from this output)")
                    continue
                tail_n = args.tail if agent else args.shell_tail
                recap, tail = read_tail(pid, bool(agent), args.lines, tail_n)
                if recap:
                    print(f"      recap: {recap}")
                if tail:
                    print("      recent output:")
                    for out_line in tail:
                        print(f"        | {out_line}")
        print()
    return 0


# ---------------------------------------------------------------- apply


@dataclass
class Op:
    kind: str  # tab | pane | agent
    target: str
    before: str | None
    after: str | None
    status: str = ""


def fmt(value: str | None) -> str:
    return "(none)" if not value else f"\"{value}\""


def cmd_apply(args: argparse.Namespace) -> int:
    require_herdr()
    with open(args.plan, encoding="utf-8") as fh:
        plan = json.load(fh)
    if not isinstance(plan, list):
        sys.exit("herdr_names: plan must be a JSON list of entries")

    workspaces, tabs, panes, agents = load_state()
    live_names = {a["name"]: pid for pid, a in agents.items() if a.get("name")}
    planned_names: dict[str, str] = {}
    ops: list[Op] = []
    errors: list[str] = []
    warnings: list[str] = []

    def check_label(kind: str, target: str, label: str) -> bool:
        if not isinstance(label, str):
            errors.append(f"{kind} {target}: label must be a string")
            return False
        if kind == "tab" and not label.strip():
            errors.append(f"{kind} {target}: tab label cannot be empty")
            return False
        if len(label) > LABEL_HARD_MAX:
            errors.append(f"{kind} {target}: label longer than {LABEL_HARD_MAX} chars: {label!r}")
            return False
        if len(label) > LABEL_SOFT_MAX:
            warnings.append(f"{kind} {target}: {label!r} is {len(label)} chars; the sidebar may truncate past {LABEL_SOFT_MAX}")
        return True

    for n, entry in enumerate(plan):
        if not isinstance(entry, dict):
            errors.append(f"entry {n}: not an object")
            continue
        pane_id = entry.get("pane_id")
        tab_id = entry.get("tab_id")
        if pane_id and pane_id not in panes:
            errors.append(f"entry {n}: unknown pane {pane_id}")
            continue
        if not tab_id and pane_id:
            tab_id = panes[pane_id]["tab_id"]
        if tab_id and tab_id not in tabs:
            errors.append(f"entry {n}: unknown tab {tab_id}")
            continue
        if not pane_id and not tab_id:
            errors.append(f"entry {n}: needs pane_id or tab_id")
            continue

        if "tab" in entry:
            label = entry["tab"]
            if check_label("tab", tab_id, label):
                ops.append(Op("tab", tab_id, tabs[tab_id]["label"], label.strip()))

        if "pane" in entry:
            if not pane_id:
                errors.append(f"entry {n}: \"pane\" needs a pane_id")
            else:
                label = entry["pane"] or ""
                if check_label("pane", pane_id, label):
                    ops.append(Op("pane", pane_id, panes[pane_id].get("label"), label.strip() or None))

        if "agent" in entry:
            name = entry["agent"] or ""
            if not pane_id:
                errors.append(f"entry {n}: \"agent\" needs a pane_id")
            elif pane_id not in agents:
                errors.append(f"entry {n}: no live agent in {pane_id}, cannot name it")
            elif name and not AGENT_NAME_RE.match(name):
                errors.append(f"entry {n}: agent name {name!r} must match [a-z][a-z0-9_-]{{0,31}}")
            elif name and planned_names.get(name, pane_id) != pane_id:
                errors.append(f"entry {n}: agent name {name!r} is planned twice")
            elif name and live_names.get(name, pane_id) != pane_id:
                errors.append(f"entry {n}: agent name {name!r} is already used by {live_names[name]}")
            else:
                if name:
                    planned_names[name] = pane_id
                ops.append(Op("agent", pane_id, agents[pane_id].get("name"), name or None))

    for w in warnings:
        print(f"warning: {w}")
    if errors:
        for e in errors:
            print(f"error: {e}", file=sys.stderr)
        print("herdr_names: plan rejected, nothing applied", file=sys.stderr)
        return 2

    failed = 0
    for op in ops:
        if (op.before or None) == (op.after or None):
            op.status = "unchanged"
            continue
        if args.dry_run:
            op.status = "would apply"
            continue
        if op.kind == "tab":
            cmd = ["tab", "rename", op.target, op.after or ""]
        elif op.kind == "pane":
            cmd = ["pane", "rename", op.target] + ([op.after] if op.after else ["--clear"])
        else:
            cmd = ["agent", "rename", op.target] + ([op.after] if op.after else ["--clear"])
        try:
            herdr_json(*cmd)
            op.status = "applied"
        except RuntimeError as exc:
            op.status = f"FAILED: {exc}"
            failed += 1

    if not ops:
        print("nothing to do")
        return 0
    width = max(len(fmt(op.before)) for op in ops)
    for op in ops:
        print(f"{op.kind:<5} {op.target:<7} {fmt(op.before):<{width}} -> {fmt(op.after):<26} {op.status}")
    return 1 if failed else 0


# ---------------------------------------------------------------- main


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    snap = sub.add_parser("snapshot", help="print the current session state with output tails")
    snap.add_argument("--lines", type=int, default=150, help="rows to read from each pane (default 150)")
    snap.add_argument("--tail", type=int, default=25, help="non-empty lines to show per agent pane (default 25)")
    snap.add_argument("--shell-tail", type=int, default=8, help="lines to show per non-agent pane (default 8)")
    snap.set_defaults(func=cmd_snapshot)

    app = sub.add_parser("apply", help="rename tabs, panes, and agents from a plan file")
    app.add_argument("plan", help="path to the JSON plan")
    app.add_argument("--dry-run", action="store_true", help="show what would change without renaming")
    app.set_defaults(func=cmd_apply)

    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except RuntimeError as exc:
        print(f"herdr_names: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
