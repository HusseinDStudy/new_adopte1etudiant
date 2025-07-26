# Test Plan

## Document Information
- **Project**: AdopteUnEtudiant
- **Version**: 2.0
- **Last Updated**: January 2025
- **Test Environment**: Automated + Manual
- **Total Test Cases**: 302 automated tests

## Test Scope

### In Scope
- **Authentication & Authorization** (56 test cases)
- **User Management** (Student & Company profiles)
- **Job Application System** (22 test cases)
- **Adoption Request System** (23 test cases) 
- **Messaging System** (31 test cases)
- **Skills Management** (10 test cases)
- **Two-Factor Authentication** (16 test cases)
- **OAuth Integration** (14 test cases)
- **Security Controls** (21 test cases)
- **Performance & Load Testing** (20 test cases)
- **API Contract Validation** (29 test cases)

### Out of Scope
- Third-party service testing (Google OAuth server)
- Email delivery testing (SMTP server)
- Browser compatibility testing
- Mobile app testing (not yet developed)

## Test Environment

### Technical Stack
- **Backend**: Node.js + Fastify + TypeScript
- **Database**: PostgreSQL (test instance)
- **Test Framework**: Vitest + Supertest
- **Coverage Tool**: V8 Coverage Provider
- **Data Generation**: @faker-js/faker

### Environment Setup
- **Isolated test database** with automatic cleanup
- **Mock external services** (email, OAuth)
- **Parallel test execution** for speed
- **Coverage reporting** integrated

## Test Categories

## 1. Authentication Tests (`auth.test.ts`) - 56 Tests

### 1.1 User Registration
**Test Cases**: 8 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| AUTH-REG-001 | Register new student with valid data | 201 Created, user profile created |
| AUTH-REG-002 | Register new company with valid data | 201 Created, company profile created |
| AUTH-REG-003 | Register with existing email | 409 Conflict error |
| AUTH-REG-004 | Register with invalid email format | 400 Validation error |
| AUTH-REG-005 | Register with weak password | 400 Validation error |
| AUTH-REG-006 | Register without required fields | 400 Validation error |
| AUTH-REG-007 | Register with malformed request | 400 Bad request |
| AUTH-REG-008 | Register with SQL injection attempt | 400 Validation error |

### 1.2 User Login
**Test Cases**: 12 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| AUTH-LOG-001 | Login with valid credentials | 200 OK, JWT token set |
| AUTH-LOG-002 | Login with invalid email | 401 Unauthorized |
| AUTH-LOG-003 | Login with invalid password | 401 Unauthorized |
| AUTH-LOG-004 | Login with non-existent user | 401 Unauthorized |
| AUTH-LOG-005 | Login with missing fields | 400 Bad request |
| AUTH-LOG-006 | Login with disabled password | 403 Forbidden |
| AUTH-LOG-007 | Login with OAuth-only account | 401 Unauthorized |
| AUTH-LOG-008 | Login with 2FA enabled | 200 OK, 2FA required |
| AUTH-LOG-009 | Login rate limiting test | 429 Too many requests |
| AUTH-LOG-010 | Login with expired session | 401 Unauthorized |
| AUTH-LOG-011 | Login concurrent sessions | Multiple sessions allowed |
| AUTH-LOG-012 | Login session persistence | Session maintained |

### 1.3 OAuth Integration
**Test Cases**: 14 tests
**Priority**: High

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| OAUTH-001 | Google OAuth callback success | User authenticated |
| OAUTH-002 | Google OAuth callback with error | Error handled gracefully |
| OAUTH-003 | OAuth account linking | Accounts linked successfully |
| OAUTH-004 | OAuth new user creation | New user created with OAuth |
| OAUTH-005 | OAuth existing user login | Existing user authenticated |
| OAUTH-006 | OAuth profile completion | Profile completion flow |
| OAUTH-007 | OAuth registration flow | Complete OAuth registration |
| OAUTH-008 | OAuth error handling | Errors handled properly |
| OAUTH-009 | OAuth state validation | CSRF protection active |
| OAUTH-010 | OAuth token validation | Tokens validated correctly |
| OAUTH-011 | OAuth user already logged in | Existing session handled |
| OAUTH-012 | OAuth account deletion callback | Account deletion processed |
| OAUTH-013 | OAuth scope validation | Required scopes validated |
| OAUTH-014 | OAuth error edge cases | Various error scenarios |

