---
title: "Avoid the Redundancy Effect: Don't Duplicate What Users Already Know"
category: Cognitive Load
tags: [tooltip, data-viz, text, cognitive-load]
priority: niche
applies_when: "When reviewing whether labels, tooltips, or annotations duplicate information already communicated by another element on screen."
---

## Principle
Do not present the same information in multiple formats simultaneously when one format is sufficient for comprehension.

## Why It Matters
The redundancy effect, from cognitive load theory, demonstrates that presenting identical information through multiple channels (e.g., a diagram with redundant text description, or a label plus a tooltip that says the same thing) does not help — it actively harms processing. Users must cross-reference the duplicate sources to confirm they say the same thing, consuming working memory for zero informational gain. Each redundant element adds processing cost without adding understanding. This is counterintuitive, as many designers assume "more explanation = better understanding."

## Application Guidelines
- Choose the most effective single format for each piece of information: use a diagram OR text explanation, not both saying the same thing
- Eliminate help text that merely restates a clear label (e.g., a field labeled "Email Address" doesn't need a tooltip saying "Enter your email address")
- In data visualizations, let the visual encoding carry the message — don't add text annotations that repeat what the chart already shows
- When an icon's meaning is universally understood (e.g., a play button), don't add a redundant text label
- Reserve dual-channel presentation for genuinely complex information where two complementary (not identical) representations aid understanding

## Anti-Patterns
- Tooltips that repeat the exact text of the label they're attached to
- Simultaneously showing a data table and a chart that present identical data with no additional insight
- Reading aloud exactly what is written on screen in tutorial videos
- Adding "Click here to submit" text to a button already labeled "Submit"
