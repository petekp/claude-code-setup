# Migration Charter

## Mission
Move the web app from legacy analytics events to the shared analytics client.

## Scope
- `packages/web`
- `packages/shared`
- docs and env wiring related to analytics

## Invariants
- Page view tracking must continue to work
- Signup conversion tracking must not disappear

## Non-Goals
- No redesign of analytics taxonomy

## Guardrails
- Delete replaced code in the same slice
- Record major decisions in DECISIONS.md