### 1.4 Two-Factor Authentication
**Test Cases**: 16 tests
**Priority**: High

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| 2FA-001 | Generate 2FA secret | QR code and secret generated |
| 2FA-002 | Enable 2FA with valid token | 2FA enabled successfully |
| 2FA-003 | Enable 2FA with invalid token | 401 Invalid token |
| 2FA-004 | Enable 2FA when already enabled | 400 Already enabled |
| 2FA-005 | Verify 2FA login with valid token | Login successful |
| 2FA-006 | Verify 2FA login with invalid token | 401 Invalid token |
| 2FA-007 | Verify 2FA with recovery code | Login successful |
| 2FA-008 | Verify 2FA with expired session | 401 Session expired |
| 2FA-009 | Disable 2FA with valid password | 2FA disabled |
| 2FA-010 | Disable 2FA with invalid password | 401 Invalid password |
| 2FA-011 | Generate recovery codes | Codes generated |
| 2FA-012 | Use recovery code once | Code invalidated |
| 2FA-013 | 2FA secret regeneration | New secret generated |
| 2FA-014 | 2FA backup codes validation | Codes validated |
| 2FA-015 | 2FA time window validation | Time-based validation |
| 2FA-016 | 2FA brute force protection | Rate limiting active |

## 2. Application Management Tests (`application.test.ts`) - 22 Tests

### 2.1 Create Applications
**Test Cases**: 6 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| APP-CRE-001 | Create application with valid data | 201 Created |
| APP-CRE-002 | Create duplicate application | 409 Conflict |
| APP-CRE-003 | Create without student profile | 403 Forbidden |
| APP-CRE-004 | Create for non-existent offer | 404 Not found |
| APP-CRE-005 | Create without authentication | 401 Unauthorized |
| APP-CRE-006 | Create with invalid offer ID | 400 Bad request |

### 2.2 Update Application Status
**Test Cases**: 10 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| APP-UPD-001 | Update to HIRED status | Conversation created |
| APP-UPD-002 | Update to INTERVIEW status | Conversation created |
| APP-UPD-003 | Update to REJECTED status | No conversation |
| APP-UPD-004 | Update to SEEN status | No conversation |
| APP-UPD-005 | Update non-existent application | 404 Not found |
| APP-UPD-006 | Update without permission | 403 Forbidden |
| APP-UPD-007 | Update with invalid status | 400 Bad request |
| APP-UPD-008 | Update duplicate conversation | No duplicate created |
| APP-UPD-009 | Update without authentication | 401 Unauthorized |
| APP-UPD-010 | Update with malformed request | 400 Bad request |

### 2.3 List Applications
**Test Cases**: 6 tests
**Priority**: Medium

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| APP-LST-001 | List student applications | Applications returned |
| APP-LST-002 | List with no applications | Empty array |
| APP-LST-003 | List with proper ordering | Newest first |
| APP-LST-004 | List without authentication | 401 Unauthorized |
| APP-LST-005 | List with conversation data | Conversations included |
| APP-LST-006 | List with offer details | Offer data included |

## 3. Adoption Request Tests (`adoptionRequest.test.ts`) - 23 Tests

### 3.1 Create Adoption Requests
**Test Cases**: 8 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| ADR-CRE-001 | Create with valid data | Request and conversation created |
| ADR-CRE-002 | Create duplicate request | 409 Conflict |
| ADR-CRE-003 | Create without company profile | 403 Forbidden |
| ADR-CRE-004 | Create without message | 400 Bad request |
| ADR-CRE-005 | Create with invalid student ID | 400 Bad request |
| ADR-CRE-006 | Create without authentication | 401 Unauthorized |
| ADR-CRE-007 | Create with empty message | 400 Bad request |
| ADR-CRE-008 | Create with long message | 201 Created |

### 3.2 Update Request Status
**Test Cases**: 8 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| ADR-UPD-001 | Accept adoption request | Status updated to ACCEPTED |
| ADR-UPD-002 | Reject adoption request | Status updated to REJECTED |
| ADR-UPD-003 | Update non-existent request | 404 Not found |
| ADR-UPD-004 | Update without permission | 404 Not found |
| ADR-UPD-005 | Update with invalid status | 400 Bad request |
| ADR-UPD-006 | Update without authentication | 401 Unauthorized |
| ADR-UPD-007 | Update already processed | Status updated |
| ADR-UPD-008 | Update by wrong user | 404 Not found |

