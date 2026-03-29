---
title: Mobile-Aware Layouts for Field Workers
category: Enterprise & B2B Patterns
tags: [mobile, enterprise, form, responsive]
priority: niche
applies_when: "When field workers use the enterprise application on phones in challenging conditions — one-handed, in sunlight, with intermittent connectivity."
---

## Principle
Design purpose-built mobile experiences for field workers that prioritize their specific tasks, environmental constraints, and connectivity limitations rather than shrinking the desktop interface.

## Why It Matters
Field workers — inspectors, delivery drivers, sales reps, maintenance technicians, healthcare workers — use enterprise software in fundamentally different conditions than office workers: on phones, often one-handed, in bright sunlight, with intermittent connectivity, and with time pressure. A responsive desktop layout squeezed onto a phone screen fails these users. They need a separate, task-focused mobile experience that surfaces exactly what they need in the field and gracefully handles offline scenarios.

## Application Guidelines
- Identify the top 3-5 tasks field workers perform on mobile and design the mobile experience around those tasks exclusively — don't try to replicate the full desktop on mobile
- Design for one-handed use with thumb-reachable interaction zones and large touch targets (minimum 44px)
- Support offline-first workflows: allow data entry, form completion, and photo capture offline with automatic sync when connectivity returns
- Use high-contrast, large-text designs that are readable in direct sunlight and at arm's length
- Minimize text input: use dropdowns, toggles, photo capture, barcode scanning, and voice input rather than keyboard-heavy forms
- Show clear sync status indicators so field workers know whether their data has been uploaded: "Last synced: 5 minutes ago" or "3 items pending upload"
- Support camera-based input for common field tasks: photo documentation, barcode/QR scanning, document capture

## Anti-Patterns
- Responsively shrinking the full desktop interface to mobile, creating a cluttered, unusable experience that requires constant scrolling and zooming
- Requiring constant network connectivity for field operations that happen in areas with poor signal
- Using small form fields and precise interactions designed for mouse and keyboard on a touchscreen device
- Ignoring environmental factors: low contrast text unreadable in sunlight, small buttons unusable with gloves, no consideration for one-handed operation
