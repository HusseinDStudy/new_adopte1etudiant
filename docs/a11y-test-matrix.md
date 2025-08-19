# Accessibility Test Matrix

This document provides a matrix of accessibility coverage across different features and pages of the Adopte1Etudiant application. It details the types of accessibility tests performed (automated, manual, screen reader) and their status.

## Purpose

To ensure comprehensive accessibility compliance (WCAG 2.2 AA and RGAA alignment) and provide a clear overview of accessibility testing efforts.

## Test Criteria & Standards

-   **WCAG 2.2 AA**: Web Content Accessibility Guidelines 2.2 Level AA
-   **RGAA**: Référentiel Général d'Amélioration de l'Accessibilité (French accessibility standard)
-   **Automated Tools**: `jest-axe`, Lighthouse CI
-   **Manual Checks**: Keyboard navigation, focus management, visual inspection
-   **Screen Reader Testing**: VoiceOver (macOS), NVDA (Windows), TalkBack (Android)

## Feature-by-Page Accessibility Coverage

| Feature/Page           | Automated Tests (`jest-axe`) | Manual Keyboard Navigation | Screen Reader Testing | Status   | Notes                                    |
| :--------------------- | :--------------------------- | :------------------------- | :-------------------- | :------- | :--------------------------------------- |
| **Authentication**     |                              |                            |                       |          |                                          |
| Login Page             | ✅ Covered                   | ✅ Covered                 | 🟡 Partial            | Ongoing  | Basic flow covered; need deeper review   |
| Registration Page      | ✅ Covered                   | ✅ Covered                 | 🟡 Partial            | Ongoing  | Basic flow covered; need deeper review   |
| Password Reset         | ❌ Not yet                   | ❌ Not yet                 | ❌ Not yet            | Pending  |                                          |
| 2FA Setup/Verification | ✅ Covered                   | ✅ Covered                 | ❌ Not yet            | Pending  | Basic flow covered; need screen reader   |
| **User Dashboard**     |                              |                            |                       |          |                                          |
| Student Dashboard      | 🟡 Partial                   | ✅ Covered                 | ❌ Not yet            | Pending  | Key metrics, offers, applications        |
| Company Dashboard      | 🟡 Partial                   | ✅ Covered                 | ❌ Not yet            | Pending  | Offers, applicants, messages             |
| **Profiles**           |                              |                            |                       |          |                                          |
| Student Profile        | ✅ Covered                   | ✅ Covered                 | 🟡 Partial            | Ongoing  | Form validation, CV upload, skills       |
| Company Profile        | 🟡 Partial                   | ✅ Covered                 | ❌ Not yet            | Pending  | Company details, contact info            |
| **Job Offers**         |                              |                            |                       |          |                                          |
| Offer Listing          | ✅ Covered                   | ✅ Covered                 | 🟡 Partial            | Ongoing  | Filters, pagination, cards               |
| Offer Detail Page      | 🟡 Partial                   | ✅ Covered                 | ❌ Not yet            | Pending  | Apply button, company info               |
| Create/Edit Offer      | ❌ Not yet                   | ❌ Not yet                 | ❌ Not yet            | Pending  | Complex form, rich text editor           |
| **Applications**       |                              |                            |                       |          |                                          |
| My Applications        | 🟡 Partial                   | ✅ Covered                 | ❌ Not yet            | Pending  | Status updates, view details             |
| Offer Applications     | 🟡 Partial                   | ✅ Covered                 | ❌ Not yet            | Pending  | Filtering, status updates                |
| **Messaging**          |                              |                            |                       |          |                                          |
| Conversations List     | ❌ Not yet                   | 🟡 Partial                 | ❌ Not yet            | Pending  | Basic navigation; focus issues           |
| Conversation View      | ❌ Not yet                   | 🟡 Partial                 | ❌ Not yet            | Pending  | Message input, scrollable area           |
| **Admin Panel**        |                              |                            |                       |          |                                          |
| User Management        | ❌ Not yet                   | ❌ Not yet                 | ❌ Not yet            | Pending  | Tables, filters, actions                 |
| Blog Management        | ❌ Not yet                   | ❌ Not yet                 | ❌ Not yet            | Pending  | Forms, content editor, media upload      |
| Analytics              | ❌ Not yet                   | ❌ Not yet                 | ❌ Not yet            | Pending  | Charts, data tables                      |
| **Blog System**        |                              |                            |                       |          |                                          |
| Blog Listing           | 🟡 Partial                   | ✅ Covered                 | ❌ Not yet            | Pending  | Filters, pagination                      |
| Blog Post Page         | ✅ Covered                   | ✅ Covered                 | 🟡 Partial            | Ongoing  | Content rendering, social share          |
| **Other Pages**        |                              |                            |                       |          |                                          |
| Home Page              | ✅ Covered                   | ✅ Covered                 | ✅ Covered            | Complete | Hero, sections, links                    |
| About Us               | ❌ Not yet                   | ✅ Covered                 | ❌ Not yet            | Pending  | Static content                           |
| Contact Us             | ❌ Not yet                   | 🟡 Partial                 | ❌ Not yet            | Pending  | Form fields, captcha                     |
| Legal Pages            | ❌ Not yet                   | ✅ Covered                 | ❌ Not yet            | Pending  | Static content (Mentions légales, RGPD)  |

## Glossary

-   **WCAG**: Web Content Accessibility Guidelines
-   **RGAA**: Référentiel Général d'Amélioration de l'Accessibilité
-   **`jest-axe`**: Accessibility testing library for Jest/Vitest

## Recommendations

- Prioritize completing manual and screen reader testing for critical user flows.
- Integrate `jest-axe` into all new components and pages.
- Regularly review and update this matrix as features evolve.
- Conduct periodic full accessibility audits.

---
