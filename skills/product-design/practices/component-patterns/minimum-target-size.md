---
title: Minimum Target Size — 44x44px
category: Component Patterns
tags: [button, accessibility, mobile, fitts-law]
priority: core
applies_when: "When sizing interactive elements (buttons, links, checkboxes, icons) and ensuring they meet the 44x44px minimum touch/click target."
---

## Principle
All interactive elements must have a minimum touch/click target size of 44x44 CSS pixels to ensure reliable activation across input methods and user abilities.

## Why It Matters
Small tap targets are one of the most common causes of user frustration, accidental taps, and accessibility failures. Apple's Human Interface Guidelines and WCAG 2.5.5 both specify minimum target sizes for good reason: human fingers vary in size, motor precision varies by user and context (moving vehicle, one-handed use), and cursor precision varies by input device. A button that is technically visible but practically untappable is a design defect. This is especially critical on mobile but applies equally to desktop interfaces used by people with motor impairments.

## Application Guidelines
- Set a minimum interactive area of 44x44px for all buttons, links, checkboxes, radio buttons, toggles, and other tappable elements
- When the visual element must be smaller than 44px (e.g., an icon button), expand the tappable area with invisible padding so the hit target still meets the minimum
- Maintain at least 8px of spacing between adjacent interactive targets to prevent accidental activation of the wrong element
- For inline text links within paragraphs, ensure the line height provides sufficient vertical target area
- Test touch targets on actual devices, not just in browser dev tools — emulators do not replicate the imprecision of real finger taps
- In data-dense views (tables, lists), ensure row actions are reachable without requiring precise taps on tiny icons
- Consider larger targets (48x48px+) for primary actions and destructive actions where mis-taps are especially costly

## Anti-Patterns
- Icon buttons that are 24x24px with no expanded hit area, requiring precise cursor placement to activate
- Table row action icons (edit, delete) crammed into a narrow column with only a few pixels between them
- Checkboxes that only respond to clicks on the tiny checkbox graphic, not on the associated label text
- Close buttons (X) in modal corners that are 16x16px, causing users to miss and click behind the modal instead
