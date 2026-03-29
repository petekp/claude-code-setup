---
title: Error Messages — Plain Language with Constructive Solutions
category: Feedback & Error Handling
tags: [text, error-handling, accessibility, mental-model]
priority: core
applies_when: "When writing error messages for any user-facing flow and ensuring they are understandable, non-blaming, and actionable."
---

## Principle
Error messages should be written in plain, non-technical language that describes what happened from the user's perspective and suggests a constructive next step.

## Why It Matters
Technical error messages ("NullReferenceException in UserService.GetProfile()," "ECONNREFUSED," "422 Unprocessable Entity") are meaningless to most users and actively hostile to non-technical ones. They signal that the software was built for developers, not for the people using it. Plain-language errors reduce support tickets, enable self-service resolution, and prevent the fear and confusion that technical jargon creates. Every error message is an opportunity to help, not to blame.

## Application Guidelines
- Write error messages as if speaking to a smart friend who does not know your system's internals: "We could not save your changes because the file is too large" not "Error: MAX_UPLOAD_SIZE exceeded"
- Never blame the user: "That password is too short" rather than "Invalid password" — the latter implies the user did something wrong without explaining what
- Be specific about what failed and what to do: "Your credit card was declined. Please check the card number and expiration date, or try a different card."
- Avoid vague messages like "Invalid input," "An error occurred," or "Please try again" — each is an abdication of the design team's responsibility to be helpful
- Reserve technical details for expandable "More details" sections or error logs, not the primary message
- Test error messages with non-technical users to verify they are understandable and actionable

## Anti-Patterns
- Displaying raw exception messages, HTTP status codes, or stack traces to end users as the primary error message, requiring them to be software engineers to understand what went wrong in an application they are paying to use
