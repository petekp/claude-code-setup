"""Shared data structures and helpers for formal verification elegance checks."""

from __future__ import annotations

import fnmatch
import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any

try:  # pragma: no cover - optional dependency
    import yaml
except Exception:  # pragma: no cover - fallback when PyYAML is absent
    yaml = None


DEFAULT_THRESHOLD_VALUES = {
    "cyclomatic_complexity": 10,
    "nesting_depth": 4,
    "function_length": 50,
    "file_length": 500,
    "parameter_count": 5,
}

DEFAULT_COMMENT_DENSITY = 0.06

DEFAULT_WEIGHTS = {
    "cyclomatic_complexity": 4,
    "nesting_depth": 3,
    "function_length": 1,
    "file_length": 5,
    "parameter_count": 2,
    "naming_snake_case": 2,
    "naming_camel_case": 2,
    "error_handling": 2,
    "comment_density": 4,
    "consistency_mix": 3,
    "duplicate_logic": 3,
    "unnecessary_abstraction": 2,
    "overengineering_generic": 1,
    "unused_code": 3,
    "single_trait_implementor": 2,
}

DEFAULT_EXCLUDES = [
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/target/**",
]

GRADE_BOUNDS = {
    "A": range(90, 101),
    "B": range(80, 90),
    "C": range(70, 80),
    "D": range(60, 70),
    "F": range(0, 60),
}


@dataclass(frozen=True)
class Deduction:
    """A single elegance issue with enough location context to apply a fix."""

    file: str
    line: int
    rule: str
    category: str
    message: str
    fix_suggestion: str | None = None
    impact: int = 1


def _coerce_scalar(raw: str) -> Any:
    lowered = raw.strip().lower()
    if lowered in {"true", "false"}:
        return lowered == "true"
    if lowered in {"null", "none", "~"}:
        return None
    if raw.isdigit():
        return int(raw)
    try:
        return int(raw)
    except ValueError:
        pass
    try:
        return float(raw)
    except ValueError:
        pass
    if (raw.startswith('"') and raw.endswith('"')) or (raw.startswith("'") and raw.endswith("'")):
        return raw[1:-1]
    return raw


def _load_yaml_fallback(path: Path) -> dict[str, Any]:
    """Parse a tiny YAML subset used by elegance configuration.

    Supports simple scalar keys, one-level dictionaries, and one-level lists.
    """

    data: dict[str, Any] = {}
    section: str | None = None
    section_values: dict[str, Any] | list[str] | None = None

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue

        stripped = line.strip()
        if not raw_line.startswith(" "):
            if ":" in stripped:
                key, value = stripped.split(":", 1)
                key = key.strip()
                value = value.strip()
                if value:
                    data[key] = _coerce_scalar(value)
                    section = None
                    section_values = None
                else:
                    # Child lines start on the next indented lines.
                    section = key
                    section_values = {}
            continue

        if section is None:
            continue

        # Nested line.
        if stripped.startswith("- "):
            if section_values is None or not isinstance(section_values, list):
                section_values = []
                data[section] = section_values
            raw_value = _coerce_scalar(stripped[2:])
            value = raw_value.strip() if isinstance(raw_value, str) else raw_value
            section_values.append(value)
            continue

        if ":" in stripped and isinstance(section_values, dict):
            key, value = stripped.split(":", 1)
            key = key.strip()
            value = value.strip()
            section_values[key] = _coerce_scalar(value)
            continue

    return data


def load_elegance_config(project_dir: Path, config_path: Path | str | None = None) -> dict[str, Any]:
    """Load thresholds and grading policy from YAML config with safe defaults."""

    if config_path is None:
        config = {}
    else:
        path = Path(config_path)
        if not path.is_absolute():
            path = project_dir / path
        if path.exists():
            if yaml is not None:
                with path.open("r", encoding="utf-8") as f:
                    loaded = yaml.safe_load(f) or {}
                config = loaded if isinstance(loaded, dict) else {}
            else:
                config = _load_yaml_fallback(path)
        else:
            config = {}

    thresholds = dict(DEFAULT_THRESHOLD_VALUES)
    thresholds.update(config.get("thresholds", {}) if isinstance(config.get("thresholds", {}), dict) else {})

    weights = dict(DEFAULT_WEIGHTS)
    weights.update(config.get("weights", {}) if isinstance(config.get("weights", {}), dict) else {})

    exclude = list(DEFAULT_EXCLUDES)
    if isinstance(config.get("exclude"), list):
        exclude.extend(config["exclude"])

    return {
        "thresholds": thresholds,
        "weights": weights,
        "minimum_grade": config.get("minimum_grade", "B"),
        "exclude": exclude,
        "comment_density_min": config.get("comment_density_min", DEFAULT_COMMENT_DENSITY),
    }


def should_exclude(path: Path, patterns: list[str]) -> bool:
    """Return True when a path matches an exclusion glob pattern."""
    relative = path.as_posix()
    for pattern in patterns:
        if fnmatch.fnmatch(relative, pattern):
            return True
    return False


def deduction_as_dict(d: Deduction) -> dict[str, Any]:
    """Convert a Deduction into a stable JSON-friendly mapping."""
    return asdict(d)


def grade_from_score(score: int) -> str:
    """Map score into letter grade."""
    if score < 0:
        score = 0
    if score > 100:
        score = 100
    for grade, values in GRADE_BOUNDS.items():
        if score in values:
            return grade
    return "F"


def meets_minimum(grade: str, minimum_grade: str) -> bool:
    order = ["F", "D", "C", "B", "A"]
    return order.index(grade) >= order.index(minimum_grade)


def serializable_report(
    grade: str,
    score: int,
    minimum_grade: str,
    deductions: list[Deduction],
) -> dict[str, Any]:
    by_category: dict[str, int] = {}
    for d in deductions:
        by_category[d.category] = by_category.get(d.category, 0) + d.impact

    return {
        "layer": "elegance",
        "grade": grade,
        "score": score,
        "minimum_grade": minimum_grade,
        "pass": meets_minimum(grade, minimum_grade),
        "summary": {
            "violations": len(deductions),
            "by_category": by_category,
        },
        "deductions": [deduction_as_dict(d) for d in deductions],
        "violations": [deduction_as_dict(d) for d in deductions],
    }


def pretty_print_human(
    grade: str,
    score: int,
    minimum_grade: str,
    deductions: list[Deduction],
    output_mode: str = "human",
) -> str:
    """Build a stable formatted human-readable report."""
    lines = []
    status = "PASS" if meets_minimum(grade, minimum_grade) else "FAIL"
    lines.append(f"Layer 3 Elegance: {status}")
    lines.append(f"Grade: {grade} (score={score}, minimum={minimum_grade})")
    lines.append("")

    if not deductions:
        lines.append("No elegance violations found.")
        return "\n".join(lines)

    for d in deductions:
        base = f"{d.file}:{d.line} [{d.category}] {d.rule} — {d.message}"
        lines.append(base)
        if output_mode == "agent" and d.fix_suggestion:
            lines.append(f"  Fix: {d.fix_suggestion}")

    return "\n".join(lines)


def normalize_text_path(project_dir: Path, file_path: Path) -> str:
    try:
        return str(file_path.relative_to(project_dir))
    except ValueError:
        return str(file_path)


def read_file_text(file_path: Path) -> str:
    return file_path.read_text(encoding="utf-8", errors="ignore")


def to_json(payload: dict[str, Any]) -> str:
    return json.dumps(payload, indent=2)
