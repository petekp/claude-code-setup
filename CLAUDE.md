- Never use IIFEs in React components.
- Always prefer easy-to-read code over clever code.
- Don't run the dev server unless there's a specific reason to do so. I typically run it myself outside Claude.
- Never add extraneous comments or comment markers to generated code. Code should be self-documenting.

## TypeScript

- Prefer `type` over `interface` unless extending or declaration merging is needed.
- No `!` non-null assertions without a comment explaining why it's safe.
- Prefer `unknown` over `any` and narrow with type guards.
- Use const assertions (`as const`) for literal types.

## React / Next.js

- Never use useEffect for derived state. Use useMemo instead.
- Always provide complete dependency arrays. Never disable exhaustive-deps without discussion.
- Prefer server components unless client interactivity is required.
- Use `"use client"` directive only at the component that needs it, not higher.
- Use forwardRef for components that wrap DOM elements.
- Always support className prop for composition with cn().

## Testing

- When implementing a feature, ask if I want tests before writing them.
- Prefer integration tests over unit tests for UI components.
- Test user behavior, not implementation details.

## Before Finishing

- Mention if lint/typecheck should be run to verify changes.
- Note any manual verification steps needed (browser testing, etc.).
