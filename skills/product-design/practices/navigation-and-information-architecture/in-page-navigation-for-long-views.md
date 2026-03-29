---
title: In-Page Navigation for Long Single-Page Views
category: Navigation & Information Architecture
tags: [navigation, layout, scanning, progressive-disclosure]
priority: situational
applies_when: "When building a long single-page view with multiple sections (settings pages, documentation, record details) that needs anchor links or a sticky table of contents."
---

## Principle
Long single-page views with multiple sections must provide an in-page navigation mechanism (anchor links, sticky table of contents, or section jumps) so users can orient themselves and jump directly to the section they need.

## Why It Matters
Settings pages, documentation views, record detail pages, and configuration screens often contain 5-15 sections organized vertically on a single page. Without in-page navigation, users must scroll linearly through all preceding content to reach the section they need — a particular frustration for users who know exactly which section they want. In-page navigation transforms a long scroll into a direct-access structure, saving time for repeat visitors and providing orientation for first-time visitors.

## Application Guidelines
- Add a sticky sidebar or top-anchored section navigation that lists all sections on the page with clickable anchor links
- Highlight the currently visible section in the in-page navigation as the user scrolls (scroll-spy behavior) to maintain orientation
- Use smooth scrolling with a small offset when jumping to a section so the section header is clearly visible and not hidden behind a sticky header
- For pages with 10+ sections, group sections into categories in the in-page navigation to keep the navigation itself scannable
- Ensure anchor links update the URL hash so users can share direct links to specific sections

## Anti-Patterns
- Creating a 5000-pixel-tall settings page with no in-page navigation, requiring linear scrolling to find a specific setting
- Providing in-page navigation that does not highlight the current section during scrolling, removing the orientation benefit
- Using smooth-scroll animations that are so slow they add noticeable delay when jumping between sections
- Placing in-page navigation in a non-sticky position that scrolls away with the content, making it usable only at the top of the page
