# Task Verification Guidelines

This document provides Claude Code with specific guidance on how to verify completed tasks for your application, including quality standards, testing requirements, and deployment readiness checks.

## Verification Overview

### Purpose of Task Verification
Task verification ensures that all completed work meets your application's quality standards before deployment. This includes:
- **Functional Completeness**: All requirements implemented correctly
- **Code Quality**: Adherence to coding standards and best practices
- **Testing Coverage**: Comprehensive test coverage and passing tests
- **Integration Success**: Proper integration with existing systems
- **Performance Standards**: Meeting response time and resource usage requirements
- **Security Compliance**: Following security best practices
- **User Experience**: Meeting UX/UI standards and accessibility requirements

### Quality Gates
All tasks must pass these quality gates before being marked complete:
- [ ] **Functional Requirements**: All acceptance criteria met
- [ ] **Code Quality**: Meets coding standards and passes linting
- [ ] **Test Coverage**: [Target: e.g., 80%+ coverage for new code]
- [ ] **Integration Tests**: All integration points working
- [ ] **Performance**: Meets response time requirements
- [ ] **Security**: Security checklist items verified
- [ ] **Documentation**: Code and API documentation updated
- [ ] **User Experience**: UX standards and accessibility verified

## Code Quality Verification

### Code Review Checklist
#### Architecture & Design
- [ ] **Follows established patterns**: Consistent with existing codebase architecture
- [ ] **Separation of concerns**: Proper layer separation maintained
- [ ] **SOLID principles**: Single responsibility, open/closed, etc.
- [ ] **No code duplication**: Reusable code properly abstracted
- [ ] **Proper abstractions**: Interfaces and abstractions used appropriately

#### Code Standards
- [ ] **Naming conventions**: Variables, functions, classes follow standards
- [ ] **Code formatting**: Consistent with project formatting rules
- [ ] **Comments & documentation**: Complex logic properly documented
- [ ] **Error handling**: Proper error handling and logging implemented
- [ ] **Type safety**: Strong typing used (if applicable)

#### Security Standards
- [ ] **Input validation**: All user inputs properly validated
- [ ] **Authentication checks**: Proper auth/authorization implemented
- [ ] **SQL injection prevention**: Parameterized queries used
- [ ] **XSS prevention**: Output properly sanitized
- [ ] **Secrets management**: No hardcoded secrets or credentials

### Automated Quality Checks
```bash
# Code quality commands to run during verification
[linting command]          # Check code style and potential issues
[type checking command]    # Verify type safety (if applicable)
[security scan command]    # Check for security vulnerabilities
[dependency audit]         # Check for vulnerable dependencies
```

## Testing Verification

### Test Coverage Requirements
- **Unit Tests**: [e.g., 80%+ coverage for new business logic]
- **Integration Tests**: [e.g., All API endpoints tested]
- **End-to-End Tests**: [e.g., Critical user flows tested]
- **Performance Tests**: [e.g., Load testing for new features]

### Test Execution Checklist
```bash
# Frontend testing commands
cd [frontend-directory]
[unit test command]        # Run frontend unit tests
[integration test command] # Run frontend integration tests
[e2e test command]        # Run end-to-end tests

# Backend testing commands
cd [backend-directory]
[unit test command]        # Run backend unit tests
[integration test command] # Run API integration tests
[database test command]    # Run database-related tests
```

#### Test Quality Standards
- [ ] **Test naming**: Descriptive test names that explain the scenario
- [ ] **Test organization**: Tests grouped logically by feature/component
- [ ] **Test data**: Proper test data setup and cleanup
- [ ] **Mocking strategy**: External dependencies properly mocked
- [ ] **Edge cases**: Error scenarios and edge cases tested
- [ ] **Happy path**: Primary user scenarios covered

### Manual Testing Scenarios
#### Functional Testing
- [ ] **Core functionality**: Primary feature requirements work as expected
- [ ] **User workflows**: Complete user journeys tested end-to-end
- [ ] **Data validation**: Input validation working correctly
- [ ] **Error handling**: Error messages clear and helpful
- [ ] **Edge cases**: Boundary conditions and unusual scenarios tested