### 3.3 List Requests
**Test Cases**: 7 tests
**Priority**: Medium

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| ADR-LST-001 | List sent requests (company) | Requests returned |
| ADR-LST-002 | List received requests (student) | Requests returned |
| ADR-LST-003 | List with no requests | Empty array |
| ADR-LST-004 | List without authentication | 401 Unauthorized |
| ADR-LST-005 | List with conversation data | Conversations included |
| ADR-LST-006 | List with proper ordering | Newest first |
| ADR-LST-007 | List with student skills | Skills included |

## 4. Messaging System Tests (`message.test.ts`) - 31 Tests

### 4.1 Conversation Management
**Test Cases**: 13 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| MSG-CON-001 | List conversations (student) | Conversations returned |
| MSG-CON-002 | List conversations (company) | Conversations returned |
| MSG-CON-003 | List with no conversations | Empty array |
| MSG-CON-004 | List without authentication | 401 Unauthorized |
| MSG-CON-005 | List with proper topic formatting | Adoption requests formatted |
| MSG-CON-006 | List ordered by recent activity | Most recent first |
| MSG-CON-007 | List with no messages | "No messages yet" shown |
| MSG-CON-008 | Get conversation messages | Messages returned |
| MSG-CON-009 | Get without permission | 403 Forbidden |
| MSG-CON-010 | Get non-existent conversation | 403 Forbidden |
| MSG-CON-011 | Get with adoption status | Status included |
| MSG-CON-012 | Get empty conversation | Empty messages array |
| MSG-CON-013 | Get with unauthorized user | 403 Forbidden |

### 4.2 Message Creation
**Test Cases**: 18 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| MSG-SND-001 | Send message (student) | 201 Created |
| MSG-SND-002 | Send message (company) | 201 Created |
| MSG-SND-003 | Send to rejected conversation | 403 Forbidden |
| MSG-SND-004 | Send to accepted conversation | 201 Created |
| MSG-SND-005 | Send without permission | 403 Forbidden |
| MSG-SND-006 | Send to non-existent conversation | 404 Not found |
| MSG-SND-007 | Send without authentication | 401 Unauthorized |
| MSG-SND-008 | Send with empty content | 400 Bad request |
| MSG-SND-009 | Send with missing content | 400 Bad request |
| MSG-SND-010 | Send with valid content | Message created |
| MSG-SND-011 | Send with long content | 201 Created |
| MSG-SND-012 | Send with special characters | 201 Created |
| MSG-SND-013 | Send as unauthorized user | 403 Forbidden |
| MSG-SND-014 | Send with HTML content | Content sanitized |
| MSG-SND-015 | Send with script tags | Content sanitized |
| MSG-SND-016 | Send message ordering | Proper timestamp order |
| MSG-SND-017 | Send with emoji content | 201 Created |
| MSG-SND-018 | Send rate limiting | Rate limits enforced |

## 5. Security Tests (`security.test.ts`) - 21 Tests

### 5.1 Authentication Security
**Test Cases**: 8 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| SEC-AUTH-001 | JWT token validation | Invalid tokens rejected |
| SEC-AUTH-002 | Token expiration | Expired tokens rejected |
| SEC-AUTH-003 | Token tampering | Modified tokens rejected |
| SEC-AUTH-004 | Session hijacking prevention | Sessions properly isolated |
| SEC-AUTH-005 | Concurrent login protection | Multiple sessions handled |
| SEC-AUTH-006 | Password brute force | Rate limiting active |
| SEC-AUTH-007 | Account lockout | Accounts locked after attempts |
| SEC-AUTH-008 | Session timeout | Sessions expire properly |

### 5.2 Input Validation Security
**Test Cases**: 8 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| SEC-INP-001 | SQL injection in login | Injection prevented |
| SEC-INP-002 | XSS in message content | Scripts sanitized |
| SEC-INP-003 | CSRF token validation | CSRF attacks prevented |
| SEC-INP-004 | File upload validation | Malicious files rejected |
| SEC-INP-005 | Request size limits | Large requests rejected |
| SEC-INP-006 | Header injection | Header attacks prevented |
| SEC-INP-007 | Path traversal | Directory traversal prevented |
| SEC-INP-008 | Command injection | Command injection prevented |

### 5.3 Authorization Security
**Test Cases**: 5 tests
**Priority**: Critical

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| SEC-AUZ-001 | Role-based access control | Permissions enforced |
| SEC-AUZ-002 | Resource ownership | Only owners can modify |
| SEC-AUZ-003 | Privilege escalation | Escalation prevented |
| SEC-AUZ-004 | Cross-user data access | Access properly restricted |
| SEC-AUZ-005 | Admin panel access | Admin-only areas protected |

