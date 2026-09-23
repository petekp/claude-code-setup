---
name: pr-screenshot-comparison
description: "Create clear, polished before-and-after screenshots from the actual running product for a GitHub pull request. Use when a UI change needs visual proof: capture matching product states, crop to the relevant UI, stitch and caption one comparison image, attach it natively to the PR, and keep the image out of the repository."
---

# PR Screenshot Comparison

Create a single, reviewer-friendly image that makes a visual UI change easy to evaluate.

## Product evidence rule

A PR screenshot is evidence of the product, not a design illustration. Every panel must come from the actual product route running the exact base or PR commit. It must use the real app shell, routing, authentication boundary, and data path.

A component harness, Storybook story, static reconstruction, fabricated destination page, or mock data screen does not qualify as product evidence. Do not attach one to a PR or describe it as an application screenshot.

If authentication or data blocks the route:

1. Start or reuse the project's canonical local environment.
2. Reuse an authenticated browser session when one is available. If sign-in needs the user, request the smallest necessary handoff.
3. If the actual route still cannot be reached, stop and report the blocker. A missing screenshot is more accurate than fabricated proof.

Build a harness only when the user explicitly asks for component-level evidence. Label it **Component harness** in the image and PR copy. Never mix it with or substitute it for product screenshots.

## Internal data policy

For a verified private or internal PR, use the actual product data on screen, including PHI. Do not replace names, records, or content with fake data solely for privacy. These screenshots are internal review artifacts.

Still exclude credentials, access tokens, passwords, API keys, and unrelated sensitive data. For a public or externally visible PR, minimize or redact sensitive data before capture.

## Capture and composition

1. Define the proof: exact base/head commits, product route, data, viewport in CSS pixels, browser zoom, theme, and required interaction states. List material changes; cover them or explicitly name exclusions in the PR caption. For a new central control, use **Before**, **After at rest**, **After activated**. Otherwise use **Before**, **After**.
2. Capture one settled state before taking the batch. Verify the served commit, loaded record, fonts, images, and scroll position. A ready server or completed navigation does not prove the content has settled. Keep menus, focus, pointer, and panels matched except for the interaction being demonstrated.
3. Save a lossless **full viewport** PNG through the selected browser tool. Record its actual pixel dimensions beside the CSS viewport dimensions. Derive the pixel-to-CSS scale from those values; do not assume that devicePixelRatio or a clipping API uses the same coordinate system. Inspect this first capture before repeating it. Reject unexpected scaling, blank margins, loading states, and clipped content at capture time.
4. Capture the other states using the same viewport, zoom, data, theme, and browser capture method on the exact commits. Use separate worktrees or a reversible clean checkout. Restore the PR checkout afterward and verify it is serving the PR code.
5. Crop from the saved originals, using the same CSS rectangle mapped to image pixels. Include the complete control, its open menu, and enough surrounding context to identify the change. Preserve edge padding; do not cut through labels, headings, menus, or callouts. If the union of these states is too wide to read in a PR, narrow the proof area or make a separate detail comparison instead of shrinking the whole screen.
6. Use [scripts/compose.py](scripts/compose.py) for the standard stacked comparison. It preserves screenshot pixels, validates dimensions and crop bounds, and renders consistent labels and captions. It produces the upload PNG and a review-size preview. Do not substitute an improvised stitching script for the standard layout. A different layout is appropriate when this one cannot show the change; retain the annotation rules below and explain the exception.
7. Inspect the preview, not just the full-resolution image. Inside Herdr, open the composed PNG in the terminal-browser split so Pete sees it before it is attached. Required labels and IDs must be readable without zooming. Check that all relevant states are complete, crops align, and annotations do not conceal evidence. If it fails, recapture or reframe before upload. Upscaling a small capture, sharpening it, or adding a caption does not recover lost evidence.
8. Attach only the inspected PNG, with the required upload authorization, using the attachment procedure below. Reload the PR and inspect the rendered image at its actual embedded size; a successful upload or nonzero image dimensions is not a visual check.

## Annotation standard

Keep annotations outside the product pixels. The compositor is the default visual style:

- Stack panels vertically so each uses the available review width. Use a 20 CSS px outer inset, 24 px between panels, and equal header heights. Align every label, caption, and screenshot to the same left edge.
- Use Arial regular/bold on macOS, DejaVu Sans regular/bold on Linux, or explicitly supply one equivalent sans-serif pair. Reuse the selected pair for the entire PR. Do not silently fall back to a bitmap font or vary typography per panel.
- State labels are 16 px bold; explanatory captions are 14 px regular with 20 px line spacing, at most two lines. Keep **Before** / **After** separate from the explanation. Put commit hashes and route details in PR prose, not in the image header.
- Use the compositor's light or dark neutral frame to suit the captured UI, consistently across panels. Keep text contrast at least 4.5:1. Never recolor the product capture or use red/green alone to communicate state.
- Explain the visible difference, not the implementation. Use parallel captions, such as “List ancestor” / “Customer ancestor”; omit captions that merely repeat the state label.
- Add numbered callouts only if captions leave the changed target ambiguous, usually no more than three. Use 20 px circular markers with 12 px bold numerals and 1.5 px leader lines, scaled with the screenshot. Keep the same number for the same target across panels. Place explanations in a consistent external legend; leaders must point precisely without crossing text or obscuring controls. The default compositor deliberately adds no overlays. If callouts are needed, retain its frame and typography rather than redesigning the image.