#### User Experience Testing
- [ ] **Responsive design**: Works correctly on mobile, tablet, desktop
- [ ] **Loading states**: Appropriate loading indicators shown
- [ ] **Error states**: User-friendly error messages displayed
- [ ] **Accessibility**: Screen reader compatible, keyboard navigation
- [ ] **Performance**: Acceptable load times and responsiveness

## Integration Verification

### API Integration Testing
#### Endpoint Verification
- [ ] **Request/Response format**: Follows API standards
- [ ] **Status codes**: Appropriate HTTP status codes returned
- [ ] **Error responses**: Consistent error format used
- [ ] **Validation**: Input validation working correctly
- [ ] **Authentication**: Proper auth checks implemented

#### Database Integration
- [ ] **Schema changes**: Migrations run successfully
- [ ] **Data integrity**: Foreign key constraints working
- [ ] **Performance**: Queries perform acceptably with realistic data
- [ ] **Rollback capability**: Database changes can be rolled back if needed

### Frontend-Backend Integration
- [ ] **API calls**: Frontend correctly calls backend endpoints
- [ ] **Data mapping**: Data properly transformed between layers
- [ ] **Error handling**: API errors properly handled in frontend
- [ ] **Loading states**: Loading indicators work during API calls
- [ ] **State management**: Application state properly updated

## Performance Verification

### Performance Standards
- **API Response Times**: [e.g., < 200ms for GET requests, < 500ms for POST]
- **Page Load Times**: [e.g., < 3 seconds initial load, < 1 second navigation]
- **Database Queries**: [e.g., < 100ms for simple queries]
- **Memory Usage**: [e.g., No memory leaks, reasonable memory consumption]

### Performance Testing
```bash
# Performance testing commands
[load test command]        # Run load tests against APIs
[performance test command] # Run frontend performance tests
[database benchmark]       # Test database query performance
```

#### Performance Checklist
- [ ] **Response times**: All endpoints meet response time requirements
- [ ] **Database performance**: Queries optimized and performant
- [ ] **Memory usage**: No memory leaks, acceptable memory consumption
- [ ] **Concurrent users**: System handles expected concurrent load
- [ ] **Resource usage**: CPU and memory usage within acceptable limits

## Security Verification

### Security Checklist
#### Authentication & Authorization
- [ ] **Authentication required**: Protected endpoints require authentication
- [ ] **Authorization checks**: Users can only access permitted resources
- [ ] **Token validation**: JWT tokens (if used) properly validated
- [ ] **Session management**: Sessions handled securely

#### Data Security
- [ ] **Input sanitization**: All user inputs properly sanitized
- [ ] **SQL injection**: Database queries use parameterized statements
- [ ] **XSS prevention**: Output properly encoded/escaped
- [ ] **CSRF protection**: CSRF tokens implemented where needed
- [ ] **Sensitive data**: PII and sensitive data properly protected

#### Infrastructure Security
- [ ] **HTTPS enforcement**: All production traffic uses HTTPS
- [ ] **CORS configuration**: CORS policies properly configured
- [ ] **Rate limiting**: API rate limiting implemented where appropriate
- [ ] **Error disclosure**: Error messages don't leak sensitive information

## Accessibility Verification

### Accessibility Standards
Follow [WCAG 2.1 AA] guidelines or your organization's accessibility standards.

#### Accessibility Checklist
- [ ] **Keyboard navigation**: All interactive elements accessible via keyboard
- [ ] **Screen reader**: Content properly structured for screen readers
- [ ] **Color contrast**: Text meets minimum contrast requirements
- [ ] **ARIA labels**: Proper ARIA labels for complex UI elements
- [ ] **Focus management**: Focus properly managed in single-page apps
- [ ] **Alternative text**: Images have appropriate alt text

### Accessibility Testing Tools
```bash
# Automated accessibility testing
[accessibility test command]  # Run automated accessibility tests
```

#### Manual Accessibility Testing
- [ ] **Keyboard only**: Navigate entire feature using only keyboard
- [ ] **Screen reader**: Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] **Color blindness**: Test with color blindness simulators
- [ ] **High contrast**: Test with high contrast mode enabled

## Documentation Verification

### Documentation Requirements
#### Code Documentation
- [ ] **API documentation**: All new endpoints documented
- [ ] **Function documentation**: Complex functions have clear documentation
- [ ] **Type definitions**: Interfaces and types properly documented
- [ ] **Configuration**: New configuration options documented