## 6. Performance Tests (`performance.test.ts`) - 20 Tests

### 6.1 Load Testing
**Test Cases**: 10 tests
**Priority**: High

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| PERF-LOAD-001 | 50 concurrent users login | < 2s response time |
| PERF-LOAD-002 | 100 concurrent API calls | < 1s response time |
| PERF-LOAD-003 | Database query optimization | < 500ms query time |
| PERF-LOAD-004 | Memory usage under load | < 512MB memory |
| PERF-LOAD-005 | CPU usage monitoring | < 80% CPU usage |
| PERF-LOAD-006 | Connection pool limits | Connections properly managed |
| PERF-LOAD-007 | Rate limiting effectiveness | Limits enforced |
| PERF-LOAD-008 | Cache performance | Cache hits > 80% |
| PERF-LOAD-009 | Database connection pooling | Connections reused |
| PERF-LOAD-010 | API response compression | Responses compressed |

### 6.2 Stress Testing
**Test Cases**: 10 tests
**Priority**: Medium

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| PERF-STR-001 | Maximum user capacity | System handles 500+ users |
| PERF-STR-002 | Database stress test | No data corruption |
| PERF-STR-003 | Memory leak detection | No memory leaks |
| PERF-STR-004 | Error handling under load | Graceful degradation |
| PERF-STR-005 | Recovery after overload | System recovers properly |
| PERF-STR-006 | File upload stress | Large files handled |
| PERF-STR-007 | Search performance | Search < 2s response |
| PERF-STR-008 | Report generation | Reports generated quickly |
| PERF-STR-009 | Concurrent database writes | No deadlocks |
| PERF-STR-010 | Network timeout handling | Timeouts handled gracefully |

## Test Execution Schedule

### Automated Test Execution
- **Continuous Integration**: On every commit
- **Nightly Builds**: Full test suite + performance tests
- **Weekly**: Security scan + dependency audit
- **Release**: Complete test suite + manual verification

### Manual Test Execution
- **Feature Testing**: During development
- **Integration Testing**: Before staging deployment
- **User Acceptance Testing**: Before production
- **Exploratory Testing**: Weekly sessions

## Test Data Management

### Test Data Requirements
- **User Accounts**: 50+ test users (students/companies)
- **Job Offers**: 100+ test offers with various skills
- **Applications**: 200+ test applications
- **Messages**: 500+ test messages
- **Skills**: 50+ test skills

### Data Generation Strategy
- **Faker.js** for realistic test data
- **Predefined scenarios** for specific test cases
- **Dynamic generation** for load testing
- **Cleanup procedures** after each test

## Defect Management

### Severity Levels
1. **Critical**: System crashes, security vulnerabilities
2. **High**: Major feature not working, data loss
3. **Medium**: Feature partially working, workaround exists
4. **Low**: Minor UI issues, performance degradation

### Resolution Timeframes
- **Critical**: 4 hours
- **High**: 24 hours
- **Medium**: 1 week
- **Low**: Next release cycle

## Test Reporting

### Daily Reports
- Test execution results
- Coverage metrics
- Failed test analysis
- Performance benchmarks

### Weekly Reports
- Coverage trend analysis
- Test suite performance
- Defect summary
- Quality metrics

### Release Reports
- Complete test execution summary
- Coverage achievement
- Known issues and workarounds
- Performance validation

## Risk Assessment

### High Risk Areas
1. **Authentication System** - Security critical
2. **Payment Processing** - Financial impact
3. **Data Migration** - Data integrity
4. **Third-party Integrations** - External dependencies

### Mitigation Strategies
- **Comprehensive test coverage** for critical areas
- **Manual verification** for high-risk changes
- **Staged rollouts** for major updates
- **Rollback procedures** for failures

## Success Criteria

### Test Completion Criteria
- **100% test execution** completion
- **Zero critical defects** remaining
- **Coverage thresholds** met (80%+ branch coverage)
- **Performance benchmarks** achieved

### Quality Gates
- All tests passing
- No security vulnerabilities
- Performance within acceptable limits
- Documentation updated

## Conclusion

This comprehensive test plan ensures the AdopteUnEtudiant platform maintains high quality and reliability. The combination of automated testing, manual verification, and continuous monitoring provides confidence in system stability and user satisfaction.

Regular review and updates of this test plan ensure it remains relevant and effective as the application evolves. 