---
title: Descriptive Wizard Navigation Button Labels
category: Workflow & Multi-Step Processes
tags: [wizard, button, text, mental-model]
priority: situational
applies_when: "When labeling wizard navigation buttons with descriptive, action-oriented text instead of generic 'Next' and 'Back' to set user expectations."
---

## Principle
Label wizard navigation buttons with descriptive, action-oriented text that tells users what will happen next rather than using generic labels like "Next" and "Back."

## Why It Matters
Generic "Next" and "Back" buttons tell users nothing about where they're going or what the system will do. Descriptive labels like "Continue to Payment," "Review Your Selections," or "Save and Configure Notifications" set expectations, reduce anxiety about the unknown next step, and help users decide whether they're ready to proceed. This small change in labeling significantly reduces hesitation at step boundaries and makes the wizard feel guided rather than mechanical.

## Application Guidelines
- Replace "Next" with a label that describes the destination or action: "Continue to Billing Details" or "Save and Proceed to Review"
- Replace "Back" with context: "Return to Account Setup" or "Edit Previous Selections"
- Label the final step's action button with a definitive completion verb: "Submit Application," "Create Account," "Confirm and Deploy" — never just "Finish" or "Done"
- Include secondary information about consequences when relevant: "Submit for Review (cannot be edited after submission)"
- Keep labels concise (2-5 words) but specific enough to set clear expectations
- For steps with branching paths, adjust the forward button label to reflect the chosen path: "Continue with Standard Setup" or "Continue with Custom Configuration"

## Anti-Patterns
- Using generic "Next" / "Back" / "Finish" labels throughout the entire wizard, providing no information about upcoming steps
- Misleading labels that don't match the actual next step (labeling "Review" when the next step is actually more data entry)
- "Submit" as the final button label when the action is actually "Save as Draft" — the label must match the action precisely
- Long, multi-sentence button labels that are more like paragraphs than action triggers
