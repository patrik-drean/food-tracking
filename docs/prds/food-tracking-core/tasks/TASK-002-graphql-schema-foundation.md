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
  - `backend/src/schema/builder.ts` - Pothos builder configuration
  - `backend/src/schema/types/Food.ts` - Food type definition
  - `backend/src/schema/types/Query.ts` - Query resolvers
  - `backend/src/schema/types/Mutation.ts` - Mutation resolvers
- **Services**:
  - `backend/src/services/foodService.ts` - Business logic layer
  - `backend/src/lib/prisma.ts` - Prisma client configuration (already exists)
- **Server Setup**:
  - `backend/src/index.ts` - GraphQL Yoga server configuration (already exists)

#### Configuration Changes
- **Environment Variables**: DATABASE_URL already configured in `.env`
- **Dependencies**: Add @pothos/plugin-prisma and related packages
- **Database**: Prisma schema and client already set up from TASK-001
- **Scripts**: Prisma generation already configured in package.json

### Implementation Details

#### Pothos Schema Builder Setup
```typescript
// backend/src/schema/builder.ts
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

// DateTime scalar for Prisma dates
builder.scalarType('DateTime', {
  serialize: (date) => date.toISOString(),
  parseValue: (value) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('Invalid date value');
  },
});
```

```typescript
// backend/src/schema/index.ts
import { builder } from './builder';

// Import all type definitions
import './types/Food';
import './types/Query';
import './types/Mutation';

export const schema = builder.toSchema();
export { builder };
```

#### Food Type Definition
```typescript
// backend/src/schema/types/Food.ts
import { builder } from '../builder';

builder.prismaObject('FoodLogEntry', {
  name: 'Food',
  fields: (t) => ({
    id: t.exposeID('id'),
    description: t.exposeString('description'),
    calories: t.exposeFloat('calories', { nullable: true }),
    fat: t.exposeFloat('fat', { nullable: true }),
    carbs: t.exposeFloat('carbs', { nullable: true }),
    protein: t.exposeFloat('protein', { nullable: true }),
    isManual: t.exposeBoolean('isManual'),
    logDate: t.expose('logDate', { type: 'DateTime' }),
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
import { builder } from '../builder';
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
import { builder } from '../builder';
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

interface NutritionInput {
  calories?: number | null;
  fat?: number | null;
  carbs?: number | null;
  protein?: number | null;
}

interface AddFoodInput {
  description: string;
  nutrition?: NutritionInput | null;
}

interface UpdateFoodNutritionInput {
  id: string;
  nutrition: NutritionInput;
}

export const foodService = {
  async getTodaysFoods() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.foodLogEntry.findMany({
      where: {
        logDate: {
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
    return prisma.foodLogEntry.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['description'],
    });
  },

  async addFood(input: AddFoodInput) {
    const { description, nutrition } = input;

    return prisma.foodLogEntry.create({
      data: {
        description,
        calories: nutrition?.calories,
        fat: nutrition?.fat,
        carbs: nutrition?.carbs,
        protein: nutrition?.protein,
        isManual: !!nutrition, // True if nutrition provided manually
        logDate: new Date(),
      },
    });
  },

  async updateFoodNutrition(input: UpdateFoodNutritionInput) {
    const { id, nutrition } = input;

    return prisma.foodLogEntry.update({
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

  async getFoodsByDate(date: string) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    return prisma.foodLogEntry.findMany({
      where: {
        logDate: {
          gte: targetDate,
          lt: nextDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  },
};
```

#### Integration with Existing Server
The GraphQL schema will be integrated into the existing `backend/src/index.ts` server:

```typescript
// Update backend/src/index.ts
import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import { schema } from './schema'  // Add this import
import { prisma } from './lib/prisma'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create GraphQL Yoga server
const yoga = createYoga({
  schema,  // Use the new schema
  context: async () => ({
    prisma,
  }),
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  graphiql: {
    title: 'Food Tracking API',
    defaultQuery: `
query GetTodaysFoods {
  todaysFoods {
    id
    description
    calories
    protein
    carbs
    fat
    isManual
    logDate
    createdAt
  }
}

mutation AddFood {
  addFood(input: {
    description: "1 medium apple"
    nutrition: {
      calories: 95
      protein: 0.5
      carbs: 25
      fat: 0.3
    }
  }) {
    id
    description
    calories
    protein
    carbs
    fat
    isManual
    logDate
    createdAt
  }
}`,
  },
})
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

#### Prerequisites
1. Ensure backend is running locally
2. Database is set up with Prisma migrations
3. Environment variables are configured

#### Running the API Locally
```bash
# From the project root
cd backend

