# Design Critique Checklist

Quick-pass checklist for interface critique. Use for fast reviews; see PRINCIPLES.md for deep heuristics.

## Clarity

- [ ] Labels match outcomes (no ambiguity)
- [ ] Primary action obvious within 1 second
- [ ] Errors say what happened + how to fix
- [ ] Icons have labels (or are universally understood)
- [ ] No jargon or system-speak

## Hierarchy & Layout

- [ ] One clear focal point per screen/section
- [ ] Spacing uses consistent rhythm
- [ ] Alignment is intentional (no near-misses)
- [ ] Related items grouped (Gestalt proximity)
- [ ] Visual weight matches importance

## Interaction States

- [ ] Hover state exists and is visible
- [ ] Focus state exists and is visible (keyboard users)
- [ ] Active/pressed state provides feedback
- [ ] Disabled state is clear (not just grayed)
- [ ] Loading state exists with progress indication
- [ ] Error state is clear with recovery path
- [ ] Success state confirms completion

## Feedback

- [ ] Response is immediate (<100ms) or shows progress
- [ ] User knows what happened after every action
- [ ] Destructive actions have confirmation
- [ ] Errors don't blame the user
- [ ] Success messages are brief and helpful

## Accessibility

- [ ] Focus ring clearly visible on all interactive elements
- [ ] Tab order is logical
- [ ] Contrast >= 4.5:1 for text (7:1 for small text)
- [ ] Touch/click targets >= 44x44px
- [ ] Not relying on color alone for meaning
- [ ] Screen reader text for icon-only buttons
- [ ] Reduced motion alternative exists

## Typography

- [ ] Type hierarchy is clear (3-4 levels max)
- [ ] Body text is readable (16px+ on web)
- [ ] Line length is appropriate (45-75 characters)
- [ ] Line height supports readability

## Navigation

- [ ] User knows where they are
- [ ] User knows how to get back
- [ ] Navigation matches mental model
- [ ] Deep links work (if applicable)

## Mobile/Responsive

- [ ] Touch targets are adequately sized
- [ ] Critical actions are thumb-reachable
- [ ] Content reflows appropriately
- [ ] No horizontal scroll on content

## Performance Perception

- [ ] Skeleton screens for predictable layouts
- [ ] Progress indicators for long operations
- [ ] Optimistic updates where appropriate
- [ ] No layout shift during loading

## Edge Cases

- [ ] Empty states are helpful with clear CTA
- [ ] Error states guide recovery
- [ ] Long content handled gracefully
- [ ] Missing data handled gracefully

## The Final Test

- [ ] Would a new user understand this immediately?
- [ ] Does it feel inevitable, like it couldn't be any other way?
- [ ] Are we proud to ship this?
