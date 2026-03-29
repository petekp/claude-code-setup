---
title: Impersonation and Support View Mode
category: Enterprise & B2B Patterns
tags: [enterprise, permissions, trust]
priority: niche
applies_when: "When support staff and administrators need a secure, audited impersonation capability to see the application exactly as a specific user sees it."
---

## Principle
Provide a secure, audited impersonation capability that lets support staff and administrators view the application exactly as a specific user sees it, enabling efficient troubleshooting without requiring screen shares or credential sharing.

## Why It Matters
When a user reports "I can't see the button" or "the page looks wrong," support teams need to reproduce their exact experience. Without impersonation, this requires screen-sharing sessions, credential sharing (a security violation), or guesswork. Impersonation lets support staff instantly see the application through the user's eyes — with their permissions, data, settings, and configuration — dramatically reducing resolution time and improving support quality.

## Application Guidelines
- Display a prominent, unmistakable visual indicator during impersonation (e.g., a bright banner: "You are viewing as Jane Smith [End Impersonation]") that persists on every page
- Restrict impersonation to authorized support roles with explicit audit logging of every impersonation session (who impersonated whom, when, for how long)
- Default impersonation to read-only mode that prevents the support user from making changes on behalf of the impersonated user
- If write-mode impersonation is supported, require additional authorization and log every action taken
- Allow impersonated users to be notified that their account was accessed for support purposes, supporting transparency and compliance
- Provide quick impersonation access from the user management screen: a "View as User" button on each user record

## Anti-Patterns
- No impersonation capability, forcing support teams to ask users to share credentials or spend time on screen-sharing sessions
- Impersonation without audit logging, creating a security and compliance blind spot
- Impersonation mode that is visually indistinguishable from normal use, creating risk that support staff forget they're impersonating and take unintended actions
- Full read-write impersonation with no additional safeguards, where a support agent could accidentally modify the user's data
