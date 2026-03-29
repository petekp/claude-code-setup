#!/usr/bin/env python3
from __future__ import annotations

import argparse
import dataclasses
import importlib.util
import json
import sys
import traceback
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run Z3Py behavioral specs.")
    parser.add_argument("--specs-dir", default=".verifier/specs/")
    parser.add_argument("--facts", default=".verifier/facts/facts.json")
    parser.add_argument("--output-mode", choices=("agent", "human"), default="human")
    parser.add_argument("--json", action="store_true")
    return parser.parse_args()


def load_facts(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"facts": [], "metadata": {}}
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def normalize_violation(item: Any, spec_path: Path, output_mode: str) -> dict[str, Any]:
    if dataclasses.is_dataclass(item):
        data = dataclasses.asdict(item)
    elif isinstance(item, dict):
        data = dict(item)
    else:
        data = {
            "rule": getattr(item, "rule", spec_path.stem),
            "counterexample": getattr(item, "counterexample", str(item)),
            "diagnosis": getattr(item, "diagnosis", "Behavioral spec reported a violation."),
            "fix_suggestion": getattr(item, "fix_suggestion", None),
            "file": getattr(item, "file", str(spec_path)),
            "line": getattr(item, "line", 1),
        }

    violation = {
        "layer": "behavioral",
        "rule": data.get("rule", spec_path.stem),
        "description": data.get("description", ""),
        "counterexample": data.get("counterexample", "unspecified"),
        "diagnosis": data.get("diagnosis", "Behavioral verification failed."),
        "file": data.get("file", str(spec_path)),
        "line": data.get("line", 1),
        "spec": str(spec_path),
    }
    if output_mode == "agent":
        violation["fix_suggestion"] = data.get(
            "fix_suggestion",
            "Tighten the spec or implementation until the counterexample is no longer satisfiable.",
        )
    return violation


def import_spec(spec_path: Path):
    module_name = f"formal_verify_spec_{spec_path.stem}_{abs(hash(spec_path))}"
    spec = importlib.util.spec_from_file_location(module_name, spec_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load module from {spec_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def execute_spec(spec_path: Path, facts: dict[str, Any], output_mode: str) -> list[dict[str, Any]]:
    try:
        module = import_spec(spec_path)
    except Exception as exc:
        return [
            normalize_violation(
                {
                    "rule": spec_path.stem,
                    "counterexample": str(exc),
                    "diagnosis": "Failed to import the behavioral spec.",
                    "fix_suggestion": "Fix the import error or missing dependency before rerunning verification.",
                    "file": str(spec_path),
                    "line": 1,
                },
                spec_path,
                output_mode,
            )
        ]

    if not hasattr(module, "verify"):
        return [
            normalize_violation(
                {
                    "rule": spec_path.stem,
                    "counterexample": "verify() missing",
                    "diagnosis": "Behavioral spec must expose a verify(facts) function.",
                    "fix_suggestion": "Add a verify(facts) entry point that returns a list of violations.",
                    "file": str(spec_path),
                    "line": 1,
                },
                spec_path,
                output_mode,
            )
        ]

    try:
        result = module.verify(facts)
    except TypeError:
        result = module.verify()
    except Exception as exc:
        return [
            normalize_violation(
                {
                    "rule": spec_path.stem,
                    "counterexample": traceback.format_exc(limit=5),
                    "diagnosis": f"Behavioral spec crashed: {exc}",
                    "fix_suggestion": "Fix the spec implementation or the supplied facts so verify() can run cleanly.",
                    "file": str(spec_path),
                    "line": 1,
                },
                spec_path,
                output_mode,
            )
        ]

    if result is None:
        return []
    if not isinstance(result, list):
        result = [result]
    return [normalize_violation(item, spec_path, output_mode) for item in result]


def render_text(violations: list[dict[str, Any]]) -> str:
    if not violations:
        return "Behavioral verification passed."

    lines = []
    for violation in violations:
        lines.append(f"[behavioral] {violation['rule']}")
        lines.append(f"  Spec: {violation['spec']}")
        lines.append(f"  Counterexample: {violation['counterexample']}")
        lines.append(f"  Diagnosis: {violation['diagnosis']}")
        if "fix_suggestion" in violation:
            lines.append(f"  Fix: {violation['fix_suggestion']}")
        lines.append("")
    return "\n".join(lines).rstrip()


def main() -> int:
    args = parse_args()
    specs_dir = Path(args.specs_dir)
    facts = load_facts(Path(args.facts))
    violations: list[dict[str, Any]] = []

    if specs_dir.exists():
        for spec_path in sorted(path for path in specs_dir.glob("*.py") if path.is_file()):
            violations.extend(execute_spec(spec_path, facts, args.output_mode))

    if args.json:
        print(json.dumps(violations, indent=2, sort_keys=True))
    else:
        print(render_text(violations))
    return 1 if violations else 0


if __name__ == "__main__":
    sys.exit(main())
