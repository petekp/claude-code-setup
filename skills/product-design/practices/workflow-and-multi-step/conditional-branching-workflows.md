---
title: Conditional Branching in Workflows
category: Workflow & Multi-Step Processes
tags: [wizard, enterprise, settings, progressive-disclosure]
priority: situational
applies_when: "When a workflow needs dynamic paths that adapt based on user inputs, data conditions, or business rules so users only encounter relevant steps."
---

## Principle
Support dynamic workflow paths that adapt based on user inputs, data conditions, and business rules, so that users only encounter steps relevant to their specific situation rather than a one-size-fits-all linear process.

## Why It Matters
Real-world business processes aren't linear. An expense report over $5,000 requires VP approval; under that threshold, a manager suffices. A new hire in engineering needs IT equipment provisioning; a hire in sales doesn't. A loan application for a home buyer follows a different path than one for a refinance. Conditional branching makes workflows intelligent by routing users through only the steps that apply to them, reducing unnecessary work and ensuring the right process is followed for each situation.

## Application Guidelines
- Define branching conditions based on user inputs, data attributes, or computed values: "If amount > $5,000, add VP approval step"
- Show users only the steps that apply to their path — don't show skipped steps as disabled or struck-through, as this creates confusion about whether something was missed
- Update the step indicator dynamically when a branching decision is made: if the branch adds a step, the total step count should update
- Allow workflow administrators to configure branching rules through a visual rule builder, not code: "When [field] [operator] [value], then [add step / skip step / route to]"
- Log the path taken through the workflow in the audit trail so administrators can review which branches were triggered
- Provide a workflow visualization that shows all possible paths so administrators can understand the complete process map

## Anti-Patterns
- Forcing all users through every step of a workflow regardless of relevance, with "N/A" entries for inapplicable steps
- Conditional branches that are invisible to the user, causing confusion when the process is shorter or longer than expected
- Branching logic hardcoded in application code rather than configurable by business administrators
- Workflows that branch but provide no way for administrators to understand or modify the branching conditions
