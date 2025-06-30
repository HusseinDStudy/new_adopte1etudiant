# Security Measures

This document outlines the security measures implemented in the AdopteUnEtudiant platform to protect user data and prevent common vulnerabilities. Our approach is aligned with best practices and aims to address the threats identified in the OWASP Top 10.

---

### 1. **Injection** (A03:2021)

-   **Description**: Injection flaws, such as SQL injection, occur when untrusted data is sent to an interpreter as part of a command or query.
-   **Our Mitigation**:
    -   We use **Prisma ORM** for all database interactions. Prisma provides a type-safe database client that automatically generates parameterized queries. This design feature effectively eliminates the risk of SQL injection, as user input is never directly concatenated into raw SQL queries. All data is treated as values, not executable code.

---

### 2. **Broken Authentication** (A07:2021)

-   **Description**: Flaws in authentication and session management can allow attackers to compromise user accounts or assume other users' identities.
-   **Our Mitigation**:
    -   **Password Hashing**: User passwords are never stored in plaintext. We use the **`bcrypt`** library to hash and salt all passwords before they are stored in the database.
    -   **JSON Web Tokens (JWT)**: User sessions are managed via JWTs. These tokens are signed on the server and contain the user's ID and role. The signature ensures that the token cannot be tampered with by the client.
    -   **Secure Cookie Transport**: The JWT is transmitted to the client via a **`httpOnly`** cookie. This prevents client-side JavaScript from accessing the token, mitigating the risk of Cross-Site Scripting (XSS) attacks stealing the session token. Cookies are also flagged as `Secure` in production, ensuring they are only sent over HTTPS.
    -   **Google OAuth 2.0**: We offer "Login with Google" as a secure, external authentication method, reducing the attack surface on our own authentication system.

---

### 3. **Broken Access Control** (A01:2021)

-   **Description**: This flaw occurs when restrictions on what authenticated users are allowed to do are not properly enforced.
-   **Our Mitigation**:
    -   **Role-Based Access Control (RBAC)**: The application enforces a strict RBAC system. The user's role (`STUDENT` or `COMPANY`) is embedded in their JWT.
    -   **Middleware Enforcement**: Critical API endpoints are protected by a custom `roleMiddleware`. This middleware checks the user's role on every request and will reject any action that the user is not authorized to perform (e.g., a student trying to create a job offer, or a company trying to access another company's data).
    -   **Ownership Checks**: Within controllers, we perform explicit ownership checks to ensure users can only modify resources they own (e.g., a company can only edit its own offers).

---

### 4. **Cryptographic Failures** (A02:2021 - formerly Sensitive Data Exposure)

-   **Description**: Failures related to cryptography (or lack thereof) can expose sensitive data.
-   **Our Mitigation**:
    -   **HTTPS/TLS**: The application is designed to be deployed behind a reverse proxy (like Nginx) that enforces HTTPS. This encrypts all data in transit between the client and the server, preventing eavesdropping.
    -   **No Sensitive Data in URLs**: We avoid passing sensitive information, such as session tokens or personal data, in URL parameters.

---

### 5. **Cross-Site Scripting (XSS)** (A03:2021)

-   **Description**: XSS flaws occur whenever an application includes untrusted data in a new web page without proper validation or escaping.
-   **Our Mitigation**:
    -   **React's Auto-Escaping**: We use React for the frontend, which automatically escapes content rendered into the DOM. By default, any data rendered is treated as a string, preventing malicious scripts from being executed. We avoid using the `dangerouslySetInnerHTML` property.
    -   **`httpOnly` Cookies**: As mentioned above, using `httpOnly` cookies for session tokens prevents XSS attacks from gaining access to user sessions.

---

### 6. **Security Misconfiguration** (A05:2021)

-   **Description**: This can result from insecure default configurations, incomplete configurations, or verbose error messages containing sensitive information.
-   **Our Mitigation**:
    -   **Security Headers**: We use the **`@fastify/helmet`** plugin in our Fastify backend. This automatically sets various HTTP headers (e.g., `X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options`) to protect against common attacks like clickjacking and MIME-sniffing.
    -   **Minimal Error Messages**: In production, generic error messages are sent to the client to avoid leaking implementation details (e.g., stack traces). Detailed errors are logged only on the server.
    -   **Unused Ports Disabled**: The Docker configuration ensures that only the necessary ports are exposed to the outside world.

---

### 7. **Server-Side Request Forgery (SSRF)** (A10:2021)

-   **Description**: SSRF flaws occur whenever a web application is fetching a remote resource without validating the user-supplied URL.
-   **Our Mitigation**:
    -   The application currently does not have any features that make server-side requests to user-supplied URLs. Therefore, the risk of SSRF is minimal by design. Any future feature requiring this functionality would need to implement strict allow-listing of domains and protocols. 