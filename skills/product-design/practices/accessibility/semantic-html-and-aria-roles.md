---
title: Semantic HTML and ARIA Roles
category: Accessibility
tags: [navigation, form, modal, accessibility]
priority: core
applies_when: "When building any UI component and you need to use native semantic HTML elements as the foundation, supplementing with ARIA only when native semantics are insufficient."
---

## Principle
Use native semantic HTML elements as the foundation for all UI components, and supplement with ARIA roles and attributes only when native semantics are insufficient.

## Why It Matters
Screen readers, voice control software, and other assistive technologies rely on the semantic structure of the DOM to communicate page structure and element purpose to users. A `<button>` is automatically announced as a button, receives keyboard focus, and responds to Enter/Space — a `<div>` styled to look like a button provides none of this for free. Semantic HTML gives you accessibility, keyboard support, and correct behavior out of the box. ARIA is a powerful supplement but adds complexity and maintenance burden, and incorrect ARIA is often worse than no ARIA at all because it actively misleads assistive technology users.

## Application Guidelines
- Use native HTML elements whenever possible: `<button>` for actions, `<a>` for navigation, `<input>` for data entry, `<nav>` for navigation regions, `<main>` for primary content, `<header>`/`<footer>` for landmarks
- Use heading elements (`<h1>` through `<h6>`) in correct hierarchical order to create a navigable document outline
- When custom components require ARIA, follow the WAI-ARIA Authoring Practices patterns for the specific widget type (tabs, dialogs, menus, etc.)
- Apply ARIA landmark roles (`banner`, `navigation`, `main`, `complementary`, `contentinfo`) to page regions so screen reader users can jump between sections
- Use `aria-label`, `aria-labelledby`, and `aria-describedby` to provide accessible names and descriptions when visible text is insufficient
- Test with actual screen readers (VoiceOver, NVDA, JAWS) — automated tools catch only about 30% of accessibility issues

## Anti-Patterns
- Using `<div>` and `<span>` for everything and attempting to recreate button, link, and form behavior with JavaScript and ARIA
- Adding `role="button"` to a `<div>` without also implementing keyboard handling (Enter and Space to activate, focusable via tabindex)
- Using ARIA attributes that conflict with the native semantics of the element (e.g., `role="button"` on an `<a>` tag)
- Skipping heading levels (jumping from `<h1>` to `<h4>`), which creates a confusing document outline for screen reader navigation
