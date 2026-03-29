---
title: "Modality Effect: Pair Visual Content With Audio Narration for Complex Instructions"
category: Cognitive Load
tags: [onboarding, accessibility, cognitive-load]
priority: niche
applies_when: "When creating video tutorials, interactive walkthroughs, or complex onboarding sequences that combine visual demonstrations with explanatory text."
---

## Principle
For complex instructional content that includes visuals, deliver explanatory text as audio narration rather than on-screen text to leverage dual processing channels.

## Why It Matters
The modality effect, a well-established finding from cognitive load theory, shows that people learn better when visual information (diagrams, animations, demonstrations) is paired with audio narration rather than with on-screen text. This is because the visual and auditory processing channels are partially independent — a diagram paired with narration distributes the load across both channels, while a diagram paired with on-screen text overloads the visual channel alone. In software interfaces, this principle is most relevant for tutorial videos, interactive guides, and complex onboarding sequences.

## Application Guidelines
- In video tutorials, narrate the explanation while showing the interface rather than displaying text overlays that compete with the visual demonstration
- For interactive walkthroughs, consider audio narration for complex multi-step processes where the user needs to watch the screen
- When audio is not feasible (public settings, accessibility requirements), use sequential presentation — show the visual first, then the text, rather than simultaneously
- Keep audio narration concise and synchronized with the visual content; pauses in narration should align with processing time for complex visuals
- Always provide text alternatives (captions, transcripts) for accessibility, but present them as optional rather than the primary channel

## Anti-Patterns
- Tutorial videos with on-screen text overlays that users must read while simultaneously watching a complex demonstration
- Interactive guides that display dense explanatory text alongside the interface element they're explaining
- Audio narration that is unsynchronized with or redundant to on-screen text (violates both the modality and redundancy principles)
- Relying solely on audio with no visual reference, underutilizing the visual channel
