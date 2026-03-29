#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib
import json
import re
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

try:
    from tree_sitter import Language, Parser
except ImportError:  # pragma: no cover - optional dependency
    Language = None
    Parser = None


RUST_KEYWORDS = {
    "fn",
    "if",
    "else",
    "match",
    "while",
    "loop",
    "for",
    "return",
    "pub",
    "struct",
    "enum",
    "trait",
    "impl",
    "use",
    "mod",
    "let",
}
SWIFT_KEYWORDS = {
    "func",
    "if",
    "else",
    "switch",
    "case",
    "for",
    "while",
    "guard",
    "return",
    "class",
    "struct",
    "enum",
    "protocol",
    "import",
    "let",
    "var",
}
IDENTIFIER_RE = re.compile(r"\b[A-Za-z_][A-Za-z0-9_]*\b")
STRING_RE = re.compile(r'"((?:\\.|[^"\\])*)"')
RUST_IMPORT_RE = re.compile(r"^\s*use\s+([^;]+);", re.MULTILINE)
RUST_FN_RE = re.compile(r"^\s*(pub(?:\([^)]*\))?\s+)?fn\s+([A-Za-z_][A-Za-z0-9_]*)", re.MULTILINE)
RUST_TYPE_RE = re.compile(
    r"^\s*(pub(?:\([^)]*\))?\s+)?(struct|enum|trait)\s+([A-Za-z_][A-Za-z0-9_]*)",
    re.MULTILINE,
)
SWIFT_IMPORT_RE = re.compile(r"^\s*import\s+([A-Za-z_][A-Za-z0-9_.]*)", re.MULTILINE)
SWIFT_FN_RE = re.compile(
    r"^\s*(?:public|internal|private|fileprivate|open)?\s*(?:static\s+|class\s+)?func\s+([A-Za-z_][A-Za-z0-9_]*)",
    re.MULTILINE,
)
SWIFT_TYPE_RE = re.compile(
    r"^\s*(?:public|internal|private|fileprivate|open)?\s*(class|struct|enum|protocol)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*([^{]+))?",
    re.MULTILINE,
)
CALL_RE = re.compile(r"\b([A-Za-z_][A-Za-z0-9_.]*)\s*\(")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract structural facts from Rust and Swift files.")
    parser.add_argument("--project-dir", required=True, help="Project root to scan")
    parser.add_argument(
        "--files",
        nargs="+",
        help="Explicit file list to update incrementally relative to the project root",
    )
    parser.add_argument(
        "--output",
        default=".verifier/facts/facts.json",
        help="Where to write the facts database",
    )
    parser.add_argument(
        "--incremental",
        action="store_true",
        help="Infer changed files from cached metadata instead of scanning the whole tree",
    )
    return parser.parse_args()


def module_name_for(path: Path) -> str:
    if path.stem == "mod" and path.parent.name:
        return path.parent.name
    return path.stem


def relative_to_root(path: Path, root: Path) -> str:
    try:
        return str(path.resolve().relative_to(root.resolve()))
    except ValueError:
        return str(path)


def line_for_offset(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def record_fact(fact_type: str, *, source_path: str, line: int, **payload: Any) -> dict[str, Any]:
    fact = {"type": fact_type, "source_path": source_path, "line": line}
    fact.update(payload)
    return fact


def load_existing(output_path: Path) -> dict[str, Any]:
    if not output_path.exists():
        return {"facts": [], "metadata": {}}
    with output_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def get_git_commit(root: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "-C", str(root), "rev-parse", "HEAD"],
            check=True,
            capture_output=True,
            text=True,
        )
        return result.stdout.strip()
    except Exception:
        return "unknown"


def list_source_files(root: Path) -> list[Path]:
    return sorted(
        path
        for ext in ("*.rs", "*.swift")
        for path in root.rglob(ext)
        if ".git" not in path.parts and ".verifier" not in path.parts
    )


def detect_changed_files(root: Path, metadata: dict[str, Any]) -> list[Path]:
    previous_commit = metadata.get("commit")
    changed: list[Path] = []

    if previous_commit and previous_commit != "unknown":
        try:
            result = subprocess.run(
                ["git", "-C", str(root), "diff", "--name-only", previous_commit],
                check=True,
                capture_output=True,
                text=True,
            )
            for line in result.stdout.splitlines():
                if line.endswith((".rs", ".swift")):
                    changed.append(root / line)
        except Exception:
            changed = []

        try:
            extra = subprocess.run(
                ["git", "-C", str(root), "ls-files", "--others", "--exclude-standard"],
                check=True,
                capture_output=True,
                text=True,
            )
            for line in extra.stdout.splitlines():
                if line.endswith((".rs", ".swift")):
                    changed.append(root / line)
        except Exception:
            pass

    if changed:
        return sorted({path.resolve() for path in changed})

    previous_mtimes = metadata.get("file_mtimes", {})
    for path in list_source_files(root):
        rel = relative_to_root(path, root)
        current_mtime = path.stat().st_mtime
        if previous_mtimes.get(rel) != current_mtime:
            changed.append(path)
    return sorted({path.resolve() for path in changed})


