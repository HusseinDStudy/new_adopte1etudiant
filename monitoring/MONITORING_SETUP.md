# 🔍 API Monitoring with Existing Tools

This directory contains monitoring configurations using proven, existing tools instead of custom solutions.

## Tools Used

### 1. **Newman (Postman CLI)** - API Testing & Monitoring
- **Purpose**: Functional API testing and monitoring
- **Benefits**: Industry standard, extensive testing capabilities, great reporting
- **Usage**: Automated API endpoint validation

### 2. **Artillery** - Performance Testing & Load Testing  
- **Purpose**: Performance monitoring and load testing
- **Benefits**: Excellent performance metrics, realistic load simulation
- **Usage**: Response time monitoring, throughput testing

## Quick Start

### Install Tools
```bash
# Install globally
npm install -g newman artillery

# Or install locally
npm install newman artillery --save-dev
```

### Run Monitoring
```bash
# API functional tests
npm run monitor:api

# Performance tests  
npm run monitor:performance

# Run all monitoring
npm run monitor:all
```

## Files

### `postman-collection.json`
Comprehensive Postman collection testing:
- ✅ Health check endpoint
- ✅ API documentation accessibility
- ✅ Core API endpoints (offers, companies, skills)
- ✅ Response structure validation
- ✅ Performance assertions

### `artillery-config.yml`
Performance testing configuration:
- 🚀 Load testing with realistic traffic patterns
- 📊 Response time monitoring
- 📈 Throughput measurement
- ⚡ Stress testing capabilities

### `environment.json`
Environment variables for different deployment targets:
- 🔧 Base URL configuration
- ⏱️ Timeout settings
- 🔄 Retry configuration

## Advanced Usage

### Newman with Custom Reports
```bash
# Generate HTML report
newman run monitoring/postman-collection.json \
  -e monitoring/environment.json \
  --reporters cli,html \
  --reporter-html-export report.html

# Generate JSON report for CI/CD
newman run monitoring/postman-collection.json \
  -e monitoring/environment.json \
  --reporters json \
  --reporter-json-export results.json
```

### Artillery with Custom Configuration
```bash
# Run with custom target
artillery run monitoring/artillery-config.yml \
  --target http://staging.adopte1etudiant.com

# Generate detailed report
artillery run monitoring/artillery-config.yml \
  --output performance-report.json

# Convert to HTML report
artillery report performance-report.json \
  --output performance-report.html
```

### Environment-Specific Monitoring
```bash
# Development
newman run monitoring/postman-collection.json \
  --env-var "baseUrl=http://localhost:8080"

# Staging
newman run monitoring/postman-collection.json \
  --env-var "baseUrl=https://staging-api.adopte1etudiant.com"

# Production
newman run monitoring/postman-collection.json \
  --env-var "baseUrl=https://api.adopte1etudiant.com"
```

## CI/CD Integration

### GitHub Actions
The monitoring is integrated into `.github/workflows/monitoring.yml`:
- Runs Newman tests on hourly schedule and manual dispatch
- Executes Artillery performance tests  
- Generates reports as artifacts
- Fails build if tests don't pass

### Local Development
```bash
# Quick health check
newman run monitoring/postman-collection.json \
  -e monitoring/environment.json \
  --folder "Health Check"

# Performance baseline
artillery run monitoring/artillery-config.yml \
  --config '{"phases":[{"duration":10,"arrivalRate":1}]}'
```

## Monitoring Thresholds

### Newman Tests
- ✅ Response time < 1000ms
- ✅ All endpoints return 200 status
- ✅ Response structure validation
- ✅ API documentation accessibility

### Artillery Performance
- ⚡ P95 response time < 500ms
- ⚡ P99 response time < 1000ms  
- 📊 Error rate < 5%
- 🚀 Minimum throughput requirements

## Benefits of Using Existing Tools

### ✅ **Proven & Reliable**
- Battle-tested in production environments
- Extensive community support and documentation
- Regular updates and security patches

### ✅ **Feature Rich**
- Advanced reporting capabilities
- Integration with CI/CD pipelines
- Extensive assertion libraries

### ✅ **Industry Standard**
- Widely adopted by development teams
- Easy to find developers familiar with tools
- Extensive plugin ecosystems

### ✅ **Maintenance Free**
- No custom code to maintain
- Tool updates handled by maintainers
- Focus on configuration, not implementation

### ✅ **Professional Reports**
- HTML reports with charts and graphs
- JSON output for programmatic processing
- Integration with monitoring dashboards

## Extending Monitoring

### Add New Tests
1. **Newman**: Edit `postman-collection.json` in Postman app
2. **Artillery**: Modify `artillery-config.yml` scenarios

### Custom Environments
1. Create new environment files for different targets
2. Update CI/CD workflows to use appropriate environments

### Integration with Monitoring Services
- **Datadog**: Import Newman/Artillery results
- **New Relic**: Send performance metrics
- **Grafana**: Visualize trends over time

## Troubleshooting

### Newman Issues
```bash
# Debug mode
newman run monitoring/postman-collection.json --verbose

# Skip SSL verification (development only)
newman run monitoring/postman-collection.json --insecure
```

### Artillery Issues
```bash
# Debug mode
DEBUG=* artillery run monitoring/artillery-config.yml

# Increase timeout
artillery run monitoring/artillery-config.yml \
  --config '{"http":{"timeout":30}}'
```

This approach leverages proven tools instead of reinventing the wheel! 🚀
