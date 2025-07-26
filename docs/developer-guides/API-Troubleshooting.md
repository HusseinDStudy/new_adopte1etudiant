# API Troubleshooting Guide

## Overview

This guide helps you diagnose and resolve common issues when working with the Adopte1Etudiant API. Use this as your first resource when encountering problems.

## 🚨 Common Error Codes & Solutions

### 400 Bad Request

**Symptoms**: Request validation failed, malformed JSON, or missing required fields.

**Common Causes**:
- Invalid JSON syntax
- Missing required fields
- Invalid data types
- Field validation failures

**Solutions**:

```bash
# ❌ Bad Request Example
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "STUDENT",
    "email": "invalid-email",
    "password": "123"
  }'

# ✅ Correct Request
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "STUDENT",
    "email": "john.doe@university.edu",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Debugging Steps**:
1. Validate JSON syntax using a JSON validator
2. Check all required fields are present
3. Verify data types match the API specification
4. Review field validation rules in the API docs

### 401 Unauthorized

**Symptoms**: Authentication required or invalid credentials.

**Common Causes**:
- Missing authentication cookie
- Expired JWT token
- Invalid credentials
- Not logged in

**Solutions**:

```bash
# Check if you're authenticated
curl -X GET http://localhost:8080/api/auth/me \
  -b cookies.txt

# If not authenticated, login first
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Debugging Steps**:
1. Verify you're including cookies in requests (`-b cookies.txt` for curl)
2. Check if your session has expired
3. Confirm your credentials are correct
4. Ensure you're using the correct authentication method

### 403 Forbidden

**Symptoms**: Insufficient permissions for the requested action.

**Common Causes**:
- Wrong user role (Student trying to access Company endpoints)
- Trying to access resources you don't own
- Account restrictions

**Solutions**:

```javascript
// Check your current user role
const checkRole = async () => {
  const response = await fetch('/api/auth/me', {
    credentials: 'include'
  });
  const user = await response.json();
  console.log('Current role:', user.role);
};

// Ensure you're using the correct role-specific endpoints
// Students: /api/applications/my-applications
// Companies: /api/offers/my-offers
```

**Debugging Steps**:
1. Verify your user role matches the endpoint requirements
2. Check if you're trying to access resources you own
3. Review the endpoint documentation for role restrictions

### 404 Not Found

**Symptoms**: Requested resource doesn't exist.

**Common Causes**:
- Incorrect URL or endpoint
- Resource has been deleted
- Invalid resource ID
- Typo in the request path

**Solutions**:

```bash
# ❌ Wrong endpoint
curl http://localhost:8080/api/offer/123

# ✅ Correct endpoint
curl http://localhost:8080/api/offers/123
```

**Debugging Steps**:
1. Double-check the endpoint URL
2. Verify the resource ID exists
3. Check if the resource has been deleted
4. Review the API documentation for correct paths

### 409 Conflict

**Symptoms**: Resource already exists or conflicting state.

**Common Causes**:
- Trying to register with an existing email
- Applying to the same job offer twice
- Duplicate resource creation

**Solutions**:

```javascript
// Handle conflict errors gracefully
const handleRegistration = async (userData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (response.status === 409) {
      const error = await response.json();
      console.log('Conflict:', error.message);
      // Handle duplicate email case
      return { error: 'Email already registered' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### 422 Validation Error

**Symptoms**: Data validation failed with detailed error messages.

**Common Causes**:
- Field length violations
- Invalid format (email, URL, etc.)
- Business rule violations

**Solutions**:

```javascript
// Parse validation errors
const handleValidationError = async (response) => {
  if (response.status === 422) {
    const error = await response.json();
    console.log('Validation errors:', error.details);
    
    // Display specific field errors to user
    Object.entries(error.details).forEach(([field, message]) => {
      console.log(`${field}: ${message}`);
    });
  }
};
```

### 429 Too Many Requests

**Symptoms**: Rate limit exceeded.

**Common Causes**:
- Making too many requests too quickly
- Exceeding hourly rate limits
- Aggressive polling or retry logic

**Solutions**:

```javascript
// Implement exponential backoff
const apiCallWithRetry = async (url, options, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || Math.pow(2, attempt);
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
    }
  }
};
```

## 🔧 Debugging Tools & Techniques

### 1. Enable Verbose Logging

```bash
# Use curl with verbose output
curl -v -X GET http://localhost:8080/api/auth/me \
  -b cookies.txt

