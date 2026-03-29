"""Complexity checks for Layer 3 elegance auditing."""

from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path
from typing import Any

from . import Deduction


CONTROL_KEYWORDS = (
    "else if",
    "if",
    "match",
    "for",
    "while",
    "loop",
    "guard",
    "catch",
    "case",
    "switch",
)

RUST_NAME_RE = re.compile(
    r"(?ms)^\s*(?:pub\s+)?(?:async\s+)?(?:unsafe\s+)?(?:const\s+)?fn\s+([A-Za-z_][A-Za-z0-9_]*)\s*(<[^>]*>)?\s*\((.*?)\)\s*(?:->.*?)?\s*\{"
)
SWIFT_NAME_RE = re.compile(
    r"(?ms)^\s*(?:public|private|internal|fileprivate|open|final|mutating|static)?\s*func\s+([A-Za-z_][A-Za-z0-9_]*)\s*(<[^>]*>)?\s*\((.*?)\)\s*(?:->.*?)?\s*\{"
)


def _strip_strings_and_comments(line: str) -> str:
    # Remove simple string literals and line comments to reduce false positives.
    text = line
    in_string = False
    escaped = False
    output = []
    idx = 0
    while idx < len(text):
        ch = text[idx]
        if ch == "\\" and in_string and not escaped:
            escaped = True
            output.append(ch)
            idx += 1
            continue
        if ch == '"' and not escaped:
            in_string = not in_string
        if not in_string and ch == "/" and idx + 1 < len(text) and text[idx + 1] == "/":
            break
        if not in_string:
            output.append(ch)
        escaped = ch == "\\" and not escaped
        idx += 1
    return "".join(output)


def _count_top_level_csv(params: str) -> int:
    if not params.strip():
        return 0
    level_round = 0
    level_square = 0
    level_angle = 0
    count = 0
    for ch in params:
        if ch == "(":
            level_round += 1
        elif ch == ")":
            level_round -= 1
        elif ch == "[":
            level_square += 1
        elif ch == "]":
            level_square -= 1
        elif ch == "<":
            level_angle += 1
        elif ch == ">":
            level_angle -= 1
        elif ch == "," and level_round == 0 and level_square == 0 and level_angle == 0:
            count += 1
    return count + 1


def _match_functions(source: str, language: str):
    pattern = RUST_NAME_RE if language == "rust" else SWIFT_NAME_RE
    for match in pattern.finditer(source):
        yield {
            "name": match.group(1),
            "generic": (match.group(2) or "").strip(),
            "params": match.group(3) or "",
            "sig_start": match.start(),
            "body_start": match.end() - 1,
        }


def _locate_function_body(source: str, start: int) -> tuple[int, int]:
    depth = 0
    for idx in range(start, len(source)):
        ch = source[idx]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return start, idx
    return start, len(source) - 1


def _extract_blocks(source: str, match: dict[str, Any]) -> tuple[str, str, int, int]:
    sig_start = int(match["sig_start"])
    body_start = int(match["body_start"])
    signature = source[sig_start:body_start]
    line_start = source.count("\n", 0, sig_start) + 1
    body_start, body_end = _locate_function_body(source, body_start)
    return signature, source[body_start:body_end + 1], line_start, source.count("\n", 0, body_end + 1)


def _compute_complexity(body: str) -> int:
    complexity = 1
    for keyword in CONTROL_KEYWORDS:
            complexity += len(re.findall(rf"\b{re.escape(keyword)}\b", body))
    complexity += len(re.findall(r"&&|\|\|", body))
    complexity += len(re.findall(r"\?", body))
    return complexity


def _compute_nesting_depth(body: str) -> int:
    depth = 0
    max_depth = 0
    for raw in body.splitlines():
        line = _strip_strings_and_comments(raw)
        for token in CONTROL_KEYWORDS:
            if re.search(rf"\b{re.escape(token)}\b", line):
                max_depth = max(max_depth, depth + 1)
        depth += line.count("{") - line.count("}")
        depth = max(depth, 0)
        max_depth = max(max_depth, depth)
    return max_depth


def _scan_rust_with_tree_sitter(path: Path) -> dict[str, int]:
    if shutil.which("tree-sitter") is None:
        return {}
    # Optional and intentionally soft-fail: if tree-sitter isn't happy, fallback.
    try:
        # A real implementation would parse AST; for now treat as not available.
        return {}
    except Exception:
        return {}


