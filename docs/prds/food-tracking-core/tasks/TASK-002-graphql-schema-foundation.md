# Task: GraphQL Schema Foundation with Pothos and Basic CRUD

> **Parent PRD**: [food-tracking-core/prd.md](../prd.md)
> **Task ID**: TASK-002
> **Status**: Not Started
> **Priority**: High
> **Estimated Effort**: 1-2 days
> **Assignee**: Self-directed learning
> **Created**: 2025-10-01
> **Updated**: 2025-10-01

## Task Overview

### Description
Implement the core GraphQL schema using Pothos schema builder with Prisma integration. Create Food type, queries, and mutations for basic CRUD operations. Establish type-safe GraphQL patterns that will be used throughout the application.

### Context
This task builds the GraphQL API foundation that the frontend will consume. Focus on learning Pothos code-first schema generation, Prisma integration, and type-safe GraphQL patterns. This establishes the API contract for all food tracking functionality.

### Dependencies
- **Prerequisite Tasks**: TASK-001 (Project setup with Prisma schema)
- **Blocking Tasks**: All frontend GraphQL integration tasks
- **External Dependencies**: GraphQL Yoga, Pothos, Prisma Client

## Technical Specifications

### Scope of Changes

#### Backend Changes
- **Schema Definition**:
  - `backend/src/schema/index.ts` - Main schema export
  - `backend/src/schema/types/Food.ts` - Food type definition
  - `backend/src/schema/types/index.ts` - Type exports
- **Resolvers**:
  - `backend/src/resolvers/food.ts` - Food queries and mutations
  - `backend/src/resolvers/index.ts` - Resolver exports
- **Services**:
  - `backend/src/services/foodService.ts` - Business logic layer
  - `backend/src/lib/prisma.ts` - Prisma client configuration
- **Server Setup**:
  - `backend/src/server.ts` - GraphQL Yoga server configuration
  - `backend/src/index.ts` - Application entry point

#### Configuration Changes
- **Environment Variables**: DATABASE_URL for Prisma connection
- **Dependencies**: Add @pothos/plugin-prisma for Prisma integration
- **Scripts**: Add database setup and generation commands

### Implementation Details

#### Pothos Schema Builder Setup
```typescript
// backend/src/schema/index.ts
import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import { prisma } from '../lib/prisma';

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
  },
});

// Import all type definitions
import './types';

export const schema = builder.toSchema();
```

#### Food Type Definition
```typescript
// backend/src/schema/types/Food.ts
import { builder } from '../index';

builder.prismaObject('Food', {
  fields: (t) => ({
    id: t.exposeID('id'),
    description: t.exposeString('description'),
    calories: t.exposeFloat('calories', { nullable: true }),
    fat: t.exposeFloat('fat', { nullable: true }),
    carbs: t.exposeFloat('carbs', { nullable: true }),
    protein: t.exposeFloat('protein', { nullable: true }),
    isManual: t.exposeBoolean('isManual'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

// Input types for mutations
const NutritionInput = builder.inputType('NutritionInput', {
  fields: (t) => ({
    calories: t.float({ required: false }),
    fat: t.float({ required: false }),
    carbs: t.float({ required: false }),
    protein: t.float({ required: false }),
  }),
});

const AddFoodInput = builder.inputType('AddFoodInput', {
  fields: (t) => ({
    description: t.string({ required: true }),
    nutrition: t.field({ type: NutritionInput, required: false }),
  }),
});

const UpdateFoodNutritionInput = builder.inputType('UpdateFoodNutritionInput', {
  fields: (t) => ({
    id: t.id({ required: true }),
    nutrition: t.field({ type: NutritionInput, required: true }),
  }),
});
```

