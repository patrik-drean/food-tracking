# Task: Frontend GraphQL Client Setup with Urql and Type Generation

> **Parent PRD**: [food-tracking-core/prd.md](../prd.md)
> **Task ID**: TASK-003
> **Status**: Not Started
> **Priority**: High
> **Estimated Effort**: 1 day
> **Assignee**: Self-directed learning
> **Created**: 2025-10-01
> **Updated**: 2025-10-01

## Task Overview

### Description
Set up Urql GraphQL client in the Next.js frontend with automatic type generation from the backend schema. Configure GraphQL operations, caching, and error handling patterns that will be used throughout the application.

### Context
This task establishes the frontend's connection to the GraphQL API and creates type-safe GraphQL operations. Focus on learning Urql client patterns, GraphQL code generation, and Next.js integration with GraphQL.

### Dependencies
- **Prerequisite Tasks**: TASK-002 (GraphQL schema foundation)
- **Blocking Tasks**: All frontend feature implementation tasks
- **External Dependencies**: Urql, GraphQL Code Generator, running GraphQL server

## Technical Specifications

### Scope of Changes

#### Frontend Configuration
- **GraphQL Client**:
  - `frontend/src/lib/urql.ts` - Urql client configuration
  - `frontend/src/lib/graphql-client.tsx` - Provider setup for Next.js
- **Code Generation**:
  - `frontend/codegen.yml` - GraphQL Code Generator configuration
  - `frontend/src/generated/graphql.ts` - Generated types and hooks
- **GraphQL Operations**:
  - `frontend/src/graphql/queries/` - Query definitions
  - `frontend/src/graphql/mutations/` - Mutation definitions
  - `frontend/src/graphql/fragments/` - Reusable fragments
- **Provider Setup**:
  - `frontend/src/app/providers.tsx` - GraphQL provider for app
  - `frontend/src/app/layout.tsx` - Root layout with providers

#### Package Dependencies
```json
{
  "dependencies": {
    "urql": "^4.0.0",
    "@urql/next": "^1.1.0",
    "graphql": "^16.8.0"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^5.0.0",
    "@graphql-codegen/client-preset": "^4.0.0",
    "@graphql-codegen/urql-introspection": "^3.0.0"
  }
}
```

### Implementation Details

#### Urql Client Configuration
```typescript
// frontend/src/lib/urql.ts
import { Client, cacheExchange, fetchExchange } from 'urql';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

export const urqlClient = new Client({
  url: GRAPHQL_ENDPOINT,
  exchanges: [
    cacheExchange,
    fetchExchange,
  ],
  requestPolicy: 'cache-and-network',
});
```

#### Next.js Provider Setup
```typescript
// frontend/src/lib/graphql-client.tsx
'use client';

import { ReactNode } from 'react';
import { UrqlProvider } from '@urql/next';
import { urqlClient } from './urql';

interface GraphQLProviderProps {
  children: ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  return (
    <UrqlProvider client={urqlClient}>
      {children}
    </UrqlProvider>
  );
}
```

#### Root Layout Integration
```typescript
// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GraphQLProvider } from '../lib/graphql-client';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Food Tracking App',
  description: 'Personal food and nutrition tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GraphQLProvider>
          {children}
        </GraphQLProvider>
      </body>
    </html>
  );
}
```

#### GraphQL Code Generator Configuration
```yaml
# frontend/codegen.yml
schema: 'http://localhost:4000/graphql'
documents: 'src/graphql/**/*.graphql'
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-urql
    config:
      withHooks: true
      withComponent: false
      scalars:
        DateTime: string
        ID: string
  src/generated/introspection.json:
    plugins:
      - introspection
```

#### Basic GraphQL Operations
```graphql
# frontend/src/graphql/queries/foods.graphql
query TodaysFoods {
  todaysFoods {
    id
    description
    calories
    fat
    carbs
    protein
    isManual
    createdAt
  }
}

query RecentFoods($limit: Int) {
  recentFoods(limit: $limit) {
    id
    description
    calories
    fat
    carbs
    protein
    isManual
    createdAt
  }
}
```

```graphql
# frontend/src/graphql/mutations/foods.graphql
mutation AddFood($input: AddFoodInput!) {
  addFood(input: $input) {
    id
    description
    calories
    fat
    carbs
    protein
    isManual
    createdAt
  }
}

mutation UpdateFoodNutrition($input: UpdateFoodNutritionInput!) {
  updateFoodNutrition(input: $input) {
    id
    description
    calories
    fat
    carbs
    protein
    isManual
    createdAt
  }
}
```

#### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npm run codegen && next build",
    "codegen": "graphql-codegen --config codegen.yml",
    "codegen:watch": "graphql-codegen --config codegen.yml --watch",
    "type-check": "tsc --noEmit"
  }
}
```

#### Environment Configuration
```bash
# frontend/.env.local
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql

# frontend/.env.example
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

#### TypeScript Configuration Update
```json
// frontend/tsconfig.json additions
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/generated/*": ["./src/generated/*"],
      "@/graphql/*": ["./src/graphql/*"]
    }
  }
}
```

### Error Handling and Loading States

#### Custom Hook for GraphQL State Management
```typescript
// frontend/src/hooks/useGraphQLState.ts
import { OperationResult } from 'urql';

export interface GraphQLState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
}

export function useGraphQLState<T>(
  result: OperationResult<T>
): GraphQLState<T> {
  return {
    data: result.data,
    loading: result.fetching,
    error: result.error?.message || null,
  };
}
```

