# Security Guide

This document outlines the security measures and best practices implemented in the "AdopteUnEtudiant" application to protect user data and ensure the integrity of the platform.

---

## 1. Authentication and Session Management

Secure authentication is the first line of defense. Our approach is detailed in the **[Authentication Guide](./Authentication.md)**.

*   **Password Hashing**: User passwords are **never** stored in plaintext. We use the **`bcryptjs`** library to compute a strong, salted hash of user passwords before storing them in the database. This makes it computationally infeasible to reverse the original password even if the database were compromised.

*   **JSON Web Tokens (JWT)**:
    *   **Stateless and Signed**: JWTs are signed on the server using a strong secret key (`JWT_SECRET`), ensuring they cannot be tampered with by a client.
    *   **Short Expiration**: Tokens are issued with a short expiration time (e.g., 24 hours) to limit the window of opportunity for an attacker if a token is compromised.
    *   **Transmission**: All communication, including the transmission of JWTs, must be enforced over **HTTPS** in production to prevent man-in-the-middle attacks.

*   **Secure Token Storage (Frontend)**: The JWT is stored in the browser's `localStorage`. While this is standard for SPAs, developers must be vigilant against Cross-Site Scripting (XSS) vulnerabilities, as a successful XSS attack could steal the token.

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
    *   Our JWT-based authentication, where the token is sent from `localStorage` in an `Authorization` header, is not inherently vulnerable to traditional CSRF attacks. CSRF relies on the browser automatically including credentials (like session cookies) with a cross-site request. Since we manually attach the token, this attack vector is mitigated.

---

## 6. Dependency Management

*   **Vulnerability Scanning**: We use tools like **`pnpm audit`** and **GitHub Dependabot** to continuously scan our third-party dependencies for known security vulnerabilities.
*   **Policy**: When a critical vulnerability is detected, the affected package must be updated or patched immediately.

---

## 7. HTTPS Enforcement

In production, the entire application (both frontend and backend) **must** be served over HTTPS. This is typically configured at the hosting provider level (e.g., Render provides free SSL certificates). HTTPS encrypts all data in transit between the client and the server, protecting it from eavesdropping and tampering. 