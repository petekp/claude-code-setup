#!/usr/bin/env python3
from __future__ import annotations

import argparse
import fnmatch
import itertools
import json
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover - explicit runtime guard
    yaml = None

try:
    from z3 import Const, EnumSort, Or, Solver, sat
except ImportError:  # pragma: no cover - optional at import time
    Const = EnumSort = Or = Solver = sat = None


@dataclass
class Match:
    module: str
    file: str
    line: int
    evidence: str
    fact_type: str


WITNESS_COUNTER = itertools.count()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Verify structural rules over extracted facts.")
    parser.add_argument("--facts", default=".verifier/facts/facts.json")
    parser.add_argument("--constraints", default=".verifier/structural.yaml")
    parser.add_argument("--output-mode", choices=("agent", "human"), default="human")
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text")
    return parser.parse_args()


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_yaml(path: Path) -> dict[str, Any]:
    if yaml is None:
        raise RuntimeError(
            "PyYAML is required for structural verification. Run install-deps.sh or install PyYAML first."
        )
    with path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
    if not isinstance(data, dict):
        raise ValueError("Constraints file must contain a mapping at the top level")
    return data


def build_index(facts: list[dict[str, Any]]) -> dict[str, Any]:
    modules: dict[str, dict[str, Any]] = {}
    facts_by_type: dict[str, list[dict[str, Any]]] = defaultdict(list)
    functions_to_modules: dict[str, set[str]] = defaultdict(set)

    for fact in facts:
        facts_by_type[fact["type"]].append(fact)
        module_name = fact.get("module")
        if fact["type"] == "module":
            modules[module_name] = {
                "lang": fact.get("lang"),
                "path": fact.get("path"),
                "file": fact.get("source_path"),
                "facts": [],
                "imports": [],
                "calls": [],
                "references": [],
                "literals": [],
                "implements": [],
                "types": [],
            }

    for fact in facts:
        module_name = fact.get("module")
        if module_name and module_name not in modules:
            modules[module_name] = {
                "lang": None,
                "path": fact.get("source_path"),
                "file": fact.get("source_path"),
                "facts": [],
                "imports": [],
                "calls": [],
                "references": [],
                "literals": [],
                "implements": [],
                "types": [],
            }
        if module_name:
            modules[module_name]["facts"].append(fact)

        if fact["type"] == "imports" and module_name:
            modules[module_name]["imports"].append(fact)
        elif fact["type"] == "calls" and module_name:
            modules[module_name]["calls"].append(fact)
        elif fact["type"] == "reference" and module_name:
            modules[module_name]["references"].append(fact)
        elif fact["type"] == "contains_literal" and module_name:
            modules[module_name]["literals"].append(fact)
        elif fact["type"] == "implements" and module_name:
            modules[module_name]["implements"].append(fact)
        elif fact["type"] == "type_def" and module_name:
            modules[module_name]["types"].append(fact)
        elif fact["type"] == "defines_fn":
            functions_to_modules[fact["fn_name"]].add(module_name)

    adjacency: dict[str, set[str]] = defaultdict(set)
    for module_name, info in modules.items():
        for call_fact in info["calls"]:
            callee = call_fact["callee"].split(".")[-1]
            for target in functions_to_modules.get(callee, set()):
                if target and target != module_name:
                    adjacency[module_name].add(target)

    return {
        "modules": modules,
        "facts_by_type": facts_by_type,
        "functions_to_modules": functions_to_modules,
        "adjacency": adjacency,
    }


def wildcard_regex(term: str, *, anchored: bool) -> re.Pattern[str]:
    escaped = re.escape(term).replace(r"\*", ".*").replace(r"\?", ".")
    if anchored:
        escaped = f"^{escaped}$"
    return re.compile(escaped)


def value_matches(value: str, expression: str, *, anchored: bool = True) -> bool:
    for part in expression.split("|"):
        part = part.strip()
        if not part:
            continue
        if wildcard_regex(part, anchored=anchored).search(value):
            return True
    return False


def resolve_pattern(pattern: str, config: dict[str, Any], seen: set[str] | None = None) -> str:
    if ":" in pattern or pattern == "reference_tmux_literal":
        return pattern

    custom_patterns = config.get("custom_patterns", {})
    if not isinstance(custom_patterns, dict):
        return pattern

    seen = seen or set()
    if pattern in seen:
        return pattern
    if pattern not in custom_patterns:
        return pattern

    target = custom_patterns[pattern]
    if isinstance(target, str):
        seen.add(pattern)
        return resolve_pattern(target, config, seen)
    return pattern


