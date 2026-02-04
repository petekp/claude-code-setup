#!/usr/bin/env python3
"""
Parse Twitter/X data export into normalized format for personality analysis.

Usage:
    python parse_twitter.py <path_to_twitter_archive_folder> [output_file.json]

The Twitter archive folder should contain the 'data/' subdirectory with .js files.
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path


def parse_js_file(file_path: Path) -> list:
    """Parse Twitter's JavaScript-wrapped JSON files."""
    content = file_path.read_text(encoding='utf-8')
    # Remove variable assignment: window.YTD.tweets.part0 = [...]
    json_str = re.sub(r'^window\.YTD\.\w+\.part\d+\s*=\s*', '', content.strip())
    return json.loads(json_str)


def parse_tweet_date(date_str: str) -> str:
    """Convert Twitter date format to ISO-8601."""
    # "Wed Oct 10 20:19:24 +0000 2018"
    dt = datetime.strptime(date_str, "%a %b %d %H:%M:%S %z %Y")
    return dt.isoformat()


def extract_tweets(archive_path: Path) -> list:
    """Extract and normalize tweets from archive."""
    data_dir = archive_path / 'data'
    tweets_file = data_dir / 'tweets.js'

    if not tweets_file.exists():
        # Try alternate location
        tweets_file = data_dir / 'tweet.js'

    if not tweets_file.exists():
        raise FileNotFoundError(f"Could not find tweets.js in {data_dir}")

    raw_tweets = parse_js_file(tweets_file)
    items = []

    for entry in raw_tweets:
        tweet = entry.get('tweet', entry)

        content = tweet.get('full_text', tweet.get('text', ''))
        if not content.strip():
            continue

        item = {
            'id': tweet.get('id_str', tweet.get('id', '')),
            'type': 'reply' if tweet.get('in_reply_to_status_id_str') else 'post',
            'timestamp': parse_tweet_date(tweet['created_at']),
            'content': content,
            'metadata': {
                'platform': 'twitter',
                'engagement': {
                    'likes': int(tweet.get('favorite_count', 0)),
                    'replies': 0,  # Not in export
                    'shares': int(tweet.get('retweet_count', 0))
                },
                'context': tweet.get('in_reply_to_status_id_str'),
                'hashtags': [h['text'] for h in tweet.get('entities', {}).get('hashtags', [])],
                'mentions': [m['screen_name'] for m in tweet.get('entities', {}).get('user_mentions', [])]
            }
        }
        items.append(item)

    return items


def extract_profile(archive_path: Path) -> dict:
    """Extract profile information."""
    profile_file = archive_path / 'data' / 'profile.js'
    if not profile_file.exists():
        return {}

    data = parse_js_file(profile_file)
    if data and len(data) > 0:
        profile = data[0].get('profile', data[0])
        return {
            'bio': profile.get('description', {}).get('bio', ''),
            'location': profile.get('description', {}).get('location', ''),
            'website': profile.get('description', {}).get('website', '')
        }
    return {}


def extract_likes(archive_path: Path) -> list:
    """Extract liked tweets for interest analysis."""
    likes_file = archive_path / 'data' / 'like.js'
    if not likes_file.exists():
        return []

    raw_likes = parse_js_file(likes_file)
    items = []

    for entry in raw_likes:
        like = entry.get('like', entry)
        content = like.get('fullText', '')
        if content.strip():
            items.append({
                'id': like.get('tweetId', ''),
                'type': 'like',
                'timestamp': None,  # Not provided in likes
                'content': content,
                'metadata': {
                    'platform': 'twitter',
                    'engagement': {},
                    'context': None
                }
            })

    return items


def main():
    if len(sys.argv) < 2:
        print("Usage: python parse_twitter.py <archive_folder> [output.json]")
        sys.exit(1)

    archive_path = Path(sys.argv[1])
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'twitter_normalized.json'

    if not archive_path.exists():
        print(f"Error: Path not found: {archive_path}")
        sys.exit(1)

    print(f"Parsing Twitter archive: {archive_path}")

    tweets = extract_tweets(archive_path)
    likes = extract_likes(archive_path)
    profile = extract_profile(archive_path)

    result = {
        'platform': 'twitter',
        'profile': profile,
        'items': tweets + likes,
        'stats': {
            'total_tweets': len([i for i in tweets if i['type'] == 'post']),
            'total_replies': len([i for i in tweets if i['type'] == 'reply']),
            'total_likes': len(likes)
        }
    }

    if tweets:
        dates = [i['timestamp'] for i in tweets if i['timestamp']]
        result['date_range'] = {
            'start': min(dates),
            'end': max(dates)
        }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Parsed {len(tweets)} tweets, {len(likes)} likes")
    print(f"Output saved to: {output_file}")


if __name__ == "__main__":
    main()
