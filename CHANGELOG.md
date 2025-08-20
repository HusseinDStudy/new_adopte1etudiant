# Changelog

This repository-level changelog is the **primary and most detailed source of all notable changes** to the Adopte1Etudiant project, consolidating changes across the API and Web applications.

## API Changelog

All notable changes to the Adopte1Etudiant API will be documented in this section.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-08-14

### Added
- **Accessibility Panel & A11yProvider**: New components and provider for enhanced web accessibility, integrated across the application.
- **Secure Cookies**: HttpOnly JWT cookies set to secure in production for login and 2FA.
- **Rate Limiting**: Global and per-route rate limiting implemented using `@fastify/rate-limit`.
- **X-Request-Id Tracing**: Web application propagates `X-Request-Id` to the API for cross-tier tracing and logging.
- **Structured API Logs**: API logs now include request IDs, redaction, and duration.
- **Admin /metrics Endpoint**: Added `GET /metrics` for admin-only access to application metrics.
- **CloudWatch Integration**: Production setup configured to ship container logs to CloudWatch via `awslogs`.
- **Monitoring Workflows**: New scheduled monitoring workflow and updated Postman collection.
- **Slack Notifier Script**: Tooling added for Slack notifications.
- **Mobile Menu & Responsiveness**: Implemented a mobile menu and improved overall viewport responsiveness.
- **Legal Pages**: Re-added `/mentions-legales` and `/rgpd` pages with full FR/EN translations.
- **Broadcast Messaging**: Admins can now send broadcast messages to targeted user roles (Student/Company/All) with conversation-based architecture.
- **Public Students Directory**: `/students` endpoint is now public, with email visibility for COMPANY role.
- **Offer-Linked Invites**: Companies can invite students to specific offers, creating linked conversations.
- **Comprehensive i18n System**: Full French/English translations across all UI components with a language switcher.
- **Blog System**: Complete blog functionality with featured posts, categories, pagination, and individual post pages.
- **Admin Panel Enhancements**: Admin dashboard now properly displays recent articles data, active/inactive user filtering, and offer visibility control.
- **UI Primitives and Components**: Added `packages/ui` with `Field` primitives, `Button`, `Input`, `Select`, `Label`, `Dialog`, `DropdownMenu`, `ConfirmDialog` for consistent UI.
- **Accessibility Tests**: Integrated `jest-axe` tests for accessibility (smoke, Login, Profile).
- **Storybook Integration**: Initialized with `@storybook/addon-a11y` for UI components.
- **Service Layer Refactor**: Extracted business logic into dedicated service classes (OfferService, AuthService, etc.) for better separation of concerns.
- **Centralized Error Handling**: Implemented a global error handler with custom error classes (AppError, ValidationError, NotFoundError).
- **Comprehensive Test Suite**: 302 automated tests from scratch with 100% pass rate covering authentication, business logic, security, and performance.
- **Sanitization Middleware**: Added input sanitization and XSS protection.
- **CV Visibility Feature**: `isCvPublic` field added to `StudentProfile`, with CV URL input and visibility toggle.
- **Skills Normalization & Validation**: Backend and frontend validation/normalization for skill inputs to prevent data duplication.
- **Two-Factor Authentication (MFA)**: Complete TOTP-based 2FA system for security, enforced across password and Google OAuth.
- **Unified Conversation System**: Refactored messaging to be conversation-centric, decoupling from application/adoption request origins.
- **Atomic Registration**: Requires complete profiles on signup, including OAuth.
- **Database Schema Updates**: Major updates for admin roles, user flags, blog functionality, and conversation system.
- **Docker Compose for Local Development**: Simplified local development using `docker-compose.db.yml` for DB and `npm run dev` for apps.
- **Automated Database Backups**: Implemented automated database backups before each deployment.

### Changed
- Improved Swagger UI configuration with better UX.
- Enhanced error response documentation.
- Updated API documentation with more detailed examples.
- Refactored authentication forms for better usability.
- Unify admin navigation: fused admin + dashboard sidebars, replaced legacy admin header, added conditional messaging links.
- Blog filters now update automatically from input/select (removed manual button).
- Localized all UI labels and messages with i18n.
- Refactored forms/pages (Login, Register, Profile, Admin, Offers, Blog, Applications) to use new UI primitives.
- Fixed 2FA session token handling (expired vs invalid tokens).
- Updated 10 test files to align with actual error response structure.
- Improved test isolation and shared PrismaClient usage.
- Frontend data handling improved with proper array checks and fallbacks.
- Skills data structure updated from objects to strings.
- Error handling and loading states enhanced across all pages.
- Responsive design and user feedback improved.
- Login/registration page UI center-aligned.
- Google-only authentication flow corrected.
- Database seed updated with more extensive data.
- Score-based sorting for company offers implemented.
- Search functionality for companies in student directory added.
- OAuth registration extended to collect required profile data.
- Error alerts replaced with styled error components across company pages.
- Login methods management UI with password disable functionality added.
- Empty state styling standardized across application pages.
- `db:push` command added for easier schema synchronization.
- Logout functionality reworked to ensure sessions are properly cleared.
- Dashboard page removed; user details integrated directly into profile page.
- Database port configurations synchronized.
- `Content-Type: application/json` headers explicitly set in web services.
- Admin messaging updated to use conversation model instead of direct messages.
- AdminService enhanced with improved broadcast message handling.
- Frontend hooks and services updated for broadcast conversations.
- Blog service enhanced with proper content format handling.

