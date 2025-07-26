# API Testing Guide

## Overview

This guide covers comprehensive testing strategies for the Adopte1Etudiant API, including unit tests, integration tests, and API documentation validation.

## 🧪 Testing Strategy

### Test Pyramid

```
    /\
   /  \     E2E Tests (Few)
  /____\    
 /      \   Integration Tests (Some)
/__________\ Unit Tests (Many)
```

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints and database interactions
3. **End-to-End Tests**: Test complete user workflows
4. **Documentation Tests**: Validate API docs match implementation

## 🚀 Quick Start

### Running All Tests

```bash
# Run all tests
npm run test

# Run API-specific tests
npm run test --workspace=apps/api

# Run tests in watch mode
npm run test:watch --workspace=apps/api

# Run tests with coverage
npm run test:coverage --workspace=apps/api
```

### API Documentation Validation

```bash
# Validate API documentation against implementation
npm run docs:validate

# Generate and validate documentation
npm run docs:generate && npm run docs:validate
```

## 🔧 Test Configuration

### Vitest Configuration

The API uses Vitest for testing. Configuration is in `apps/api/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        'prisma/',
        'scripts/'
      ]
    }
  }
});
```

### Test Environment Setup

Tests use a separate test database and environment:

```typescript
// src/__tests__/setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from 'db-postgres';

beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await cleanDatabase();
});
```

## 📝 Unit Testing

### Testing Controllers

```typescript
// src/__tests__/controllers/authController.test.ts
import { describe, it, expect, vi } from 'vitest';
import { registerUser } from '../controllers/authController.js';
import { createTestApp } from '../helpers/test-app.js';

describe('Auth Controller', () => {
  it('should register a new student', async () => {
    const app = await createTestApp();
    
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        role: 'STUDENT',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }
    });
    
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      email: 'test@example.com',
      role: 'STUDENT'
    });
  });
  
  it('should reject invalid email format', async () => {
    const app = await createTestApp();
    
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        role: 'STUDENT',
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }
    });
    
    expect(response.statusCode).toBe(400);
  });
});
```

### Testing Services

```typescript
// src/__tests__/services/userService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createUser, getUserById } from '../services/userService.js';
import { cleanDatabase } from '../helpers/test-helpers.js';

describe('User Service', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });
  
  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'STUDENT'
    };
    
    const user = await createUser(userData);
    
    expect(user).toMatchObject({
      email: 'test@example.com',
      role: 'STUDENT'
    });
    expect(user.id).toBeDefined();
  });
  
  it('should retrieve user by ID', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'STUDENT'
    };
    
    const createdUser = await createUser(userData);
    const retrievedUser = await getUserById(createdUser.id);
    
    expect(retrievedUser).toMatchObject(createdUser);
  });
});
```

## 🔗 Integration Testing

### Testing API Endpoints

```typescript
// src/__tests__/integration/offers.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/test-app.js';
import { createTestUser, loginTestUser } from '../helpers/auth-helpers.js';

describe('Offers API', () => {
  let app;
  let authCookie;
  
  beforeEach(async () => {
    app = await createTestApp();
    
    // Create and login test company
    const company = await createTestUser('COMPANY');
    authCookie = await loginTestUser(app, company);
  });
  
  it('should create a new offer', async () => {
    const offerData = {
      title: 'Software Engineer Intern',
      description: 'Great opportunity for students',
      location: 'Paris',
      duration: '6 months',
      skills: ['JavaScript', 'React']
    };
    
    const response = await app.inject({
      method: 'POST',
      url: '/api/offers',
      headers: {
        cookie: authCookie
      },
      payload: offerData
    });
    
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject(offerData);
  });
  
  it('should list offers with pagination', async () => {
    // Create test offers
    await createTestOffers(5);
    
    const response = await app.inject({
      method: 'GET',
      url: '/api/offers?page=1&limit=3'
    });
    
    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.offers).toHaveLength(3);
    expect(data.pagination).toMatchObject({
      page: 1,
      limit: 3,
      total: 5,
      totalPages: 2
    });
  });
});
```

### Testing Authentication Flow

```typescript
// src/__tests__/integration/auth-flow.test.ts
import { describe, it, expect } from 'vitest';
import { createTestApp } from '../helpers/test-app.js';

describe('Authentication Flow', () => {
  it('should complete full auth flow', async () => {
    const app = await createTestApp();
    
    // 1. Register
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        role: 'STUDENT',
        email: 'flow-test@example.com',
        password: 'password123',
        firstName: 'Flow',
        lastName: 'Test'
      }
    });
    
    expect(registerResponse.statusCode).toBe(201);
    
    // 2. Login
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'flow-test@example.com',
        password: 'password123'
      }
    });
    
    expect(loginResponse.statusCode).toBe(200);
    const authCookie = loginResponse.headers['set-cookie'];
    
    // 3. Access protected endpoint
    const meResponse = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        cookie: authCookie
      }
    });
    
    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json()).toMatchObject({
      email: 'flow-test@example.com',
      role: 'STUDENT'
    });
    
    // 4. Logout
    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: {
        cookie: authCookie
      }
    });
    
    expect(logoutResponse.statusCode).toBe(200);
  });
});
```