#### User Documentation
- [ ] **Feature documentation**: User-facing features documented
- [ ] **Setup instructions**: Installation/setup steps updated if needed
- [ ] **Migration guides**: Breaking changes documented with migration steps
- [ ] **Changelog**: Changes added to changelog/release notes

## Deployment Verification

### Build Verification
```bash
# Build verification commands
[frontend build command]   # Verify frontend builds successfully
[backend build command]    # Verify backend builds successfully
[docker build command]     # Build container images if applicable
```

#### Build Checklist
- [ ] **No build errors**: All builds complete without errors
- [ ] **No build warnings**: Address or document any build warnings
- [ ] **Asset optimization**: Images and assets properly optimized
- [ ] **Bundle size**: Frontend bundle size within acceptable limits

### Environment Configuration
- [ ] **Environment variables**: All required env vars documented
- [ ] **Configuration validation**: App starts successfully with production config
- [ ] **Database migrations**: Migrations run successfully in staging/production
- [ ] **External dependencies**: All external services properly configured

### Rollback Planning
- [ ] **Rollback strategy**: Clear plan for rolling back changes if needed
- [ ] **Database rollback**: Database changes can be rolled back safely
- [ ] **Feature flags**: Feature can be disabled via configuration if needed
- [ ] **Monitoring**: Adequate monitoring in place to detect issues

## User Acceptance Criteria

### Functional Acceptance
Review each acceptance criterion from the original task:
- [ ] **Criterion 1**: [Verify specific acceptance criterion]
- [ ] **Criterion 2**: [Verify specific acceptance criterion]
- [ ] **Criterion 3**: [Verify specific acceptance criterion]

### Business Value Verification
- [ ] **User value**: Feature provides clear value to target users
- [ ] **Business goals**: Implementation supports business objectives
- [ ] **Usage metrics**: Appropriate tracking/analytics implemented
- [ ] **Success criteria**: Success metrics can be measured

## Final Verification Steps

### Pre-Deployment Checklist
1. [ ] **All tests passing**: Both automated and manual tests pass
2. [ ] **Code review complete**: Code reviewed and approved
3. [ ] **Documentation updated**: All documentation current and accurate
4. [ ] **Performance verified**: Performance requirements met
5. [ ] **Security verified**: Security checklist completed
6. [ ] **Accessibility verified**: Accessibility standards met
7. [ ] **Integration tested**: Works properly with existing systems

### User Confirmation Process
After technical verification is complete:

1. **Present Summary**: Provide comprehensive verification summary
2. **Request User Review**: Ask user to confirm requirements are met
3. **Address Feedback**: Make any requested adjustments
4. **Final Approval**: Get explicit user confirmation of satisfaction

### Task Completion Documentation
Once user confirms satisfaction:

1. **Update Task Status**: Mark task as ✅ COMPLETED
2. **Add Completion Notes**: Document verification results
3. **Update Task History**: Record completion date and verification details
4. **Archive or Close**: Move completed task to appropriate location

---

## Verification Commands Quick Reference

```bash
# Quality checks
[lint command]
[type check command]
[security scan command]

# Testing
[unit test command]
[integration test command]
[e2e test command]

# Performance
[load test command]
[performance benchmark command]

# Build verification
[build command]
[production build verification]

# Deployment readiness
[migration test command]
[environment validation command]
```

## Common Verification Patterns

### API Endpoint Verification
```bash
# Example API testing pattern
curl -X GET [endpoint] -H "Authorization: Bearer [token]"
# Verify response format, status codes, performance
```

### Database Verification
```sql
-- Example database verification queries
SELECT COUNT(*) FROM [table] WHERE [condition];
-- Verify data integrity and constraints
```

### Frontend Verification
```bash
# Example frontend verification
[test runner] --coverage
# Verify component rendering, user interactions, accessibility
```

---

## Instructions for Using This Template

1. **Customize verification standards** to match your application's requirements
2. **Update command examples** with your actual testing and build commands
3. **Define specific performance thresholds** relevant to your application
4. **Include domain-specific verification steps** for your industry/use case
5. **Reference this document** in your task verification process

This document ensures consistent, thorough verification of all completed tasks before deployment, maintaining high quality standards across your application.