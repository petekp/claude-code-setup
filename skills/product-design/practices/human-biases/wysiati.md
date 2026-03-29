---
title: WYSIATI — What You See Is All There Is
category: Human Biases in Interfaces
tags: [search, dashboard, empty-state, trust]
priority: niche
applies_when: "When displaying filtered data, truncated lists, or partial results where users might mistake a subset for the complete picture."
---

## Principle
Users build their understanding and make decisions based solely on the information currently visible to them — they do not spontaneously consider what might be missing from the picture.

## Why It Matters
When an interface shows three options, users treat those as all the options. When a dashboard shows five metrics, users assume those capture the full story. People do not naturally ask "what am I not seeing?" — they construct a coherent narrative from available information and act on it with full confidence. This means what you choose to display (and omit) in an interface directly shapes the quality of user decisions. Incomplete data presented cleanly feels more trustworthy than complete data presented messily.

## Application Guidelines
- When displaying data subsets, explicitly label what is included and what is excluded ("Showing results from last 30 days — view all time")
- Surface the existence of hidden information: filter counts ("3 of 12 shown"), collapsed sections ("4 more options"), truncation indicators
- In decision-support interfaces, explicitly flag when data is incomplete or when relevant factors are not represented
- Design empty and zero states that communicate absence rather than letting users assume nothing exists
- When users apply filters, show a persistent indicator of active filters so they remember their view is narrowed

## Anti-Patterns
- Truncating lists without indicating more items exist
- Showing filtered views without visible filter indicators, letting users mistake a subset for the whole
- Presenting partial analytics without date ranges or data-completeness indicators
- Hiding important caveats or limitations in footnotes or tooltips that most users will never see
