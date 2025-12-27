#!/usr/bin/env python3
"""
Model-First Reasoning Validator

Validates that a model.json file has the required structure before implementation.
Run: python scripts/validate-model.py model.json
"""

import json
import sys
from typing import Any

REQUIRED_KEYS = {
    "deliverable",
    "entities",
    "state_variables",
    "actions",
    "constraints",
    "initial_state",
    "goal",
    "assumptions",
    "unknowns",
    "requirement_trace",
    "test_oracles"
}

REQUIRED_ACTION_KEYS = {"name", "preconditions", "effects"}
REQUIRED_CONSTRAINT_KEYS = {"id", "statement"}
REQUIRED_TRACE_KEYS = {"requirement", "represented_as", "ref"}
REQUIRED_ORACLE_KEYS = {"id", "maps_to", "description"}


def validate_model(data: dict[str, Any]) -> tuple[bool, list[str]]:
    """Validate model structure. Returns (is_valid, list_of_issues)."""
    issues = []

    # Check top-level keys
    missing = REQUIRED_KEYS - set(data.keys())
    if missing:
        issues.append(f"Missing top-level keys: {', '.join(sorted(missing))}")

    # Check deliverable structure
    if "deliverable" in data:
        deliverable = data["deliverable"]
        if not isinstance(deliverable, dict):
            issues.append("'deliverable' must be an object")
        elif "description" not in deliverable:
            issues.append("'deliverable' missing 'description'")

    # Check lists are lists
    list_fields = ["entities", "state_variables", "actions", "constraints",
                   "initial_state", "goal", "assumptions", "unknowns",
                   "requirement_trace", "test_oracles"]
    for field in list_fields:
        if field in data and not isinstance(data[field], list):
            issues.append(f"'{field}' must be a list")

    # Check actions structure
    if "actions" in data and isinstance(data["actions"], list):
        for i, action in enumerate(data["actions"]):
            if isinstance(action, dict):
                missing_action = REQUIRED_ACTION_KEYS - set(action.keys())
                if missing_action:
                    issues.append(f"Action[{i}] missing: {', '.join(missing_action)}")

    # Check constraints structure
    if "constraints" in data and isinstance(data["constraints"], list):
        for i, constraint in enumerate(data["constraints"]):
            if isinstance(constraint, dict):
                missing_constraint = REQUIRED_CONSTRAINT_KEYS - set(constraint.keys())
                if missing_constraint:
                    issues.append(f"Constraint[{i}] missing: {', '.join(missing_constraint)}")

    # Check requirement_trace structure
    if "requirement_trace" in data and isinstance(data["requirement_trace"], list):
        for i, trace in enumerate(data["requirement_trace"]):
            if isinstance(trace, dict):
                missing_trace = REQUIRED_TRACE_KEYS - set(trace.keys())
                if missing_trace:
                    issues.append(f"Requirement_trace[{i}] missing: {', '.join(missing_trace)}")

    # Check test_oracles structure
    if "test_oracles" in data and isinstance(data["test_oracles"], list):
        for i, oracle in enumerate(data["test_oracles"]):
            if isinstance(oracle, dict):
                missing_oracle = REQUIRED_ORACLE_KEYS - set(oracle.keys())
                if missing_oracle:
                    issues.append(f"Test_oracle[{i}] missing: {', '.join(missing_oracle)}")

    return len(issues) == 0, issues


def main(path: str) -> int:
    """Main entry point."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: File not found: {path}")
        return 1
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON: {e}")
        return 1

    is_valid, issues = validate_model(data)

    if issues:
        print("VALIDATION FAILED:")
        for issue in issues:
            print(f"  - {issue}")
        print()

    # Check for unknowns (warning, not error)
    unknowns = data.get("unknowns", [])
    if unknowns:
        print(f"WARNING: {len(unknowns)} unknowns remain - STOP after Phase 1")
        for unknown in unknowns:
            print(f"  - {unknown}")
        print()
        print("Do NOT proceed to implementation until unknowns are resolved.")
        return 2  # Special exit code for unknowns

    if is_valid:
        print("OK: Model structure is valid")
        print("    Ready for Phase 2: Implementation")
        return 0

    return 1


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python validate-model.py <model.json>")
        print()
        print("Validates a Model-First Reasoning model file.")
        print("Exit codes:")
        print("  0 = Valid, ready for implementation")
        print("  1 = Invalid structure")
        print("  2 = Valid but has unknowns (stop after Phase 1)")
        sys.exit(2)

    sys.exit(main(sys.argv[1]))