# Check response headers
curl -I http://localhost:8080/api/offers
```

### 2. Inspect Network Traffic

```javascript
// Browser DevTools Network tab
// Look for:
// - Request headers (especially cookies)
// - Response status codes
// - Response body content
// - CORS errors

// Enable detailed fetch logging
const debugFetch = async (url, options) => {
  console.log('Request:', { url, options });
  
  const response = await fetch(url, options);
  
  console.log('Response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });
  
  const data = await response.json();
  console.log('Data:', data);
  
  return data;
};
```

### 3. Validate API Responses

```javascript
// Create a response validator
const validateResponse = (response, expectedSchema) => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  // Add schema validation here if needed
  return response.json();
};
```

### 4. Test with Different HTTP Clients

```bash
# Test with curl
curl -X GET http://localhost:8080/api/offers

# Test with httpie
http GET localhost:8080/api/offers

# Test with Postman or Insomnia
```

## 🌐 CORS Issues

**Symptoms**: Browser blocks requests with CORS errors.

**Common Causes**:
- Frontend running on different port than API
- Missing CORS configuration
- Preflight request failures

**Solutions**:

```javascript
// Ensure credentials are included
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
});

// For development, ensure your frontend URL is in CORS config
// Check apps/api/src/index.ts for CORS settings
```

## 🍪 Cookie Issues

**Symptoms**: Authentication not working despite successful login.

**Common Causes**:
- Cookies not being sent with requests
- SameSite policy issues
- Secure flag in development

**Solutions**:

```javascript
// Ensure credentials are included in all authenticated requests
const authenticatedFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include' // Always include cookies
  });
};

// For curl, always use -b cookies.txt for authenticated requests
curl -X GET http://localhost:8080/api/auth/me -b cookies.txt
```

## 📊 Performance Issues

**Symptoms**: Slow API responses or timeouts.

**Common Causes**:
- Large result sets without pagination
- N+1 query problems
- Network latency
- Database performance

**Solutions**:

```javascript
// Always use pagination for large datasets
const getOffersEfficiently = async () => {
  const response = await fetch('/api/offers?limit=20&page=1', {
    credentials: 'include'
  });
  return response.json();
};

// Implement request timeouts
const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};
```

## 🔍 Environment-Specific Issues

### Development Environment

```bash
# Check if API server is running
curl http://localhost:8080/health

# Verify database connection
npm run db:status --workspace=apps/api

# Check environment variables
cat apps/api/.env
```

### Production Environment

```bash
# Check API health
curl https://api.adopte1etudiant.com/health

# Verify SSL certificate
curl -I https://api.adopte1etudiant.com

# Check DNS resolution
nslookup api.adopte1etudiant.com
```

## 📝 Logging & Monitoring

### Enable API Logging

```javascript
// Add request/response logging
const loggedFetch = async (url, options) => {
  const startTime = Date.now();
  
  console.log(`🚀 ${options?.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    console.log(`✅ ${response.status} ${url} (${duration}ms)`);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${url} failed (${duration}ms):`, error);
    throw error;
  }
};
```

### Monitor API Health

```javascript
// Health check utility
const checkAPIHealth = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    
    if (response.ok) {
      console.log('✅ API is healthy');
      return true;
    } else {
      console.warn('⚠️ API returned non-200 status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API health check failed:', error);
    return false;
  }
};

// Run health check periodically
setInterval(checkAPIHealth, 60000); // Every minute
```

## 📞 Getting Help

When you need additional support:

1. **Check the Interactive API Docs**: [http://localhost:8080/docs](http://localhost:8080/docs)
2. **Search GitHub Issues**: Look for similar problems
3. **Create a Detailed Bug Report**:
   - Include error messages
   - Provide request/response examples
   - Specify your environment
   - Add steps to reproduce

4. **Contact Support**:
   - Email: support@adopte1etudiant.com
   - Include relevant logs and error details

## 🧪 Testing Your Fixes

```bash
# Run API tests
npm run test --workspace=apps/api

# Test specific endpoints
npm run test:integration --workspace=apps/api

# Validate API specification
npm run docs:generate --workspace=apps/api
```

Remember: Most API issues are related to authentication, data validation, or incorrect endpoint usage. Start with these areas when troubleshooting!