# Install dependencies (if not done)
npm install

# Add required Pothos dependencies
npm install @pothos/core @pothos/plugin-prisma

# Generate Prisma client and Pothos types
npx prisma generate

# Run database migrations (if needed)
npx prisma migrate dev

# Start the development server
npm run dev
```

The GraphQL server will be available at:
- **GraphQL Endpoint**: `http://localhost:4000/graphql`
- **GraphiQL Playground**: `http://localhost:4000/graphql` (same URL, opens in browser)

#### Testing with cURL Commands

**1. Test Server Health**
```bash
# Basic introspection query to verify server is running
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { queryType { name } } }"
  }'
```

**2. Test Today's Foods Query**
```bash
# Query for today's food entries
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { todaysFoods { id description calories protein carbs fat isManual logDate createdAt } }"
  }'
```

**3. Test Add Food Mutation (with nutrition)**
```bash
# Add a food entry with complete nutrition data
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addFood(input: { description: \"1 medium apple\", nutrition: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 } }) { id description calories protein carbs fat isManual logDate createdAt } }"
  }'
```

**4. Test Add Food Mutation (description only)**
```bash
# Add a food entry without nutrition data
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addFood(input: { description: \"chicken breast\" }) { id description calories protein carbs fat isManual logDate createdAt } }"
  }'
```

**5. Test Recent Foods Query**
```bash
# Query for recent food suggestions
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { recentFoods(limit: 5) { id description calories protein carbs fat logDate createdAt } }"
  }'
```

**6. Test Update Food Nutrition**
```bash
# Update nutrition for existing food (replace ID with actual ID from previous queries)
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateFoodNutrition(input: { id: \"FOOD_ID_HERE\", nutrition: { calories: 120, protein: 1.0, carbs: 30, fat: 0.5 } }) { id description calories protein carbs fat isManual logDate } }"
  }'
```

#### Expected Responses

**Successful Query Response:**
```json
{
  "data": {
    "todaysFoods": [
      {
        "id": "cm1234567890",
        "description": "1 medium apple",
        "calories": 95,
        "protein": 0.5,
        "carbs": 25,
        "fat": 0.3,
        "isManual": true,
        "logDate": "2024-10-02T00:00:00.000Z",
        "createdAt": "2024-10-02T10:30:00.000Z"
      }
    ]
  }
}
```

**Error Response Example:**
```json
{
  "errors": [
    {
      "message": "Field \"invalidField\" is not defined by type \"Food\".",
      "locations": [{ "line": 1, "column": 50 }]
    }
  ]
}
```

#### Validation Tests
1. **GraphiQL Playground**: Test all queries and mutations manually
2. **Data Validation**: Verify nullable fields work correctly
3. **Error Handling**: Test invalid inputs and database errors
4. **Performance**: Check query efficiency with sample data
5. **CORS**: Verify frontend can make requests from localhost:3000

## Implementation Notes

### Required Dependencies
First, install the required Pothos dependencies in the backend:

```bash
cd backend
npm install @pothos/core @pothos/plugin-prisma
npm install -D @pothos/plugin-prisma
```

### Development Approach
1. **Step 1**: Install Pothos dependencies and set up builder with Prisma plugin
2. **Step 2**: Define Food type and input types following existing schema
3. **Step 3**: Implement service layer with Prisma operations
4. **Step 4**: Create query and mutation resolvers
5. **Step 5**: Update existing GraphQL Yoga server configuration
6. **Step 6**: Test schema with GraphiQL playground and cURL commands
7. **Step 7**: Verify integration with existing database and server setup

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
- [ ] All cURL test commands execute successfully
- [ ] Integration with existing server setup verified
- [ ] Database operations work with existing Prisma configuration

### Documentation Complete
- [ ] GraphQL schema documented with descriptions
- [ ] Service methods have proper JSDoc comments
- [ ] Local testing instructions verified and working
- [ ] cURL command examples tested and documented
- [ ] GraphiQL playground usage documented
- [ ] Environment variables documented (DATABASE_URL already configured)

### Deployment Ready
- [ ] Database connection uses existing environment configuration
- [ ] GraphQL endpoint accessible from frontend
- [ ] Prisma client generation integrated with existing build process
- [ ] Server starts successfully with new schema
- [ ] Railway deployment works with updated schema
- [ ] GitHub Pages frontend can connect to backend API

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