#### Query Resolvers
```typescript
// backend/src/schema/types/Query.ts
import { builder } from '../index';
import { foodService } from '../../services/foodService';

builder.queryType({
  fields: (t) => ({
    todaysFoods: t.prismaField({
      type: ['Food'],
      resolve: async (query, parent, args, context) => {
        return foodService.getTodaysFoods();
      },
    }),
    recentFoods: t.prismaField({
      type: ['Food'],
      args: {
        limit: t.arg.int({ required: false, defaultValue: 10 }),
      },
      resolve: async (query, parent, args, context) => {
        return foodService.getRecentFoods(args.limit);
      },
    }),
  }),
});
```

#### Mutation Resolvers
```typescript
// backend/src/schema/types/Mutation.ts
import { builder } from '../index';
import { foodService } from '../../services/foodService';

builder.mutationType({
  fields: (t) => ({
    addFood: t.prismaField({
      type: 'Food',
      args: {
        input: t.arg({ type: AddFoodInput, required: true }),
      },
      resolve: async (query, parent, args, context) => {
        return foodService.addFood(args.input);
      },
    }),
    updateFoodNutrition: t.prismaField({
      type: 'Food',
      args: {
        input: t.arg({ type: UpdateFoodNutritionInput, required: true }),
      },
      resolve: async (query, parent, args, context) => {
        return foodService.updateFoodNutrition(args.input);
      },
    }),
  }),
});
```

#### Food Service Layer
```typescript
// backend/src/services/foodService.ts
import { prisma } from '../lib/prisma';
import type { AddFoodInput, UpdateFoodNutritionInput } from '../schema/types';

export const foodService = {
  async getTodaysFoods() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.food.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  },

  async getRecentFoods(limit: number = 10) {
    return prisma.food.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['description'],
    });
  },

  async addFood(input: AddFoodInput) {
    const { description, nutrition } = input;

    return prisma.food.create({
      data: {
        description,
        calories: nutrition?.calories,
        fat: nutrition?.fat,
        carbs: nutrition?.carbs,
        protein: nutrition?.protein,
        isManual: !!nutrition, // True if nutrition provided manually
      },
    });
  },

  async updateFoodNutrition(input: UpdateFoodNutritionInput) {
    const { id, nutrition } = input;

    return prisma.food.update({
      where: { id },
      data: {
        calories: nutrition.calories,
        fat: nutrition.fat,
        carbs: nutrition.carbs,
        protein: nutrition.protein,
        isManual: true,
      },
    });
  },
};
```

#### GraphQL Yoga Server Setup
```typescript
// backend/src/server.ts
import { createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import { schema } from './schema';

const yoga = createYoga({
  schema,
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  graphiql: {
    title: 'Food Tracking API',
  },
});

const server = createServer(yoga);

export { server, yoga };
```