### Fixed
- Unused parameter warnings in Swagger configuration.
- Minor styling issues.
- Accessibility bugs identified during audits.
- Blog filter and analytics issues repaired.
- Frontend CI build issues related to shared packages and Vite/TSC resolution.
- `prepack` hooks added for `shared-types` and `ui-theme`.
- Tailwind ESLint rules enabled.
- Delete/2FA/dialog flows.
- Lints.
- Database connection issues in broadcast message creation.
- Test expectations to match new log message format.
- JWT_SECRET validation logs in test mode.
- TypeScript compilation errors in CI/CD pipeline.
- Database relations and type casting.
- Test assertions for proper status codes.
- `optionalAuthMiddleware` test failures.
- Frontend form handling for broadcast role selection.
- Database connection issues in broadcast message creation.
- `optionalAuthMiddleware` test failures.
- Docker Compose health checks and image tags.
- CI/CD pipeline issues, including `docker compose down -v` and `DATABASE_URL` construction.
- Student skill cascade delete.
- Adoption request conversation link.
- Bugs related to incomplete messaging system.

### Breaking Change
- `packages/ui-theme` no longer supports the `high-contrast` theme. The `Theme` type removed `high-contrast` and associated tokens were dropped. Consumers must stop referencing `high-contrast` and rely on `light` or `dark`.
- Settings routes `/settings` and `/admin/settings` are removed. Update any bookmarks/links to use `/profile` or `/admin/profil`.
- Major database schema updates and new admin role system were implemented. Ensure `npm run db:migrate:deploy` is run.
- A major architectural refactoring introduced a service layer, affecting business logic structure and error handling. This requires updates to custom logic.
- The primary `docker-compose.yml` and `Dockerfile.dev` files have been removed. Local development now requires `docker-compose.db.yml` for the database and `npm run dev` for applications.
- The `-v` flag (volume removal) from `docker compose down` during deployment has been removed to prevent critical data loss. Deployment scripts must reflect this.

## [1.1.0] - 2025-07-26

### Added
- Admin-only metrics endpoint `GET /metrics`
- Frontend propagates `X-Request-Id` header on all API requests; API uses and echoes it for cross-tier tracing
- Enhanced Swagger UI with professional styling and examples
- Comprehensive API integration guide
- API troubleshooting documentation
- Detailed schema examples for all endpoints
- Professional tag descriptions with external documentation links
- Initial web application setup with React, Vite, and TypeScript.
- User authentication and authorization flows (login, register, logout).
- Student and Company dashboards.
- Job offer listing and detail pages.
- Application submission and tracking.
- Real-time messaging interface.
- Student profile creation and management.
- Company profile creation and offer posting.
- Two-factor authentication (2FA) setup and verification.
- Google OAuth integration.
- Responsive design for various screen sizes.
- Internationalization (i18n) support (English and French).
- Accessibility features and dedicated accessibility page.

### Changed
- Improved Swagger UI configuration with better UX
- Enhanced error response documentation
- Updated API documentation with more detailed examples
- Improved UI/UX for various components.
- Refactored authentication forms for better usability.

### Fixed
- Unused parameter warnings in Swagger configuration
- Improved type safety in API documentation
- Minor styling issues.
- Accessibility bugs identified during audits.

## [1.0.0] - 2025-06-26

### Added
- Complete REST API with authentication system
- JWT-based authentication with HTTP-only cookies
- Two-factor authentication (2FA) support
- OAuth integration with Google
- Role-based access control (Student/Company)
- User profile management
- Job offer CRUD operations
- Application management system
- Real-time messaging between users
- Student adoption request system
- Skills database and management
- Comprehensive API documentation with Swagger UI
- Rate limiting for API protection
- Input validation with Zod schemas
- CORS protection
- Database migrations and seeding
- Comprehensive test suite

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/login/verify-2fa` - Two-factor authentication
- `DELETE /api/auth/account` - Delete user account
- `PATCH /api/auth/change-password` - Change password
- `POST /api/auth/disable-password` - Disable password login
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/complete-oauth-registration` - Complete OAuth registration
- `POST /api/auth/complete-link` - Complete account linking

### Profile Endpoints
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update profile
- `PATCH /api/profile` - Partial profile update

### Offer Endpoints
- `GET /api/offers` - List all offers (public)
- `GET /api/offers/:id` - Get specific offer
- `POST /api/offers` - Create new offer (Company only)
- `PUT /api/offers/:id` - Update offer (Company only)
- `DELETE /api/offers/:id` - Delete offer (Company only)
- `GET /api/offers/my-offers` - Get company's offers
- `GET /api/offers/:id/applications` - Get offer applications

