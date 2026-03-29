---
title: White-Label and Theme Customization for B2B SaaS
category: Enterprise & B2B Patterns
tags: [enterprise, theming, settings, accessibility]
priority: niche
applies_when: "When B2B customers need to brand the application with their own logo, colors, and domain so it feels like an extension of their organization."
---

## Principle
Enable B2B customers to brand the application with their own logo, colors, and domain so that it feels like an extension of their organization rather than a third-party tool.

## Why It Matters
B2B SaaS products are often used by the customer's own clients, employees, or partners. If the product is visibly branded as a third-party tool, it can undermine the customer's brand perception and create confusion about who owns the experience. White-labeling allows customers to present a unified brand experience, which is frequently a requirement in enterprise sales and directly impacts deal size and customer retention.

## Application Guidelines
- Support logo replacement in the header, login screen, email templates, and exported documents
- Provide a color theme system driven by design tokens: customers set a primary brand color and the system generates a harmonious palette (hover states, active states, backgrounds)
- Allow custom domain mapping (app.customer.com) with customer-provided SSL certificates or automated certificate provisioning
- Support customizable email templates with the customer's branding for transactional notifications
- Provide a live preview of branding changes before they go live so customers can verify the result
- Maintain accessibility standards automatically: if a customer's brand color doesn't meet contrast requirements, adjust the generated palette and warn the customer
- Separate branding configuration from functional configuration so customers can update their brand without affecting application behavior

## Anti-Patterns
- Hardcoding the vendor's brand throughout the application with no customization capability, making it impossible for customers to present a unified experience
- Allowing custom CSS injection, which gives flexibility but creates a maintenance nightmare when the underlying UI changes
- Brand customization that only covers the login page while leaving the rest of the application in vendor branding
- Generating themes that violate accessibility contrast requirements because the customer's brand colors are not suitable for UI use