#### Prisma Client Configuration
```typescript
// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Data Flow
1. **GraphQL Request**: Client sends query/mutation to GraphQL endpoint
2. **Schema Validation**: Pothos validates against generated schema
3. **Resolver Execution**: Type-safe resolver calls service layer
4. **Business Logic**: Service layer handles database operations via Prisma
5. **Response**: Type-safe response returned to client

## Acceptance Criteria

### Functional Requirements
- [ ] **GraphQL Schema**: Complete schema with Food type, queries, and mutations
- [ ] **Today's Foods Query**: Returns foods logged today in chronological order
- [ ] **Recent Foods Query**: Returns recent unique foods for suggestions
- [ ] **Add Food Mutation**: Creates new food entry with optional nutrition data
- [ ] **Update Nutrition Mutation**: Updates nutrition values for existing food
- [ ] **Type Safety**: Full TypeScript integration between schema and resolvers

### Technical Requirements
- [ ] **Code Quality**: Follows Pothos patterns and TypeScript best practices
- [ ] **Error Handling**: Proper GraphQL error responses for validation failures
- [ ] **Database Integration**: Prisma queries optimized and working correctly
- [ ] **CORS Configuration**: Frontend can successfully make GraphQL requests
- [ ] **Development Tools**: GraphiQL playground accessible and functional

### Learning Requirements
- [ ] **Pothos Patterns**: Understanding code-first schema generation
- [ ] **Prisma Integration**: Type-safe database operations with Prisma plugin
- [ ] **GraphQL Best Practices**: Proper input types, nullable fields, error handling
- [ ] **Service Layer**: Separation of GraphQL resolvers and business logic

## Testing Strategy

### Unit Tests
- **Service Tests**:
  - `foodService.test.ts` - Test all service methods with mock Prisma client
  - Test date filtering for today's foods
  - Test distinct filtering for recent foods
- **Schema Tests**:
  - `schema.test.ts` - Test schema generation and type safety
  - Validate all types are properly exported

### Integration Tests
- **GraphQL Operations**:
  - Test queries return expected data structure
  - Test mutations create/update data correctly
  - Test error scenarios (invalid input, missing data)
- **Database Integration**:
  - Test Prisma operations with test database
  - Validate date filtering and sorting logic

### Manual Testing Scenarios
1. **GraphiQL Playground**: Test all queries and mutations manually
2. **Data Validation**: Verify nullable fields work correctly
3. **Error Handling**: Test invalid inputs and database errors
4. **Performance**: Check query efficiency with sample data

## Implementation Notes

### Development Approach
1. **Step 1**: Set up Pothos builder with Prisma plugin
2. **Step 2**: Define Food type and input types
3. **Step 3**: Implement service layer with Prisma operations
4. **Step 4**: Create query and mutation resolvers
5. **Step 5**: Configure GraphQL Yoga server with CORS
6. **Step 6**: Test full schema with GraphiQL playground

### Learning Focus Areas
- **Code-First GraphQL**: Pothos schema building vs schema-first approaches
- **Type Safety**: End-to-end TypeScript from database to GraphQL
- **Prisma Integration**: Using Prisma plugin for automatic type generation
- **GraphQL Patterns**: Input types, nullable fields, error handling
- **Service Architecture**: Separating GraphQL concerns from business logic

### Potential Challenges
- **DateTime Handling**: Proper timezone handling for "today" filtering
- **Type Generation**: Ensuring Pothos types stay in sync with Prisma schema
- **Null Handling**: Managing optional nutrition fields correctly
- **CORS Configuration**: Proper setup for development and production

## Definition of Done

### Code Complete
- [ ] All GraphQL operations work correctly in GraphiQL
- [ ] Service layer properly tested with unit tests
- [ ] Type safety verified throughout the stack
- [ ] Error handling implemented for common failure cases
- [ ] CORS configured for frontend development

### Documentation Complete
- [ ] GraphQL schema documented with descriptions
- [ ] Service methods have proper JSDoc comments
- [ ] README updated with GraphQL endpoint information
- [ ] Environment variables documented

### Deployment Ready
- [ ] Database connection configured via environment variables
- [ ] GraphQL endpoint accessible from frontend
- [ ] Prisma client generation working in build process
- [ ] Server starts successfully with proper error logging

## Related Tasks

### Follow-up Tasks
- [TASK-003]: Create frontend GraphQL client with Urql
- [TASK-004]: Build food entry UI components
- [TASK-005]: Implement OpenAI integration for nutrition analysis

### Reference Resources
- Pothos GraphQL documentation
- Prisma GraphQL integration guide
- GraphQL Yoga setup examples

## Notes & Comments

### Learning Objectives for This Task
1. **Code-First GraphQL**: Understanding Pothos schema builder patterns
2. **Type Safety**: Full-stack TypeScript with GraphQL and Prisma
3. **API Design**: Creating intuitive GraphQL operations for frontend consumption
4. **Service Architecture**: Proper separation between GraphQL and business logic

### Key Technologies Learned
- **Pothos Schema Builder**: Code-first GraphQL schema generation
- **Prisma Plugin**: Automatic type generation from database schema
- **GraphQL Yoga**: Modern GraphQL server with built-in features
- **Service Layer Pattern**: Clean architecture for GraphQL applications

---

**Task History**:
| Date | Status Change | Notes | Author |
|------|---------------|-------|--------|
| 2025-10-01 | Created | GraphQL foundation task for learning Pothos and Prisma | Claude |