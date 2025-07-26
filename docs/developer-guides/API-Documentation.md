# API Documentation Guide

## Overview

The Adopte1Etudiant API provides a comprehensive RESTful interface for connecting students with companies for internships and job opportunities. This documentation covers all available endpoints, authentication methods, and usage examples.

## 🚀 Quick Start

### Access the Interactive Documentation

The API includes interactive Swagger UI documentation that allows you to explore and test all endpoints directly in your browser:

- **Development**: [http://localhost:8080/docs](http://localhost:8080/docs)
- **Production**: [https://api.adopte1etudiant.com/docs](https://api.adopte1etudiant.com/docs)

### Base URLs

- **Development**: `http://localhost:8080`
- **Production**: `https://api.adopte1etudiant.com`

## 🔐 Authentication

The API uses JWT tokens stored in HTTP-only cookies for authentication. This provides security against XSS attacks while maintaining ease of use.

### Authentication Flow

1. **Register** a new account or **Login** with existing credentials
2. JWT token is automatically stored in an HTTP-only cookie
3. Include the cookie in subsequent requests (handled automatically by browsers)
4. For 2FA-enabled accounts, complete the verification process

### Example Authentication

```bash
# Register a new student
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "STUDENT",
    "email": "student@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "student@example.com",
    "password": "securepassword123"
  }'

# Use authenticated endpoint
curl -X GET http://localhost:8080/api/auth/me \
  -b cookies.txt
```

## 📚 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register` - Register new user account
- `POST /login` - User authentication
- `POST /logout` - End user session
- `GET /me` - Get current user information
- `POST /login/verify-2fa` - Two-factor authentication verification
- `DELETE /account` - Delete user account
- `PATCH /change-password` - Change user password

### Offers (`/api/offers`)
- `GET /` - List all job offers (public)
- `GET /:id` - Get specific offer details (public)
- `POST /` - Create new offer (Company only)
- `PUT /:id` - Update offer (Company only)
- `DELETE /:id` - Delete offer (Company only)
- `GET /my-offers` - Get company's offers (Company only)
- `GET /:id/applications` - Get offer applications (Company only)

### Applications (`/api/applications`)
- `POST /` - Apply to a job offer (Student only)
- `GET /my-applications` - Get user's applications (Student only)
- `PATCH /:id/status` - Update application status (Company only)

### Profile (`/api/profile`)
- `GET /` - Get user profile
- `PUT /` - Update user profile
- `POST /upload-cv` - Upload CV file (Student only)

### Messages (`/api/messages`)
- `GET /conversations` - Get user's conversations
- `GET /conversations/:id/messages` - Get messages in conversation
- `POST /conversations/:id/messages` - Send message

### Students (`/api/students`)
- `GET /` - List students (Company only)
- `GET /:id` - Get student profile (Company only)

### Companies (`/api/companies`)
- `GET /` - List companies (Student only)
- `GET /:id` - Get company profile (Student only)

### Skills (`/api/skills`)
- `GET /` - Get available skills
- `POST /` - Add new skill

### Adoption Requests (`/api/adoption-requests`)
- `POST /` - Create adoption request (Company only)
- `GET /my-requests` - Get received requests (Student only)
- `GET /sent-requests` - Get sent requests (Company only)
- `PATCH /:id/status` - Update request status (Student only)

### Two-Factor Authentication (`/api/2fa`)
- `POST /setup` - Setup 2FA
- `POST /verify` - Verify 2FA setup
- `POST /disable` - Disable 2FA

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response
```json
{
  "message": "Error description",
  "code": "ERROR_CODE (optional)",
  "details": { ... } // Additional error details (optional)
}
```

## 🔍 Query Parameters

Many endpoints support query parameters for filtering, pagination, and searching:

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Filtering
- `search` - Search term for text fields
- `location` - Filter by location
- `skills` - Comma-separated list of skills

### Example
```
GET /api/offers?page=2&limit=20&search=internship&location=Paris&skills=javascript,react
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Validation Error - Data validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## 🔧 Development Tools

### Generate OpenAPI Specification

```bash
# Generate JSON specification
curl http://localhost:8080/docs/json > api-spec.json

# Generate YAML specification  
curl http://localhost:8080/docs/yaml > api-spec.yaml
```

### Testing with Postman

1. Import the OpenAPI specification into Postman
2. Set up environment variables for base URL
3. Configure authentication using cookies

## 📝 Examples

### Complete User Registration Flow

```javascript
// 1. Register new student
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: 'STUDENT',
    email: 'john.doe@university.edu',
    password: 'securePassword123',
    firstName: 'John',
    lastName: 'Doe'
  })
});

// 2. Login (cookie automatically stored)
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'john.doe@university.edu',
    password: 'securePassword123'
  })
});

// 3. Update profile
const profileResponse = await fetch('/api/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    school: 'University of Technology',
    degree: 'Computer Science',
    skills: ['JavaScript', 'React', 'Node.js'],
    isOpenToOpportunities: true
  })
});

// 4. Browse job offers
const offersResponse = await fetch('/api/offers?search=internship&skills=javascript', {
  credentials: 'include'
});
```

## 🛠️ SDK and Client Libraries

You can generate client libraries using the OpenAPI specification with tools like:

- [OpenAPI Generator](https://openapi-generator.tech/)
- [Swagger Codegen](https://swagger.io/tools/swagger-codegen/)
- [AutoRest](https://github.com/Azure/autorest)

### Generating Client SDKs

```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/docs/json \
  -g typescript-fetch \
  -o ./generated-client

# Generate Python client
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/docs/json \
  -g python \
  -o ./python-client
```

## 📞 Support

For API support and questions:
- **Email**: support@adopte1etudiant.com
- **Documentation**: [https://docs.adopte1etudiant.com](https://docs.adopte1etudiant.com)
- **Issues**: [GitHub Issues](https://github.com/HusseinDStudy/new_adopte1etudiant/issues)