def build_parser(module_name: str) -> Parser | None:
    if Parser is None or Language is None:
        return None

    try:
        language_module = importlib.import_module(module_name)
    except ImportError:
        return None

    language_factory = getattr(language_module, "language", None)
    if language_factory is None:
        return None

    language_handle = language_factory()
    try:
        language = Language(language_handle)
    except TypeError:
        language = language_handle

    try:
        return Parser(language)
    except TypeError:
        parser = Parser()
        try:
            parser.language = language
        except AttributeError:
            parser.set_language(language)
        return parser


def parser_mode(path: Path, rust_parser: Parser | None, swift_parser: Parser | None) -> str:
    parser = rust_parser if path.suffix == ".rs" else swift_parser
    return "tree-sitter+regex" if parser is not None else "regex"


def verify_parse(path: Path, source_bytes: bytes, rust_parser: Parser | None, swift_parser: Parser | None) -> None:
    parser = rust_parser if path.suffix == ".rs" else swift_parser
    if parser is None:
        return
    try:
        parser.parse(source_bytes)
    except Exception:
        return


def extract_identifier_refs(
    text: str,
    *,
    module: str,
    lang: str,
    rel_path: str,
) -> list[dict[str, Any]]:
    keywords = RUST_KEYWORDS if lang == "rust" else SWIFT_KEYWORDS
    facts: list[dict[str, Any]] = []
    for match in IDENTIFIER_RE.finditer(text):
        identifier = match.group(0)
        if identifier in keywords:
            continue
        facts.append(
            record_fact(
                "reference",
                module=module,
                name=identifier,
                source_path=rel_path,
                line=line_for_offset(text, match.start()),
            )
        )
    return facts


def extract_calls(
    text: str,
    *,
    module: str,
    lang: str,
    rel_path: str,
) -> list[dict[str, Any]]:
    keywords = RUST_KEYWORDS if lang == "rust" else SWIFT_KEYWORDS
    facts: list[dict[str, Any]] = []
    for match in CALL_RE.finditer(text):
        callee = match.group(1)
        if callee.split(".")[-1] in keywords:
            continue
        line = line_for_offset(text, match.start())
        snippet = text.splitlines()[line - 1].strip() if line <= len(text.splitlines()) else ""
        if lang == "rust" and snippet.lstrip().startswith("fn "):
            continue
        if lang == "swift" and "func " in snippet and snippet.index("func ") < snippet.find(callee):
            continue
        facts.append(
            record_fact(
                "calls",
                module=module,
                callee=callee,
                source_path=rel_path,
                line=line,
            )
        )
    return facts


def extract_rust(path: Path, root: Path) -> list[dict[str, Any]]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    rel_path = relative_to_root(path, root)
    module = module_name_for(path)
    facts = [
        record_fact("module", module=module, lang="rust", path=rel_path, source_path=rel_path, line=1)
    ]

    for match in RUST_IMPORT_RE.finditer(text):
        facts.append(
            record_fact(
                "imports",
                module=module,
                imported=match.group(1).strip(),
                source_path=rel_path,
                line=line_for_offset(text, match.start()),
            )
        )

    for match in RUST_FN_RE.finditer(text):
        visibility = "public" if match.group(1) else "private"
        fn_name = match.group(2)
        line = line_for_offset(text, match.start())
        facts.append(
            record_fact(
                "defines_fn",
                module=module,
                fn_name=fn_name,
                visibility=visibility,
                source_path=rel_path,
                line=line,
            )
        )
        if visibility == "public":
            facts.append(
                record_fact(
                    "has_pub_fn",
                    module=module,
                    fn_name=fn_name,
                    visibility=visibility,
                    source_path=rel_path,
                    line=line,
                )
            )

    for match in RUST_TYPE_RE.finditer(text):
        visibility = "public" if match.group(1) else "private"
        facts.append(
            record_fact(
                "type_def",
                module=module,
                type_name=match.group(3),
                visibility=visibility,
                kind=match.group(2),
                source_path=rel_path,
                line=line_for_offset(text, match.start()),
            )
        )

    for match in STRING_RE.finditer(text):
        facts.append(
            record_fact(
                "contains_literal",
                module=module,
                literal=match.group(1),
                source_path=rel_path,
                line=line_for_offset(text, match.start()),
            )
        )

    facts.extend(extract_calls(text, module=module, lang="rust", rel_path=rel_path))
    facts.extend(extract_identifier_refs(text, module=module, lang="rust", rel_path=rel_path))
    return facts


