# API Changelog

All notable changes to the Adopte1Etudiant API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enhanced Swagger UI with professional styling and examples
- Comprehensive API integration guide
- API troubleshooting documentation
- Detailed schema examples for all endpoints
- Professional tag descriptions with external documentation links

### Changed
- Improved Swagger UI configuration with better UX
- Enhanced error response documentation
- Updated API documentation with more detailed examples

### Fixed
- Unused parameter warnings in Swagger configuration
- Improved type safety in API documentation

## [1.0.0] - 2024-01-20

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
- **Documentation**: [http://localhost:8080/docs](http://localhost:8080/docs)
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
- API status page: [https://status.adopte1etudiant.com](https://status.adopte1etudiant.com)

---

For questions about API changes or to request new features, please:
1. Check the [API Documentation](http://localhost:8080/docs)
2. Search [existing issues](https://github.com/HusseinDStudy/new_adopte1etudiant/issues)
3. Create a new issue with the `api` label
4. Contact support at support@adopte1etudiant.com
