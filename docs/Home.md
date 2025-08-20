# Project Wiki: Adopte1Etudiant

Welcome to the project wiki! This documentation provides a comprehensive overview of the project's architecture, features, and development processes.

## 📖 Quick Navigation

- **[README](../README.md)**: Main project overview and getting started guide

## 👥 User Guides

Documentation for end users of the platform:

- **[User Manual](user-guides/User-Manual.md)**: Step-by-step guides for Students and Companies

## 💻 Developer Guides

Essential documentation for developers working on the project:

- **[Development Guide](developer-guides/Development-Guide.md)**: Local setup, conventions, and contribution guidelines
- **[API Documentation](developer-guides/API-Guide.md)**: Comprehensive API usage guide with examples
- **[API Troubleshooting](developer-guides/API-Guide.md#troubleshooting)**: Common issues and debugging techniques
- **[API Maintenance Guide](developer-guides/API-Maintenance-Guide.md)**: Complete maintenance procedures and schedules
- **[Authentication Flow](developer-guides/Authentication.md)**: JWT, OAuth, and role-based access control

## 🏗️ Technical Guides

Deep technical documentation for system architecture and implementation:

- **[Architecture Overview](technical-guides/Architecture.md)**: Technology stack, monorepo structure, and infrastructure
- **[Database Guide](technical-guides/Database-Guide.md)**: Schema, migrations, and seeding processes
- **[Security Measures](technical-guides/Security.md)**: Security implementation mapped to OWASP Top 10
- **[Design Patterns](technical-guides/Design-Patterns.md)**: Key software design patterns used
- **[Monitoring & Alerting](technical-guides/Monitoring-And-Alerting.md)**: Indicators, probes, and alerting

## 📋 Project Management

Process documentation and quality assurance:

- **[CI/CD Pipeline](project-management/CI-CD.md)**: Continuous integration and deployment with GitHub Actions
- **[Issue Management Guide](project-management/Issue-Management-Guide.md)**: Bug reporting, tracking, and resolution processes

## 🚀 Quick Reference

### **Essential Commands**
```bash
# API Documentation
npm run docs:validate          # Validate API documentation
npm run docs:generate          # Generate fresh documentation
npm run docs:serve            # View documentation

# API Monitoring (Using Proven Tools)
npm run monitor:api           # Run Newman API tests
npm run monitor:performance   # Run Artillery performance tests
npm run monitor:all          # Run all monitoring

# Development
npm run dev --workspace=apps/api    # Start API server
npm run build --workspace=apps/api  # Build and check for errors
npm run test --workspace=apps/api   # Run tests
```

### **Key Resources**
- **📊 API Documentation**: [/docs](/docs)
- **🔍 API Monitoring**: [monitoring/README.md](monitoring/README.md)
- **📈 GitHub Actions**: Repository Actions tab

## 📞 Support

For questions, issues, or contributions:
- **GitHub Issues**: [Report bugs and request features](https://github.com/HusseinDStudy/new_adopte1etudiant/issues)
- **Email**: support@adopte1etudiant.com
- **Documentation**: This documentation is continuously updated and improved
