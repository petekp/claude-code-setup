---
title: Comprehensive Keyboard Shortcut System
category: Desktop-Specific Patterns
tags: [toolbar, navigation, keyboard, accessibility]
priority: situational
applies_when: "When building a desktop application where power users need keyboard shortcuts for frequent actions and you need a discoverable, customizable shortcut system."
---

## Principle
Provide a complete, discoverable, and customizable keyboard shortcut system that lets power users perform every frequent action without reaching for the mouse.

## Why It Matters
Expert users spend hours each day in desktop applications. Every mouse movement to a toolbar button or menu item interrupts flow and costs seconds that compound into hours over weeks. A well-designed keyboard shortcut system is the single highest-leverage investment for power-user efficiency. It also improves accessibility for users who cannot use a mouse.

## Application Guidelines
- Follow platform conventions first: Cmd+S (save), Cmd+Z (undo), Cmd+C/V/X (clipboard) must behave as expected — never repurpose standard shortcuts
- Provide a shortcut palette or cheat sheet accessible via a single keystroke (e.g., Cmd+/ or ?) that shows all available shortcuts in context
- Use mnemonic key assignments (e.g., Cmd+B for bold, Cmd+K for link) and group related actions on adjacent keys
- Display keyboard shortcuts inline next to menu items, toolbar tooltips, and command palette entries so users learn them passively
- Support customizable key bindings for advanced users and accessibility needs
- Implement a command palette (Cmd+K or Cmd+Shift+P) as an alternative discovery and execution surface for all commands

## Anti-Patterns
- Overriding browser or OS-level shortcuts (e.g., hijacking Cmd+W, Cmd+T, or F5) — this violates user expectations and causes data loss
- Assigning shortcuts only to toolbar actions while leaving high-frequency workflow actions (like "assign to me" or "mark as reviewed") without keyboard access
- Providing shortcuts with no way to discover them — users won't memorize a shortcut they've never seen
- Using obscure multi-modifier combinations (Ctrl+Alt+Shift+F7) that are impossible to remember and painful to execute
