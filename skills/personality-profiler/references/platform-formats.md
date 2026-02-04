# Platform Data Export Formats

Detailed specifications for parsing social media data exports.

## Table of Contents

1. [Twitter/X](#twitterx)
2. [LinkedIn](#linkedin)
3. [Instagram](#instagram)
4. [Common Gotchas](#common-gotchas)

---

## Twitter/X

### Export Structure

Twitter exports come as a ZIP containing JavaScript files (not pure JSON).

```
twitter-archive/
├── data/
│   ├── account.js
│   ├── profile.js
│   ├── tweets.js
│   ├── like.js
│   ├── follower.js
│   ├── following.js
│   ├── direct-messages.js
│   └── ...
└── assets/
    └── (media files)
```

### File Format

Files use JavaScript variable assignment, not pure JSON:

```javascript
window.YTD.tweets.part0 = [
  {
    "tweet": {
      "id_str": "1234567890",
      "full_text": "Tweet content here",
      "created_at": "Wed Oct 10 20:19:24 +0000 2018",
      "favorite_count": "5",
      "retweet_count": "2",
      "in_reply_to_status_id_str": "1234567889",
      "entities": {
        "hashtags": [],
        "urls": [],
        "user_mentions": []
      }
    }
  }
]
```

### Parsing Strategy

```python
import json
import re

def parse_twitter_js(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the variable assignment prefix
    json_str = re.sub(r'^window\.YTD\.\w+\.part\d+ = ', '', content)
    return json.loads(json_str)
```

### Key Fields for Personality Analysis

| File | Fields | Use |
|------|--------|-----|
| `tweets.js` | `full_text`, `created_at`, `favorite_count` | Primary content |
| `profile.js` | `description.bio` | Self-description |
| `like.js` | `like.fullText` | Interest signals |

### Date Format

Twitter uses: `"Wed Oct 10 20:19:24 +0000 2018"`

Parse with: `datetime.strptime(date_str, "%a %b %d %H:%M:%S %z %Y")`

---

## LinkedIn

### Export Structure

LinkedIn exports as ZIP containing CSV files:

```
linkedin-export/
├── Profile.csv
├── Connections.csv
├── Messages.csv
├── Comments.csv
├── Shares.csv
├── Reactions.csv
├── Skills.csv
├── Positions.csv
├── Education.csv
└── ...
```

### File Format

Standard CSV with headers:

```csv
"Date","Share Link","Share Commentary"
"2024-01-15","https://linkedin.com/feed/...","My thoughts on this article..."
```

### Key Files for Personality Analysis

| File | Columns | Use |
|------|---------|-----|
| `Shares.csv` | `Share Commentary`, `Date` | Original content |
| `Comments.csv` | `Comment`, `Date` | Engagement style |
| `Profile.csv` | `Summary`, `Headline` | Self-presentation |
| `Positions.csv` | `Title`, `Company Name`, `Description` | Professional identity |
| `Skills.csv` | `Name` | Expertise claims |

### Parsing Strategy

```python
import csv
from datetime import datetime

def parse_linkedin_csv(file_path):
    items = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            items.append(row)
    return items
```

### Date Format

LinkedIn uses: `"2024-01-15"` (YYYY-MM-DD)

---

## Instagram

### Export Structure

Instagram exports as ZIP with JSON files:

```
instagram-export/
├── content/
│   ├── posts_1.json
│   ├── stories.json
│   └── reels.json
├── comments/
│   └── post_comments.json
├── likes/
│   └── liked_posts.json
├── followers_and_following/
│   ├── followers.json
│   └── following.json
├── personal_information/
│   └── personal_information.json
└── media/
    └── (photos/videos)
```

### File Format

Pure JSON with nested structure:

```json
[
  {
    "media": [
      {
        "uri": "media/posts/202401/photo.jpg",
        "creation_timestamp": 1705334400,
        "title": "Caption text here"
      }
    ]
  }
]
```

### Key Files for Personality Analysis

| File | Fields | Use |
|------|--------|-----|
| `content/posts_1.json` | `title` (caption), `creation_timestamp` | Primary content |
| `comments/post_comments.json` | Comment text | Engagement style |
| `personal_information/` | Bio, name | Self-presentation |

### Parsing Strategy

```python
import json
from datetime import datetime

def parse_instagram_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    items = []
    for post in data:
        for media in post.get('media', []):
            items.append({
                'content': media.get('title', ''),
                'timestamp': datetime.fromtimestamp(media['creation_timestamp']),
                'type': 'post'
            })
    return items
```

### Date Format

Instagram uses Unix timestamps: `1705334400`

Convert with: `datetime.fromtimestamp(timestamp)`

### Encoding Note

Instagram exports sometimes have UTF-8 encoding issues with emojis. Use:

```python
def fix_instagram_encoding(text):
    if text:
        return text.encode('latin1').decode('utf-8')
    return text
```

---

## Common Gotchas

### 1. Character Encoding

All platforms may have encoding issues. Always:
- Open files with `encoding='utf-8'`
- Handle `UnicodeDecodeError` gracefully
- Instagram specifically may need Latin-1 → UTF-8 conversion

### 2. Missing Fields

Fields may be absent rather than null:
```python
content = item.get('text', '') or item.get('full_text', '')
```

### 3. Media vs Text

Some posts are media-only (no text). Filter these:
```python
posts_with_text = [p for p in posts if p.get('content', '').strip()]
```

### 4. Timezone Handling

- Twitter: UTC with offset in string
- LinkedIn: No timezone (assume local)
- Instagram: UTC timestamps

Normalize all to UTC for consistent temporal analysis.

### 5. Thread/Reply Detection

| Platform | Reply Indicator |
|----------|-----------------|
| Twitter | `in_reply_to_status_id_str` is not null |
| LinkedIn | Check if `Comments.csv` |
| Instagram | Separate `comments/` directory |

### 6. Rate of Content

Typical volumes:
- Active Twitter: 1-10 tweets/day
- Active LinkedIn: 1-5 posts/week
- Active Instagram: 1-3 posts/week

Adjust confidence calculations based on data density.