### Application Endpoints
- `POST /api/applications` - Apply to job offer (Student only)
- `GET /api/applications/my-applications` - Get student's applications
- `PATCH /api/applications/:id/status` - Update application status (Company only)
- `DELETE /api/applications/:id` - Delete application (Student only)

### Message Endpoints
- `GET /api/messages/conversations` - Get user's conversations
- `GET /api/messages/conversations/:id/messages` - Get conversation messages
- `POST /api/messages/conversations/:id/messages` - Send message

### Student Endpoints
- `GET /api/students` - List available students (Company only)

### Company Endpoints
- `GET /api/companies` - List companies with offers (public)

### Skill Endpoints
- `GET /api/skills` - Get available skills (public)

### Adoption Request Endpoints
- `POST /api/adoption-requests` - Create adoption request (Company only)
- `GET /api/adoption-requests/my-requests` - Get received requests (Student only)
- `GET /api/adoption-requests/sent-requests` - Get sent requests (Company only)
- `PATCH /api/adoption-requests/:id/status` - Update request status (Student only)

### Two-Factor Authentication Endpoints
- `POST /api/2fa/generate` - Generate 2FA secret
- `POST /api/2fa/verify` - Verify and enable 2FA
- `POST /api/2fa/disable` - Disable 2FA

### Security Features
- JWT authentication with HTTP-only cookies
- Role-based access control
- Two-factor authentication with TOTP
- OAuth integration (Google)
- Rate limiting (1000 req/hour authenticated, 100 req/hour public)
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Password hashing with bcrypt

### Data Models
- **User**: Core user entity with email, role, and authentication data
- **StudentProfile**: Student-specific profile data
- **CompanyProfile**: Company-specific profile data
- **Offer**: Job/internship offers
- **Application**: Job applications with status tracking
- **Message**: Real-time messaging system
- **Conversation**: Message grouping
- **AdoptionRequest**: Direct student recruitment requests
- **Skill**: Skills database for filtering and matching
- **TwoFactorAuth**: 2FA configuration and backup codes

### Response Format
All API responses follow a consistent format:
```json
{
  "data": { ... },
  "message": "Success message",
  "pagination": { ... } // For paginated responses
}
```

### Error Handling
Standardized error responses with appropriate HTTP status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (resource already exists)
- 422: Validation Error (detailed field errors)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

### Pagination
Consistent pagination across all list endpoints:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- Response includes pagination metadata

### Filtering & Search
Advanced filtering capabilities:
- Text search across relevant fields
- Skill-based filtering
- Location filtering
- Status filtering
- Date range filtering

### Documentation
- Interactive Swagger UI at `/docs`
- OpenAPI 3.0 specification
- Comprehensive endpoint documentation
- Request/response examples
- Authentication flow documentation
- Error code reference
- Integration guides

## Migration Guide

### From Development to Production
1. Update environment variables
2. Configure production database
3. Set up SSL certificates
4. Configure OAuth providers
5. Update CORS settings
6. Set up monitoring and logging

### Breaking Changes
None in this initial release.

## Deprecation Notice
No deprecated endpoints in this release.

## Support
- **Documentation**: [/docs](/docs)
- **GitHub Issues**: [Report bugs and request features](https://github.com/HusseinDStudy/new_adopte1etudiant/issues)
- **Email Support**: support@adopte1etudiant.com

## Versioning Strategy
- **Major version** (X.0.0): Breaking changes
- **Minor version** (0.X.0): New features, backward compatible
- **Patch version** (0.0.X): Bug fixes, backward compatible

## API Stability
- **Stable**: All documented endpoints are considered stable
- **Beta**: No beta endpoints in current release
- **Experimental**: No experimental endpoints in current release

## Rate Limiting
- **Authenticated users**: 1000 requests per hour
- **Public endpoints**: 100 requests per hour
- **Rate limit headers** included in all responses

## Monitoring
- Health check endpoint: `GET /health`
- Metrics endpoint: `GET /metrics` (admin only)
- API status page: [YOUR_STATUS_PAGE_URL](YOUR_STATUS_PAGE_URL)

---

For questions about API changes or to request new features, please:
1. Check the [API Documentation](/docs)
2. Search [existing issues](https://github.com/HusseinDStudy/new_adopte1etudiant/issues)
3. Create a new issue with the `api` label
4. Contact support at support@adopte1etudiant.com

## Web Changelog

All notable changes to the Adopte1Etudiant Web application will be documented in this section.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial web application setup with React, Vite, and TypeScript.
- User authentication and authorization flows (login, register, logout).
- Student and Company dashboards.
- Job offer listing and detail pages.
- Application submission and tracking.
- Real-time messaging interface.
- Student profile creation and management.
- Company profile creation and offer posting.
- Two-factor authentication (2FA) setup and verification.
- Google OAuth integration.
- Responsive design for various screen sizes.
- Internationalization (i18n) support (English and French).
- Accessibility features and dedicated accessibility page.

### Changed
- Improved UI/UX for various components.
- Refactored authentication forms for better usability.

### Fixed
- Minor styling issues.
- Accessibility bugs identified during audits.