#### Error Boundary Component
```typescript
// frontend/src/components/ErrorBoundary.tsx
'use client';

import { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function GraphQLErrorBoundary({
  children,
  fallback = <div>Something went wrong</div>
}: ErrorBoundaryProps) {
  // Implementation would use React Error Boundary patterns
  return <>{children}</>;
}
```

## Acceptance Criteria

### Functional Requirements
- [ ] **Urql Client**: Successfully configured and connecting to GraphQL endpoint
- [ ] **Type Generation**: GraphQL operations generate TypeScript types and hooks
- [ ] **Provider Setup**: GraphQL client available throughout Next.js app
- [ ] **Basic Operations**: Can execute queries and mutations with generated hooks
- [ ] **Error Handling**: Proper error states and loading indicators
- [ ] **Caching**: Default Urql caching working correctly

### Technical Requirements
- [ ] **Code Generation**: `npm run codegen` generates types without errors
- [ ] **Type Safety**: All GraphQL operations are fully typed
- [ ] **Build Process**: Frontend builds successfully with generated types
- [ ] **Environment Config**: GraphQL endpoint configurable via environment variables
- [ ] **Development Workflow**: Code generation integrates with development server

### Learning Requirements
- [ ] **Urql Patterns**: Understanding client setup, caching, and request policies
- [ ] **GraphQL Codegen**: Automated type generation from schema
- [ ] **Next.js Integration**: Provider patterns and client-side GraphQL
- [ ] **Type Safety**: End-to-end type safety from GraphQL to React components

## Testing Strategy

### Setup Validation
- **Client Connection**:
  - Verify Urql client can connect to GraphQL server
  - Test basic introspection query
  - Validate environment variable configuration
- **Code Generation**:
  - Verify generated types match GraphQL schema
  - Test generated hooks are properly typed
  - Validate build process includes code generation

### Integration Tests
- **GraphQL Operations**:
  - Test query hooks return expected data structure
  - Test mutation hooks handle success and error states
  - Verify loading states work correctly
- **Caching Behavior**:
  - Test cache-and-network request policy
  - Verify cache updates after mutations

### Manual Testing Scenarios
1. **Development Workflow**: Start dev server, verify GraphQL operations work
2. **Code Generation**: Run codegen, verify types are updated
3. **Error Handling**: Test with GraphQL server down, verify error states
4. **Build Process**: Run production build, verify generated types included

## Implementation Notes

### Development Approach
1. **Step 1**: Install Urql and GraphQL Code Generator dependencies
2. **Step 2**: Configure Urql client with basic settings
3. **Step 3**: Set up GraphQL provider in Next.js app
4. **Step 4**: Configure code generation with basic operations
5. **Step 5**: Create sample queries and mutations
6. **Step 6**: Test full workflow and type generation

### Learning Focus Areas
- **Urql vs Apollo**: Understanding lightweight GraphQL client benefits
- **Code Generation**: Automated type safety from GraphQL schema
- **Next.js Client Components**: Provider patterns and hydration considerations
- **GraphQL Best Practices**: Query structuring, fragment usage, error handling
- **Caching Strategies**: Urql's normalized cache vs document cache

### Potential Challenges
- **Code Generation Timing**: Ensuring backend schema is available for codegen
- **Environment Variables**: Proper Next.js public/private variable handling
- **SSR Considerations**: Client-side GraphQL in Next.js App Router
- **Type Synchronization**: Keeping generated types in sync during development

## Definition of Done

### Code Complete
- [ ] Urql client configured and provider setup complete
- [ ] GraphQL code generation working and integrated into build process
- [ ] Basic queries and mutations defined with proper TypeScript types
- [ ] Error handling and loading states properly implemented
- [ ] Environment configuration documented and working

### Documentation Complete
- [ ] README updated with GraphQL client setup instructions
- [ ] Code generation process documented
- [ ] Environment variables documented
- [ ] Learning notes about Urql patterns

### Deployment Ready
- [ ] Build process includes code generation step
- [ ] Environment variables properly configured for different environments
- [ ] TypeScript compilation passes with generated types
- [ ] Client can connect to production GraphQL endpoint

## Related Tasks

### Follow-up Tasks
- [TASK-004]: Create basic UI layout and navigation structure
- [TASK-005]: Build food entry form with GraphQL mutations
- [TASK-006]: Implement daily food log display with queries

### Reference Resources
- Urql documentation for Next.js
- GraphQL Code Generator configuration guide
- Next.js App Router with client components

## Notes & Comments

### Learning Objectives for This Task
1. **GraphQL Client Setup**: Understanding Urql configuration and provider patterns
2. **Type Generation**: Automated TypeScript types from GraphQL schema
3. **Next.js Integration**: Client-side GraphQL in modern Next.js applications
4. **Development Workflow**: Code generation integration with development process

### Key Technologies Learned
- **Urql Client**: Lightweight alternative to Apollo Client
- **GraphQL Code Generator**: Automated type safety tooling
- **Next.js Providers**: Client component patterns for app-wide state
- **TypeScript Integration**: End-to-end type safety with GraphQL

---

**Task History**:
| Date | Status Change | Notes | Author |
|------|---------------|-------|--------|
| 2025-10-01 | Created | Frontend GraphQL client setup for Urql learning | Claude |