def _scan_for_rust_complexity(path: Path, text: str) -> dict[str, int]:
    # Radon doesn't support Rust. Use it only as a graceful optional hook if available.
    if shutil.which("radon") is None:
        return {}
    if path.suffix != ".py":
        return {}
    try:
        proc = subprocess.run(
            ["radon", "cc", "-j", str(path)],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode != 0:
            return {}
        import json as _json

        payload = _json.loads(proc.stdout.strip() or "{}")
        results: dict[str, int] = {}
        for entry in payload.get(str(path.name), []):
            name = entry.get("name")
            if isinstance(name, str) and isinstance(entry.get("complexity"), int):
                results[name] = int(entry["complexity"])
        return results
    except Exception:
        return {}


def _warn_if_optional_tools_missing() -> list[str]:
    notes = []
    if shutil.which("swiftlint") is None:
        notes.append("swiftlint not found; using fallback swift checks.")
    if shutil.which("radon") is None:
        notes.append("radon not found; using fallback complexity checks.")
    if shutil.which("tree-sitter") is None:
        notes.append("tree-sitter not found; using brace-level fallback parsing.")
    return notes


def audit_complexity(project_dir: Path, files: list[Path], config: dict) -> tuple[list[Deduction], list[str]]:
    """Run complexity checks across Rust and Swift source files."""
    thresholds = config["thresholds"]
    notes = _warn_if_optional_tools_missing()
    penalties: list[Deduction] = []

    for path in files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        lang = "rust" if path.suffix == ".rs" else "swift"

        _ = _scan_rust_with_tree_sitter(path)
        radon_results = _scan_for_rust_complexity(path, text)

        for match in _match_functions(text, lang):
            name = match["name"]
            params = match["params"]
            signature, body, start_line, _ = _extract_blocks(text, match)
            parameter_count = _count_top_level_csv(params)
            if parameter_count > thresholds["parameter_count"]:
                penalties.append(
                    Deduction(
                        file=str(path),
                        line=start_line,
                        category="complexity",
                        rule="parameter_count",
                        message=(
                            f"Function `{name}` has {parameter_count} parameters; "
                            f"threshold is {thresholds['parameter_count']}."
                        ),
                        fix_suggestion="Split inputs into grouped structs or separate this function.",
                        impact=parameter_count - thresholds["parameter_count"],
                    )
                )

            body_lines = body.count("\n") + 1
            if body_lines > thresholds["function_length"]:
                penalties.append(
                    Deduction(
                        file=str(path),
                        line=start_line,
                        category="complexity",
                        rule="function_length",
                        message=(
                            f"Function `{name}` is {body_lines} lines; "
                            f"threshold is {thresholds['function_length']}."
                        ),
                        fix_suggestion="Split this function or extract nested helpers.",
                        impact=max(1, (body_lines - thresholds["function_length"]) // 10 + 1),
                    )
                )

            complexity = radon_results.get(name)
            if complexity is None:
                complexity = _compute_complexity(body)
            if complexity > thresholds["cyclomatic_complexity"]:
                penalties.append(
                    Deduction(
                        file=str(path),
                        line=start_line,
                        category="complexity",
                        rule="cyclomatic_complexity",
                        message=(
                            f"Function `{name}` complexity is {complexity}; "
                            f"threshold is {thresholds['cyclomatic_complexity']}."
                        ),
                        fix_suggestion="Reduce branch count and extract branch helpers.",
                        impact=complexity - thresholds["cyclomatic_complexity"],
                    )
                )

            nesting = _compute_nesting_depth(body)
            if nesting > thresholds["nesting_depth"]:
                penalties.append(
                    Deduction(
                        file=str(path),
                        line=start_line,
                        category="complexity",
                        rule="nesting_depth",
                        message=(
                            f"Function `{name}` nesting depth is {nesting}; "
                            f"threshold is {thresholds['nesting_depth']}."
                        ),
                        fix_suggestion="Prefer guard clauses and shorter condition blocks.",
                        impact=nesting - thresholds["nesting_depth"],
                    )
                )

    for path in files:
        total_lines = len(path.read_text(encoding="utf-8", errors="ignore").splitlines())
        if total_lines > thresholds["file_length"]:
            penalties.append(
                Deduction(
                    file=str(path),
                    line=1,
                    category="complexity",
                    rule="file_length",
                    message=f"{path.name} is {total_lines} lines; file threshold is {thresholds['file_length']}.",
                    fix_suggestion="Split this source file by module ownership.",
                    impact=max(1, (total_lines - thresholds["file_length"]) // 50 + 1),
                )
            )

    return penalties, notes
