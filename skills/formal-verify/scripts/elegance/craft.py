"""Craft and maintainability heuristics for Layer 3 elegance auditing."""

from __future__ import annotations

import hashlib
import re
from collections import Counter
from pathlib import Path

from . import Deduction


RUST_FN_DECL_RE = re.compile(
    r"(?ms)^\s*(?:pub\s+)?(?:async\s+)?(?:unsafe\s+)?fn\s+([A-Za-z_][A-Za-z0-9_]*)\s*(<[^>]*>)?\s*\((.*?)\)\s*(?:->.*?)?\s*\{"
)
SWIFT_FN_DECL_RE = re.compile(
    r"(?ms)^\s*(?:public|private|internal|fileprivate|open|final|mutating|static)?\s*func\s+([A-Za-z_][A-Za-z0-9_]*)\s*(<[^>]*>)?\s*\((.*?)\)\s*(?:->.*?)?\s*\{"
)
RUST_IMPL_RE = re.compile(r"(?m)impl\s+([A-Za-z_][A-Za-z0-9_]*)\s+for\s+")


def _extract_function_blocks(text: str, language: str):
    pattern = RUST_FN_DECL_RE if language == "rust" else SWIFT_FN_DECL_RE
    for m in pattern.finditer(text):
        body_start = m.end() - 1
        name = m.group(1)
        generic = (m.group(2) or "").strip()
        sig_start = m.start()
        body_start, body_end = _locate_block(text, body_start)
        yield {
            "name": name,
            "generic": generic,
            "start_line": text.count("\n", 0, sig_start) + 1,
            "raw": text[m.start():body_end + 1],
            "body": text[body_start + 1:body_end],
            "is_private": "pub " not in text[sig_start : sig_start + 8]
            and "private " not in text[sig_start : sig_start + 12],
        }


def _locate_block(text: str, start: int) -> tuple[int, int]:
    depth = 0
    for idx in range(start, len(text)):
        ch = text[idx]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return start, idx
    return start, len(text) - 1


def _normalize_body(body: str) -> str:
    # lightweight AST-like normalization for duplicate detection
    body = re.sub(r"//.*", "", body)
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
    body = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', '""', body)
    tokens = re.findall(r"[A-Za-z_][A-Za-z0-9_]*|[{}();,=<>+*/-]", body)
    return " ".join(tokens)


def _is_wrapper(body: str) -> bool:
    lines = [ln.strip() for ln in body.splitlines() if ln.strip() and not ln.strip().startswith("//")]
    if not lines:
        return False
    if len(lines) > 2:
        return False
    compact = " ".join(lines)
    is_return = compact.startswith("return ") and compact.endswith(";") and "(" in compact
    is_single_call = compact.endswith(")") and compact.count("(") == compact.count(")")
    return is_return or is_single_call


def _generic_token_usage(generic: str, text: str) -> int:
    if not generic:
        return 0
    generic_body = generic.strip("<>").strip()
    if not generic_body:
        return 0
    generic_names = [part.split(":")[0].strip() for part in generic_body.split(",")]
    usage = 0
    for token in generic_names:
        usage += len(re.findall(rf"\b{re.escape(token)}\b", text))
    return usage


def _audit_duplicates(path: Path, signatures: dict[str, tuple[str, int]], body_hash: str, line_no: int, penalties: list[Deduction]) -> None:
    if body_hash in signatures:
        first_path, first_line = signatures[body_hash]
        penalties.append(
            Deduction(
                file=str(path),
                line=line_no,
                category="craft",
                rule="duplicate_logic",
                message=(
                    f"Function body duplicates logic from "
                    f"{Path(first_path).name}:{first_line}."
                ),
                fix_suggestion="Extract a shared helper and call it from both locations.",
                impact=3,
            )
        )
        return
    signatures[body_hash] = (str(path), line_no)


def _audit_private_unused(path: Path, name: str, calls: int, line_no: int, penalties: list[Deduction]) -> None:
    if name.startswith("test_"):
        return
    # Count includes declaration itself; any external call means >= 2 occurrences.
    if calls <= 1:
        penalties.append(
            Deduction(
                file=str(path),
                line=line_no,
                category="craft",
                rule="unused_code",
                message=f"`{name}` appears to be unused in scanned files.",
                fix_suggestion="Remove dead helper code or route calls through public API entry points.",
                impact=2,
            )
        )


def audit_craft(project_dir: Path, files: list[Path], config: dict) -> tuple[list[Deduction], list[str]]:
    """Run duplication, abstraction, and maintainability checks."""
    del project_dir, config
    penalties: list[Deduction] = []
    notes: list[str] = []
    signatures: dict[str, tuple[str, int]] = {}
    trait_impl_counter: Counter[str] = Counter()

    for path in files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        language = "rust" if path.suffix == ".rs" else "swift"

        calls: Counter[str] = Counter()
        for fn in _extract_function_blocks(text, language):
            name = fn["name"]
            body = fn["body"]
            line_no = fn["start_line"]
            generic = fn["generic"]

            for name_match in re.finditer(rf"\b{re.escape(name)}\s*\(", text):
                calls[name] += 1

            if fn["is_private"]:
                _audit_private_unused(path, name, calls[name], line_no, penalties)

            if _is_wrapper(body):
                penalties.append(
                    Deduction(
                        file=str(path),
                        line=line_no,
                        category="craft",
                        rule="unnecessary_abstraction",
                        message=f"`{name}` appears to be a delegation wrapper.",
                        fix_suggestion="Inline or collapse wrapper into call sites.",
                        impact=1,
                    )
                )

            usage = _generic_token_usage(generic, fn["raw"])
            if generic and usage <= 1:
                penalties.append(
                    Deduction(
                        file=str(path),
                        line=line_no,
                        category="craft",
                        rule="overengineering_generic",
                        message=f"`{name}` has generic parameters with low usage ({usage}).",
                        fix_suggestion="Remove unnecessary generic parameters if behavior is concrete.",
                        impact=1,
                    )
                )

            body_hash = hashlib.md5(_normalize_body(body).encode("utf-8")).hexdigest()
            _audit_duplicates(path, signatures, body_hash, line_no, penalties)

        if language == "rust":
            for match in RUST_IMPL_RE.finditer(text):
                trait_impl_counter[match.group(1)] += 1

    for trait_name, count in trait_impl_counter.items():
        if count == 1:
            penalties.append(
                Deduction(
                    file="(project)",
                    line=1,
                    category="craft",
                    rule="single_trait_implementor",
                    message=f"Trait `{trait_name}` has a single implementation.",
                    fix_suggestion="Replace with direct concrete abstraction if polymorphism is not needed.",
                    impact=1,
                )
            )

    if trait_impl_counter:
        notes.append("Trait cardinality checked.")
    return penalties, notes
