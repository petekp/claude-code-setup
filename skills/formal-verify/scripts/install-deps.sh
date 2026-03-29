#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(pwd)"
SKIP_APALACHE_SERVER=0
APALACHE_VERSION="${APALACHE_VERSION:-0.47.2}"
LOCAL_BIN="${HOME}/.local/bin"
PYTHON_PACKAGES=(
  z3-solver
  tree-sitter
  tree-sitter-rust
  tree-sitter-swift
  radon
  lizard
  PyYAML
)

INSTALLED=()
READY=()
WARNINGS=()

usage() {
  cat <<'EOF'
Usage: install-deps.sh [--project-dir <path>] [--skip-apalache-server]
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-dir)
      PROJECT_DIR="$2"
      shift 2
      ;;
    --skip-apalache-server)
      SKIP_APALACHE_SERVER=1
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

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

require_python() {
  if ! command_exists python3; then
    echo "python3 is required" >&2
    exit 1
  fi

  local version
  version="$(python3 - <<'PY'
import sys
print(f"{sys.version_info.major}.{sys.version_info.minor}")
PY
)"
  local major="${version%%.*}"
  local minor="${version##*.}"

  if (( major < 3 || (major == 3 && minor < 10) )); then
    echo "Python 3.10+ is required, found ${version}" >&2
    exit 1
  fi

  READY+=("python3 ${version}")
}

install_python_packages() {
  local missing=()
  local pkg
  for pkg in "${PYTHON_PACKAGES[@]}"; do
    if ! python3 -m pip show "$pkg" >/dev/null 2>&1; then
      missing+=("$pkg")
    fi
  done

  if (( ${#missing[@]} > 0 )); then
    python3 -m pip install --user "${missing[@]}"
    INSTALLED+=("${missing[@]}")
  fi

  READY+=("python packages")
}

ensure_swiftlint() {
  if command_exists swiftlint; then
    READY+=("swiftlint")
    return
  fi

  if [[ "$(uname -s)" == "Darwin" ]] && command_exists brew; then
    brew list swiftlint >/dev/null 2>&1 || brew install swiftlint
    READY+=("swiftlint")
    INSTALLED+=("swiftlint")
    return
  fi

  WARNINGS+=("swiftlint not found; Layer 3 will fall back to heuristic Swift checks")
}

ensure_java() {
  if ! command_exists java; then
    WARNINGS+=("Java 17+ not found; Apalache cannot run until Java is installed")
    return
  fi

  local java_version
  java_version="$(
    java -version 2>&1 | awk -F '"' '/version/ {print $2; exit}'
  )"
  local major="${java_version%%.*}"
  if [[ "${java_version}" == 1.* ]]; then
    major="$(echo "${java_version}" | cut -d. -f2)"
  fi

  if (( major < 17 )); then
    WARNINGS+=("Java 17+ required for Apalache; found ${java_version}")
    return
  fi

  READY+=("java ${java_version}")
}

ensure_apalache() {
  mkdir -p "${LOCAL_BIN}"

  if command_exists apalache-mc || [[ -x "${LOCAL_BIN}/apalache-mc" ]]; then
    READY+=("apalache-mc")
    return
  fi

  if ! command_exists curl || ! command_exists tar; then
    WARNINGS+=("curl and tar are required to install Apalache automatically")
    return
  fi

  local tmp_dir
  tmp_dir="$(mktemp -d)"
  local archive="${tmp_dir}/apalache.tgz"
  local url="https://github.com/apalache-mc/apalache/releases/download/v${APALACHE_VERSION}/apalache.tgz"

  if curl -fsSL "${url}" -o "${archive}"; then
    tar -xzf "${archive}" -C "${tmp_dir}"
    local found
    found="$(find "${tmp_dir}" -type f -name 'apalache-mc' | head -n 1)"
    if [[ -n "${found}" ]]; then
      install -m 0755 "${found}" "${LOCAL_BIN}/apalache-mc"
      INSTALLED+=("apalache-mc")
      READY+=("apalache-mc")
    else
      WARNINGS+=("Apalache archive downloaded but binary not found")
    fi
  else
    WARNINGS+=("Failed to download Apalache ${APALACHE_VERSION} from GitHub releases")
  fi

  rm -rf "${tmp_dir}"
}

create_verifier_layout() {
  local verifier_dir="${PROJECT_DIR}/.verifier"
  mkdir -p \
    "${verifier_dir}/specs" \
    "${verifier_dir}/facts" \
    "${verifier_dir}/reports"

  if [[ ! -f "${verifier_dir}/structural.yaml" ]]; then
    cat > "${verifier_dir}/structural.yaml" <<'EOF'
ownership: []
boundaries: []
patterns: []
migration: []
custom_patterns: {}
EOF
  fi

  if [[ ! -f "${verifier_dir}/elegance.yaml" ]]; then
    cat > "${verifier_dir}/elegance.yaml" <<'EOF'
thresholds:
  cyclomatic_complexity: 10
  nesting_depth: 4
  function_length: 50
  file_length: 500
  parameter_count: 5
minimum_grade: B
exclude:
  - "*/tests/*"
  - "*/generated/*"
weights:
  complexity: 4
  consistency: 3
  craft: 5
EOF
  fi

  READY+=(".verifier/")
}

ensure_gitignore_entries() {
  local gitignore="${PROJECT_DIR}/.gitignore"
  touch "${gitignore}"

  local entry
  for entry in ".verifier/facts/" ".verifier/reports/"; do
    if ! grep -qxF "${entry}" "${gitignore}"; then
      printf '%s\n' "${entry}" >> "${gitignore}"
      INSTALLED+=("${entry} entry")
    fi
  done
}

start_apalache_server() {
  if (( SKIP_APALACHE_SERVER == 1 )); then
    return
  fi

  local apalache_bin="apalache-mc"
  if [[ -x "${LOCAL_BIN}/apalache-mc" ]]; then
    apalache_bin="${LOCAL_BIN}/apalache-mc"
  elif ! command_exists apalache-mc; then
    return
  fi

  if pgrep -f 'apalache-mc server' >/dev/null 2>&1; then
    READY+=("apalache daemon")
    return
  fi

  nohup "${apalache_bin}" server >/tmp/apalache-server.log 2>&1 &
  READY+=("apalache daemon")
}

print_summary() {
  echo "formal-verify bootstrap summary"
  echo "  project: ${PROJECT_DIR}"

  if (( ${#INSTALLED[@]} > 0 )); then
    echo "  installed:"
    printf '    - %s\n' "${INSTALLED[@]}"
  fi

  if (( ${#READY[@]} > 0 )); then
    echo "  ready:"
    printf '    - %s\n' "${READY[@]}"
  fi

  if (( ${#WARNINGS[@]} > 0 )); then
    echo "  warnings:"
    printf '    - %s\n' "${WARNINGS[@]}"
  fi
}

require_python
install_python_packages
ensure_swiftlint
ensure_java
ensure_apalache
create_verifier_layout
ensure_gitignore_entries
start_apalache_server
print_summary
