from dataclasses import dataclass
from typing import Any, Iterable

from z3 import Function, Not, Solver, StringSort, StringVal, sat


@dataclass
class Violation:
    rule: str
    counterexample: dict[str, Any]
    diagnosis: str
    fix_suggestion: str


SnapshotSort = StringSort()
FieldSort = StringSort()
ValueSort = StringSort()

rust_wrote = Function("rust_wrote", SnapshotSort, FieldSort, ValueSort)
swift_read = Function("swift_read", SnapshotSort, FieldSort, ValueSort)


def _check_snapshot_pair(snapshot_name: str, field_name: str, swift_value: str, rust_value: str) -> bool:
    s = Solver()
    snapshot = StringVal(snapshot_name)
    field = StringVal(field_name)
    s.add(swift_read(snapshot, field) == StringVal(swift_value))
    s.add(rust_wrote(snapshot, field) == StringVal(rust_value))
    counterexample = Not(swift_read(snapshot, field) == rust_wrote(snapshot, field))
    s.add(counterexample)
    return s.check() == sat


def verify(facts: dict[str, Any]) -> list[Violation]:
    violations: list[Violation] = []

    for mutation in facts.get("swift_mutations", []):
        snapshot_name = mutation.get("snapshot", "<unknown>")
        field_name = mutation.get("field", "<unknown>")
        swift_value = str(mutation.get("swift_value", "mutated"))
        rust_value = str(mutation.get("rust_value", "baseline"))

        mutated = _check_snapshot_pair(snapshot_name, field_name, swift_value, rust_value)
        if mutated:
            violations.append(
                Violation(
                    rule="snapshot-immutability",
                    counterexample={
                        "snapshot": snapshot_name,
                        "field": field_name,
                        "swift_value": swift_value,
                        "rust_value": rust_value,
                    },
                    diagnosis=(
                        f"Swift accessor '{mutation.get('function', '<anon>')}' "
                        f"writes '{swift_value}' but Rust wrote '{rust_value}' for {field_name} "
                        f"on {snapshot_name}."
                    ),
                    fix_suggestion=(
                        "Treat snapshots as immutable DTOs; read-only adapters must never "
                        "assign or transform fields produced by Rust. Merge any field-level "
                        "mutations back into the Rust writer before crossing the FFI."
                    ),
                )
            )

    for safe_read in facts.get("cross_boundary_reads", []):
        snapshot_name = safe_read.get("snapshot", "<unknown>")
        field_name = safe_read.get("field", "<unknown>")
        swift_value = str(safe_read.get("swift_value", "value"))
        rust_value = str(safe_read.get("rust_value", "value"))

        mismatch = _check_snapshot_pair(snapshot_name, field_name, swift_value, rust_value)
        if mismatch:
            violations.append(
                Violation(
                    rule="snapshot-immutability",
                    counterexample={
                        "snapshot": snapshot_name,
                        "field": field_name,
                        "swift_value": swift_value,
                        "rust_value": rust_value,
                    },
                    diagnosis=(
                        "Cross-boundary read asserts immutability but Z3 finds a mismatch "
                        "between the Rust snapshot and the Swift view."
                    ),
                    fix_suggestion="Ensure the Rust writer and Swift reader agree on every field."
                )
            )

    return violations
