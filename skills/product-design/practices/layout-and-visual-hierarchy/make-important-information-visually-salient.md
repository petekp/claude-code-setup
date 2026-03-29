---
title: Make Important Information Visually Salient
category: Layout & Visual Hierarchy
tags: [layout, dashboard, button, scanning]
priority: core
applies_when: "When designing any screen and the most important element needs to be the most visually prominent through size, contrast, or position."
---

## Principle
The most critical information on any screen must be the most visually prominent, achieved through size, color, contrast, position, or isolation — never left for the user to hunt for.

## Why It Matters
Users form first impressions of a screen in under 500 milliseconds. During this pre-attentive phase, the brain registers size, color, and spatial position before reading any text. If the most important information (a critical alert, a key metric, the primary action) does not win this initial visual competition, users may overlook it entirely or waste significant time locating it. Salience is not about making things "pop" aesthetically — it is about ensuring the information architecture matches the user's task priority.

## Application Guidelines
- Identify the single most important piece of information per screen and ensure it has the highest visual weight (largest size, strongest contrast, or most prominent position)
- Use color strategically: reserve saturated or warm colors (red, orange, blue) for elements requiring attention and use neutral tones for everything else
- Place critical information in the top-left quadrant of the page or above the fold on smaller viewports — this is where eyes land first in left-to-right reading cultures
- Use whitespace to isolate important elements — surrounded by empty space, even small elements gain salience
- For dashboards, size the most important metric 2-3x larger than supporting metrics rather than presenting all metrics at equal size

## Anti-Patterns
- Presenting all data at the same visual weight — flat tables of same-sized, same-colored text where nothing stands out
- Burying critical alerts or errors in a secondary location (a collapsed panel, a badge on a tab) while non-urgent information dominates the viewport
- Using the same red color for errors, required field indicators, and decorative accents — diluting the signal that red is supposed to carry
- Making the primary CTA the same size and color as secondary actions, forcing users to read every button label to find what they need
