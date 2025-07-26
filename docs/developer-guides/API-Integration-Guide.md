# API Integration Guide

## Overview

This guide provides comprehensive examples and best practices for integrating with the Adopte1Etudiant API. Whether you're building a web application, mobile app, or third-party integration, this guide will help you get started quickly.

## 🚀 Quick Start

### Prerequisites

- API access credentials
- Basic understanding of REST APIs
- HTTP client (curl, Postman, or programming language HTTP library)

### Base URLs

- **Development**: `http://localhost:8080`
- **Production**: `https://api.adopte1etudiant.com`

## 🔐 Authentication Setup

### Step 1: Register a New User

```bash
# Register a student
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "role": "STUDENT",
    "email": "john.doe@university.edu",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

```bash
# Register a company
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "role": "COMPANY",
    "email": "hr@techcorp.com",
    "password": "companySecure456",
    "name": "TechCorp Solutions",
    "contactEmail": "contact@techcorp.com"
  }'
```

### Step 2: Login and Get Session

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john.doe@university.edu",
    "password": "securePassword123"
  }'
```

### Step 3: Verify Authentication

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -b cookies.txt
```

## 📝 Common Integration Patterns

### 1. Student Profile Management

```javascript
// Create/Update Student Profile
const updateProfile = async (profileData) => {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      school: profileData.school,
      degree: profileData.degree,
      skills: profileData.skills,
      isOpenToOpportunities: true,
      isCvPublic: true
    })
  });
  
  return response.json();
};
```

### 2. Job Offer Management

```javascript
// Create a Job Offer (Company only)
const createOffer = async (offerData) => {
  const response = await fetch('/api/offers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      title: offerData.title,
      description: offerData.description,
      location: offerData.location,
      duration: offerData.duration,
      skills: offerData.skills
    })
  });
  
  return response.json();
};

// Browse Job Offers
const getOffers = async (filters = {}) => {
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    ...(filters.search && { search: filters.search }),
    ...(filters.location && { location: filters.location }),
    ...(filters.skills && { skills: filters.skills.join(',') })
  });
  
  const response = await fetch(`/api/offers?${params}`, {
    credentials: 'include'
  });
  
  return response.json();
};
```

### 3. Application Workflow

```javascript
// Apply to a Job Offer (Student only)
const applyToOffer = async (offerId) => {
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ offerId })
  });
  
  return response.json();
};

// Get My Applications (Student)
const getMyApplications = async (status = null) => {
  const params = new URLSearchParams({
    page: 1,
    limit: 20,
    ...(status && { status })
  });
  
  const response = await fetch(`/api/applications/my-applications?${params}`, {
    credentials: 'include'
  });
  
  return response.json();
};

// Update Application Status (Company)
const updateApplicationStatus = async (applicationId, status) => {
  const response = await fetch(`/api/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  
  return response.json();
};
```

## 🔍 Advanced Features

### Pagination Handling

```javascript
const getAllOffers = async () => {
  let allOffers = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`/api/offers?page=${page}&limit=50`, {
      credentials: 'include'
    });
    
    const data = await response.json();
    allOffers = [...allOffers, ...data.offers];
    
    hasMore = page < data.pagination.totalPages;
    page++;
  }
  
  return allOffers;
};
```

### Error Handling

```javascript
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error ${response.status}: ${error.message}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
```

### Real-time Features

```javascript
// Polling for new messages
const pollForMessages = (conversationId, callback) => {
  let lastMessageId = null;
  
  const poll = async () => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      const newMessages = lastMessageId 
        ? data.messages.filter(msg => msg.id > lastMessageId)
        : data.messages;
      
      if (newMessages.length > 0) {
        callback(newMessages);
        lastMessageId = newMessages[newMessages.length - 1].id;
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };
  
  // Poll every 5 seconds
  const interval = setInterval(poll, 5000);
  
  // Initial poll
  poll();
  
  // Return cleanup function
  return () => clearInterval(interval);
};
```

## 🛠️ SDK Generation

### Generate TypeScript Client

```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/docs/json \
  -g typescript-fetch \
  -o ./generated-client \
  --additional-properties=typescriptThreePlus=true
```

### Generate Python Client

```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/docs/json \
  -g python \
  -o ./python-client \
  --additional-properties=packageName=adopte1etudiant_api
```

## 📱 Mobile Integration

### React Native Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

class AdopteAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await AsyncStorage.getItem('auth_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Authentication methods
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      await AsyncStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }
  
  // Profile methods
  async getProfile() {
    return this.request('/api/profile');
  }
  
  // Offers methods
  async getOffers(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/api/offers?${params}`);
  }
}

// Usage
const api = new AdopteAPI('https://api.adopte1etudiant.com');
```

## 🧪 Testing Your Integration

### Unit Tests Example

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { AdopteAPI } from './adopte-api';

describe('AdopteAPI', () => {
  let api;
  
  beforeEach(() => {
    api = new AdopteAPI('http://localhost:8080');
  });
  
  it('should login successfully', async () => {
    const response = await api.login('test@example.com', 'password123');
    expect(response).toHaveProperty('message');
    expect(response.message).toBe('Login successful');
  });
  
  it('should fetch offers with pagination', async () => {
    const response = await api.getOffers({ page: 1, limit: 10 });
    expect(response).toHaveProperty('offers');
    expect(response).toHaveProperty('pagination');
    expect(response.pagination.page).toBe(1);
  });
});
```

## 📞 Support & Resources

- **API Documentation**: [http://localhost:8080/docs](http://localhost:8080/docs)
- **GitHub Issues**: [Report bugs and request features](https://github.com/HusseinDStudy/new_adopte1etudiant/issues)
- **Email Support**: support@adopte1etudiant.com
- **Developer Community**: [Join our Discord](https://discord.gg/adopte1etudiant)

## 🔄 Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authenticated requests**: 1000 requests per hour
- **Public endpoints**: 100 requests per hour
- **Rate limit headers** are included in responses:
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## 🚨 Best Practices

1. **Always handle errors gracefully**
2. **Implement proper retry logic with exponential backoff**
3. **Cache responses when appropriate**
4. **Use pagination for large datasets**
5. **Validate input data before sending requests**
6. **Keep authentication tokens secure**
7. **Monitor rate limits and implement backoff strategies**
8. **Use HTTPS in production**
9. **Implement proper logging for debugging**
10. **Test your integration thoroughly**
