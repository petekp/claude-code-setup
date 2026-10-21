#!/bin/sh
#
# Checks the frontmatter of every skill in skills/, the formatting of mods/
# and skills/, then each mod in mods/ with `claude plugin validate`, a type
# check and its tests. Exits 1 on any error.
#
# Needs python3 with PyYAML (pip install pyyaml). PyYAML rejects frontmatter
# that looser loaders accept, such as an unquoted description containing ": ".
# The other checks need npx, and the mod checks the claude CLI.
#
# Usage: ./scripts/validate.sh

set -eu

REPO_DIR=$(CDPATH='' cd "$(dirname "$0")/.." && pwd -P)
# Prettier changes its output between minor versions, so a pinned version
# keeps the check from failing on files nobody changed.
PRETTIER=prettier@3.9.9
status=0

python3 - "$REPO_DIR/skills" <<'PY' || status=1
import pathlib, sys

try:
    import yaml
except ImportError:
    sys.exit("validate.sh needs PyYAML: pip install pyyaml")

# Claude Code truncates description plus when_to_use at this length in the
# skill listing.
LISTING_LIMIT = 1536

errors = 0
skills = sorted(p for p in pathlib.Path(sys.argv[1]).iterdir() if p.is_dir() and not p.name.startswith("."))

def error(skill, message):
    global errors
    errors += 1
    print(f"  x {skill.name}: {message}")

for skill in skills:
    path = skill / "SKILL.md"
    if not path.is_file():
        error(skill, "no SKILL.md")
        continue
    text = path.read_text()
    if not text.startswith("---\n"):
        error(skill, "no frontmatter")
        continue
    end = text.find("\n---", 4)
    if end == -1:
        error(skill, "frontmatter is not closed")
        continue
    try:
        meta = yaml.safe_load(text[4:end])
    except yaml.YAMLError as e:
        error(skill, f"frontmatter is not valid YAML: {str(e).splitlines()[0]}")
        continue
    if not isinstance(meta, dict):
        error(skill, "frontmatter is not a mapping")
        continue
    if meta.get("name") != skill.name:
        error(skill, f"name is {meta.get('name')!r}, but the folder is {skill.name!r}")
    description = meta.get("description")
    if not isinstance(description, str) or not description.strip():
        error(skill, "description is missing")
        continue
    listing = len(description) + len(str(meta.get("when_to_use", "")))
    if listing > LISTING_LIMIT:
        error(skill, f"description and when_to_use are {listing} characters; the limit is {LISTING_LIMIT}")

print(f"Checked {len(skills)} skills, {errors} error(s).")
sys.exit(1 if errors else 0)
PY

log=$(mktemp)
trap 'rm -f "$log"' EXIT

# Runs one check and prints the check's output only when it fails.
check() {
    label=$1
    shift
    if "$@" >"$log" 2>&1; then
        echo "  ok $label"
    else
        echo "  x $label"
        sed 's/^/      /' "$log"
        status=1
    fi
}

# Prettier reads .prettierignore and .gitignore from the folder it runs in.
cd "$REPO_DIR"
echo "Formatting:"
before=$status
check "prettier" npx -y "$PRETTIER" --check mods skills
[ "$status" = "$before" ] || echo "      Fix: npx -y $PRETTIER --write mods skills"

if ! command -v claude >/dev/null 2>&1; then
    echo "Skipped the mods: no claude CLI."
    exit "$status"
fi

for dir in "$REPO_DIR"/mods/*/; do
    dir=${dir%/}
    [ -f "$dir/.claude-plugin/plugin.json" ] || continue
    name=$(basename "$dir")
    echo "Mod $name:"
    check "plugin validate" claude plugin validate "$dir"
    # Claude Code writes these types when it loads the mod from a folder you own.
    if [ -f "$dir/.claude-plugin/types/tsconfig.json" ]; then
        check "types" npx -y -p typescript tsc --noEmit -p "$dir"
    else
        echo "  - types: not checked. Load the mod once to write them: mods/scripts/live.sh start mods/$name"
    fi
    check "tests" claude plugin test "$dir"
done

exit "$status"
