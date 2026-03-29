#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(pwd)"
LAYERS="all"
OUTPUT_MODE="human"
VERBOSE=0
JSON_MODE=0
SINCE_CHECKPOINT=0

usage() {
  cat <<'EOF'
Usage: verify.sh [--layers <1|2|3|all>] [--project-dir <path>] [--output-mode <agent|human>] [--verbose] [--json] [--since-checkpoint]
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --layers)
      LAYERS="$2"
      shift 2
      ;;
    --project-dir)
      PROJECT_DIR="$2"
      shift 2
      ;;
    --output-mode)
      OUTPUT_MODE="$2"
      shift 2
      ;;
    --verbose)
      VERBOSE=1
      shift
      ;;
    --json)
      JSON_MODE=1
      shift
      ;;
    --since-checkpoint)
      SINCE_CHECKPOINT=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

REPORT_DIR="${PROJECT_DIR}/.verifier/reports"
FACTS_PATH="${PROJECT_DIR}/.verifier/facts/facts.json"
CACHE_FILE="${REPORT_DIR}/last-run.json"
mkdir -p "${REPORT_DIR}" "$(dirname "${FACTS_PATH}")"

STRUCTURAL_RESULTS="$(mktemp)"
BEHAVIORAL_RESULTS="$(mktemp)"
APALACHE_RESULTS="$(mktemp)"
ELEGANCE_RESULTS="$(mktemp)"
printf '[]\n' > "${STRUCTURAL_RESULTS}"
printf '[]\n' > "${BEHAVIORAL_RESULTS}"
printf '[]\n' > "${APALACHE_RESULTS}"
printf '{}\n' > "${ELEGANCE_RESULTS}"

warn() {
  printf 'WARN: %s\n' "$1" >&2
}

progress() {
  if (( VERBOSE == 1 )) || [[ "${LAYERS}" == "all" ]]; then
    printf '%s\n' "$1"
  fi
}

layer_requested() {
  case "$LAYERS" in
    all) return 0 ;;
    1) [[ "$1" == "1" ]] && return 0 ;;
    2) [[ "$1" == "2" ]] && return 0 ;;
    3) [[ "$1" == "3" ]] && return 0 ;;
  esac
  return 1
}

cache_is_fresh() {
  if (( SINCE_CHECKPOINT == 0 )) || [[ ! -f "${CACHE_FILE}" ]]; then
    return 1
  fi
  python3 - "${PROJECT_DIR}" "${CACHE_FILE}" <<'PY'
import json
import sys
from pathlib import Path

project_dir = Path(sys.argv[1])
cache_file = Path(sys.argv[2])
with cache_file.open("r", encoding="utf-8") as handle:
    data = json.load(handle)

if not data.get("timestamp"):
    raise SystemExit(1)

timestamp = data["timestamp"]
for path in project_dir.rglob("*"):
    if not path.is_file():
        continue
    if ".git" in path.parts or ".verifier" in path.parts:
        continue
    if path.suffix not in {".rs", ".swift", ".py", ".tla", ".yaml", ".yml"}:
        continue
    if path.stat().st_mtime > __import__("datetime").datetime.fromisoformat(timestamp).timestamp():
        raise SystemExit(1)

raise SystemExit(0)
PY
}

if cache_is_fresh; then
  if (( JSON_MODE == 1 )); then
    cat "${CACHE_FILE}"
  else
    python3 - "${CACHE_FILE}" <<'PY'
import json
import sys
with open(sys.argv[1], "r", encoding="utf-8") as handle:
    data = json.load(handle)
print("Using cached verification results.")
for name, values in data.get("layers", {}).items():
    if name == "elegance":
        if values:
            print(f"[elegance] grade {values.get('grade', 'unknown')}")
            for deduction in values.get("deductions", values.get("violations", [])):
                location = deduction.get("file", "unknown")
                line = deduction.get("line", 1)
                print(f"  {location}:{line} - {deduction.get('message', deduction.get('diagnosis', 'deduction'))}")
        continue
    for item in values:
        print(f"[{item.get('layer', name)}] {item.get('rule', 'unnamed_rule')}")
        print(f"  Counterexample: {item.get('counterexample', 'n/a')}")
        print(f"  Diagnosis: {item.get('diagnosis', 'n/a')}")
        print()
PY
  fi
  python3 - "${CACHE_FILE}" <<'PY'
import json
import sys
with open(sys.argv[1], "r", encoding="utf-8") as handle:
    data = json.load(handle)
raise SystemExit(data.get("exit_code", 0))
PY
fi

run_python_json() {
  local destination="$1"
  shift
  if "$@" > "${destination}"; then
    return 0
  fi
  return 1
}

EXIT_CODE=0

if layer_requested "1" || layer_requested "2"; then
  progress "Extracting facts..."
  extract_args=(python3 "${SCRIPT_DIR}/extract-facts.py" --project-dir "${PROJECT_DIR}" --output "${FACTS_PATH}")
  if [[ -f "${FACTS_PATH}" ]]; then
    extract_args+=(--incremental)
  fi
  if ! "${extract_args[@]}" >/dev/null; then
    warn "Fact extraction failed."
    EXIT_CODE=1
  fi
