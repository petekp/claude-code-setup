#!/usr/bin/env bash
set -euo pipefail

SPECS_DIR=".verifier/specs/"
JSON_MODE=0
TIMEOUT_SECONDS="${APALACHE_TIMEOUT_SECONDS:-60}"
APALACHE_BIN="${APALACHE_BIN:-}"

usage() {
  cat <<'EOF'
Usage: run-apalache.sh [--specs-dir <path>] [--json] [--timeout <seconds>]
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --specs-dir)
      SPECS_DIR="$2"
      shift 2
      ;;
    --json)
      JSON_MODE=1
      shift
      ;;
    --timeout)
      TIMEOUT_SECONDS="$2"
      shift 2
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

if [[ -z "${APALACHE_BIN}" ]]; then
  if command -v apalache-mc >/dev/null 2>&1; then
    APALACHE_BIN="apalache-mc"
  elif command -v apalache >/dev/null 2>&1; then
    APALACHE_BIN="apalache"
  fi
fi

if [[ -z "${APALACHE_BIN}" ]]; then
  if (( JSON_MODE == 1 )); then
    printf '[]\n'
  else
    echo "Apalache not installed; skipping TLA+ checks."
  fi
  exit 0
fi

TIMEOUT_CMD=()
if command -v timeout >/dev/null 2>&1; then
  TIMEOUT_CMD=(timeout "${TIMEOUT_SECONDS}")
elif command -v gtimeout >/dev/null 2>&1; then
  TIMEOUT_CMD=(gtimeout "${TIMEOUT_SECONDS}")
fi

RESULTS_FILE="$(mktemp)"
printf '[]\n' > "${RESULTS_FILE}"

append_result() {
  local result_json="$1"
  python3 - "$RESULTS_FILE" "$result_json" <<'PY'
import json
import sys
path = sys.argv[1]
result = json.loads(sys.argv[2])
with open(path, "r", encoding="utf-8") as handle:
    data = json.load(handle)
data.append(result)
with open(path, "w", encoding="utf-8") as handle:
    json.dump(data, handle)
PY
}

shopt -s nullglob
for spec in "${SPECS_DIR}"/*.tla; do
  [[ -f "${spec}" ]] || continue
  cfg="${spec%.tla}.cfg"
  run_dir="$(mktemp -d)"
  stdout_file="$(mktemp)"
  stderr_file="$(mktemp)"
  command=("${APALACHE_BIN}" "check" "${spec}" "--run-dir=${run_dir}")
  if [[ -f "${cfg}" ]]; then
    command+=("--config=${cfg}")
  fi

  if "${TIMEOUT_CMD[@]}" "${command[@]}" >"${stdout_file}" 2>"${stderr_file}"; then
    :
  else
    excerpt="$(python3 - "${stdout_file}" "${stderr_file}" <<'PY'
import sys
parts = []
for path in sys.argv[1:]:
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as handle:
            parts.append(handle.read().strip())
    except FileNotFoundError:
        pass
joined = "\n".join(part for part in parts if part)
print(joined[-4000:] if joined else "Apalache reported a violation or execution error.")
PY
)"
    result_json="$(python3 - "${spec}" "${excerpt}" <<'PY'
import json
import sys
spec = sys.argv[1]
excerpt = sys.argv[2]
print(json.dumps({
    "layer": "behavioral",
    "rule": spec.rsplit("/", 1)[-1].rsplit(".", 1)[0],
    "description": "TLA+/Apalache spec reported a behavioral violation.",
    "counterexample": excerpt,
    "diagnosis": "Apalache found a failing state trace or could not prove the bounded model safe.",
    "file": spec,
    "line": 1,
    "spec": spec,
}))
PY
)"
    append_result "${result_json}"
  fi

  rm -rf "${run_dir}" "${stdout_file}" "${stderr_file}"
done
shopt -u nullglob

if (( JSON_MODE == 1 )); then
  cat "${RESULTS_FILE}"
else
  python3 - "${RESULTS_FILE}" <<'PY'
import json
import sys
with open(sys.argv[1], "r", encoding="utf-8") as handle:
    data = json.load(handle)
if not data:
    print("Apalache verification passed.")
else:
    for item in data:
        print(f"[behavioral] {item['rule']}")
        print(f"  Spec: {item['spec']}")
        print(f"  Counterexample: {item['counterexample']}")
        print(f"  Diagnosis: {item['diagnosis']}")
        print()
PY
fi

python3 - "${RESULTS_FILE}" <<'PY'
import json
import sys
with open(sys.argv[1], "r", encoding="utf-8") as handle:
    data = json.load(handle)
raise SystemExit(1 if data else 0)
PY
