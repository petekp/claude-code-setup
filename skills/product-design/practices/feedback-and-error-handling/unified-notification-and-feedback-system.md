---
title: Unified Notification and Feedback System
category: Feedback & Error Handling
tags: [notification, accessibility, consistency, enterprise]
priority: situational
applies_when: "When building or consolidating a product-wide notification system to ensure all feedback (errors, warnings, successes, info) uses consistent patterns."
---

## Principle
All application feedback — errors, warnings, successes, and informational messages — should flow through a single, consistent notification system rather than ad hoc implementations scattered across features.

## Why It Matters
When each feature team builds its own notification mechanism, users encounter inconsistent placement, styling, behavior, and dismissal patterns across the same application. A success toast from the editor appears bottom-left while the upload confirmation appears top-right; one error auto-dismisses while another persists. This inconsistency forces users to relearn feedback patterns for each feature and erodes the predictability that makes software feel trustworthy. A unified system also reduces development cost and ensures accessibility standards are met uniformly.

## Application Guidelines
- Build a centralized notification service that all features call to display feedback — define a shared API with parameters for severity, message, duration, actions, and position
- Establish consistent visual patterns: all toasts look the same, all inline errors follow the same layout, all banners share the same structure
- Define clear rules for which notification type to use: toasts for transient confirmations, inline messages for field-level validation, banners for page-level alerts, modals for blocking confirmations
- Implement a global notification queue that prevents overlap and stacking — show one toast at a time and queue the rest
- Ensure the unified system handles accessibility (aria-live, focus management, keyboard dismissal) in one place rather than requiring each feature to implement it independently
- Support notification deduplication — if the same error fires 10 times in rapid succession, show it once with a count

## Anti-Patterns
- Having five different toast implementations across the application — each with different animation timing, positioning, z-index behavior, and accessibility support — because each feature team built their own without checking if a shared component existed