fi

if layer_requested "1"; then
  progress "Verifying structural constraints..."
  if [[ -f "${SCRIPT_DIR}/verify-structural.py" ]]; then
    if ! run_python_json "${STRUCTURAL_RESULTS}" \
      python3 "${SCRIPT_DIR}/verify-structural.py" \
      --facts "${FACTS_PATH}" \
      --constraints "${PROJECT_DIR}/.verifier/structural.yaml" \
      --output-mode "${OUTPUT_MODE}" \
      --json; then
      EXIT_CODE=1
    fi
  else
    warn "Layer 1 script not found, skipping"
  fi
fi

if layer_requested "2"; then
  progress "Checking behavioral specs..."
  if [[ -f "${SCRIPT_DIR}/verify-behavioral.py" ]]; then
    if ! run_python_json "${BEHAVIORAL_RESULTS}" \
      python3 "${SCRIPT_DIR}/verify-behavioral.py" \
      --specs-dir "${PROJECT_DIR}/.verifier/specs" \
      --facts "${FACTS_PATH}" \
      --output-mode "${OUTPUT_MODE}" \
      --json; then
      EXIT_CODE=1
    fi
  else
    warn "Layer 2 behavioral script not found, skipping"
  fi

  if [[ -f "${SCRIPT_DIR}/run-apalache.sh" ]]; then
    if ! "${SCRIPT_DIR}/run-apalache.sh" --specs-dir "${PROJECT_DIR}/.verifier/specs" --json > "${APALACHE_RESULTS}"; then
      EXIT_CODE=1
    fi
  else
    warn "Layer 2 Apalache script not found, skipping"
  fi
fi

if layer_requested "3"; then
  progress "Auditing elegance..."
  if [[ -f "${SCRIPT_DIR}/audit-elegance.py" ]]; then
    if ! run_python_json "${ELEGANCE_RESULTS}" \
      python3 "${SCRIPT_DIR}/audit-elegance.py" \
      --project-dir "${PROJECT_DIR}" \
      --config "${PROJECT_DIR}/.verifier/elegance.yaml" \
      --output-mode "${OUTPUT_MODE}" \
      --json; then
      EXIT_CODE=1
    fi
  else
    warn "Layer 3 script not found, skipping"
  fi
fi

AGGREGATED_JSON="$(python3 - "${STRUCTURAL_RESULTS}" "${BEHAVIORAL_RESULTS}" "${APALACHE_RESULTS}" "${ELEGANCE_RESULTS}" "${EXIT_CODE}" "${PROJECT_DIR}" <<'PY'
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

structural_path, behavioral_path, apalache_path, elegance_path, exit_code, project_dir = sys.argv[1:7]

def load(path, default):
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except Exception:
        return default

root = Path(project_dir)
files_verified = sorted(
    str(path.relative_to(root))
    for path in root.rglob("*")
    if path.is_file()
    and ".git" not in path.parts
    and ".verifier" not in path.parts
    and path.suffix in {".rs", ".swift", ".py", ".tla", ".yaml", ".yml", ".md"}
)

data = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "exit_code": int(exit_code),
    "files_verified": files_verified,
    "layers": {
        "structural": load(structural_path, []),
        "behavioral": load(behavioral_path, []),
        "apalache": load(apalache_path, []),
        "elegance": load(elegance_path, {}),
    },
}
print(json.dumps(data))
PY
)"

printf '%s\n' "${AGGREGATED_JSON}" > "${CACHE_FILE}"

if (( JSON_MODE == 1 )); then
  python3 -c 'import json,sys; print(json.dumps(json.loads(sys.stdin.read()), indent=2, sort_keys=True))' <<<"${AGGREGATED_JSON}"
else
  python3 - "${AGGREGATED_JSON}" <<'PY'
import json
import sys

data = json.loads(sys.argv[1])
layers = data.get("layers", {})

if not any(layers.values()):
    print("Verification passed.")
    raise SystemExit(0)

for group in ("structural", "behavioral", "apalache"):
    for item in layers.get(group, []):
        print(f"[{item.get('layer', group)}] {item.get('rule', 'unnamed_rule')}")
        location = item.get("file")
        if location:
            print(f"  File: {location}:{item.get('line', 1)}")
        print(f"  Counterexample: {item.get('counterexample', 'n/a')}")
        print(f"  Diagnosis: {item.get('diagnosis', 'n/a')}")
        fix = item.get("fix_suggestion")
        if fix:
            print(f"  Fix: {fix}")
        print()

elegance = layers.get("elegance", {})
if elegance:
    print(f"[elegance] grade {elegance.get('grade', 'unknown')}")
    deductions = elegance.get("deductions", elegance.get("violations", []))
    for deduction in deductions:
        location = deduction.get("file", "unknown")
        line = deduction.get("line", 1)
        print(f"  {location}:{line} - {deduction.get('message', deduction.get('diagnosis', 'deduction'))}")
PY
fi

exit "${EXIT_CODE}"
