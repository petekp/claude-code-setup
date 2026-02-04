#!/usr/bin/env python3
"""
Parse Instagram data export into normalized format for personality analysis.

Usage:
    python parse_instagram.py <path_to_instagram_export_folder> [output_file.json]

The Instagram export folder should contain directories like content/, comments/, etc.
"""

import json
import sys
from datetime import datetime
from pathlib import Path


def fix_encoding(text: str) -> str:
    """Fix Instagram's encoding issues with emojis and special chars."""
    if not text:
        return ''
    try:
        # Instagram sometimes double-encodes UTF-8
        return text.encode('latin1').decode('utf-8')
    except (UnicodeDecodeError, UnicodeEncodeError):
        return text


def parse_timestamp(ts: int) -> str:
    """Convert Unix timestamp to ISO-8601."""
    return datetime.utcfromtimestamp(ts).isoformat() + 'Z'


def load_json_file(file_path: Path) -> list | dict:
    """Load and parse a JSON file."""
    if not file_path.exists():
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def extract_posts(export_path: Path) -> list:
    """Extract posts from content directory."""
    items = []

    # Instagram may have multiple posts files
    content_dir = export_path / 'content'
    if not content_dir.exists():
        content_dir = export_path / 'your_instagram_activity' / 'content'

    if not content_dir.exists():
        # Try root level
        posts_file = export_path / 'posts_1.json'
        if posts_file.exists():
            content_dir = export_path

    if not content_dir.exists():
        return items

    # Find all posts files
    for posts_file in content_dir.glob('posts*.json'):
        raw_posts = load_json_file(posts_file)

        for post in raw_posts:
            media_list = post.get('media', [post]) if isinstance(post, dict) else [post]

            for media in media_list:
                caption = fix_encoding(media.get('title', ''))
                if not caption.strip():
                    continue

                items.append({
                    'id': media.get('uri', ''),
                    'type': 'post',
                    'timestamp': parse_timestamp(media['creation_timestamp']) if 'creation_timestamp' in media else None,
                    'content': caption,
                    'metadata': {
                        'platform': 'instagram',
                        'engagement': {},
                        'context': None,
                        'media_type': 'photo' if 'photo' in media.get('uri', '').lower() else 'video'
                    }
                })

    return items


def extract_comments(export_path: Path) -> list:
    """Extract comments made on posts."""
    items = []

    comments_file = export_path / 'comments' / 'post_comments.json'
    if not comments_file.exists():
        comments_file = export_path / 'your_instagram_activity' / 'comments' / 'post_comments.json'
    if not comments_file.exists():
        comments_file = export_path / 'comments.json'

    if not comments_file.exists():
        return items

    raw_data = load_json_file(comments_file)

    # Handle different structures
    comments_list = raw_data
    if isinstance(raw_data, dict):
        comments_list = raw_data.get('comments_media_comments', raw_data.get('comments', []))

    for comment in comments_list:
        text = ''
        timestamp = None

        if isinstance(comment, dict):
            # Nested structure
            string_data = comment.get('string_list_data', [])
            if string_data:
                text = fix_encoding(string_data[0].get('value', ''))
                timestamp = string_data[0].get('timestamp')
            else:
                text = fix_encoding(comment.get('value', comment.get('comment', '')))
                timestamp = comment.get('timestamp')

        if not text.strip():
            continue

        items.append({
            'id': '',
            'type': 'comment',
            'timestamp': parse_timestamp(timestamp) if timestamp else None,
            'content': text,
            'metadata': {
                'platform': 'instagram',
                'engagement': {},
                'context': None
            }
        })

    return items


def extract_likes(export_path: Path) -> list:
    """Extract liked posts for interest signals."""
    items = []

    likes_file = export_path / 'likes' / 'liked_posts.json'
    if not likes_file.exists():
        likes_file = export_path / 'your_instagram_activity' / 'likes' / 'liked_posts.json'

    if not likes_file.exists():
        return items

    raw_data = load_json_file(likes_file)
    likes_list = raw_data.get('likes_media_likes', raw_data) if isinstance(raw_data, dict) else raw_data

    for like in likes_list:
        timestamp = None
        if isinstance(like, dict):
            string_data = like.get('string_list_data', [])
            if string_data:
                timestamp = string_data[0].get('timestamp')
            else:
                timestamp = like.get('timestamp')

        items.append({
            'id': '',
            'type': 'like',
            'timestamp': parse_timestamp(timestamp) if timestamp else None,
            'content': '',  # Instagram doesn't include liked content
            'metadata': {
                'platform': 'instagram',
                'engagement': {},
                'context': None
            }
        })

    return items


def extract_profile(export_path: Path) -> dict:
    """Extract profile information."""
    profile_file = export_path / 'personal_information' / 'personal_information.json'
    if not profile_file.exists():
        profile_file = export_path / 'profile.json'

    if not profile_file.exists():
        return {}

    data = load_json_file(profile_file)

    if isinstance(data, dict):
        profile_data = data.get('profile_user', [{}])
        if profile_data:
            p = profile_data[0] if isinstance(profile_data, list) else profile_data
            string_data = p.get('string_map_data', {})
            return {
                'username': string_data.get('Username', {}).get('value', ''),
                'bio': fix_encoding(string_data.get('Bio', {}).get('value', '')),
                'name': string_data.get('Name', {}).get('value', '')
            }
    return {}


def main():
    if len(sys.argv) < 2:
        print("Usage: python parse_instagram.py <export_folder> [output.json]")
        sys.exit(1)

    export_path = Path(sys.argv[1])
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'instagram_normalized.json'

    if not export_path.exists():
        print(f"Error: Path not found: {export_path}")
        sys.exit(1)

    print(f"Parsing Instagram export: {export_path}")

    posts = extract_posts(export_path)
    comments = extract_comments(export_path)
    likes = extract_likes(export_path)
    profile = extract_profile(export_path)

    all_items = posts + comments + likes

    result = {
        'platform': 'instagram',
        'profile': profile,
        'items': all_items,
        'stats': {
            'total_posts': len(posts),
            'total_comments': len(comments),
            'total_likes': len(likes)
        }
    }

    # Calculate date range
    timestamps = [i['timestamp'] for i in all_items if i['timestamp']]
    if timestamps:
        result['date_range'] = {
            'start': min(timestamps),
            'end': max(timestamps)
        }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Parsed {len(posts)} posts, {len(comments)} comments, {len(likes)} likes")
    print(f"Output saved to: {output_file}")


if __name__ == "__main__":
    main()
