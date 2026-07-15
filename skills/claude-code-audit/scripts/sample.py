#!/usr/bin/env python3
"""
Stratified sample from the inventory. Prefer recent sessions, but ensure
diversity across projects and session sizes so the audit doesn't overfit to
whatever project the user lived in last week.

Strategy:
  1. Filter by --days (default 60, 0 = no limit).
  2. Filter by --min-user-turns (default 2; drop one-shot `/status`-style sessions).
  3. Sort by recency.
  4. Pass 1 (recency quota): take the newest N where N = 60% of --count.
  5. Pass 2 (project diversity): for each project not yet well-represented,
     pull its most recent qualifying session until we reach --count.
  6. Pass 3 (size diversity): if the sample is all short or all long, swap in
     a few outliers from the remaining pool.

Deterministic for a given inventory and flags (no randomness).
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path


def load_inventory(path: Path) -> list[dict]:
    return json.loads(path.read_text())


def by_size_bucket(rec: dict) -> str:
    size = rec.get("size_bytes", 0)
    if size < 20_000:
        return "xs"
    if size < 100_000:
        return "s"
    if size < 500_000:
        return "m"
    if size < 2_000_000:
        return "l"
    return "xl"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inventory", default="audit/inventory.json")
    parser.add_argument("--count", type=int, default=60, help="target sample size")
    parser.add_argument("--days", type=int, default=60, help="recency window in days (0 = all)")
    parser.add_argument("--min-user-turns", type=int, default=2)
    parser.add_argument(
        "--include-project",
        action="append",
        default=[],
        help="restrict to sessions in this project (repeatable, substring match on project_key)",
    )
    parser.add_argument(
        "--exclude-project",
        action="append",
        default=[],
        help="drop sessions whose project_key matches (repeatable)",
    )
    parser.add_argument("--out", default="audit/sample.json")
    args = parser.parse_args()

    inv = load_inventory(Path(args.inventory))

    cutoff_mtime: float | None = None
    if args.days > 0:
        cutoff_mtime = (datetime.now() - timedelta(days=args.days)).timestamp()

    pool: list[dict] = []
    for rec in inv:
        if rec["user_turns"] < args.min_user_turns:
            continue
        if cutoff_mtime is not None and rec["mtime"] < cutoff_mtime:
            continue
        if args.include_project and not any(p in rec["project_key"] for p in args.include_project):
            continue
        if args.exclude_project and any(p in rec["project_key"] for p in args.exclude_project):
            continue
        pool.append(rec)

    pool.sort(key=lambda r: r["mtime"], reverse=True)

    if not pool:
        print("error: no sessions matched filters", file=sys.stderr)
        return 1

    target = min(args.count, len(pool))
    selected: list[dict] = []
    selected_paths: set[str] = set()

    recency_quota = max(1, int(target * 0.6))
    for rec in pool[:recency_quota]:
        selected.append(rec)
        selected_paths.add(rec["path"])

    by_project = defaultdict(list)
    for rec in pool:
        by_project[rec["project_key"]].append(rec)

    project_counts = Counter(r["project_key"] for r in selected)
    max_per_project = max(2, target // max(1, len(by_project)))

    for project_key, recs in sorted(by_project.items(), key=lambda kv: -len(kv[1])):
        if len(selected) >= target:
            break
        for rec in recs:
            if len(selected) >= target:
                break
            if project_counts[project_key] >= max_per_project + 2:
                break
            if rec["path"] in selected_paths:
                continue
            selected.append(rec)
            selected_paths.add(rec["path"])
            project_counts[project_key] += 1

    if len(selected) < target:
        for rec in pool:
            if len(selected) >= target:
                break
            if rec["path"] in selected_paths:
                continue
            selected.append(rec)
            selected_paths.add(rec["path"])

    buckets = Counter(by_size_bucket(r) for r in selected)
    if buckets.get("xl", 0) == 0:
        for rec in pool:
            if by_size_bucket(rec) == "xl" and rec["path"] not in selected_paths:
                if selected:
                    selected[-1] = rec
                    selected_paths.add(rec["path"])
                break
    if buckets.get("xs", 0) == 0:
        for rec in pool:
            if by_size_bucket(rec) == "xs" and rec["path"] not in selected_paths:
                if len(selected) > 1:
                    selected[-2] = rec
                    selected_paths.add(rec["path"])
                break

    selected.sort(key=lambda r: r["mtime"], reverse=True)

    out = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "args": {
            "count": args.count,
            "days": args.days,
            "min_user_turns": args.min_user_turns,
            "include_project": args.include_project,
            "exclude_project": args.exclude_project,
        },
        "pool_size": len(pool),
        "sample_size": len(selected),
        "sample": selected,
    }
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2))

    project_counts = Counter(r["project_key"] for r in selected)
    size_counts = Counter(by_size_bucket(r) for r in selected)
    print(f"wrote {out_path}")
    print(f"  pool size:   {len(pool)}")
    print(f"  sample size: {len(selected)}")
    print(f"  date range:  {selected[-1]['mtime_iso']}  ->  {selected[0]['mtime_iso']}")
    print("  projects:")
    for name, count in project_counts.most_common(10):
        print(f"    {count:>3}  {name}")
    print("  size buckets:")
    for bucket in ("xs", "s", "m", "l", "xl"):
        if size_counts.get(bucket):
            print(f"    {bucket}: {size_counts[bucket]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
