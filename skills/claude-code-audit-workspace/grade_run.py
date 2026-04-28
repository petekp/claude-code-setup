#!/usr/bin/env python3
"""
Grade a single run's outputs against its machine assertions.

Usage: grade_run.py <run_dir>
  where run_dir contains an outputs/ subdir (and eval_metadata.json is at its parent).

Writes grading.json next to outputs/ with this shape (matches skill-creator viewer):
{
  "expectations": [
    {"text": "...", "passed": true/false, "evidence": "..."}
  ],
  "pass_rate": 0.75,
  "machine_only": true
}
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


SESSION_ID_RE = re.compile(r"[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}", re.I)
SHORT_HEX_RE = re.compile(r"\b[0-9a-f]{8,12}\b", re.I)
NUMBER_OF_RE = re.compile(r"\b\d+\s*(?:of|/)\s*\d+\b|\b\d+\s*sessions?\b|\b\d+\s*corrections?\b|\b\d+\s*prompts?\b|\b\d+%\b|\b\d+\s*tool\s*(?:uses|calls|invocations)?\b")


def find_report(outputs_dir: Path) -> Path | None:
    for candidate in [
        outputs_dir / "report.md",
        outputs_dir / "audit" / "report.md",
    ]:
        if candidate.is_file():
            return candidate
    reports = list(outputs_dir.rglob("report.md"))
    return reports[0] if reports else None


def find_drafts_dir(outputs_dir: Path) -> Path | None:
    for candidate in [
        outputs_dir / "drafts",
        outputs_dir / "audit" / "drafts",
    ]:
        if candidate.is_dir():
            return candidate
    matches = [p for p in outputs_dir.rglob("drafts") if p.is_dir()]
    return matches[0] if matches else None


def count_files(p: Path) -> int:
    return sum(1 for _ in p.rglob("*") if _.is_file())


def count_sessions_processed(outputs_dir: Path) -> int:
    for candidate in [
        outputs_dir / "audit" / "sample.json",
        outputs_dir / "sample.json",
    ]:
        if candidate.is_file():
            try:
                data = json.loads(candidate.read_text())
                if isinstance(data, dict) and "sample" in data:
                    return len(data["sample"])
                if isinstance(data, list):
                    return len(data)
            except json.JSONDecodeError:
                pass
    extracted_count = 0
    for candidate in [
        outputs_dir / "audit" / "extracted",
        outputs_dir / "extracted",
    ]:
        if candidate.is_dir():
            extracted_count = max(extracted_count, sum(1 for _ in candidate.glob("*.json")))
    return extracted_count


def count_session_id_citations_in_report(report: str) -> int:
    full_uuids = set(m.group(0).lower().replace("-", "") for m in SESSION_ID_RE.finditer(report))
    short_ids = set(m.group(0).lower() for m in SHORT_HEX_RE.finditer(report))
    total = set()
    for u in full_uuids:
        total.add(u[:12])
    for s in short_ids:
        if len(s) >= 8:
            total.add(s[:12])
    return len(total)


def count_numeric_claims(report: str) -> int:
    return len(NUMBER_OF_RE.findall(report))


def count_recommendations(report: str) -> int:
    h2_recs = re.findall(r"^##\s+\d+\.", report, re.MULTILINE)
    h3_recs = re.findall(r"^###\s+\d+\.", report, re.MULTILINE)
    return max(len(h2_recs), len(h3_recs))


def grade(run_dir: Path) -> dict:
    outputs_dir = run_dir / "outputs"
    if not outputs_dir.is_dir():
        return {
            "expectations": [{"text": "outputs/ directory exists", "passed": False, "evidence": f"missing {outputs_dir}"}],
            "pass_rate": 0.0,
            "machine_only": True,
        }

    meta_path = run_dir.parent / "eval_metadata.json"
    if not meta_path.is_file():
        return {"expectations": [], "pass_rate": 0.0, "error": f"no eval_metadata at {meta_path}"}
    meta = json.loads(meta_path.read_text())

    report_path = find_report(outputs_dir)
    report = report_path.read_text() if report_path else ""
    report_bytes = len(report)

    drafts_dir = find_drafts_dir(outputs_dir)
    drafts_count = count_files(drafts_dir) if drafts_dir else 0

    sessions_n = count_sessions_processed(outputs_dir)
    cite_count = count_session_id_citations_in_report(report)
    number_count = count_numeric_claims(report)
    rec_count = count_recommendations(report)

    results = []
    for a in meta.get("assertions", []):
        if a.get("type") != "machine":
            continue
        aid = a["id"]
        if aid == "report_exists":
            passed = report_bytes >= 800
            ev = f"report.md bytes: {report_bytes}" + (f"  path: {report_path}" if report_path else "  missing")
        elif aid == "sampled_many":
            passed = sessions_n >= 10
            ev = f"sessions processed (from sample.json or extracted/): {sessions_n}"
        elif aid == "cites_session_ids":
            passed = cite_count >= 2
            ev = f"distinct session-id-like hex fragments: {cite_count}"
        elif aid == "uses_numbers":
            passed = number_count >= 3
            ev = f"numeric claim matches: {number_count}"
        elif aid == "has_drafts":
            passed = drafts_count >= 1
            ev = f"drafts file count: {drafts_count} at {drafts_dir}"
        elif aid == "three_recs":
            passed = rec_count == 3
            ev = f"numbered recommendations detected: {rec_count}"
        else:
            passed = False
            ev = f"unknown machine assertion: {aid}"
        results.append({"text": a["text"], "passed": passed, "evidence": ev})

    machine = [r for r in results if r is not None]
    passed_n = sum(1 for r in machine if r["passed"])
    pass_rate = passed_n / len(machine) if machine else 0.0

    return {
        "expectations": results,
        "pass_rate": round(pass_rate, 3),
        "machine_only": True,
        "_diagnostics": {
            "report_bytes": report_bytes,
            "report_path": str(report_path) if report_path else None,
            "drafts_count": drafts_count,
            "drafts_dir": str(drafts_dir) if drafts_dir else None,
            "sessions_processed": sessions_n,
            "session_id_citations": cite_count,
            "numeric_claims": number_count,
            "recommendations_counted": rec_count,
        },
    }


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: grade_run.py <run_dir>", file=sys.stderr)
        return 2
    run_dir = Path(sys.argv[1])
    if not run_dir.is_dir():
        print(f"error: no such dir {run_dir}", file=sys.stderr)
        return 1
    result = grade(run_dir)
    out = run_dir / "grading.json"
    out.write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
