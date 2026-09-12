#!/usr/bin/env python3
"""Reject temporary GitHub attachment URLs in raw PR description text."""

import argparse
import html
from pathlib import Path
import re
from urllib.parse import parse_qsl, urlsplit


URL_PATTERN = re.compile(r"https?://[^\s<>\"'`)\]]+", re.IGNORECASE)
SIGNED_KEYS = {"jwt", "token", "access_token", "expires", "signature", "sig"}
DELIVERY_HOSTS = {
    "private-user-images.githubusercontent.com",
    "camo.githubusercontent.com",
}


def attachment_problem(raw_url):
    try:
        url = urlsplit(html.unescape(raw_url))
    except ValueError:
        return None
    host = (url.hostname or "").lower()
    storage_host = host.endswith(".amazonaws.com") or host == "objects.githubusercontent.com"
    storage_asset = "github-production-user-asset-" in host or (
        storage_host and "github-production-user-asset-" in url.path
    )

    if host in DELIVERY_HOSTS or storage_asset:
        return "delivery or proxy URL; recover the original GitHub attachment link"

    is_attachment = url.path.startswith("/user-attachments/") or host == (
        "user-images.githubusercontent.com"
    )
    if not is_attachment:
        return None
    if url.scheme != "https" or url.username or url.password:
        return "attachment URL must use HTTPS without embedded credentials"
    keys = {key.lower() for key, _ in parse_qsl(url.query, keep_blank_values=True)}
    if any(
        key in SIGNED_KEYS or key.startswith(("x-amz-", "x-goog-"))
        for key in keys
    ):
        return "signed attachment URL can expire; use the original attachment link"
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("body_file", type=Path, help="Raw PR body or proposed Markdown")
    args = parser.parse_args()
    try:
        body = args.body_file.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        parser.error(str(error))

    failures = []
    for match in URL_PATTERN.finditer(body):
        problem = attachment_problem(match.group())
        if problem:
            line = body.count("\n", 0, match.start()) + 1
            failures.append((line, problem))
    if failures:
        for line, problem in failures:
            print(f"{args.body_file}:{line}: {problem}")
        print("Attachment URL check failed. Do not publish or hand off this body.")
        return 1

    print("No temporary GitHub attachment URLs found. Verify upload provenance and rendering separately.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
