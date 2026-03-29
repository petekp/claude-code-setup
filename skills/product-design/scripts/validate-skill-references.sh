#!/usr/bin/env bash
set -euo pipefail

# Resolve paths relative to this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILL_MD="$SKILL_ROOT/SKILL.md"
PRACTICES_DIR="$SKILL_ROOT/practices"

# Temp files for tracking state (cleaned up on exit)
TMPDIR_WORK=$(mktemp -d)
REFERENCED_LIST="$TMPDIR_WORK/referenced.txt"
ALL_FILES_LIST="$TMPDIR_WORK/all_files.txt"
BASENAMES_LIST="$TMPDIR_WORK/basenames.txt"
touch "$REFERENCED_LIST" "$ALL_FILES_LIST" "$BASENAMES_LIST"
cleanup() { rm -rf "$TMPDIR_WORK"; }
trap cleanup EXIT

# Colors for output
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
BOLD='\033[1m'
RESET='\033[0m'

broken_refs=0
missing_frontmatter=0
duplicate_basenames=0
orphan_count=0
total_files=0

# --------------------------------------------------------------------------
# 1. Parse router table and check referenced files exist
# --------------------------------------------------------------------------
printf "\n${BOLD}=== Reference Integrity ===${RESET}\n\n"

while IFS= read -r line; do
    # Extract the directory from the second column (backtick-enclosed path ending in /)
    dir=$(echo "$line" | sed -n 's/.*| *`\(practices\/[^`]*\/\)` *|.*/\1/p')
    if [ -z "$dir" ]; then
        continue
    fi

    # Extract all backtick-enclosed .md filenames from the third column
    third_col=$(echo "$line" | awk -F'|' '{print $4}')
    for filename in $(echo "$third_col" | grep -oE '`[^`]+\.md`' | tr -d '`'); do
        if [ -z "$filename" ]; then
            continue
        fi

        full_path="$SKILL_ROOT/$dir$filename"
        echo "$dir$filename" >> "$REFERENCED_LIST"

        if [ ! -f "$full_path" ]; then
            printf "${RED}BROKEN${RESET}  %s%s\n" "$dir" "$filename"
            broken_refs=$((broken_refs + 1))
        else
            printf "${GREEN}OK${RESET}      %s%s\n" "$dir" "$filename"
        fi
    done
done < "$SKILL_MD"

if [ "$broken_refs" -eq 0 ]; then
    printf "\nAll referenced files exist.\n"
fi

# --------------------------------------------------------------------------
# 2. Build full file list and check for orphans
# --------------------------------------------------------------------------
printf "\n${BOLD}=== Orphaned Files (not in router table) ===${RESET}\n\n"

find "$PRACTICES_DIR" -type f -name '*.md' | sort > "$ALL_FILES_LIST"
total_files=$(wc -l < "$ALL_FILES_LIST" | tr -d ' ')

while IFS= read -r filepath; do
    rel_path="${filepath#$SKILL_ROOT/}"
    if ! grep -qFx "$rel_path" "$REFERENCED_LIST"; then
        printf "${YELLOW}ORPHAN${RESET}  %s\n" "$rel_path"
        orphan_count=$((orphan_count + 1))
    fi
done < "$ALL_FILES_LIST"

if [ "$orphan_count" -eq 0 ]; then
    printf "No orphaned files found.\n"
else
    printf "\n%d of %d practice files are not directly referenced by the router.\n" "$orphan_count" "$total_files"
    printf "(This is informational -- the router only lists starter files per category.)\n"
fi

# --------------------------------------------------------------------------
# 3. Check for duplicate basenames across category directories
# --------------------------------------------------------------------------
printf "\n${BOLD}=== Duplicate Basenames ===${RESET}\n\n"

while IFS= read -r filepath; do
    base=$(basename "$filepath")
    rel_path="${filepath#$SKILL_ROOT/}"
    echo "$base	$rel_path" >> "$BASENAMES_LIST"
done < "$ALL_FILES_LIST"

# Find basenames that appear more than once
dup_names=$(awk -F'\t' '{print $1}' "$BASENAMES_LIST" | sort | uniq -d)

if [ -z "$dup_names" ]; then
    printf "No duplicate basenames found.\n"
else
    while IFS= read -r dup_name; do
        if [ -z "$dup_name" ]; then
            continue
        fi
        printf "${YELLOW}DUPE${RESET}    %s\n" "$dup_name"
        grep "^${dup_name}	" "$BASENAMES_LIST" | while IFS='	' read -r _ location; do
            printf "          %s\n" "$location"
        done
        duplicate_basenames=$((duplicate_basenames + 1))
    done <<< "$dup_names"
fi

# --------------------------------------------------------------------------
# 4. Check frontmatter completeness (tags, priority, applies_when)
# --------------------------------------------------------------------------
printf "\n${BOLD}=== Frontmatter Completeness ===${RESET}\n\n"

required_fields="tags priority applies_when"
files_with_issues=0

while IFS= read -r filepath; do
    rel_path="${filepath#$SKILL_ROOT/}"
    missing_fields=""

    # Extract frontmatter: content between first --- and second ---
    frontmatter=$(sed -n '/^---$/,/^---$/p' "$filepath" | sed '1d;$d')

    if [ -z "$frontmatter" ]; then
        printf "${RED}NO FRONTMATTER${RESET}  %s\n" "$rel_path"
        files_with_issues=$((files_with_issues + 1))
        missing_frontmatter=$((missing_frontmatter + 1))
        continue
    fi

    for field in $required_fields; do
        if ! echo "$frontmatter" | grep -qE "^${field}:"; then
            if [ -z "$missing_fields" ]; then
                missing_fields="$field"
            else
                missing_fields="$missing_fields, $field"
            fi
        fi
    done

    if [ -n "$missing_fields" ]; then
        printf "${RED}MISSING${RESET} %s  ->  %s\n" "$rel_path" "$missing_fields"
        files_with_issues=$((files_with_issues + 1))
        missing_frontmatter=$((missing_frontmatter + 1))
    fi
done < "$ALL_FILES_LIST"

if [ "$files_with_issues" -eq 0 ]; then
    printf "All practice files have complete frontmatter.\n"
fi

# --------------------------------------------------------------------------
# 5. Summary
# --------------------------------------------------------------------------
printf "\n${BOLD}=== Summary ===${RESET}\n\n"
printf "  Total practice files:        %d\n" "$total_files"

printf "  Broken references:           %d" "$broken_refs"
if [ "$broken_refs" -gt 0 ]; then
    printf "  ${RED}(FAIL)${RESET}"
fi
printf "\n"

printf "  Missing frontmatter fields:  %d" "$missing_frontmatter"
if [ "$missing_frontmatter" -gt 0 ]; then
    printf "  ${YELLOW}(warning)${RESET}"
fi
printf "\n"

printf "  Duplicate basenames:         %d" "$duplicate_basenames"
if [ "$duplicate_basenames" -gt 0 ]; then
    printf "  ${YELLOW}(warning)${RESET}"
fi
printf "\n"

printf "  Orphaned files (info only):  %d\n" "$orphan_count"
printf "\n"

if [ "$broken_refs" -gt 0 ]; then
    printf "${RED}${BOLD}FAILED${RESET} -- %d broken reference(s) found.\n\n" "$broken_refs"
    exit 1
fi

printf "${GREEN}${BOLD}PASSED${RESET} -- all references are intact.\n\n"
exit 0
