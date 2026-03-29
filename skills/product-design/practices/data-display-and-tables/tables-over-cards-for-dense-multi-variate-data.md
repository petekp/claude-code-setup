---
title: Tables Over Cards for Dense Multi-Variate Data
category: Data Display & Tables
tags: [table, card, layout, data-density, scanning]
priority: situational
applies_when: "When choosing between a table and a card layout for a dataset with many comparable attributes per record where cross-record comparison is the primary task."
---

## Principle
Use tables instead of cards when displaying datasets with many comparable attributes per record, because tables enable column-aligned comparison that cards fundamentally cannot support.

## Why It Matters
Cards are popular in modern UI design and work well for visual content (products with images, profiles with photos, articles with thumbnails). But for multi-attribute data comparison — the core task in admin panels, CRMs, analytics tools, and enterprise software — cards are dramatically inferior to tables. Comparing a value across 20 cards means scanning 20 different spatial positions because the value sits at a slightly different pixel position on each card due to varying content above it. In a table, the same value is in the exact same column across all rows, enabling instant vertical scanning. This is not a stylistic preference; it is a cognitive reality.

## Application Guidelines
- Use **tables** when: records have 5+ comparable attributes, users need to compare values across records, sorting and filtering are important, or the data is primarily textual/numeric.
- Use **cards** when: records are primarily visual (images, thumbnails), records have highly variable content lengths, users browse rather than compare, or the display is optimized for mobile touch interaction.
- When in doubt, **default to tables** for professional and enterprise tools. Tables can be made visually appealing with proper typography, density controls, and clean alignment.
- If stakeholders request cards for aesthetic reasons, demonstrate the **comparison task failure**: ask them to find the record with the highest value for a specific attribute across 20 cards vs. 20 table rows. The table wins every time.
- Consider **hybrid approaches**: a table view as the default with a "Card view" toggle for users who prefer the card layout for browsing, or cards for the list view with a table inside expanded detail panels.
- When using cards, at minimum ensure **consistent internal layout** so that the same field appears at the same position within every card, mitigating the worst of the comparison problem.

## Anti-Patterns
- Using cards to display a list of records with 8+ comparable fields (price, date, status, owner, priority, category...) that users need to compare, forcing visual scanning across scattered positions.
- Choosing cards over tables for purely aesthetic reasons in a data-heavy enterprise application where comparison is the primary task.
- Card layouts where the internal structure varies per card (e.g., longer descriptions pushing fields to different positions), making systematic comparison impossible.
- Providing no table view alternative when users explicitly request one, prioritizing visual design over functional utility.