def extract_swift(path: Path, root: Path) -> list[dict[str, Any]]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    rel_path = relative_to_root(path, root)
    module = module_name_for(path)
    facts = [
        record_fact("module", module=module, lang="swift", path=rel_path, source_path=rel_path, line=1)
    ]

    for match in SWIFT_IMPORT_RE.finditer(text):
        facts.append(
            record_fact(
                "imports",
                module=module,
                imported=match.group(1).strip(),
                source_path=rel_path,
                line=line_for_offset(text, match.start()),
            )
        )

    for match in SWIFT_FN_RE.finditer(text):
        fn_name = match.group(1)
        line = line_for_offset(text, match.start())
        visibility = "public" if re.search(r"\b(public|open)\b", match.group(0)) else "private"
        facts.append(
            record_fact(
                "defines_fn",
                module=module,
                fn_name=fn_name,
                visibility=visibility,
                source_path=rel_path,
                line=line,
            )
        )
        if visibility == "public":
            facts.append(
                record_fact(
                    "has_pub_fn",
                    module=module,
                    fn_name=fn_name,
                    visibility=visibility,
                    source_path=rel_path,
                    line=line,
                )
            )

    for match in SWIFT_TYPE_RE.finditer(text):
        line = line_for_offset(text, match.start())
        type_name = match.group(2)
        facts.append(
            record_fact(
                "type_def",
                module=module,
                type_name=type_name,
                visibility="public" if re.search(r"\b(public|open)\b", match.group(0)) else "private",
                kind=match.group(1),
                source_path=rel_path,
                line=line,
            )
        )
        conformance = (match.group(3) or "").strip()
        if conformance:
            for protocol in [item.strip().split()[0] for item in conformance.split(",") if item.strip()]:
                facts.append(
                    record_fact(
                        "implements",
                        module=module,
                        protocol=protocol,
                        source_path=rel_path,
                        line=line,
                    )
                )

    for match in STRING_RE.finditer(text):
        facts.append(
            record_fact(
                "contains_literal",
                module=module,
                literal=match.group(1),
                source_path=rel_path,
                line=line_for_offset(text, match.start()),
            )
        )

    facts.extend(extract_calls(text, module=module, lang="swift", rel_path=rel_path))
    facts.extend(extract_identifier_refs(text, module=module, lang="swift", rel_path=rel_path))
    return facts


def dedupe_facts(facts: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for fact in facts:
        key = json.dumps(fact, sort_keys=True)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(fact)
    return deduped


def add_cross_language_facts(facts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rust_types: dict[str, dict[str, Any]] = {}
    swift_types: dict[str, dict[str, Any]] = {}
    for fact in facts:
        if fact["type"] != "type_def":
            continue
        if fact.get("module") and fact.get("type_name"):
            if fact.get("module") and fact.get("visibility") is not None:
                if fact.get("source_path", "").endswith(".rs"):
                    rust_types.setdefault(fact["type_name"], fact)
                elif fact.get("source_path", "").endswith(".swift"):
                    swift_types.setdefault(fact["type_name"], fact)

    for type_name in sorted(set(rust_types) & set(swift_types)):
        source = swift_types[type_name]
        facts.append(
            record_fact(
                "type_crosses_ffi",
                type_name=type_name,
                module=source["module"],
                source_path=source["source_path"],
                line=source["line"],
            )
        )
    return facts


def merge_incremental(
    existing_facts: list[dict[str, Any]],
    new_facts: list[dict[str, Any]],
    touched_paths: set[str],
) -> list[dict[str, Any]]:
    untouched = [fact for fact in existing_facts if fact.get("source_path") not in touched_paths]
    return dedupe_facts(untouched + new_facts)


def main() -> int:
    args = parse_args()
    root = Path(args.project_dir).resolve()
    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = root / output_path
    output_path.parent.mkdir(parents=True, exist_ok=True)

    existing = load_existing(output_path)

    rust_parser = build_parser("tree_sitter_rust")
    swift_parser = build_parser("tree_sitter_swift")

    if args.files:
        files = [Path(item).resolve() if Path(item).is_absolute() else (root / item).resolve() for item in args.files]
    elif args.incremental:
        files = detect_changed_files(root, existing.get("metadata", {}))
    else:
        files = list_source_files(root)

    new_facts: list[dict[str, Any]] = []
    parser_modes: dict[str, str] = {}
    touched_paths: set[str] = set()

    for path in files:
        rel_path = relative_to_root(path, root)
        touched_paths.add(rel_path)
        if not path.exists():
            continue

        source_bytes = path.read_bytes()
        verify_parse(path, source_bytes, rust_parser, swift_parser)
        parser_modes[rel_path] = parser_mode(path, rust_parser, swift_parser)

        if path.suffix == ".rs":
            new_facts.extend(extract_rust(path, root))
        elif path.suffix == ".swift":
            new_facts.extend(extract_swift(path, root))

    if args.files or args.incremental:
        merged = merge_incremental(existing.get("facts", []), new_facts, touched_paths)
    else:
        merged = dedupe_facts(new_facts)

    merged = add_cross_language_facts(merged)
    merged = dedupe_facts(merged)

    file_mtimes = {
        relative_to_root(path, root): path.stat().st_mtime
        for path in list_source_files(root)
    }
    metadata = {
        "commit": get_git_commit(root),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "files_parsed": len(files),
        "file_mtimes": file_mtimes,
        "parser_modes": parser_modes,
    }

    payload = {"facts": merged, "metadata": metadata}
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)
        handle.write("\n")

    print(json.dumps(metadata, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
