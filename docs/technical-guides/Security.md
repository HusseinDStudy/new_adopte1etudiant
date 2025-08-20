# Security Guide

This document outlines the security measures and best practices implemented in the `Adopte1Etudiant` application to protect user data and ensure the integrity of the platform.

---

## 1. Authentication and Session Management

Secure authentication is the first line of defense. Our approach is detailed in the **[Authentication Guide](./Authentication.md)**.

*   **Password Hashing**: User passwords are **never** stored in plaintext. We use the **`bcryptjs`** library to compute a strong, salted hash of user passwords before storing them in the database. This makes it computationally infeasible to reverse the original password even if the database were compromised.

*   **JSON Web Tokens (JWT)**:
    *   **Stateless and Signed**: JWTs are signed on the server using a strong secret key (`JWT_SECRET`), ensuring they cannot be tampered with by a client.
    *   **Short Expiration**: Tokens are issued with a short expiration time (e.g., 24 hours) to limit the window of opportunity for an attacker if a token is compromised.
    *   **Transmission**: All communication, including the transmission of JWTs, must be enforced over **HTTPS** in production to prevent man-in-the-middle attacks.

*   **Secure Token Storage (Frontend)**: Authentication uses **HTTP-only cookies** with the `secure` attribute in production to mitigate XSS risks on the browser side. Non-browser clients can use short-lived Bearer tokens in the `Authorization` header.

---

## 2. Authorization (Access Control)

Authorization is handled via **Role-Based Access Control (RBAC)**.

*   **Middleware Protection**: All sensitive API endpoints are protected by a chain of middleware (`authMiddleware`, `roleMiddleware`).
*   **Principle of Least Privilege**: The `roleMiddleware` ensures that users can only access the resources appropriate for their role (e.g., a `STUDENT` cannot post a job offer). The user's role is stored in the signed JWT, preventing client-side tampering.

---

## 3. Data Validation

All data sent from a client to the backend API is rigorously validated.

*   **Schema Validation**: We use schema validation libraries (like **Zod**) to define the expected shape, types, and constraints of incoming request bodies.
*   **Benefit**: This is a critical defense against a wide range of attacks, including NoSQL/SQL injection, and prevents malformed data from entering the system and causing unexpected errors. Any request with a payload that does not match the schema is immediately rejected with a `400 Bad Request` error.

---

## 4. Database Security

*   **SQL Injection Prevention**: We use the **Prisma ORM** for all database interactions. Prisma uses parameterized queries under the hood, which is the industry-standard method for preventing SQL injection attacks. Raw SQL queries are avoided entirely.

*   **Secrets Management**:
    *   **Development**: Sensitive credentials (database connection strings, API keys, JWT secrets) are stored in a `.env` file which is explicitly listed in `.gitignore` and **never** committed to version control.
    *   **Production**: In production environments like Render, these secrets are stored as secure **environment variables** managed through the hosting platform's dashboard.

---

## 5. Common Vulnerability Prevention (Frontend)

*   **Cross-Site Scripting (XSS)**:
    *   **React's Auto-Escaping**: React automatically escapes dynamic content rendered in JSX, which mitigates the most common XSS attack vectors.
    *   **`dangerouslySetInnerHTML`**: Use of this React property is forbidden as it bypasses React's built-in protections. Content should be rendered as text wherever possible.

*   **Cross-Site Request Forgery (CSRF)**:
    *   With HTTP-only cookies, enforce SameSite and CSRF protections (tokens or double-submit), and restrict CORS to trusted origins.

---

## 6. Dependency Management

*   **Vulnerability Scanning**: We use tools like **`npm audit`** and **GitHub Dependabot** to continuously scan our third-party dependencies for known security vulnerabilities. It is recommended to run `npm audit` regularly during development and as part of the CI/CD pipeline.
    ```bash
    npm audit
    npm audit fix # to automatically fix compatible vulnerabilities
    ```
*   **Policy**: When a critical vulnerability is detected, the affected package must be updated or patched immediately.

---

## 7. HTTPS Enforcement
In production, the entire application (both frontend and backend) **must** be served over HTTPS. This is typically configured at the hosting provider level (e.g., Render provides free SSL certificates). HTTPS encrypts all data in transit between the client and the server, protecting it from eavesdropping and tampering.

---

## 8. Abuse Prevention and Observability

*   **Rate Limiting**: Global limit (100 req/min) and specific limits for sensitive endpoints: login (10/min/IP), 2FA verification (6/10min/IP), registration (10/min/IP). Implemented via `@fastify/rate-limit` (see `apps/api/src/index.ts`, `apps/api/src/routes/auth.ts`).
*   **Tracing**: End-to-end request correlation via `X-Request-Id` header (frontend → backend), returned in the response.
*   **Monitoring Endpoints**: `/health` (status) and `/metrics` (admin; uptime/memory) exposed by the API.

---

## 9. Accessibility Measures

This section outlines the accessibility measures implemented in the "Adopte1Etudiant" application, leveraging a centralized design system and accessible UI primitives.

- **Centralized Theme and Design System**: The project utilizes `packages/ui-theme` for managing design tokens, including color contrast and spacing, and `packages/ui` for accessible UI primitives. This ensures consistent application of accessibility best practices across the user interface.
- **Accessible UI Primitives**: Components like `Button`, `Input`, `Select`, `Label`, `Dialog`, and `DropdownMenu` are built with accessibility in mind, ensuring proper `aria` attributes, keyboard navigation, and focus management.
- **Automated Tests**: Integration of `jest-axe` tests for accessibility within the automated testing suite:
  - `apps/web/src/pages/__tests__/*a11y.test.tsx`
  - `components/__tests__/a11y-smoke.test.tsx`
- **Best Practices**: Adherence to key accessibility practices:
  - Semantic HTML usage for proper structure.
  - ARIA roles to enhance semantic meaning where native HTML is insufficient.
  - Clear visual focus indicators for keyboard navigation.
  - Sufficient color contrast for readability, managed via the theme.
- **User Preferences**: Implementation of an "Accessibility button" in the header that opens a preferences dialog. This allows users to customize:
  - Text size
  - Reduced motion
  - Underlined links
  - Dyslexia-friendly spacing
  - Grayscale media
  These preferences persist and apply to the `<html>` element, ensuring SSR-safe application.
- **Compliance Targets**: Aiming for WCAG 2.2 AA and RGAA alignment.
- **Testing Approach**: Combination of automated smoke tests and manual keyboard navigation checks.
- **Further Details**: Refer to `docs/a11y-test-matrix.md` for a detailed feature-by-page accessibility coverage matrix.

## 10. Recommended Improvements

- Security: secret rotation, regular audits, stricter CSP
- Accessibility: periodic axe audits, color contrast, keyboard navigation 