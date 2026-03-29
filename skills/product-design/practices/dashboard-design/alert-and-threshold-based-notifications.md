---
title: Alert and Threshold-Based Notifications
category: Dashboard Design
tags: [dashboard, notification, real-time, feedback-loop]
priority: situational
applies_when: "When building a monitoring dashboard that needs to actively notify users when metrics breach defined thresholds rather than relying on human vigilance."
---

## Principle
Define meaningful thresholds for every key metric and surface clear, prioritized alerts when values breach those thresholds, so users are notified of problems without having to continuously watch the dashboard.

## Why It Matters
No one stares at a dashboard all day. Even NOC operators monitoring critical systems look away, switch tabs, and attend meetings. Threshold-based alerts bridge the gap between "the dashboard shows a problem" and "the user knows about the problem." Without alerts, dashboards are passive displays that depend on human vigilance — an unreliable strategy. With well-calibrated alerts, dashboards become active monitoring systems that pull the user's attention only when it is needed, reducing both response times and cognitive fatigue from constant watching.

## Application Guidelines
- Define **three severity levels** for each metric: warning (approaching threshold — investigate soon), critical (threshold breached — act now), and informational (notable change — be aware). Map each level to distinct visual and notification treatments.
- Display **in-dashboard alert indicators** — colored borders, status icons, or banner bars — that make the alert visible when the user is on the dashboard. Pair these with **external notifications** (email, Slack, PagerDuty) for when the user is not watching.
- Allow users to **configure thresholds** per metric rather than relying on developer-set defaults. What constitutes "critical" varies by team, season, and business context.
- Show **alert history** so users can see when thresholds were breached and resolved, supporting post-incident review and trend analysis.
- Include **alert context** — not just "CPU > 90%" but also "CPU has been above 90% for 15 minutes" and "Last time this happened: Feb 12, caused by deploy #1247."
- Implement **alert suppression and snoozing** to prevent alert fatigue. If a metric is known to spike during deployments, users should be able to silence alerts for a defined window.
- Group related alerts to avoid **alert storms** — if 20 services fail because a database is down, surface one root-cause alert, not 20 symptom alerts.

## Anti-Patterns
- Setting thresholds too aggressively so that alerts fire constantly, training users to ignore them (the "boy who cried wolf" effect).
- Having no thresholds at all, relying entirely on users to notice when a number on the dashboard looks wrong.
- Firing alerts with no context or actionable information — "Error rate is high" without saying what the error rate is, what the threshold is, or what to do about it.
- Using the same severity level for all alerts, making it impossible for users to triage and prioritize their response.
