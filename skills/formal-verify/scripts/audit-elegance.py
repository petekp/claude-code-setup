#!/usr/bin/env python3
"""Layer 3 elegance auditor entrypoint."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from elegance.complexity import audit_complexity
from elegance.consistency import audit_consistency
from elegance.craft import audit_craft
from elegance import (
    Deduction,
    grade_from_score,
    load_elegance_config,
    meets_minimum,
    pretty_print_human,
    should_exclude,
    serializable_report,
    to_json,
)


def _collect_sources(project_dir: Path, config: dict) -> list[Path]:
    files = []
    for path in project_dir.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix not in {".rs", ".swift"}:
            continue
        rel = path.relative_to(project_dir)
        if should_exclude(rel, config.get("exclude", [])):
            continue
        files.append(path)
    return sorted(files)


def _apply_grade(
    deductions: list[Deduction],
    config: dict,
) -> tuple[int, str]:
    score = 100
    weights = config["weights"]
    for deduction in deductions:
        step = weights.get(deduction.rule, 1) * max(1, deduction.impact)
        score -= step
    return max(0, score), grade_from_score(max(0, score))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run Layer 3 elegance checks")
    parser.add_argument("--project-dir", default=".", help="Project root to scan")
    parser.add_argument(
        "--config",
        default=".verifier/elegance.yaml",
        help="Path to elegance config (default: .verifier/elegance.yaml)",
    )
    parser.add_argument(
        "--output-mode",
        default="human",
        choices=["human", "agent"],
        help="Human-friendly or agent-first output",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit JSON report",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    project_dir = Path(args.project_dir).resolve()
    config = load_elegance_config(project_dir, args.config)
    sources = _collect_sources(project_dir, config)

    if not sources:
        print("No .rs or .swift sources found for elegance auditing.")
        return 0

    all_deductions: list[Deduction] = []
    notes: list[str] = []

    module_checks = [
        audit_complexity(project_dir, sources, config),
        audit_consistency(project_dir, sources, config),
        audit_craft(project_dir, sources, config),
    ]

    for result, module_notes in module_checks:
        all_deductions.extend(result)
        notes.extend(module_notes)

    all_deductions.sort(key=lambda d: (d.file, d.line, d.rule))
    score, grade = _apply_grade(all_deductions, config)
    minimum = config.get("minimum_grade", "B")
    payload = serializable_report(grade, score, minimum, all_deductions)
    if notes:
        payload["notes"] = notes

    if args.json:
        print(to_json(payload))
    else:
        print(pretty_print_human(grade, score, minimum, all_deductions, args.output_mode))

    return 0 if payload["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