def direct_matches(module_name: str, pattern: str, index: dict[str, Any]) -> list[Match]:
    info = index["modules"][module_name]

    if pattern == "reference_tmux_literal":
        return [
            Match(module_name, fact["source_path"], fact["line"], fact["literal"], "contains_literal")
            for fact in info["literals"]
            if "tmux" in fact["literal"].lower()
        ]

    if ":" not in pattern:
        return []

    operator, value = pattern.split(":", 1)
    if operator == "import":
        return [
            Match(module_name, fact["source_path"], fact["line"], fact["imported"], "imports")
            for fact in info["imports"]
            if value_matches(fact["imported"], value)
        ]
    if operator == "import_from":
        return [
            Match(module_name, fact["source_path"], fact["line"], fact["imported"], "imports")
            for fact in info["imports"]
            if value in fact["imported"]
        ]
    if operator == "reference":
        matches: list[Match] = []
        matches.extend(
            Match(module_name, fact["source_path"], fact["line"], fact["name"], "reference")
            for fact in info["references"]
            if value_matches(fact["name"], value)
        )
        matches.extend(
            Match(module_name, fact["source_path"], fact["line"], fact["literal"], "contains_literal")
            for fact in info["literals"]
            if value_matches(fact["literal"], value, anchored=False)
        )
        return matches
    if operator == "implement":
        return [
            Match(module_name, fact["source_path"], fact["line"], fact["protocol"], "implements")
            for fact in info["implements"]
            if value_matches(fact["protocol"], value)
        ]
    if operator == "literal":
        return [
            Match(module_name, fact["source_path"], fact["line"], fact["literal"], "contains_literal")
            for fact in info["literals"]
            if value_matches(fact["literal"], value, anchored=False)
        ]
    if operator == "call_pattern":
        return [
            Match(module_name, fact["source_path"], fact["line"], fact["callee"], "calls")
            for fact in info["calls"]
            if value_matches(fact["callee"].split(".")[-1], value)
        ]
    return []


def reachable_call_matches(module_name: str, value: str, index: dict[str, Any], depth: int) -> list[Match]:
    queue = [(module_name, 0)]
    visited = {module_name}
    while queue:
        current, current_depth = queue.pop(0)
        direct = direct_matches(current, f"call_pattern:{value}", index)
        if direct:
            if current == module_name:
                return direct
            return [
                Match(module_name, match.file, match.line, f"reachable via {current}: {match.evidence}", match.fact_type)
                for match in direct
            ]
        if current_depth >= depth:
            continue
        for neighbor in sorted(index["adjacency"].get(current, set())):
            if neighbor in visited:
                continue
            visited.add(neighbor)
            queue.append((neighbor, current_depth + 1))
    return []


def module_matches(module_name: str, pattern: str, index: dict[str, Any], config: dict[str, Any], depth: int) -> list[Match]:
    resolved = resolve_pattern(pattern, config)
    if resolved.startswith("call_pattern:"):
        return reachable_call_matches(module_name, resolved.split(":", 1)[1], index, depth)
    return direct_matches(module_name, resolved, index)


def select_modules(constraint: dict[str, Any], index: dict[str, Any]) -> list[str]:
    modules = sorted(index["modules"])
    selected = modules

    if "only" in constraint:
        owner = constraint["only"]
        selected = [module for module in modules if module != owner]
    elif "modules_in" in constraint:
        group = constraint["modules_in"]
        selected = [
            module
            for module, info in index["modules"].items()
            if info.get("lang") == group or module == group
        ]
    elif "modules_matching" in constraint:
        pattern = constraint["modules_matching"]
        selected = [module for module in modules if fnmatch.fnmatchcase(module, pattern)]
    elif constraint.get("all_modules") is True:
        selected = modules

    excluded = set(constraint.get("except", []) or [])
    return sorted(module for module in selected if module not in excluded)


