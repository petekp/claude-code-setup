---
title: Respect prefers-reduced-motion
category: Accessibility
tags: [animation, accessibility]
priority: core
applies_when: "When the application uses animations or transitions and you need to honor the user's prefers-reduced-motion OS setting."
---

## Principle
When a user has enabled the "reduce motion" setting in their operating system, the application must honor that preference by minimizing or eliminating animations and transitions.

## Why It Matters
Motion and animation in interfaces can trigger vestibular disorders, migraines, seizures, and nausea in susceptible users. The `prefers-reduced-motion` media query exists because this is a genuine medical accessibility need, not a preference. Approximately 35% of adults over 40 experience some form of vestibular dysfunction. Animations that feel delightful to most users can be physically painful or disorienting for these users. Respecting this OS-level preference is both a WCAG 2.3.3 requirement and a basic respect for user autonomy.

## Application Guidelines
- Use the `prefers-reduced-motion: reduce` media query to conditionally disable or minimize animations throughout the application
- Replace slide, bounce, and zoom transitions with instant state changes or simple opacity fades (fades are generally tolerable)
- Disable auto-playing animations, parallax scrolling, and animated backgrounds when reduced motion is preferred
- Keep functional animations that communicate state changes (a checkbox filling in, a toggle sliding) but make them instant or near-instant rather than animated
- For loading states, use a static spinner or progress bar rather than complex animated illustrations
- Provide an in-app motion preference toggle in addition to respecting the OS setting, giving users control even on shared or unmanaged devices
- Test your application with `prefers-reduced-motion` enabled to verify that the experience is still complete and functional without animations

## Anti-Patterns
- Ignoring the `prefers-reduced-motion` setting entirely and playing all animations regardless of user preference
- Large-scale page transitions (slide-in screens, zoom effects) that cannot be disabled and trigger vestibular responses
- Auto-playing video backgrounds or animated hero sections with no way to pause or disable them
- Reducing motion on some components but forgetting others, creating an inconsistent experience where some animations still trigger symptoms
