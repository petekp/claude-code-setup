---
title: Status Color Consistency
category: Design Systems & Tokens
tags: [dashboard, table, theming, accessibility, consistency]
priority: core
applies_when: "When defining or auditing status colors and you need a single consistent color-to-meaning mapping across the entire application."
---

## Principle
Assign a single, consistent color to each status meaning across the entire application so that users can interpret status at a glance without reading labels, and never encounter the same color meaning different things in different contexts.

## Why It Matters
Color is one of the fastest visual processing channels — users perceive color before they read text. When status colors are consistent (green always means success/active, red always means error/critical, yellow always means warning/attention-needed), users build an instant visual vocabulary that lets them scan dashboards, tables, and lists at speed. When the same color means different things in different places, users must slow down and read every label, and they make errors based on incorrect color associations.

## Application Guidelines
- Define a fixed status color palette: green for success/active/healthy, red for error/critical/blocked, yellow/amber for warning/attention-needed, blue for informational/in-progress, gray for inactive/neutral/draft
- Document the palette in the design system with explicit rules about which statuses map to which colors, and enforce it in code reviews
- Never use red for non-error states (like a brand accent) or green for non-success states — these colors have strong learned associations
- Supplement color with icons, text labels, or patterns to ensure accessibility for color-blind users (approximately 8% of men)
- Use the same color values (not just similar hues) across all components: status badges, progress bars, alerts, table row highlights, chart series
- Define both light and dark mode variants of each status color that maintain the same semantic meaning and sufficient contrast

## Anti-Patterns
- Using red to mean "important" in one place and "error" in another, confusing users about severity
- Using arbitrary colors for statuses (purple for active, teal for error) that don't leverage universal color associations
- Relying on color alone to convey status without text labels or icons, excluding color-blind users
- Different teams or modules using different color palettes for the same status concepts, creating an inconsistent experience