def solve_witness(violating_modules: list[str]) -> str | None:
    if not violating_modules or Solver is None or EnumSort is None:
        return violating_modules[0] if violating_modules else None

    counter = next(WITNESS_COUNTER)
    sort, members = EnumSort(
        f"ModuleSort_{counter}",
        [f"mod_{index}" for index, _ in enumerate(violating_modules)],
    )
    witness = Const(f"witness_{counter}", sort)
    solver = Solver()
    solver.add(Or([witness == member for member in members]))
    if solver.check() != sat:
        return None
    model = solver.model()
    chosen = str(model[witness])
    if chosen.startswith("mod_"):
        return violating_modules[int(chosen.split("_", 1)[1])]
    return violating_modules[0]


def format_fix_suggestion(rule: dict[str, Any], module_name: str, pattern: str) -> str:
    constraint = rule["constraint"]
    if "only" in constraint:
        return f"Move the behavior matching `{pattern}` out of `{module_name}` and route it through `{constraint['only']}`."
    if "must" in constraint:
        return f"Make `{module_name}` satisfy `{pattern}` or narrow the selector if the rule is intentionally too broad."
    return f"Remove or isolate the behavior matching `{pattern}` from `{module_name}`."


def evaluate_rule(
    category: str,
    rule: dict[str, Any],
    index: dict[str, Any],
    config: dict[str, Any],
    output_mode: str,
    depth: int,
) -> list[dict[str, Any]]:
    constraint = rule["constraint"]
    selected = select_modules(constraint, index)
    if not selected:
        return []

    assertion: str | None = None
    pattern = ""
    for candidate in ("may", "must", "must_not"):
        if candidate in constraint:
            assertion = candidate
            pattern = str(constraint[candidate])
            break

    if assertion is None:
        return []

    violating_modules: list[str] = []
    evidence: dict[str, list[Match]] = {}
    for module_name in selected:
        matches = module_matches(module_name, pattern, index, config, depth)
        if assertion in {"may", "must_not"} and matches:
            violating_modules.append(module_name)
            evidence[module_name] = matches
        elif assertion == "must" and not matches:
            violating_modules.append(module_name)
            source_file = index["modules"][module_name].get("file") or index["modules"][module_name].get("path") or module_name
            evidence[module_name] = [Match(module_name, source_file, 1, f"missing {pattern}", "missing")]

    witness = solve_witness(violating_modules)
    if witness is None:
        return []

    match = evidence[witness][0]
    description = rule.get("description", "")
    if assertion == "may" and "only" in constraint:
        diagnosis = f"`{witness}` matched `{pattern}`, but only `{constraint['only']}` may satisfy this rule."
    elif assertion == "must":
        diagnosis = f"`{witness}` is missing the required pattern `{pattern}`."
    else:
        diagnosis = f"`{witness}` matched forbidden pattern `{pattern}`."

    violation = {
        "layer": "structural",
        "category": category,
        "rule": rule.get("rule", "unnamed_rule"),
        "description": description,
        "module": witness,
        "file": match.file,
        "line": match.line,
        "counterexample": match.evidence,
        "diagnosis": diagnosis,
    }
    if output_mode == "agent":
        violation["fix_suggestion"] = format_fix_suggestion(rule, witness, pattern)
    return [violation]


def render_text(violations: list[dict[str, Any]]) -> str:
    if not violations:
        return "Structural verification passed."
    lines = []
    for violation in violations:
        lines.append(f"[{violation['category']}] {violation['rule']}")
        lines.append(f"  File: {violation['file']}:{violation['line']}")
        lines.append(f"  Counterexample: {violation['counterexample']}")
        lines.append(f"  Diagnosis: {violation['diagnosis']}")
        if "fix_suggestion" in violation:
            lines.append(f"  Fix: {violation['fix_suggestion']}")
        lines.append("")
    return "\n".join(lines).rstrip()


def main() -> int:
    args = parse_args()
    facts_payload = load_json(Path(args.facts))
    config = load_yaml(Path(args.constraints))
    facts = facts_payload.get("facts", [])
    index = build_index(facts)
    depth = int(config.get("reachability_depth", 10))

    violations: list[dict[str, Any]] = []
    for category in ("ownership", "boundaries", "patterns", "migration"):
        for rule in config.get(category, []) or []:
            violations.extend(evaluate_rule(category, rule, index, config, args.output_mode, depth))

    if args.json:
        print(json.dumps(violations, indent=2, sort_keys=True))
    else:
        print(render_text(violations))

    return 1 if violations else 0


if __name__ == "__main__":
    sys.exit(main())
