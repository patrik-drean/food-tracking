# Task: Frontend GraphQL Client Setup with Urql and Type Generation

> **Parent PRD**: [food-tracking-core/prd.md](../prd.md)
> **Task ID**: TASK-003
> **Status**: ✅ COMPLETED
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
- **Prerequisite Tasks**: TASK-001 ✅ COMPLETED (Monorepo setup with Next.js + TailwindCSS), TASK-002 ✅ COMPLETED (GraphQL schema with Pothos + Prisma)
- **Blocking Tasks**: All frontend feature implementation tasks
- **External Dependencies**: Urql, GraphQL Code Generator, running GraphQL server (available at http://localhost:4000/graphql)

## Technical Specifications

### Existing Project Context
**From TASK-001 ✅ COMPLETED:**
- Monorepo structure with npm workspaces
- Frontend: Next.js 14 + App Router + TailwindCSS + TypeScript
- Frontend runs on localhost:3000
- Package.json scripts for development workflow
- ESLint and Prettier configuration

**From TASK-002 ✅ COMPLETED:**
- GraphQL server running on localhost:4000/graphql
- Complete Food schema with queries and mutations
- CORS configured for frontend access
- Prisma database integration
- Service layer with 100% test coverage

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

**Note**: The GraphQL server is already running and tested from TASK-002. The schema includes:
- **Food type** with id, description, calories, fat, carbs, protein, isManual, createdAt, updatedAt
- **Queries**: todaysFoods, recentFoods, foodsByDate
- **Mutations**: addFood, updateFoodNutrition
- **Input types**: AddFoodInput, UpdateFoodNutritionInput, NutritionInput

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

query FoodsByDate($date: String!) {
  foodsByDate(date: $date) {
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

**Available from TASK-002**: These operations are already implemented and tested in the backend:
- `todaysFoods` - Returns foods logged today in chronological order
- `recentFoods` - Returns recent unique foods for suggestions (with optional limit)
- `foodsByDate` - Returns foods for a specific date

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

**Available from TASK-002**: These mutations are already implemented and tested:
- `addFood` - Creates new food entry with optional nutrition data
- `updateFoodNutrition` - Updates nutrition values for existing food
- Input types: `AddFoodInput`, `UpdateFoodNutritionInput`, `NutritionInput`

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

**Context from TASK-001**: The frontend is already set up with Next.js 14 + App Router + TailwindCSS + TypeScript. The monorepo structure is in place with npm workspaces, and the frontend runs on localhost:3000.

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
- [x] **Urql Client**: Successfully configured and connecting to GraphQL endpoint
- [x] **Type Generation**: GraphQL operations generate TypeScript types and hooks
- [x] **Provider Setup**: GraphQL client available throughout Next.js app
- [x] **Basic Operations**: Can execute queries and mutations with generated hooks
- [x] **Error Handling**: Proper error states and loading indicators
- [x] **Caching**: Default Urql caching working correctly

### Technical Requirements
- [x] **Code Generation**: `npm run codegen` generates types without errors
- [x] **Type Safety**: All GraphQL operations are fully typed
- [x] **Build Process**: Frontend builds successfully with generated types
- [x] **Environment Config**: GraphQL endpoint configurable via environment variables
- [x] **Development Workflow**: Code generation integrates with development server

### Learning Requirements
- [x] **Urql Patterns**: Understanding client setup, caching, and request policies
- [x] **GraphQL Codegen**: Automated type generation from schema
- [x] **Next.js Integration**: Provider patterns and client-side GraphQL
- [x] **Type Safety**: End-to-end type safety from GraphQL to React components

## Testing Strategy

### Setup Validation
- **Client Connection**:
  - Verify Urql client can connect to GraphQL server (already running from TASK-002)
  - Test basic introspection query (server tested and working)
  - Validate environment variable configuration
- **Code Generation**:
  - Verify generated types match GraphQL schema (Food type, queries, mutations from TASK-002)
  - Test generated hooks are properly typed
  - Validate build process includes code generation

### Integration Tests
- **GraphQL Operations**:
  - Test query hooks return expected data structure (using real data from TASK-002)
  - Test mutation hooks handle success and error states
  - Verify loading states work correctly
- **Caching Behavior**:
  - Test cache-and-network request policy
  - Verify cache updates after mutations
- **Backend Integration**:
  - Test with real GraphQL server (already running from TASK-002)
  - Verify CORS configuration works (already tested in TASK-002)
  - Test with actual database data (Prisma setup from TASK-002)

### Manual Testing Scenarios
1. **Development Workflow**: Start frontend dev server (localhost:3000), verify GraphQL operations work with backend (localhost:4000)
2. **Code Generation**: Run codegen, verify types are updated and match TASK-002 schema
3. **Error Handling**: Test with GraphQL server down, verify error states
4. **Build Process**: Run production build, verify generated types included
5. **CORS Testing**: Verify frontend can make requests to backend (CORS already configured in TASK-002)

## Implementation Notes

### Development Approach
1. **Step 1**: Install Urql and GraphQL Code Generator dependencies in frontend
2. **Step 2**: Configure Urql client with basic settings (backend already running from TASK-002)
3. **Step 3**: Set up GraphQL provider in Next.js app (App Router structure from TASK-001)
4. **Step 4**: Configure code generation with basic operations (schema available from TASK-002)
5. **Step 5**: Create sample queries and mutations matching the Food schema
6. **Step 6**: Test full workflow and type generation with real GraphQL server

### Implementation Prerequisites
**Before starting this task, ensure:**
- Backend is running: `cd backend && npm run dev` (GraphQL server on localhost:4000)
- Frontend is set up: `cd frontend && npm run dev` (Next.js on localhost:3000)
- Database is connected: Prisma client working (from TASK-002)
- GraphQL schema is available: Introspection working at localhost:4000/graphql

### Learning Focus Areas
- **Urql vs Apollo**: Understanding lightweight GraphQL client benefits
- **Code Generation**: Automated type safety from GraphQL schema
- **Next.js Client Components**: Provider patterns and hydration considerations
- **GraphQL Best Practices**: Query structuring, fragment usage, error handling
- **Caching Strategies**: Urql's normalized cache vs document cache

### Potential Challenges
- **Code Generation Timing**: Backend schema is already available and tested (TASK-002)
- **Environment Variables**: Proper Next.js public/private variable handling
- **SSR Considerations**: Client-side GraphQL in Next.js App Router (structure from TASK-001)
- **Type Synchronization**: Keeping generated types in sync during development
- **CORS Configuration**: Backend already configured for frontend access (TASK-002)

## Definition of Done

### Code Complete
- [x] Urql client configured and provider setup complete
- [x] GraphQL code generation working and integrated into build process
- [x] Basic queries and mutations defined with proper TypeScript types
- [x] Error handling and loading states properly implemented
- [x] Environment configuration documented and working

### Documentation Complete
- [x] README updated with GraphQL client setup instructions
- [x] Code generation process documented
- [x] Environment variables documented
- [x] Learning notes about Urql patterns

### Deployment Ready
- [x] Build process includes code generation step
- [x] Environment variables properly configured for different environments
- [x] TypeScript compilation passes with generated types
- [x] Client can connect to production GraphQL endpoint

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

## ✅ TASK COMPLETION SUMMARY

### Implementation Completed
- **Urql Client Setup**: Successfully configured Urql client with cache-and-network policy
- **GraphQL Code Generation**: Automated type generation working with GraphQL Code Generator
- **Next.js Integration**: Provider setup complete with SSR support
- **Type Safety**: End-to-end TypeScript types from GraphQL schema to React components
- **Build Integration**: Code generation integrated into build process
- **Testing**: GraphQL test component created and working

### Key Files Created/Modified
- `frontend/src/lib/urql.ts` - Urql client configuration
- `frontend/src/lib/graphql-client.tsx` - GraphQL provider for Next.js
- `frontend/codegen.yml` - GraphQL Code Generator configuration
- `frontend/src/generated/graphql.ts` - Generated types and hooks
- `frontend/src/graphql/queries/foods.graphql` - Query definitions
- `frontend/src/graphql/mutations/foods.graphql` - Mutation definitions
- `frontend/src/graphql/fragments/food.graphql` - Reusable fragments
- `frontend/src/hooks/useGraphQLState.ts` - Custom hook for state management
- `frontend/src/components/GraphQLTest.tsx` - Test component
- `frontend/src/app/test-graphql/page.tsx` - Comprehensive test page

### Verification Results
- ✅ **Client Connection**: Urql client successfully connects to GraphQL server
- ✅ **Type Generation**: All GraphQL operations generate proper TypeScript types
- ✅ **Build Process**: Frontend builds successfully with generated types
- ✅ **Integration**: Frontend can execute queries and mutations with real backend data
- ✅ **Error Handling**: Proper loading states and error handling implemented
- ✅ **Caching**: Urql caching working correctly with cache-and-network policy

### Learning Objectives Achieved
- **Urql Patterns**: Understanding lightweight GraphQL client benefits
- **Code Generation**: Automated type safety from GraphQL schema
- **Next.js Integration**: Client-side GraphQL in App Router
- **Type Safety**: End-to-end type safety from GraphQL to React components

**Task History**:
| Date | Status Change | Notes | Author |
|------|---------------|-------|--------|
| 2025-10-01 | Created | Frontend GraphQL client setup for Urql learning | Claude |
| 2025-10-01 | ✅ COMPLETED | Urql client setup with code generation working | Claude |