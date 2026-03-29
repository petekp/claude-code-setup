---
title: Inline Tooltips and Contextual Help for Admin UIs
category: Enterprise & B2B Patterns
tags: [tooltip, settings, enterprise, error-handling]
priority: situational
applies_when: "When building admin configuration screens where misconfiguration has high blast radius and administrators need inline guidance about impact and valid values."
---

## Principle
Embed explanatory tooltips, inline descriptions, and contextual guidance directly into admin interfaces so administrators can understand the impact of configuration changes without consulting external documentation.

## Why It Matters
Admin configuration screens are where mistakes have the highest blast radius — a misconfigured permission can lock out users, a wrong integration setting can break data flows, a misunderstood toggle can expose sensitive data. Administrators need to understand not just what a setting does but what happens when they change it, who it affects, and whether it's reversible. Inline contextual help reduces misconfiguration by delivering this understanding at the exact point of decision.

## Application Guidelines
- Add a small help icon (?) next to every non-obvious setting that, when hovered or clicked, shows a tooltip explaining the setting's purpose, valid values, and impact
- Include inline description text below complex settings: "When enabled, users will be required to re-authenticate every 30 days. This applies to all active sessions."
- Show impact warnings for high-consequence settings: "Changing this will immediately log out all currently active users" in a warning color
- Provide "Learn more" links that open a focused documentation panel within the admin UI rather than navigating to an external site
- Display current-state indicators that show the real-time effect of a setting: "Currently: 47 users affected by this policy"
- Include example values and valid ranges for configuration inputs: "Enter a duration in seconds (60-86400). Default: 3600"

## Anti-Patterns
- Admin settings screens with bare labels and no explanation, forcing admins to guess or research externally
- Tooltips that restate the label ("Session Timeout: Sets the session timeout") without adding useful context
- Help content that uses developer jargon or references internal implementation details rather than explaining user-facing impact
- Embedding long paragraphs of help text inline that clutter the interface for experienced admins who don't need guidance
