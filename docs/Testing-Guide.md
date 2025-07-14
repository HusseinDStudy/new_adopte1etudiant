# Testing Guide

## Overview

This project maintains a comprehensive test suite with **302 tests** achieving high coverage standards:
- **89.21% Statement Coverage**
- **81.67% Branch Coverage** 
- **100% Function Coverage**

All tests use **Vitest** as the testing framework with **Supertest** for API integration testing.

## Test Architecture

### Test Categories

1. **Unit Tests** - Individual controller and middleware functions
2. **Integration Tests** - Full API endpoint testing with database
3. **End-to-End Tests** - Complete user workflows
4. **Security Tests** - Authentication, authorization, and security vulnerabilities
5. **Performance Tests** - Load testing and stress testing
6. **Contract Tests** - API contract validation

### Test File Structure

```
src/__tests__/
├── helpers/
│   ├── test-app.ts          # Test application setup
│   └── test-setup.ts        # Database helpers and test utilities
├── auth.test.ts             # Authentication and authorization
├── application.test.ts      # Job application management
├── adoptionRequest.test.ts  # Student adoption requests
├── message.test.ts          # Messaging and conversations
├── company.test.ts          # Company management
├── student.test.ts          # Student management
├── offer.test.ts            # Job offer management
├── skill.test.ts            # Skills management
├── profile.test.ts          # User profile management
├── twoFactorAuth.test.ts    # Two-factor authentication
├── oauth.test.ts            # OAuth integration
├── security.test.ts         # Security testing
├── performance.test.ts      # Performance and load testing
├── e2e-workflows.test.ts    # End-to-end user workflows
├── api-contract.test.ts     # API contract validation
└── optionalAuthMiddleware.test.ts # Optional auth middleware
```

## Running Tests

Before running the test suite, a PostgreSQL instance must be available. You can start the local development database using:

```bash
docker compose -f docker-compose.db.yml up -d
```

Ensure the `DATABASE_URL` environment variable matches the connection string in `.env.example` before executing `npm test`.


### All Tests
```bash
npm test
```

### Specific Test File
```bash
npm test -- src/__tests__/auth.test.ts
```

### With Coverage Report
```bash
npm test -- --coverage
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Debug Mode
```bash
npm test -- --reporter=verbose
```

## Test Setup and Helpers

### Database Management

The test suite uses helper functions for consistent database management:

```typescript
// Clean database before each test
await cleanupDatabase();

// Create test data
const company = await createTestCompany(app);
const student = await createTestStudent(app);
const skills = await createTestSkills(['React', 'Node.js']);
```

### Test Application Setup

Each test file uses a standardized application setup:

```typescript
describe('Test Suite', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();
    // Setup test data
  });

  afterEach(async () => {
    await cleanupDatabase();
  });
});
```

## Coverage Goals and Achievements

### Coverage Targets
- **Statement Coverage**: ≥80% ✅ (Achieved: 89.21%)
- **Branch Coverage**: ≥80% ✅ (Achieved: 81.67%)
- **Function Coverage**: ≥90% ✅ (Achieved: 100%)

### Controller-Specific Coverage

| Controller | Statement | Branch | Functions | Status |
|------------|-----------|---------|-----------|---------|
| applicationController | 93.54% | 86.66% | 100% | ✅ Excellent |
| adoptionRequestController | 93.39% | 75.86% | 100% | ✅ Good |
| messageController | 91.46% | 76.66% | 100% | ✅ Good |
| authController | 90.07% | 80.55% | 100% | ✅ Good |
| companyController | 88.46% | 50% | 100% | ⚠️ Limited branching |
| skillController | 88.46% | 50% | 100% | ⚠️ Limited branching |

## Testing Best Practices

### 1. Test Structure
Follow the **Arrange-Act-Assert** pattern:

```typescript
it('should create a new user', async () => {
  // Arrange
  const userData = {
    email: 'test@example.com',
    password: 'password123',
    role: 'STUDENT'
  };

  // Act
  const response = await supertest(app.server)
    .post('/api/auth/register')
    .send(userData);

  // Assert
  expect(response.status).toBe(201);
  expect(response.body.email).toBe(userData.email);
});
```

### 2. Database Isolation
Each test should be isolated and not depend on other tests:

```typescript
beforeEach(async () => {
  await cleanupDatabase();
  // Create fresh test data for this test
});
```

### 3. Authentication Testing
Test both authenticated and unauthenticated scenarios:

```typescript
// Test authenticated access
const response = await supertest(app.server)
  .get('/api/profile')
  .set('Cookie', `token=${authToken}`);

// Test unauthenticated access
const unauthResponse = await supertest(app.server)
  .get('/api/profile');
expect(unauthResponse.status).toBe(401);
```

### 4. Error Case Testing
Always test error scenarios:

```typescript
// Test validation errors
const response = await supertest(app.server)
  .post('/api/auth/register')
  .send({ email: 'invalid-email' });
expect(response.status).toBe(400);

// Test resource not found
const response = await supertest(app.server)
  .get('/api/offers/nonexistent-id');
expect(response.status).toBe(404);
```

### 5. Edge Case Testing
Test boundary conditions and edge cases:

```typescript
// Empty arrays
expect(response.body).toBeInstanceOf(Array);
expect(response.body.length).toBe(0);

