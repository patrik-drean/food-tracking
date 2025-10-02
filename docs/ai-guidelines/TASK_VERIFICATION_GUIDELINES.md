# Task Verification Guidelines - Food Tracking Application

This document provides Claude Code with specific guidance on how to verify completed tasks for the food tracking application, including quality standards, testing requirements, and deployment readiness checks.

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
- [ ] **Test Coverage**: 80%+ coverage for new code, 90%+ for nutrition calculations
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
# Root quality checks (run all at once)
npm run lint              # Check code style across frontend and backend
npm run format:check      # Verify code formatting with Prettier
npm run type-check        # TypeScript compilation check for both packages
npm audit                 # Check for vulnerable dependencies

# Frontend specific
cd frontend
npm run lint              # ESLint with Next.js and TypeScript rules
npm run type-check        # Next.js TypeScript compilation
npm run build             # Verify production build succeeds

# Backend specific
cd backend
npm run lint              # ESLint with TypeScript and Node.js rules
npm run type-check        # TypeScript compilation without Prisma type issues
npm run build             # Verify TypeScript compilation to dist/
npx prisma validate       # Validate Prisma schema
npx prisma format         # Check Prisma schema formatting
```

## Testing Verification

### Test Coverage Requirements
- **Unit Tests**: 80%+ coverage for React components, 90%+ for nutrition calculation functions
- **Integration Tests**: All GraphQL resolvers tested with mocked Prisma
- **End-to-End Tests**: Core food logging and nutrition analysis workflows
- **Performance Tests**: GraphQL query performance < 500ms, AI analysis < 3 seconds

### Test Execution Checklist
```bash
# Root level testing (all packages)
npm test                  # Run all tests across monorepo
npm run test:coverage     # Generate coverage reports

# Frontend testing commands
cd frontend
npm test                  # Jest + React Testing Library
npm run test:watch        # Watch mode for development
npm run test:coverage     # Coverage report for components

# Backend testing commands
cd backend
npm test                  # Jest for GraphQL resolvers and services
npm run test:watch        # Watch mode for development
npm run test:coverage     # Coverage for business logic

# Database testing
cd backend
npx prisma migrate reset --force  # Reset test database
npx prisma db seed               # Seed with test data
# Run integration tests with real database
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

### Food Tracking Performance Standards
- **GraphQL Query Times**: < 100ms for daily food queries, < 500ms for food search
- **AI Nutrition Analysis**: < 3 seconds for OpenAI API calls (when implemented)
- **Page Load Times**: < 2 seconds initial load, < 500ms SPA navigation
- **Database Queries**: < 50ms for date-based food queries, < 100ms for food search
- **Memory Usage**: No memory leaks in food entry components, < 100MB heap usage

### Performance Testing
```bash
# GraphQL performance testing
cd backend
npm run perf:graphql      # Load test GraphQL endpoints
# Test queries: foodsByDate, searchFoods, addFood, updateFood

# Frontend performance testing
cd frontend
npm run build             # Verify production build size
npm run analyze           # Bundle size analysis
npx lighthouse http://localhost:3000 --output=json

# Database performance testing
cd backend
# Test with realistic data (1000+ food entries)
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM foods WHERE created_at >= '2024-01-01';"
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT DISTINCT description FROM foods WHERE description ILIKE '%pizza%';"
```

#### Food Tracking Performance Checklist
- [ ] **GraphQL response times**: Daily food queries < 100ms, search queries < 500ms
- [ ] **Database performance**: Date-based indexes used, food search optimized
- [ ] **Memory usage**: No React memory leaks in food entry forms
- [ ] **AI API performance**: OpenAI nutrition analysis < 3 seconds (when implemented)
- [ ] **Mobile performance**: Smooth scrolling on food lists, responsive touch interactions
- [ ] **Bundle size**: Frontend build < 1MB gzipped, code splitting for routes

## Security Verification

### Food Tracking Security Checklist
#### Authentication & Authorization
- [ ] **No authentication required**: Single-user app, no auth system needed
- [ ] **Input validation**: Food descriptions validated for length and content
- [ ] **API access**: GraphQL endpoint accessible only from authorized frontend domain
- [ ] **Environment security**: Database URL and API keys properly secured

