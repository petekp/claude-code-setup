# Keep GitHub attachment links permanent

Read this before creating, rewriting, or repairing a PR description containing
image or video attachments. Apply the checks on every body rewrite, not only
when first uploading an image.

## Save the original attachment URL

- Use the attachment URL produced by GitHub's upload flow and inserted into
  the editor or raw PR body. Current uploads commonly use
  `https://github.com/user-attachments/assets/<asset-id>`.
- Preserve that URL unchanged in later description edits. Keep the local media
  file until the saved PR body and rendering are verified.
- Never replace it with a rendered image's `src` or `currentSrc`, a network
  request URL, a download URL after redirects, or a temporary upload endpoint.
  GitHub can deliver a private attachment through an expiring authenticated URL
  while the original attachment link remains stable.
- Reject delivery/proxy URLs such as `private-user-images.githubusercontent.com`,
  `camo.githubusercontent.com`, or GitHub user-asset storage URLs. Reject signed
  attachment URLs containing `jwt`, `token`, `X-Amz-*`, or similar credentials.
  An image loading now does not prove its stored URL is permanent.

## Check before and after saving

Run the shared check against the proposed body before sending it to GitHub:

```bash
python3 "$HOME/.codex/skills/pr-description/scripts/check_attachment_urls.py" "$TMPDIR/pr-body.md" || exit 1
```

After the authorized create/edit/upload, fetch the raw stored Markdown and
check it again. Supply the actual PR number and repository:

```bash
gh pr view <number> --repo <owner/repo> --json body --jq .body > "$TMPDIR/pr-body-saved.md" || exit 1
python3 "$HOME/.codex/skills/pr-description/scripts/check_attachment_urls.py" "$TMPDIR/pr-body-saved.md" || exit 1
```

The script checks known GitHub delivery hosts and signed attachment URLs. It
does not prove that a file exists, is accessible, or renders. Confirm that every
expected attachment is still present with its original URL. Then check the
rendered PR with the `gh` CLI, not a browser:

```bash
gh api repos/<owner/repo>/pulls/<number> -H "Accept: application/vnd.github.html+json" --jq .body_html > "$TMPDIR/pr-body.html" || exit 1
```

Download each rendered `<img>` `src` from that HTML, confirm it opens as an
image with the uploaded file's dimensions, and read it back to inspect it.
Those `src` values are expiring delivery URLs. Never copy one back into the
description.

If the check fails, stop before publishing or claiming completion. Recover the
canonical URL from the upload result, editor Markdown, or a saved raw body.
Do not guess an asset ID or strip credentials from a storage URL to invent a
permanent link. If the original URL cannot be recovered, re-upload the original
local file through the authorized GitHub attachment flow and verify again.
