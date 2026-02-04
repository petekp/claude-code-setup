#!/usr/bin/env python3
"""
Parse LinkedIn data export into normalized format for personality analysis.

Usage:
    python parse_linkedin.py <path_to_linkedin_export_folder> [output_file.json]

The LinkedIn export folder should contain CSV files like Shares.csv, Comments.csv, etc.
"""

import csv
import json
import sys
from datetime import datetime
from pathlib import Path


def parse_date(date_str: str) -> str | None:
    """Convert LinkedIn date format to ISO-8601."""
    if not date_str:
        return None
    try:
        # LinkedIn typically uses YYYY-MM-DD
        dt = datetime.strptime(date_str.strip(), "%Y-%m-%d")
        return dt.isoformat()
    except ValueError:
        try:
            # Sometimes includes time
            dt = datetime.strptime(date_str.strip(), "%Y-%m-%d %H:%M:%S")
            return dt.isoformat()
        except ValueError:
            return None


def read_csv_file(file_path: Path) -> list[dict]:
    """Read a CSV file and return list of dicts."""
    if not file_path.exists():
        return []

    items = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            items.append(row)
    return items


def extract_shares(export_path: Path) -> list:
    """Extract shared posts (original content)."""
    shares_file = export_path / 'Shares.csv'
    raw_shares = read_csv_file(shares_file)
    items = []

    for share in raw_shares:
        content = share.get('ShareCommentary', share.get('Share Commentary', ''))
        if not content.strip():
            continue

        items.append({
            'id': share.get('ShareLink', share.get('Share Link', '')),
            'type': 'post',
            'timestamp': parse_date(share.get('Date', '')),
            'content': content,
            'metadata': {
                'platform': 'linkedin',
                'engagement': {},
                'context': share.get('ShareLink', share.get('Share Link', ''))
            }
        })

    return items


def extract_comments(export_path: Path) -> list:
    """Extract comments on others' posts."""
    comments_file = export_path / 'Comments.csv'
    raw_comments = read_csv_file(comments_file)
    items = []

    for comment in raw_comments:
        content = comment.get('Message', comment.get('Comment', ''))
        if not content.strip():
            continue

        items.append({
            'id': comment.get('Link', ''),
            'type': 'comment',
            'timestamp': parse_date(comment.get('Date', '')),
            'content': content,
            'metadata': {
                'platform': 'linkedin',
                'engagement': {},
                'context': comment.get('Link', '')
            }
        })

    return items


def extract_reactions(export_path: Path) -> list:
    """Extract reactions (likes, etc.) for interest signals."""
    reactions_file = export_path / 'Reactions.csv'
    raw_reactions = read_csv_file(reactions_file)
    items = []

    for reaction in raw_reactions:
        items.append({
            'id': reaction.get('Link', ''),
            'type': 'like',
            'timestamp': parse_date(reaction.get('Date', '')),
            'content': '',  # LinkedIn doesn't include the liked content
            'metadata': {
                'platform': 'linkedin',
                'reaction_type': reaction.get('Type', 'LIKE'),
                'engagement': {},
                'context': reaction.get('Link', '')
            }
        })

    return items


def extract_profile(export_path: Path) -> dict:
    """Extract profile information."""
    profile_file = export_path / 'Profile.csv'
    profiles = read_csv_file(profile_file)

    if profiles:
        p = profiles[0]
        return {
            'name': f"{p.get('First Name', '')} {p.get('Last Name', '')}".strip(),
            'headline': p.get('Headline', ''),
            'summary': p.get('Summary', ''),
            'industry': p.get('Industry', ''),
            'location': p.get('Geo Location', p.get('Location', ''))
        }
    return {}


def extract_positions(export_path: Path) -> list:
    """Extract work history."""
    positions_file = export_path / 'Positions.csv'
    return read_csv_file(positions_file)


def extract_skills(export_path: Path) -> list:
    """Extract skills list."""
    skills_file = export_path / 'Skills.csv'
    skills = read_csv_file(skills_file)
    return [s.get('Name', '') for s in skills if s.get('Name')]


def main():
    if len(sys.argv) < 2:
        print("Usage: python parse_linkedin.py <export_folder> [output.json]")
        sys.exit(1)

    export_path = Path(sys.argv[1])
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'linkedin_normalized.json'

    if not export_path.exists():
        print(f"Error: Path not found: {export_path}")
        sys.exit(1)

    print(f"Parsing LinkedIn export: {export_path}")

    shares = extract_shares(export_path)
    comments = extract_comments(export_path)
    reactions = extract_reactions(export_path)
    profile = extract_profile(export_path)
    positions = extract_positions(export_path)
    skills = extract_skills(export_path)

    all_items = shares + comments + reactions

    result = {
        'platform': 'linkedin',
        'profile': profile,
        'positions': positions,
        'skills': skills,
        'items': all_items,
        'stats': {
            'total_shares': len(shares),
            'total_comments': len(comments),
            'total_reactions': len(reactions)
        }
    }

    # Calculate date range from items with timestamps
    timestamps = [i['timestamp'] for i in all_items if i['timestamp']]
    if timestamps:
        result['date_range'] = {
            'start': min(timestamps),
            'end': max(timestamps)
        }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Parsed {len(shares)} shares, {len(comments)} comments, {len(reactions)} reactions")
    print(f"Output saved to: {output_file}")


if __name__ == "__main__":
    main()
