---
title: Pause/Freeze Option for Live Data Streams
category: Dashboard Design
tags: [dashboard, real-time, button, cognitive-load]
priority: situational
applies_when: "When building a live-updating dashboard where auto-refreshing data shifts under users who need to read, analyze, copy, or screenshot a specific moment."
---

## Principle
Provide an explicit pause or freeze control on dashboards with auto-updating live data, so users can stop the stream to read, analyze, copy, or screenshot a specific moment without the data shifting under them.

## Why It Matters
Live-updating dashboards create a fundamental tension: the data needs to be current, but users also need to be able to read it. When numbers change every few seconds, users cannot finish reading a row, accurately compare two values, or select text to copy. The cognitive load of chasing moving targets leads to frustration and errors. A pause button gives users control over the update cycle — they can freeze the view, do their work, and resume live updates when ready. This transforms a stressful experience into a controlled one.

## Application Guidelines
- Place a **visible pause/play toggle** in the dashboard header, near the last-updated timestamp. Use a universally recognized pause icon (two vertical bars) and a play icon (triangle).
- When paused, display a **clear "Paused" indicator** — a banner, a dimmed overlay on the timestamp, or a colored border — so users never forget they are looking at a frozen snapshot.
- Show the **timestamp of the frozen state** prominently: "Data frozen at 09:42:15 AM — 3 minutes behind live."
- Include a **"Resume" or "Catch up to live"** button that immediately fetches current data and restores the auto-update cycle.
- Implement an **auto-resume timeout** (e.g., after 5 minutes of being paused) to prevent dashboards from being accidentally left frozen indefinitely. Warn the user before auto-resuming.
- Allow **row-level or panel-level freezing** in addition to full-dashboard freeze, so a user can pause one table to copy data while the rest of the dashboard continues updating.
- Continue fetching data in the background while paused, so that when the user resumes, the dashboard updates instantly rather than requiring a full reload.

## Anti-Patterns
- Live dashboards with no pause mechanism, forcing users to screenshot the browser to capture a moment in time.
- A pause button that stops data fetching entirely, causing a long delay and loading spinner when the user resumes.
- No visual indicator that the dashboard is paused, allowing users to make decisions on frozen data they believe is live.
- Pausing with no auto-resume safeguard, so a dashboard left paused overnight silently shows yesterday's data the next morning.