// Large payloads
const largeDescription = 'x'.repeat(10000);
// Test limits and validation

// Special characters and encoding
const specialChars = 'Test with émojis 🚀 and special chars';
```

## Comprehensive Test Categories

### Authentication Tests (`auth.test.ts`)
- User registration (student/company)
- Login/logout flows
- Password validation
- OAuth integration (Google)
- Two-factor authentication
- Session management
- Token validation
- Account linking

### Application Tests (`application.test.ts`)
- Create job applications
- Update application status
- List applications (student/company views)
- Conversation creation on status changes
- Permission validation
- Duplicate application prevention

### Adoption Request Tests (`adoptionRequest.test.ts`)
- Create adoption requests
- Update request status (accept/reject)
- List sent/received requests
- Conversation integration
- Company profile requirements
- Duplicate request prevention

### Message Tests (`message.test.ts`)
- Create conversations
- Send/receive messages
- List conversations with proper ordering
- Access control validation
- Rejected conversation handling
- Empty conversation scenarios

### Security Tests (`security.test.ts`)
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Session security
- Concurrent login protection

### Performance Tests (`performance.test.ts`)
- Load testing with multiple concurrent users
- Database query optimization
- Response time benchmarking
- Memory usage monitoring
- Stress testing under high load

## Test Data Management

### Faker Integration
The test suite uses `@faker-js/faker` for generating realistic test data:

```typescript
const userData = {
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: faker.internet.password()
};
```

### Test Helpers
Standardized helpers for common operations:

```typescript
// Create test company with profile
const company = await createTestCompany(app, {
  name: 'Test Company',
  contactEmail: 'test@company.com'
});

// Create test student with profile
const student = await createTestStudent(app, {
  firstName: 'John',
  lastName: 'Doe'
});

// Create predefined skills
const skills = await createTestSkills(['React', 'Node.js', 'Python']);
```

## Debugging Failed Tests

### Common Issues and Solutions

1. **Database State Issues**
   ```bash
   # Ensure clean database state
   await cleanupDatabase();
   ```

2. **Authentication Token Issues**
   ```typescript
   // Verify token extraction
   const cookie = response.headers['set-cookie'][0];
   const token = cookie.split(';')[0].replace('token=', '');
   ```

3. **Timing Issues**
   ```typescript
   // Add delays for timestamp-dependent tests
   await new Promise(resolve => setTimeout(resolve, 100));
   ```

4. **Foreign Key Constraint Violations**
   ```typescript
   // Follow proper deletion order
   await prisma.message.deleteMany();
   await prisma.conversation.deleteMany();
   await prisma.application.deleteMany();
   // ... continue in dependency order
   ```

### Debugging Commands

```bash
# Run specific test with verbose output
npm test -- src/__tests__/auth.test.ts --reporter=verbose

# Run single test case
npm test -- src/__tests__/auth.test.ts -t "should register a new user"

# Debug with console output
npm test -- --reporter=verbose --silent=false
```

## Test Coverage Analysis

### Reading Coverage Reports

The coverage report shows:
- **Statements**: Lines of code executed
- **Branches**: Conditional paths tested
- **Functions**: Functions called during tests
- **Lines**: Physical lines covered

### Improving Coverage

1. **Identify Uncovered Code**
   ```bash
   npm test -- --coverage --reporter=verbose
   ```

2. **Add Missing Test Cases**
   - Error handling paths
   - Edge cases and boundary conditions
   - Alternative code paths
   - Exception scenarios

3. **Focus on Low Coverage Areas**
   - Controllers with <80% branch coverage
   - Complex conditional logic
   - Error handling code

## Continuous Integration

### GitHub Actions Integration
Tests run automatically on:
- Pull request creation
- Push to main branch
- Scheduled daily runs

### Coverage Thresholds
CI fails if coverage drops below:
- 70% statement coverage
- 70% function coverage
- 65% branch coverage

## Future Improvements

### Planned Enhancements
1. **Visual Regression Testing** - UI component testing
2. **API Performance Benchmarking** - Automated performance monitoring
3. **Database Migration Testing** - Schema change validation
4. **Security Vulnerability Scanning** - Automated security testing
5. **Cross-browser Testing** - Frontend compatibility testing

### Coverage Goals
- **Target**: 90%+ statement coverage
- **Stretch Goal**: 85%+ branch coverage
- **Maintain**: 100% function coverage

## Contributing to Tests

### Adding New Tests
1. Follow existing test file patterns
2. Include both success and error cases
3. Test authentication requirements
4. Add edge case scenarios
5. Maintain database isolation

### Test Review Checklist
- [ ] Tests are isolated and don't depend on each other
- [ ] Both positive and negative cases are covered
- [ ] Authentication/authorization is tested
- [ ] Edge cases and error conditions are included
- [ ] Database cleanup is properly handled
- [ ] Test names are descriptive and clear

## Conclusion

The test suite provides comprehensive coverage of the application's functionality, ensuring reliability and maintainability. With 302 tests achieving high coverage standards, the codebase is well-protected against regressions and provides confidence for ongoing development.

Regular test maintenance and continuous improvement of coverage ensure the application remains robust and reliable as it evolves. 