#### Food Data Security
- [ ] **Food description sanitization**: User food descriptions sanitized to prevent XSS
- [ ] **SQL injection prevention**: Prisma ORM with parameterized queries
- [ ] **XSS prevention**: Food descriptions properly escaped in React components
- [ ] **No CSRF needed**: GraphQL API with proper CORS configuration
- [ ] **No sensitive data**: Only food descriptions and nutrition data stored

#### Infrastructure Security
- [ ] **HTTPS enforcement**: Railway backend and GitHub Pages use HTTPS
- [ ] **CORS configuration**: Backend allows only frontend domain access
- [ ] **Rate limiting**: OpenAI API calls rate limited to manage costs
- [ ] **Error disclosure**: GraphQL errors don't expose database details
- [ ] **API key security**: OpenAI API key stored securely in Railway environment

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
- [ ] **Keyboard only**: Navigate food entry forms and nutrition displays using only keyboard
- [ ] **Screen reader**: Test nutrition data announcements with VoiceOver/NVDA
- [ ] **Color blindness**: Test nutrition color coding (calories=orange, protein=red, carbs=blue, fat=purple)
- [ ] **High contrast**: Test with high contrast mode, ensure nutrition bars are visible

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
# Monorepo build verification
npm run build             # Build both frontend and backend
npm run lint              # Verify no linting errors
npm run type-check        # Verify TypeScript compilation

# Frontend build verification
cd frontend
npm run build             # Next.js production build
npm run export            # Static export for GitHub Pages
ls out/                   # Verify static files generated

# Backend build verification
cd backend
npm run build             # TypeScript compilation to dist/
ls dist/                  # Verify JavaScript files generated
npx prisma generate       # Verify Prisma client generation
npx prisma validate       # Verify schema is valid

# No Docker needed for this deployment strategy
```

#### Build Checklist
- [ ] **No build errors**: Both Next.js and TypeScript builds succeed
- [ ] **TypeScript compilation**: No TypeScript errors in strict mode
- [ ] **Prisma client generation**: Database client generates without errors
- [ ] **Static export**: Next.js static export works for GitHub Pages
- [ ] **Bundle size**: Frontend bundle < 1MB gzipped, code splitting enabled
- [ ] **Asset optimization**: Images optimized, fonts loaded efficiently

### Environment Configuration
- [ ] **Backend environment**: DATABASE_URL, NODE_ENV, PORT, FRONTEND_URL configured
- [ ] **Frontend environment**: NEXT_PUBLIC_GRAPHQL_ENDPOINT set for production
- [ ] **Railway configuration**: Auto-deploy from main branch, PostgreSQL connected
- [ ] **GitHub Pages**: Static export deployment, custom domain (if used)
- [ ] **Database migrations**: Prisma migrations run successfully on Railway
- [ ] **OpenAI API**: API key configured (when AI features implemented)

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

1. **Present Summary**: Provide comprehensive verification summary with specific food tracking metrics
2. **Demo Key Features**: Show working food entry, nutrition display, and data persistence
3. **Request User Review**: Ask user to test core workflows (add food, view daily totals, search)
4. **Address Feedback**: Make any requested adjustments to UI, calculations, or data handling
5. **Final Approval**: Get explicit user confirmation that food tracking functionality meets requirements

### Task Completion Documentation
Once user confirms satisfaction:

1. **Update Task Status**: Mark task as ✅ COMPLETED
2. **Add Completion Notes**: Document verification results
3. **Update Task History**: Record completion date and verification details
4. **Archive or Close**: Move completed task to appropriate location

---

## Food Tracking Verification Commands Quick Reference

```bash
# Quality checks (from root)
npm run lint              # ESLint for frontend and backend
npm run format:check      # Prettier formatting check
npm run type-check        # TypeScript compilation check
npm audit                 # Security vulnerability scan

# Testing (from root)
npm test                  # All unit and integration tests
npm run test:coverage     # Coverage reports

# Performance
cd backend && npm run perf:graphql  # GraphQL load testing
cd frontend && npx lighthouse http://localhost:3000
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM foods;"

# Build verification
npm run build             # Build both frontend and backend
cd frontend && npm run export  # Static export verification
cd backend && npx prisma validate  # Schema validation

