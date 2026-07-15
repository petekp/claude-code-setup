#!/bin/bash
#
# Validates YAML frontmatter in skills, commands, agents, and hooks.
# Exits with non-zero status if any errors are found.
#
# Usage:
#   ./scripts/validate.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

errors=0
warnings=0

check_frontmatter() {
    local file=$1
    local -a required_fields=("${@:2}")

    if [[ ! -f "$file" ]]; then
        return
    fi

    # Check for frontmatter delimiters
    local first_line=$(head -1 "$file")
    if [[ "$first_line" != "---" ]]; then
        echo "  ✗ Missing frontmatter: $file"
        ((errors++))
        return
    fi

    # Check for closing delimiter
    if ! sed -n '2,/^---$/p' "$file" | grep -q "^---$"; then
        echo "  ✗ Unclosed frontmatter: $file"
        ((errors++))
        return
    fi

    # Check required fields
    for field in "${required_fields[@]}"; do
        if ! sed -n '2,/^---$/p' "$file" | grep -q "^${field}:"; then
            echo "  ✗ Missing '$field': $file"
            ((errors++))
        fi
    done
}

echo "Validating frontmatter..."
echo ""

# Skills: require name and description
echo "Skills:"
skill_count=0
for file in "$REPO_DIR"/skills/*/SKILL.md; do
    [[ -f "$file" ]] || continue
    check_frontmatter "$file" "name" "description"
    ((skill_count++))
done
if [[ $skill_count -eq 0 ]]; then
    echo "  (no skills found)"
else
    echo "  Checked $skill_count skill(s)"
fi
echo ""

# Commands: require description
echo "Commands:"
cmd_count=0
for file in "$REPO_DIR"/commands/*.md; do
    [[ -f "$file" ]] || continue
    check_frontmatter "$file" "description"
    ((cmd_count++))
done
if [[ $cmd_count -eq 0 ]]; then
    echo "  (no commands found)"
else
    echo "  Checked $cmd_count command(s)"
fi
echo ""

# Agents: require name and description
echo "Agents:"
agent_count=0
for file in "$REPO_DIR"/agents/*.md; do
    [[ -f "$file" ]] || continue
    check_frontmatter "$file" "name" "description"
    ((agent_count++))
done
if [[ $agent_count -eq 0 ]]; then
    echo "  (no agents found)"
else
    echo "  Checked $agent_count agent(s)"
fi
echo ""

# Hooks: require event
echo "Hooks:"
hook_count=0
for file in "$REPO_DIR"/hooks/*.md; do
    [[ -f "$file" ]] || continue
    check_frontmatter "$file" "event"
    ((hook_count++))
done
if [[ $hook_count -eq 0 ]]; then
    echo "  (no hooks found)"
else
    echo "  Checked $hook_count hook(s)"
fi
echo ""

# Summary
if [[ $errors -gt 0 ]]; then
    echo "Found $errors error(s). Fix them before committing."
    exit 1
else
    echo "All frontmatter valid."
    exit 0
fi