### Standard compositor

Requires Python 3 and Pillow in the available artifact environment. Do not install dependencies into the product repo. Store the capture manifest, images, and output outside Git. Paths in the manifest are relative to the manifest file or absolute.

```json
{
  "viewport": [1020, 971],
  "crop": [64, 6, 640, 172],
  "frame": "dark",
  "panels": [
    {"label": "Before", "caption": "List ancestor", "image": "before.png", "commit": "BASE_SHA", "route": "/appraisals/record-id"},
    {"label": "After at rest", "caption": "Customer ancestor; eyebrow retained", "image": "after.png", "commit": "HEAD_SHA", "route": "/appraisals/record-id"},
    {"label": "After activated", "caption": "Related records with IDs aligned right", "image": "open.png", "commit": "HEAD_SHA", "route": "/appraisals/record-id"}
  ]
}
```

`crop` is `[x, y, width, height]` in CSS pixels. Replace all example dimensions, identities, and captions with the measured capture facts. Use a relative route so separate local origins remain comparable.

```bash
python3 <skill-directory>/scripts/compose.py /tmp/comparison.json /tmp/comparison.png
```

The compositor rejects mismatched image sizes, nonuniform scale, downscaled captures, out-of-bounds crops, overlong captions, and crops wider than 680 CSS px. This width leaves room for the frame within a roughly 720 px review column. It preserves native image density in the upload PNG and writes a separate `-preview.png` for inspection. It cannot verify commit provenance, content readiness, privacy, or whether the crop shows the right controls; those require inspecting the actual product and both outputs.

## Rules

- Every product screenshot must come from the actual product route on the named commit. Do not fabricate UI, records, or destination pages.
- Do not use a harness as a fallback for blocked authentication or data. Use it only after an explicit request for component-level evidence, and label it clearly.
- Do **not** add the PNG to the repository, `.github/assets`, or the PR branch. It is PR context, not product source.
- Do **not** use a raw private-repository file URL for the PR image; it may not render for reviewers. Native GitHub attachments are the durable option.
- Do **not** leave capture harnesses, fixtures, Vite changes, or screenshot tooling in the branch. Confirm that `git diff <base>...HEAD` contains no image asset or capture code.
- Match viewport, zoom, theme, and component state. A comparison is invalid if those differ without being called out.
- Do not announce "dark mode" or "light mode" in PR copy, headings, image captions, or alt text just to identify the visible theme. Describe the change. Mention the theme only when theme-specific behavior is part of the change or the comparison depends on that distinction.

## Suggested PR copy

Use a short heading, then the image referenced by its local path, then one sentence:

```md
### Visual comparison

![Before and after: the hover state no longer clips the checkbox](./compare.png)

Before: [old behavior]. After: [new behavior].
```

Describe the meaningful visual difference in one sentence. Do not claim full visual coverage when the image covers only one state or theme.

## Attaching with gh

Before uploading, reusing, or repairing an image link, follow
[Keep GitHub attachment links permanent](../pr-description/references/attachment-links.md).
Keep the original upload URL from the editor or raw PR body, never a rendered
image's `src`, `currentSrc`, or a URL obtained after following redirects.

`gh pr create`, `gh pr edit`, and `gh pr comment` take `--attach '<file>#<alt text>'` (gh 2.99.0 or newer; check `gh --version`). gh uploads the file and rewrites a matching local path in the body to the hosted asset URL, keeping the alt text. With no body flag it appends the image to the end of the existing body instead.

To place the image under its heading, append the copy above to the current body and attach in the same command:

```bash
gh pr view <number> --json body --jq .body > "$TMPDIR/pr-body.md" || exit 1
cat >> "$TMPDIR/pr-body.md" <<'EOF'
<the PR copy above>
EOF
python3 "$HOME/.codex/skills/pr-description/scripts/check_attachment_urls.py" "$TMPDIR/pr-body.md" || exit 1
gh pr edit <number> --body-file "$TMPDIR/pr-body.md" --attach './compare.png#Before and after: ...' || exit 1
gh pr view <number> --json body --jq .body > "$TMPDIR/pr-body-saved.md" || exit 1
python3 "$HOME/.codex/skills/pr-description/scripts/check_attachment_urls.py" "$TMPDIR/pr-body-saved.md" || exit 1
```

The path in the body must match the path passed to `--attach`. The flag repeats for more files, up to 50 per command. Accepted formats: PNG, JPEG, GIF, WebP, SVG, MP4, MOV, WebM. Images are capped at 10 MB. Uploading needs write access to the repository, and GitHub Enterprise Server is not supported.

Fall back to the web editor only when gh is older than 2.99.0 or the repository is on GitHub Enterprise Server: drag the PNG into the description, save, and verify it renders.