## 🎭 Test Helpers

### Database Helpers

```typescript
// src/__tests__/helpers/database-helpers.ts
import { prisma } from 'db-postgres';

export async function cleanDatabase() {
  // Clean in reverse order of dependencies
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.application.deleteMany();
  await prisma.adoptionRequest.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();
}

export async function seedTestData() {
  // Create test skills
  await prisma.skill.createMany({
    data: [
      { name: 'JavaScript', category: 'Programming' },
      { name: 'React', category: 'Frontend' },
      { name: 'Node.js', category: 'Backend' }
    ]
  });
}
```

### Authentication Helpers

```typescript
// src/__tests__/helpers/auth-helpers.ts
import bcrypt from 'bcryptjs';
import { prisma } from 'db-postgres';

export async function createTestUser(role = 'STUDENT', overrides = {}) {
  const baseData = {
    email: `test-${Date.now()}@example.com`,
    password: await bcrypt.hash('password123', 10),
    role,
    ...overrides
  };
  
  const user = await prisma.user.create({
    data: baseData
  });
  
  // Create profile based on role
  if (role === 'STUDENT') {
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        firstName: 'Test',
        lastName: 'Student',
        school: 'Test University',
        degree: 'Computer Science'
      }
    });
  } else if (role === 'COMPANY') {
    await prisma.companyProfile.create({
      data: {
        userId: user.id,
        name: 'Test Company',
        contactEmail: user.email,
        sector: 'Technology'
      }
    });
  }
  
  return user;
}

export async function loginTestUser(app, user) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      email: user.email,
      password: 'password123'
    }
  });
  
  return response.headers['set-cookie'];
}
```

## 📊 Test Coverage

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage --workspace=apps/api

# View coverage in browser
open apps/api/coverage/index.html
```

### Coverage Targets

- **Overall**: > 80%
- **Controllers**: > 90%
- **Services**: > 95%
- **Utilities**: > 90%

### Excluding Files from Coverage

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        'prisma/',
        'scripts/',
        'src/__tests__/',
        'src/types/',
        'src/config/swagger.ts' // Large config files
      ]
    }
  }
});
```

## 🔍 API Documentation Testing

### Automated Validation

```bash
# Validate API docs match implementation
npm run docs:validate

# This script:
# 1. Checks API health
# 2. Fetches OpenAPI spec
# 3. Tests public endpoints
# 4. Tests authentication flow
# 5. Validates response structures
# 6. Checks documentation files exist
```

### Manual Testing with Swagger UI

1. Start the API: `npm run dev --workspace=apps/api`
2. Open Swagger UI: [http://localhost:8080/docs](http://localhost:8080/docs)
3. Test endpoints using "Try it out" buttons
4. Verify request/response examples match documentation

## 🚨 Error Testing

### Testing Error Scenarios

```typescript
describe('Error Handling', () => {
  it('should handle validation errors', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        role: 'INVALID_ROLE',
        email: 'invalid-email'
      }
    });
    
    expect(response.statusCode).toBe(400);
    expect(response.json()).toHaveProperty('message');
  });
  
  it('should handle unauthorized access', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/me'
      // No auth cookie
    });
    
    expect(response.statusCode).toBe(401);
  });
  
  it('should handle rate limiting', async () => {
    // Make many requests quickly
    const promises = Array(100).fill().map(() =>
      app.inject({
        method: 'GET',
        url: '/api/offers'
      })
    );
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(r => r.statusCode === 429);
    
    expect(rateLimited).toBe(true);
  });
});
```

## 🔄 Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npm run db:migrate --workspace=apps/api
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
      
      - name: Run tests
        run: npm run test --workspace=apps/api
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
      
      - name: Validate API documentation
        run: npm run docs:validate
```

## 📈 Performance Testing

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"

scenarios:
  - name: "API Load Test"
    flow:
      - get:
          url: "/api/offers"
      - get:
          url: "/api/companies"
      - get:
          url: "/api/skills"
```

```bash
# Run load tests
npx artillery run artillery-config.yml
```

## 🛠️ Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clean State**: Reset database between tests
3. **Realistic Data**: Use realistic test data
4. **Error Cases**: Test both success and failure scenarios
5. **Performance**: Include performance regression tests
6. **Documentation**: Keep tests well-documented
7. **Maintenance**: Regularly update tests with API changes

## 📞 Troubleshooting Tests

### Common Issues

1. **Database Connection**: Ensure test database is running
2. **Port Conflicts**: Use different ports for test environment
3. **Async Issues**: Properly handle async operations
4. **Memory Leaks**: Clean up resources after tests
5. **Flaky Tests**: Identify and fix non-deterministic tests

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug --workspace=apps/api

# Run specific test file
npm run test -- auth.test.ts --workspace=apps/api
```
