import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import { FastifyRequest, FastifyReply } from 'fastify';

const isDevelopment = process.env.NODE_ENV === 'development';
const baseDocUrl = isDevelopment ? 'http://localhost:8080' : 'https://api.adopte1etudiant.com';

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Adopte1Etudiant API',
      description: `
# 🎓 Adopte1Etudiant API Documentation

Welcome to the **Adopte1Etudiant API**! This comprehensive platform connects students with companies for internships and job opportunities, featuring modern authentication, real-time messaging, and advanced matching capabilities.

## 🚀 Quick Start Guide

### Base URLs
- **Development**: \`http://localhost:8080\`
- **Production**: \`https://api.adopte1etudiant.com\`

### Interactive Testing
Use the "Try it out" buttons below to test endpoints directly in this documentation!

## 🔐 Authentication & Security

This API uses **JWT tokens** stored in **HTTP-only cookies** for secure authentication, protecting against XSS attacks while maintaining ease of use.

### 🔄 Authentication Flow
1. **Register** a new account (\`POST /api/auth/register\`)
2. **Login** with credentials (\`POST /api/auth/login\`)
3. JWT token is automatically stored in HTTP-only cookie
4. Include cookie in subsequent requests (handled automatically by browsers)
5. For 2FA-enabled accounts, complete verification (\`POST /api/auth/login/verify-2fa\`)

### 🛡️ Security Features
- **JWT Authentication** with HTTP-only cookies
- **Two-Factor Authentication (2FA)** support
- **Role-based Access Control** (Student/Company)
- **Rate Limiting** for API protection
- **Input Validation** with Zod schemas
- **CORS Protection** for cross-origin requests

## 📊 Response Format

All API responses follow a consistent structure:

### ✅ Success Response
\`\`\`json
{
  "data": { ... },
  "message": "Operation completed successfully"
}
\`\`\`

### ❌ Error Response
\`\`\`json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": { ... }
}
\`\`\`

## 🚨 HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| **200** | ✅ Success | Request completed successfully |
| **201** | ✅ Created | Resource created successfully |
| **400** | ❌ Bad Request | Invalid input data or malformed request |
| **401** | 🔒 Unauthorized | Authentication required or invalid |
| **403** | 🚫 Forbidden | Insufficient permissions for this action |
| **404** | 🔍 Not Found | Requested resource doesn't exist |
| **409** | ⚠️ Conflict | Resource already exists or conflict |
| **422** | 📝 Validation Error | Data validation failed |
| **429** | 🐌 Too Many Requests | Rate limit exceeded |
| **500** | 💥 Internal Server Error | Unexpected server error |

## 🔄 Pagination

Many endpoints support pagination with these query parameters:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 10, max: 100)

### Example Paginated Response
\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
\`\`\`

## 🔍 Filtering & Search

Most list endpoints support filtering and search:
- \`search\`: Text search in relevant fields
- \`skills\`: Comma-separated list of skills
- \`location\`: Filter by location
- \`status\`: Filter by status

### Example
\`GET /api/offers?search=internship&skills=javascript,react&location=Paris\`

## 📝 Data Validation

All request bodies are validated using **Zod schemas**. Invalid data returns a 400 error with detailed validation messages.

## 🎯 Getting Started Examples

Check out the endpoint examples below to see how to:
- 👤 Register and authenticate users
- 💼 Create and manage job offers
- 📧 Send messages between users
- 🎓 Manage student profiles
- 🏢 Handle company information
      `,
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@adopte1etudiant.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      },
      {
        url: 'https://api.adopte1etudiant.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in HTTP-only cookie for authentication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            }
          },
          required: ['message']
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier',
              example: 'clp1234567890abcdef'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@university.edu'
            },
            role: {
              type: 'string',
              enum: ['STUDENT', 'COMPANY'],
              description: 'User role',
              example: 'STUDENT'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-20T14:45:00Z'
            }
          },
          example: {
            id: 'clp1234567890abcdef',
            email: 'john.doe@university.edu',
            role: 'STUDENT',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-20T14:45:00Z'
          }
        },
        RegisterStudentRequest: {
          type: 'object',
          required: ['role', 'email', 'password', 'firstName', 'lastName'],
          properties: {
            role: {
              type: 'string',
              enum: ['STUDENT'],
              description: 'User role - must be STUDENT',
              example: 'STUDENT'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@university.edu'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (minimum 6 characters)',
              example: 'securePassword123'
            },
            firstName: {
              type: 'string',
              minLength: 1,
              description: 'Student first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              minLength: 1,
              description: 'Student last name',
              example: 'Doe'
            }
          },
          example: {
            role: 'STUDENT',
            email: 'john.doe@university.edu',
            password: 'securePassword123',
            firstName: 'John',
            lastName: 'Doe'
          }
        },
        RegisterCompanyRequest: {
          type: 'object',
          required: ['role', 'email', 'password', 'name', 'contactEmail'],
          properties: {
            role: {
              type: 'string',
              enum: ['COMPANY'],
              description: 'User role - must be COMPANY',
              example: 'COMPANY'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'hr@techcorp.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (minimum 6 characters)',
              example: 'companySecure456'
            },
            name: {
              type: 'string',
              minLength: 1,
              description: 'Company name',
              example: 'TechCorp Solutions'
            },
            contactEmail: {
              type: 'string',
              format: 'email',
              description: 'Company contact email',
              example: 'contact@techcorp.com'
            }
          },
          example: {
            role: 'COMPANY',
            email: 'hr@techcorp.com',
            password: 'companySecure456',
            name: 'TechCorp Solutions',
            contactEmail: 'contact@techcorp.com'
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@university.edu'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password',
              example: 'securePassword123'
            }
          },
          example: {
            email: 'john.doe@university.edu',
            password: 'securePassword123'
          }
        },
        CreateOfferRequest: {
          type: 'object',
          required: ['title', 'description', 'skills'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              description: 'Job offer title',
              example: 'Full-Stack Developer Internship'
            },
            description: {
              type: 'string',
              minLength: 10,
              description: 'Job offer description',
              example: 'We are looking for a motivated full-stack developer intern to join our team. You will work on exciting projects using modern technologies and gain valuable experience in a fast-paced startup environment.'
            },
            location: {
              type: 'string',
              description: 'Job location (optional)',
              example: 'Paris, France'
            },
            duration: {
              type: 'string',
              description: 'Job duration (optional)',
              example: '6 months'
            },
            skills: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Required skills for the position',
              example: ['JavaScript', 'React', 'Node.js', 'PostgreSQL']
            }
          },
          example: {
            title: 'Full-Stack Developer Internship',
            description: 'We are looking for a motivated full-stack developer intern to join our team. You will work on exciting projects using modern technologies and gain valuable experience in a fast-paced startup environment.',
            location: 'Paris, France',
            duration: '6 months',
            skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL']
          }
        },
        UpdateOfferRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              description: 'Job offer title'
            },
            description: {
              type: 'string',
              minLength: 10,
              description: 'Job offer description'
            },
            location: {
              type: 'string',
              description: 'Job location'
            },
            duration: {
              type: 'string',
              description: 'Job duration'
            },
            skills: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Required skills for the position'
            }
          },
          description: 'All fields are optional for updates'
        },
        CompleteOAuthRequest: {
          type: 'object',
          required: ['role'],
          properties: {
            role: {
              type: 'string',
              enum: ['STUDENT', 'COMPANY'],
              description: 'User role to complete OAuth registration'
            }
          }
        },
        TwoFactorTokenRequest: {
          type: 'object',
          required: ['token'],
          properties: {
            token: {
              type: 'string',
              description: '6-digit 2FA verification code'
            }
          }
        },
        StudentProfile: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            school: {
              type: 'string',
              example: 'University of Technology'
            },
            degree: {
              type: 'string',
              example: 'Computer Science'
            },
            skills: {
              type: 'array',
              items: { type: 'string' },
              example: ['JavaScript', 'React', 'Python', 'Machine Learning']
            },
            isOpenToOpportunities: {
              type: 'boolean',
              example: true
            },
            cvUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/cv/john-doe.pdf'
            },
            isCvPublic: {
              type: 'boolean',
              example: true
            }
          },
          example: {
            firstName: 'John',
            lastName: 'Doe',
            school: 'University of Technology',
            degree: 'Computer Science',
            skills: ['JavaScript', 'React', 'Python', 'Machine Learning'],
            isOpenToOpportunities: true,
            cvUrl: 'https://example.com/cv/john-doe.pdf',
            isCvPublic: true
          }
        },
        CompanyProfile: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'TechCorp Solutions'
            },
            size: {
              type: 'string',
              example: '50-100 employees'
            },
            sector: {
              type: 'string',
              example: 'Software Development'
            },
            contactEmail: {
              type: 'string',
              format: 'email',
              example: 'contact@techcorp.com'
            }
          },
          example: {
            name: 'TechCorp Solutions',
            size: '50-100 employees',
            sector: 'Software Development',
            contactEmail: 'contact@techcorp.com'
          }
        },
        Offer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clp9876543210fedcba'
            },
            title: {
              type: 'string',
              example: 'Full-Stack Developer Internship'
            },
            description: {
              type: 'string',
              example: 'We are looking for a motivated full-stack developer intern to join our team.'
            },
            location: {
              type: 'string',
              example: 'Paris, France'
            },
            duration: {
              type: 'string',
              example: '6 months'
            },
            skills: {
              type: 'array',
              items: { type: 'string' },
              example: ['JavaScript', 'React', 'Node.js', 'PostgreSQL']
            },
            companyId: {
              type: 'string',
              example: 'clp1111222233334444'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T14:45:00Z'
            }
          },
          example: {
            id: 'clp9876543210fedcba',
            title: 'Full-Stack Developer Internship',
            description: 'We are looking for a motivated full-stack developer intern to join our team.',
            location: 'Paris, France',
            duration: '6 months',
            skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
            companyId: 'clp1111222233334444',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-20T14:45:00Z'
          }
        },
        Application: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clp5555666677778888'
            },
            offerId: {
              type: 'string',
              example: 'clp9876543210fedcba'
            },
            studentId: {
              type: 'string',
              example: 'clp1234567890abcdef'
            },
            status: {
              type: 'string',
              enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED'],
              example: 'NEW'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T14:45:00Z'
            }
          },
          example: {
            id: 'clp5555666677778888',
            offerId: 'clp9876543210fedcba',
            studentId: 'clp1234567890abcdef',
            status: 'NEW',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-20T14:45:00Z'
          }
        },
        AdoptionRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clp9999888877776666'
            },
            studentId: {
              type: 'string',
              example: 'clp1234567890abcdef'
            },
            companyId: {
              type: 'string',
              example: 'clp1111222233334444'
            },
            message: {
              type: 'string',
              example: 'We would love to have you join our team as a junior developer. Your skills in React and Node.js are exactly what we are looking for.'
            },
            position: {
              type: 'string',
              example: 'Junior Full-Stack Developer'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
              example: 'PENDING'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T14:45:00Z'
            }
          },
          example: {
            id: 'clp9999888877776666',
            studentId: 'clp1234567890abcdef',
            companyId: 'clp1111222233334444',
            message: 'We would love to have you join our team as a junior developer. Your skills in React and Node.js are exactly what we are looking for.',
            position: 'Junior Full-Stack Developer',
            status: 'PENDING',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-20T14:45:00Z'
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: '🔐 **User Authentication & Account Management**\n\nComplete authentication system with JWT tokens, OAuth integration, and two-factor authentication support. Manage user accounts, passwords, and security settings.'
      },
      {
        name: 'Profile',
        description: '👤 **User Profile Management**\n\nManage student and company profiles with role-specific data structures. Handle personal information, skills, CV uploads, and profile visibility settings.'
      },
      {
        name: 'Offers',
        description: '💼 **Job & Internship Offers**\n\nComplete CRUD operations for job offers. Companies can create, update, and manage their job postings while students can browse and search available opportunities.'
      },
      {
        name: 'Applications',
        description: '📝 **Job Applications Management**\n\nHandle the complete application lifecycle from submission to hiring. Students can apply to offers and track their application status, while companies can review and update application statuses.'
      },
      {
        name: 'Messages',
        description: '💬 **Real-time Messaging System**\n\nSecure messaging platform enabling direct communication between students and companies. Manage conversations, send messages, and maintain communication history.'
      },
      {
        name: 'Students',
        description: '🎓 **Student Discovery & Management**\n\nCompany-exclusive endpoints for discovering and browsing available students. Filter by skills, education, and availability status to find the perfect candidates.'
      },
      {
        name: 'Companies',
        description: '🏢 **Company Directory & Information**\n\nPublic directory of companies with their active job offers. Browse company profile  s, sectors, and available opportunities.'
      },
      {
        name: 'Skills',
        description: '🛠️ **Skills Database & Management**\n\nComprehensive skills database for autocomplete and filtering. Manage skill categories, popularity, and usage statistics across the platform.'
      },
      {
        name: 'Adoption Requests',
        description: '🤝 **Direct Student Adoption System**\n\nUnique feature allowing companies to directly reach out to students with personalized opportunities. Manage adoption requests and responses.'
      },
      {
        name: '2FA',
        description: '🔒 **Two-Factor Authentication**\n\nAdvanced security features with TOTP-based two-factor authentication. Generate QR codes, manage backup codes, and enhance account security.'
      }
    ]
  }
};

export const swaggerUiConfig = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list' as const,
    deepLinking: true,
    defaultModelRendering: 'example' as const,
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    displayOperationId: false,
    displayRequestDuration: true,
    filter: true,
    showExtensions: false,
    showCommonExtensions: false,
    tryItOutEnabled: true,
    persistAuthorization: true,
    layout: 'BaseLayout',

    validatorUrl: null
  },
  uiHooks: {
    onRequest: function (_request: FastifyRequest, _reply: FastifyReply, next: () => void) { next() },
    preHandler: function (_request: FastifyRequest, _reply: FastifyReply, next: () => void) { next() }
  },
  staticCSP: true,
  transformStaticCSP: (header: string) => header,
  transformSpecification: (swaggerObject: Record<string, any>, _request: FastifyRequest, _reply: FastifyReply) => {
    // Add custom branding and additional info
    swaggerObject.info.title = '🎓 ' + swaggerObject.info.title;
    return swaggerObject;
  },
  transformSpecificationClone: true
};
