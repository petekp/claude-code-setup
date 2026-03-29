"""Consistency and convention checks for Layer 3 elegance auditing."""

from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

from . import Deduction


RUST_FUNCTION_RE = re.compile(r"(?m)^\s*(?:pub\s+)?(?:async\s+)?(?:unsafe\s+)?fn\s+([A-Za-z_][A-Za-z0-9_]*)")
SWIFT_FUNCTION_RE = re.compile(r"(?m)^\s*(?:public|private|internal|fileprivate|open|final|mutating|static|override)?\s*func\s+([A-Za-z_][A-Za-z0-9_]*)")
RUST_VAR_RE = re.compile(r"\blet\s+([A-Za-z_][A-Za-z0-9_]*)\b")
SWIFT_VAR_RE = re.compile(r"\b(?:var|let)\s+([A-Za-z_][A-Za-z0-9_]*)\b")


def _is_snake(name: str) -> bool:
    return bool(re.fullmatch(r"[a-z][a-z0-9_]*", name))


def _is_camel(name: str) -> bool:
    return bool(re.fullmatch(r"[a-z][A-Za-z0-9]*", name))


def _count_comment_lines(text: str) -> tuple[int, int]:
    lines = text.splitlines()
    comment_lines = 0
    in_block_comment = False
    for line in lines:
        stripped = line.strip()
        if in_block_comment:
            comment_lines += 1
            if "*/" in stripped:
                in_block_comment = False
            continue
        if stripped.startswith("//"):
            comment_lines += 1
            continue
        if "/*" in stripped:
            comment_lines += 1
            if "*/" not in stripped:
                in_block_comment = True
    non_empty = len([line for line in lines if line.strip()])
    return comment_lines, non_empty


def _mixed_style_deduction(names: list[str], style: str) -> bool:
    if len(names) < 4:
        return False
    if style == "snake":
        return len([n for n in names if not _is_snake(n)]) >= 2
    return len([n for n in names if not _is_camel(n)]) >= 2


def _audit_name_conventions(path: Path, text: str, language: str, penalties: list[Deduction]) -> None:
    if language == "rust":
        names = list(RUST_FUNCTION_RE.findall(text)) + list(RUST_VAR_RE.findall(text))
        check = _is_snake
        rule = "naming_snake_case"
        suggestion = "Use snake_case for Rust declaration names."
        style = "snake"
    else:
        names = list(SWIFT_FUNCTION_RE.findall(text)) + list(SWIFT_VAR_RE.findall(text))
        check = _is_camel
        rule = "naming_camel_case"
        suggestion = "Use camelCase for Swift declaration names."
        style = "camel"

    for name in names:
        if not check(name):
            penalties.append(
                Deduction(
                    file=str(path),
                    line=1,
                    category="consistency",
                    rule=rule,
                    message=f"`{name}` does not follow {language} naming convention.",
                    fix_suggestion=suggestion,
                    impact=1,
                )
            )

    if _mixed_style_deduction(names, style):
        penalties.append(
            Deduction(
                file=str(path),
                line=1,
                category="consistency",
                rule="consistency_mix",
                message=f"{path.name} mixes naming styles within declarations.",
                fix_suggestion="Keep a single style per language and module boundary.",
                impact=2,
            )
        )


def _audit_error_handling(path: Path, text: str, language: str, penalties: list[Deduction], counts: Counter) -> None:
    if language == "rust":
        unwrap_count = len(re.findall(r"\.unwrap\(\)", text))
        expect_count = len(re.findall(r"\.expect\(", text))
        if unwrap_count > 0:
            penalties.append(
                Deduction(
                    file=str(path),
                    line=1,
                    category="consistency",
                    rule="error_handling",
                    message=f"Rust code uses `.unwrap()` {unwrap_count} time(s).",
                    fix_suggestion="Handle `Result` explicitly with match branches.",
                    impact=min(3, max(1, unwrap_count)),
                )
            )
            counts["unwrap"] += unwrap_count
        if expect_count > 0:
            penalties.append(
                Deduction(
                    file=str(path),
                    line=1,
                    category="consistency",
                    rule="error_handling",
                    message=f"Rust code uses `.expect()` {expect_count} time(s).",
                    fix_suggestion="Prefer propagating contextual errors from Result values.",
                    impact=min(2, expect_count),
                )
            )
            counts["expect"] += expect_count
    else:
        try_force = len(re.findall(r"\btry!\b", text))
        forced = len(re.findall(r"!\b", text))  # coarse for force unwrap
        fatal_error = len(re.findall(r"\bfatalError\s*\(", text))
        if try_force + forced + fatal_error > 0:
            severity = try_force + forced + fatal_error
            penalties.append(
                Deduction(
                    file=str(path),
                    line=1,
                    category="consistency",
                    rule="error_handling",
                    message=(
                        f"Swift error handling uses {severity} high-risk constructs "
                        f"(try!, force unwrap, fatalError)."
                    ),
                    fix_suggestion="Prefer `do/try/catch`, optional binding, and safer defaults.",
                    impact=min(3, max(1, severity)),
                )
            )
            counts["swift_error"] += severity


def _audit_comment_density(path: Path, text: str, threshold: float, penalties: list[Deduction]) -> None:
    comments, non_empty = _count_comment_lines(text)
    if non_empty == 0:
        return
    ratio = comments / non_empty
    if ratio < threshold:
        penalties.append(
            Deduction(
                file=str(path),
                line=1,
                category="consistency",
                rule="comment_density",
                message=(
                    f"Comment density in {path.name} is {ratio:.2%} "
                    f"(below {threshold:.0%})."
                ),
                fix_suggestion="Add clarifying comments where cross-cutting behavior or domain rules are encoded.",
                impact=max(1, int((threshold - ratio) * 100) // 4),
            )
        )


def audit_consistency(project_dir: Path, files: list[Path], config: dict) -> tuple[list[Deduction], list[str]]:
    """Run naming and style consistency checks."""
    comment_density_min = float(config.get("comment_density_min", 0.06))
    penalties: list[Deduction] = []
    notes: list[str] = []
    counts = Counter()

    for path in files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        language = "rust" if path.suffix == ".rs" else "swift"
        _audit_name_conventions(path, text, language, penalties)
        _audit_error_handling(path, text, language, penalties, counts)
        _audit_comment_density(path, text, comment_density_min, penalties)

    if counts["unwrap"] > 3:
        notes.append("Rust unwrap usage is frequent; verify all panic paths are intentional.")
    if counts["swift_error"] > 0:
        notes.append("Swift force-handling constructs were found; validate each as intentional.")
    return penalties, notes