# Deployment readiness
cd backend && npx prisma migrate deploy  # Run migrations
cd backend && npm start   # Test production server
cd frontend && npm run build && npm run export  # Static build
```

## Common Verification Patterns

### GraphQL API Verification
```bash
# Test GraphQL queries (no auth required)
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { foodsByDate(date: \"2024-01-01\") { id description calories } }"}

# Test food entry mutation
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { addFood(input: { description: \"test food\", calories: 100 }) { id } }"}

# Verify GraphQL introspection works
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}
```

### Database Verification
```sql
-- Food tracking database verification
SELECT COUNT(*) FROM foods WHERE created_at >= CURRENT_DATE;
SELECT description, calories, protein, carbs, fat FROM foods LIMIT 5;

-- Verify indexes are working
EXPLAIN ANALYZE SELECT * FROM foods WHERE created_at >= '2024-01-01';
EXPLAIN ANALYZE SELECT * FROM foods WHERE description ILIKE '%pizza%';

-- Check data integrity
SELECT COUNT(*) FROM foods WHERE calories < 0;  -- Should be 0
SELECT COUNT(*) FROM foods WHERE description = '';  -- Should be 0

-- Verify cache table (if implemented)
SELECT COUNT(*) FROM food_cache;
SELECT description_hash, use_count FROM food_cache ORDER BY use_count DESC LIMIT 5;
```

### Frontend Verification
```bash
# React component testing
cd frontend
npm test -- --coverage
npm run test -- --testNamePattern="FoodCard"

# Visual and interaction testing
npm run dev  # Start dev server
# Manual testing checklist:
# - Home page loads with welcome message
# - Navigation works (add food, today's summary)
# - TailwindCSS styles applied correctly
# - Responsive design on mobile/tablet/desktop
# - Food entry form validation
# - Nutrition display components

# Accessibility testing
npx @axe-core/cli http://localhost:3000
# Test keyboard navigation through food forms
# Test screen reader announcements for nutrition data
```

---

## Food Tracking Specific Verification Patterns

### Nutrition Data Validation
```typescript
// Verify nutrition calculation accuracy
const validateNutritionTotals = (foods: Food[]) => {
  const totals = foods.reduce((sum, food) => ({
    calories: sum.calories + (food.calories || 0),
    protein: sum.protein + (food.protein || 0),
    carbs: sum.carbs + (food.carbs || 0),
    fat: sum.fat + (food.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  // Verify calculations are reasonable
  expect(totals.calories).toBeGreaterThanOrEqual(0)
  expect(totals.protein * 4 + totals.carbs * 4 + totals.fat * 9)
    .toBeCloseTo(totals.calories, 50) // Within 50 calories tolerance
}
```

### AI Integration Verification (Future)
```typescript
// When OpenAI integration is implemented
const verifyAINutritionAnalysis = async (description: string) => {
  const analysis = await analyzeNutrition(description)

  // Verify required fields
  expect(analysis.calories).toBeGreaterThan(0)
  expect(analysis.protein).toBeGreaterThanOrEqual(0)
  expect(analysis.carbs).toBeGreaterThanOrEqual(0)
  expect(analysis.fat).toBeGreaterThanOrEqual(0)

  // Verify reasonable ranges
  expect(analysis.calories).toBeLessThan(10000) // Sanity check
  expect(analysis.protein).toBeLessThan(1000)   // Sanity check
}
```

### Mobile-First Verification
```bash
# Test mobile responsiveness
cd frontend
npm run dev

# Test with Chrome DevTools device emulation:
# - iPhone 12 Pro (390x844)
# - iPad (768x1024)
# - Galaxy S20 (360x800)

# Verify:
# - Food entry forms work on touch devices
# - Nutrition displays are readable on small screens
# - Navigation is thumb-friendly
# - No horizontal scrolling on mobile
```

### Performance Monitoring
```bash
# Monitor GraphQL query performance
cd backend
# Enable query logging in development
export NODE_ENV=development
npm run dev

# Monitor slow queries (> 100ms)
tail -f logs/graphql-queries.log | grep "duration.*[1-9][0-9][0-9]"

# Database query analysis
psql $DATABASE_URL
\timing on
SELECT * FROM foods WHERE created_at >= CURRENT_DATE;
SELECT DISTINCT description FROM foods WHERE description ILIKE '%chicken%';
```

This document ensures consistent, thorough verification of all food tracking features before deployment, maintaining high quality standards for nutrition data accuracy, mobile usability, and GraphQL API performance.