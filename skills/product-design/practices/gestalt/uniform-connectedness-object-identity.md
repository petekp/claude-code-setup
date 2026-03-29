---
title: "Uniform Connectedness: Use Visual Links to Define Object Identity"
category: Gestalt Principles
tags: [card, list, layout, gestalt]
priority: situational
applies_when: "When a logical object is composed of multiple sub-elements (avatar, name, timestamp, actions) and you need them to read as a single entity."
---

## Principle
Elements that belong to the same object should be connected by uniform visual properties — shared color, shared border, or explicit connecting lines — so the user perceives them as a single entity rather than independent parts.

## Why It Matters
In complex interfaces, a single logical object (a user card, a data record, a notification) is often composed of many visual sub-elements: an avatar, a name, a timestamp, action buttons. Without Uniform Connectedness, users must mentally assemble these parts, which slows comprehension and increases errors. A shared visual connector lets the brain pre-assemble the object instantly.

## Application Guidelines
- Enclose all parts of a logical object in a single container with a shared background color or border so they are perceived as one unit
- When explicit containers are not appropriate, use a shared color accent (e.g., a left border stripe) to connect the sub-elements visually
- For relationship indicators in data (e.g., parent-child, linked items), use explicit connecting lines or arrows rather than relying on spatial proximity alone
- Ensure the connecting visual property (border, background, line) is unique to that grouping — if every object on the page shares the same connector style, the cue loses its power

## Anti-Patterns
- Displaying the parts of a logical object (e.g., name, email, role) as ungrouped text with no visual container or connecting cue
- Using connecting lines so faintly that they are invisible at normal zoom or to users with low contrast sensitivity
- Connecting unrelated elements with the same visual treatment used for object identity, which falsely signals that they are parts of one thing
