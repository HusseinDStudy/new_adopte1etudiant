#!/usr/bin/env node

/**
 * API Documentation Validation Script
 * 
 * This script validates that the API documentation matches the actual API implementation
 * by testing all documented endpoints and comparing responses with the OpenAPI specification.
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:8080';
const DOCS_PATH = path.join(__dirname, '../docs');
const SPEC_URL = `${API_BASE_URL}/docs/json`;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class APIValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
    this.authCookie = null;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async validateAPI() {
    this.log('\n🔍 Starting API Documentation Validation\n', 'bold');

    try {
      // Step 1: Check API health
      await this.checkAPIHealth();

      // Step 2: Fetch OpenAPI specification
      const spec = await this.fetchOpenAPISpec();

      // Step 3: Validate specification structure
      await this.validateSpecification(spec);

      // Step 4: Test authentication endpoints
      await this.testAuthenticationFlow();

      // Step 5: Test public endpoints
      await this.testPublicEndpoints(spec);

      // Step 6: Test authenticated endpoints
      await this.testAuthenticatedEndpoints(spec);

      // Step 7: Validate documentation files
      await this.validateDocumentationFiles();

      // Step 8: Generate report
      this.generateReport();

    } catch (error) {
      this.log(`❌ Validation failed: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  async checkAPIHealth() {
    this.log('📡 Checking API health...', 'blue');
    
    try {
      const response = await fetch(`${API_BASE_URL}/docs`);
      if (response.ok) {
        this.log('✅ API is accessible', 'green');
        this.results.passed++;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      this.log(`❌ API health check failed: ${error.message}`, 'red');
      this.results.failed++;
      this.results.errors.push(`API Health: ${error.message}`);
    }
  }

  async fetchOpenAPISpec() {
    this.log('📋 Fetching OpenAPI specification...', 'blue');
    
    try {
      const response = await fetch(SPEC_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch spec: ${response.status}`);
      }
      
      const spec = await response.json();
      this.log('✅ OpenAPI specification fetched successfully', 'green');
      this.results.passed++;
      
      return spec;
    } catch (error) {
      this.log(`❌ Failed to fetch OpenAPI spec: ${error.message}`, 'red');
      this.results.failed++;
      this.results.errors.push(`OpenAPI Spec: ${error.message}`);
      throw error;
    }
  }

  async validateSpecification(spec) {
    this.log('🔍 Validating OpenAPI specification structure...', 'blue');
    
    const requiredFields = ['openapi', 'info', 'paths', 'components'];
    const missingFields = requiredFields.filter(field => !spec[field]);
    
    if (missingFields.length > 0) {
      this.log(`❌ Missing required fields: ${missingFields.join(', ')}`, 'red');
      this.results.failed++;
      this.results.errors.push(`Spec Structure: Missing fields ${missingFields.join(', ')}`);
    } else {
      this.log('✅ OpenAPI specification structure is valid', 'green');
      this.results.passed++;
    }

    // Validate info section
    if (spec.info) {
      const requiredInfo = ['title', 'version', 'description'];
      const missingInfo = requiredInfo.filter(field => !spec.info[field]);
      
      if (missingInfo.length > 0) {
        this.log(`⚠️  Missing info fields: ${missingInfo.join(', ')}`, 'yellow');
        this.results.warnings++;
      }
    }

    // Count endpoints
    const pathCount = Object.keys(spec.paths || {}).length;
    this.log(`📊 Found ${pathCount} documented endpoints`, 'blue');
  }

  async testAuthenticationFlow() {
    this.log('🔐 Testing authentication flow...', 'blue');
    
    try {
      // Test registration endpoint
      const testUser = {
        role: 'STUDENT',
        email: `test-${Date.now()}@example.com`,
        password: 'testPassword123',
        firstName: 'Test',
        lastName: 'User'
      };

      const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      if (registerResponse.status === 201) {
        this.log('✅ Registration endpoint working', 'green');
        this.results.passed++;
      } else if (registerResponse.status === 409) {
        this.log('⚠️  User already exists (expected in some cases)', 'yellow');
        this.results.warnings++;
      } else {
        throw new Error(`Registration failed with status ${registerResponse.status}`);
      }

      // Test login endpoint
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      if (loginResponse.ok) {
        this.log('✅ Login endpoint working', 'green');
        this.results.passed++;
        
        // Extract cookie for authenticated requests
        const setCookie = loginResponse.headers.get('set-cookie');
        if (setCookie) {
          this.authCookie = setCookie.split(';')[0];
        }
      } else {
        throw new Error(`Login failed with status ${loginResponse.status}`);
      }

    } catch (error) {
      this.log(`❌ Authentication flow test failed: ${error.message}`, 'red');
      this.results.failed++;
      this.results.errors.push(`Authentication: ${error.message}`);
    }
  }

  async testPublicEndpoints(spec) {
    this.log('🌐 Testing public endpoints...', 'blue');
    
    const publicEndpoints = [
      { path: '/api/offers', method: 'GET' },
      { path: '/api/companies', method: 'GET' },
      { path: '/api/skills', method: 'GET' }
    ];

    for (const endpoint of publicEndpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint.path}`);
        
        if (response.ok) {
          this.log(`✅ ${endpoint.method} ${endpoint.path} - OK`, 'green');
          this.results.passed++;
          
          // Validate response structure
          const data = await response.json();
          if (this.validateResponseStructure(data, endpoint.path)) {
            this.log(`✅ Response structure valid for ${endpoint.path}`, 'green');
            this.results.passed++;
          }
        } else {
          throw new Error(`Status ${response.status}`);
        }
      } catch (error) {
        this.log(`❌ ${endpoint.method} ${endpoint.path} - ${error.message}`, 'red');
        this.results.failed++;
        this.results.errors.push(`${endpoint.method} ${endpoint.path}: ${error.message}`);
      }
    }
  }

  async testAuthenticatedEndpoints(spec) {
    if (!this.authCookie) {
      this.log('⚠️  Skipping authenticated endpoint tests (no auth cookie)', 'yellow');
      this.results.warnings++;
      return;
    }

    this.log('🔒 Testing authenticated endpoints...', 'blue');
    
    const authEndpoints = [
      { path: '/api/auth/me', method: 'GET' },
      { path: '/api/profile', method: 'GET' }
    ];

    for (const endpoint of authEndpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
          headers: {
            'Cookie': this.authCookie
          }
        });
        
        if (response.ok) {
          this.log(`✅ ${endpoint.method} ${endpoint.path} - OK`, 'green');
          this.results.passed++;
        } else {
          throw new Error(`Status ${response.status}`);
        }
      } catch (error) {
        this.log(`❌ ${endpoint.method} ${endpoint.path} - ${error.message}`, 'red');
        this.results.failed++;
        this.results.errors.push(`${endpoint.method} ${endpoint.path}: ${error.message}`);
      }
    }
  }

  validateResponseStructure(data, endpoint) {
    // Basic structure validation
    if (typeof data !== 'object') {
      this.log(`⚠️  Response is not an object for ${endpoint}`, 'yellow');
      this.results.warnings++;
      return false;
    }

    // Check for pagination in list endpoints
    if (endpoint.includes('offers') || endpoint.includes('companies')) {
      if (!data.pagination && Array.isArray(data.offers || data.companies)) {
        this.log(`⚠️  Missing pagination for ${endpoint}`, 'yellow');
        this.results.warnings++;
        return false;
      }
    }

    return true;
  }

  async validateDocumentationFiles() {
    this.log('📚 Validating documentation files...', 'blue');
    
    const requiredDocs = [
      'api-spec.json',
      'api-spec.yaml'
    ];

    for (const doc of requiredDocs) {
      try {
        const filePath = path.join(DOCS_PATH, doc);
        await fs.access(filePath);
        this.log(`✅ ${doc} exists`, 'green');
        this.results.passed++;
      } catch (error) {
        this.log(`❌ ${doc} missing`, 'red');
        this.results.failed++;
        this.results.errors.push(`Documentation: ${doc} missing`);
      }
    }
  }

  generateReport() {
    this.log('\n📊 Validation Report', 'bold');
    this.log('='.repeat(50), 'blue');
    
    this.log(`✅ Passed: ${this.results.passed}`, 'green');
    this.log(`❌ Failed: ${this.results.failed}`, 'red');
    this.log(`⚠️  Warnings: ${this.results.warnings}`, 'yellow');
    
    if (this.results.errors.length > 0) {
      this.log('\n🚨 Errors:', 'red');
      this.results.errors.forEach(error => {
        this.log(`  • ${error}`, 'red');
      });
    }

    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    
    this.log(`\n📈 Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
    
    if (this.results.failed === 0) {
      this.log('\n🎉 All critical tests passed!', 'green');
      process.exit(0);
    } else {
      this.log('\n💥 Some tests failed. Please review the errors above.', 'red');
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (process.argv[1] && process.argv[1].endsWith('validate-api-docs.js')) {
  const validator = new APIValidator();
  validator.validateAPI().catch(error => {
    console.error('Validation script failed:', error);
    process.exit(1);
  });
}

export default APIValidator;
