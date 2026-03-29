---
title: Habituation — Calibrate Alert Frequency to Maintain Urgency
category: Feedback & Error Handling
tags: [notification, error-handling, cognitive-load, trust]
priority: niche
applies_when: "When auditing alert and notification frequency to prevent alert fatigue, or designing tiered notification urgency for systems with high notification volume."
---

## Principle
Reduce alert frequency and reserve high-urgency presentation for genuinely critical events — repeated alerts at the same intensity train users to ignore all of them.

## Why It Matters
Habituation is a well-documented psychological phenomenon: when stimuli repeat without consequence, humans stop noticing them. In software, this manifests as "alert fatigue" — clinicians who see 300 drug interaction warnings per day click through them all, including the genuinely dangerous ones. Every unnecessary alert reduces the effectiveness of necessary ones. The cost of a false alarm is not zero; it is a small but cumulative tax on every future alert's credibility.

## Application Guidelines
- Audit existing alerts and eliminate those that are informational, redundant, or not actionable by the recipient
- Tier alert urgency: use inline indicators for low-severity, toasts for moderate, and modal interruptions only for critical events requiring immediate action
- Aggregate related alerts rather than firing one per occurrence: "12 items require review" rather than 12 individual notifications
- Allow users to customize alert thresholds and channels (email, push, in-app) based on their role and preferences
- Track alert dismissal rates — a high dismiss-without-action rate signals that the alert is not providing value and should be reconsidered
- When an alert genuinely requires action, differentiate it visually from routine notifications so it stands out against the baseline

## Anti-Patterns
- Showing a red-banner warning for every routine system event (new login, password expiration in 30 days, minor version update available) so that when a genuine security breach alert appears in the same style, users dismiss it reflexively
