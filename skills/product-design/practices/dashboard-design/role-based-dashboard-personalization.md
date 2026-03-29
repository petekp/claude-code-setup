---
title: Role-Based Dashboard Personalization
category: Dashboard Design
tags: [dashboard, settings, permissions, enterprise, mental-model]
priority: situational
applies_when: "When a dashboard serves multiple roles (e.g., support lead, engineering manager, CFO) who need fundamentally different default KPIs, layouts, and filters."
---

## Principle
Automatically tailor dashboard content, layout, and default filters based on the user's role, so each persona sees the most relevant view without manual configuration.

## Why It Matters
A support lead, an engineering manager, and a CFO all looking at "the dashboard" need fundamentally different information. The support lead needs ticket volume and SLA compliance. The engineering manager needs deployment frequency and error rates. The CFO needs revenue and cost trends. Showing everyone the same default view means most users see mostly irrelevant data and must customize their way to usefulness — which most will never do. Role-based personalization does this work automatically, delivering immediate value on first login and reducing the distance between opening the dashboard and getting an answer.

## Application Guidelines
- Define **3-5 core roles** that represent your primary user personas. Map each role to a curated set of KPIs, visualizations, default filters, and layout configurations.
- Auto-assign the role-based view on **first login** based on the user's role in the identity provider, team membership, or a simple onboarding question ("What best describes your role?").
- Allow users to **switch between role views** if they need to see another perspective. A manager who also does technical work should be able to toggle between the management and engineering views.
- Treat role-based defaults as a **starting point, not a cage**. Users should be able to customize their role view further, and those customizations should persist alongside the role defaults.
- Update role-based configurations as the **product and organizational needs evolve**. Review with representatives from each role quarterly to ensure the defaults still match their daily questions.
- Show role-relevant **terminology and labels**. The same metric might be "MRR" for a finance user and "Monthly Subscription Revenue" for a product manager. Adapt language to the audience.
- Use role information to control **data access scope**: a regional manager sees their region by default, while a VP sees the global view. This is both a UX improvement and a data governance practice.

## Anti-Patterns
- A single dashboard for all roles with instructions to "customize it to your needs" — most users will not and will suffer a noisy, irrelevant default view.
- Role detection that is too granular (50 roles with 50 views), creating an unmaintainable configuration matrix that quickly drifts out of date.
- Locking users into their role view with no way to see other perspectives, preventing cross-functional understanding.
- Assigning roles permanently with no way for users to update their role when they change positions or responsibilities.
