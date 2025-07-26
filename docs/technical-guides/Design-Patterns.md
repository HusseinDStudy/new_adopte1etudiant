# Software Design Patterns

This document describes the key software design patterns used in the "AdopteUnEtudiant" project. These patterns provide proven solutions to common problems, helping to ensure the codebase is scalable, maintainable, and robust.

---

## 1. Architectural Patterns

These patterns define the high-level structure of the application.

### a. Monorepo

The entire project is organized as a **monorepo**, managed by **npm workspaces** and Turborepo.

*   **What it is**: A single repository containing multiple distinct projects (the `api` and `web` apps) and shared packages (`packages/*`).
*   **Why it's used**:
    *   **Code Sharing**: Simplifies sharing code between the frontend and backend (e.g., `shared-types`).
    *   **Atomic Commits**: Changes to multiple parts of the system (e.g., an API change and the corresponding frontend update) can be made in a single commit.
    *   **Simplified Dependency Management**: A single `package-lock.json` at the root ensures consistent dependency versions across the project.
    *   **Streamlined CI/CD**: Turborepo intelligently caches build and test results, speeding up the pipeline.

### b. Client-Server Architecture

This is the fundamental structure of the application.

*   **Client (`apps/web`)**: The React single-page application that runs in the user's browser. It is responsible for the presentation layer.
*   **Server (`apps/api`)**: The Fastify backend that runs on a server. It is responsible for business logic, data persistence, and authentication.
*   **Communication**: The client and server communicate over a stateless RESTful API using HTTPS.

### c. Stateless API

The backend API is **stateless**.

*   **What it is**: The server does not store any client session data between requests. Every request from a client must contain all the information needed to be understood and processed (e.g., the JWT for authentication).
*   **Why it's used**:
    *   **Scalability**: Any server instance can handle any request, making it easy to scale horizontally by adding more server instances behind a load balancer.
    *   **Reliability**: If one server instance fails, requests can be seamlessly rerouted to another.
    *   **Simplicity**: It simplifies the server logic by removing the need to manage session state.

---

## 2. Backend Design Patterns (`apps/api`)

### a. MVC-like Structure (Model-View-Controller)

While not a strict MVC framework, the backend is organized in a similar, layered pattern:

*   **Model**: The data layer, represented by the **Prisma Schema** (`schema.prisma`). It defines the structure of our data and the relationships between entities.
*   **View**: The presentation layer, which in the context of a REST API is the **JSON response** sent back to the client.
*   **Controller**: The business logic layer. In our application, this is split between:
    *   **Routes (`src/routes`)**: Define the API endpoints and wire them to controller functions. They handle the raw HTTP request and response.
    *   **Controllers (`src/controllers`)**: Contain the core business logic. They are called by the routes, interact with the Prisma Client (Model) to fetch or update data, and determine what response to send.

### b. Middleware Pattern

The Middleware pattern is used extensively in Fastify to create a pipeline for processing requests.

*   **What it is**: Functions that have access to the request object, the reply object, and the `next` function in the application's request-response cycle.
*   **Why it's used**: To handle **cross-cutting concerns** in a clean, modular, and reusable way.
*   **Examples in our project**:
    *   `authMiddleware`: Checks for a valid JWT on protected routes.
    *   `roleMiddleware`: Checks if the authenticated user has the required role for an endpoint.
    *   Logging, CORS handling, and error handling are also implemented as middleware.

### c. Data Access Object (DAO)

*   **What it is**: A pattern that provides an abstract interface to some type of database or persistence mechanism.
*   **Our Implementation**: The **Prisma Client** instance serves as our DAO. It completely encapsulates all database access, providing a clean, type-safe API for the rest of the application to use. This decouples our business logic from the raw database queries, making the code easier to test and maintain.

---

## 3. Frontend Design Patterns (`apps/web`)

### a. Component-Based Architecture

This is the core pattern of **React**.

*   **What it is**: The UI is broken down into small, independent, and reusable pieces called **components**. Each component manages its own state and renders a piece of the UI.
*   **Why it's used**: It makes complex UIs manageable by breaking them into smaller, understandable parts. It also promotes reusability.

### b. Provider Pattern

*   **What it is**: A pattern that uses React's **Context API** to pass data through the component tree without having to pass props down manually at every level.
*   **Our Implementation**: `AuthContext.tsx` creates an `AuthProvider` component. When this component wraps the application, it "provides" the authentication state (like the current user and token) to any child component that needs it. This is a form of **Dependency Injection**.

### c. Hook Pattern

*   **What it is**: Hooks are functions that let you "hook into" React state and lifecycle features from function components.
*   **Why it's used**: They allow for reusing stateful logic between components without changing your component hierarchy.
*   **Examples in our project**:
    *   **Standard Hooks**: `useState`, `useEffect`, `useContext` are used extensively.
    *   **Custom Hooks**: We create our own hooks (e.g., `useDebounce`) to encapsulate and reuse common logic.

### d. Conditional Rendering

*   **What it is**: A fundamental pattern where you render different UI elements or components based on the current state of the application.
*   **Example**: Displaying a "Loading..." message while data is being fetched, showing user-specific controls if `user` exists in the `AuthContext`, or rendering an error message if an API call fails.
