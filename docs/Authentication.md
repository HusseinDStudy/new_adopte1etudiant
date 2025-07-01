# Authentication and Authorization

This document details the authentication and authorization mechanisms used in the "AdopteUnEtudiant" application.

---

## 1. Authentication Strategy

The application uses a **token-based authentication** system with **JSON Web Tokens (JWT)**. This approach ensures that the backend remains stateless, which is crucial for scalability and simplicity.

Users can authenticate in two ways:
1.  **Email & Password**: The classic credential-based login.
2.  **OAuth 2.0**: Via third-party providers, starting with Google.

### Authentication Flow (JWT)

1.  **Login**: A user submits their credentials (email/password) or goes through the OAuth flow.
2.  **Verification**: The backend API verifies the credentials against the database or validates the OAuth token with the provider.
3.  **Token Generation**: Upon successful verification, the server generates a signed JWT. This token contains a payload with essential, non-sensitive user information, such as:
    *   `userId`: The unique identifier for the user.
    *   `role`: The user's role (`STUDENT` or `COMPANY`).
    *   `iat` (Issued At) and `exp` (Expiration Time) timestamps.
4.  **Token Transmission**: The JWT is sent back to the client.
5.  **Token Storage**: The frontend application securely stores the JWT (e.g., in `localStorage` or an `HttpOnly` cookie for better security).
6.  **Authenticated Requests**: For every subsequent request to a protected API endpoint, the client includes the JWT in the `Authorization` header using the `Bearer` scheme.
    ```
    Authorization: Bearer <your_jwt_token>
    ```
7.  **Server-side Verification**: The `authMiddleware` on the backend intercepts each request, verifies the JWT's signature and expiration, and if valid, extracts the user information from the payload. This information is then attached to the request object (e.g., `request.user`) for use in downstream controllers.

---

## 2. Authentication Scenarios

### Email & Password

*   **Registration (`/api/auth/register`)**:
    1.  A user provides their email, password, role (`STUDENT` or `COMPANY`), and other profile details.
    2.  The backend hashes the password using a strong algorithm (e.g., bcrypt).
    3.  A new `User` record is created in the database.
    4.  The user is then expected to log in.
*   **Login (`/api/auth/login`)**:
    1.  A user submits their email and password.
    2.  The backend finds the user by email and compares the submitted password with the stored hash.
    3.  On success, a new JWT is generated and returned.

### OAuth 2.0 with Google

*   **Login (`/api/auth/google`, `/api/auth/google/callback`)**:
    1.  The user clicks the "Sign in with Google" button on the frontend, which redirects them to the `/api/auth/google` endpoint.
    2.  The backend redirects the user to Google's consent screen.
    3.  After the user grants permission, Google redirects them back to the `/api/auth/google/callback` endpoint with an authorization code.
    4.  The backend exchanges this code for an access token and retrieves the user's Google profile information.
    5.  The system then performs an "upsert":
        *   If a user with this Google ID already exists, they are logged in.
        *   If a user with this email exists but doesn't have a Google account linked, the accounts are linked.
        *   If no such user exists, a new `User` and `OAuthAccount` are created.
    6.  A JWT is generated and returned to the frontend, typically via a redirect with the token in the URL query parameters.

### Account Linking

A user who originally signed up with an email and password can link their Google account from their profile page. This allows them to log in using either method. They also have the option to disable password-based login for enhanced security, making Google the sole method of authentication for their account.

---

## 3. Authorization (RBAC)

Authorization is managed using **Role-Based Access Control (RBAC)**. The system defines two primary roles:

*   `STUDENT`: Can search for offers, apply to them, and manage their applications.
*   `COMPANY`: Can post job offers, view applicants, and search for students.

### Implementation

*   **Role in JWT**: The user's role is embedded within the JWT payload. This avoids the need for a database lookup on every request to determine the user's role.
*   **`roleMiddleware`**: A dedicated middleware is used to protect routes based on roles. It checks the `role` from the decoded JWT against a list of allowed roles for that specific endpoint.

#### Example Usage:

To restrict an endpoint to `COMPANY` users only, the `roleMiddleware` is applied to the route definition:

```typescript
// Example from a route file in `apps/api/src/routes`

import { roleMiddleware }s from '../middleware/roleMiddleware';

// This route is only accessible to users with the 'COMPANY' role.
fastify.post(
  '/offers',
  { preHandler: [authMiddleware, roleMiddleware(['COMPANY'])] },
  offerController.createOffer
);
```

If a user without the required role attempts to access the endpoint, the middleware will reject the request with a `403 Forbidden` status code.
