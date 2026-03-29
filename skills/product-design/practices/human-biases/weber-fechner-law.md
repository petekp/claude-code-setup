---
title: Weber-Fechner Law
category: Human Biases in Interfaces
tags: [loading, data-viz, performance]
priority: niche
applies_when: "When communicating performance improvements, designing slider controls for large ranges, or calibrating progress bars where perception follows a logarithmic curve."
---

## Principle
Users perceive changes in proportion to the current magnitude — a small change to a small value is noticeable, but the same absolute change to a large value is imperceptible, following a logarithmic rather than linear perception curve.

## Why It Matters
A 100ms improvement in a 200ms load time feels dramatic, but a 100ms improvement in a 5-second load time feels negligible. A $5 discount on a $15 product feels generous, but a $5 discount on a $500 product feels insulting. Users do not evaluate changes in absolute terms — they evaluate them relative to the starting point. This has profound implications for performance optimization, pricing strategy, and progress communication. Improvements must be proportional to the current state to be perceived as meaningful.

## Application Guidelines
- When communicating performance improvements, express them as percentages relative to the baseline rather than absolute values when the absolute numbers are not intuitively meaningful
- In progress indicators, use logarithmic or perception-adjusted scaling so that early progress (where small changes are noticeable) and late progress (where they are not) both feel proportionally represented
- For pricing changes and discounts, calibrate the discount to be noticeable relative to the base price — the just-noticeable difference is roughly proportional
- In slider controls and input ranges that span large value ranges, use logarithmic scaling so that fine-grained control is available at the low end where sensitivity is highest
- When optimizing performance, focus on improvements that cross perceptual thresholds rather than making uniform improvements across the board

## Anti-Patterns
- Using linear progress bars for processes where most time is spent in the last 10%, making early progress feel fast and late progress feel stalled
- Advertising absolute performance improvements ("500ms faster!") when users cannot perceive that difference in context
- Using linear sliders for values spanning multiple orders of magnitude (e.g., volume, brightness, price ranges), making fine-grained control impossible at low values
- Presenting discount amounts that are below the just-noticeable difference for the product's price range
