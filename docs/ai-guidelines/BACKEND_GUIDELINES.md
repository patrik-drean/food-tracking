# Backend Development Guidelines - Food Tracking Application

This document provides Claude Code with backend-specific guidance for the food tracking application, including GraphQL architecture patterns, API design standards, and development practices.

## Backend Architecture

### Framework & Technology Stack
- **Primary Framework**: GraphQL Yoga Server with Pothos schema builder
- **Language**: TypeScript (strict mode enabled)
- **Database**: PostgreSQL hosted on Railway
- **ORM/Database Library**: Prisma ORM with automatic client generation
- **Authentication**: None (single-user personal application)
- **Caching**: In-memory caching for AI nutrition analysis results
- **External APIs**: OpenAI GPT-4o-mini for food nutrition analysis
- **Testing**: Jest for unit tests, integration tests for GraphQL resolvers

### Project Structure
```
backend/
├── src/
│   ├── schema/         # Pothos GraphQL schema definitions
│   │   ├── types/     # GraphQL object types and input types
│   │   ├── mutations/ # GraphQL mutation resolvers
│   │   └── queries/   # GraphQL query resolvers
│   ├── services/      # Business logic (nutrition analysis, food processing)
│   │   ├── ai/       # OpenAI integration for nutrition analysis
│   │   └── food/     # Food entry and nutrition logic
│   ├── lib/          # Database client, external API clients
│   ├── utils/        # Utility functions (validation, formatting)
│   ├── types/        # TypeScript type definitions
│   └── server.ts     # GraphQL server setup and configuration
├── prisma/           # Database schema and migrations
│   ├── schema.prisma # Prisma schema definition
│   └── migrations/   # Database migration files
└── tests/            # Test files organized by feature
```

### Architecture Pattern
- **Pattern Used**: Service-oriented architecture with GraphQL as the API layer
- **Layer Separation**: GraphQL schema → Services → Prisma ORM → PostgreSQL database
- **Dependency Injection**: Simple dependency injection using TypeScript imports and factory functions
- **Domain Logic**: Food nutrition analysis, validation, and data transformation in service layer

## GraphQL API Design Standards

### GraphQL Schema Conventions
- **Schema Organization**: Separate files for types, queries, mutations, and subscriptions
- **Naming**: PascalCase for types, camelCase for fields and arguments
- **Documentation**: All types and fields must have descriptions
- **Null Safety**: Explicit nullable vs non-nullable field definitions

#### Core GraphQL Operations
```graphql
# Query for daily food entries
type Query {
  foodEntries(date: Date!): [FoodEntry!]!
  foodEntry(id: ID!): FoodEntry
}

# Mutations for food management
type Mutation {
  addFoodEntry(input: AddFoodEntryInput!): FoodEntry!
  updateFoodEntry(id: ID!, input: UpdateFoodEntryInput!): FoodEntry!
  deleteFoodEntry(id: ID!): Boolean!
  analyzeFoodNutrition(description: String!): NutritionAnalysis!
}
```

### GraphQL Type Definitions

#### Core Food Tracking Types
```graphql
type FoodEntry {
  id: ID!
  description: String!
  nutrition: Nutrition
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Nutrition {
  calories: Float!
  fat: Float!
  carbohydrates: Float!
  protein: Float!
  source: NutritionSource!
}

enum NutritionSource {
  AI_GENERATED
  USER_ENTERED
  USER_MODIFIED
}

input AddFoodEntryInput {
  description: String!
  nutrition: NutritionInput
}

input NutritionInput {
  calories: Float!
  fat: Float!
  carbohydrates: Float!
  protein: Float!
}
```

#### GraphQL Error Handling
```typescript
// Custom GraphQL errors with proper error codes
export class FoodValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'FoodValidationError';
  }
}

export class AIAnalysisError extends Error {
  constructor(message: string, public retryable: boolean = true) {
    super(message);
    this.name = 'AIAnalysisError';
  }
}

## Database Design & Management

### Prisma Schema Patterns
- **Naming Conventions**:
  - Models: PascalCase (e.g., `FoodEntry`, `Nutrition`)
  - Fields: camelCase (e.g., `createdAt`, `nutritionId`)
  - Primary Keys: `id` with `@id @default(cuid())`
  - Database Tables: Generated as snake_case automatically

- **Data Types**: String for descriptions, Float for nutrition values, DateTime for timestamps
- **Indexing Strategy**: Index on `createdAt` for date-based queries, unique constraints where needed
- **Relationships**: One-to-one for FoodEntry to Nutrition, using foreign keys with `@relation`

### Prisma Migration Management
```bash
# Prisma migration commands
npx prisma migrate dev --name migration_name  # Create and apply migration in development
npx prisma migrate deploy                      # Apply pending migrations to production
npx prisma migrate reset                       # Reset database and apply all migrations
npx prisma db push                            # Push schema changes without migration (dev only)
npx prisma generate                           # Generate Prisma client
npx prisma studio                             # Open database browser
```

### Prisma Client Patterns
```typescript
// Food entry repository using Prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FoodEntryService {
  async getFoodEntriesByDate(date: Date): Promise<FoodEntry[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.foodEntry.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        nutrition: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createFoodEntry(data: CreateFoodEntryData): Promise<FoodEntry> {
    return await prisma.foodEntry.create({
      data: {
        description: data.description,
        nutrition: data.nutrition ? {
          create: data.nutrition
        } : undefined
      },
      include: {
        nutrition: true
      }
    });
  }

  async updateFoodEntry(id: string, data: UpdateFoodEntryData): Promise<FoodEntry> {
    return await prisma.foodEntry.update({
      where: { id },
      data: {
        description: data.description,
        nutrition: data.nutrition ? {
          upsert: {
            create: data.nutrition,
            update: data.nutrition
          }
        } : undefined
      },
      include: {
        nutrition: true
      }
    });
  }

  async deleteFoodEntry(id: string): Promise<void> {
    await prisma.foodEntry.delete({
      where: { id }
    });
  }
}
```

## Security Implementation

### Authentication & Authorization
- **Authentication Method**: None (single-user personal application)
- **Token Management**: Not applicable (no authentication system)
- **Password Security**: Not applicable (no user accounts)
- **Role-Based Access**: Not applicable (single-user application)

### API Security
- **Input Validation**: Zod schemas for GraphQL input validation and sanitization
- **Rate Limiting**: Basic rate limiting for OpenAI API calls to manage costs
- **CORS Configuration**: Allow frontend domain for GraphQL requests, restrict origins
- **Request Sanitization**: Sanitize food descriptions to prevent XSS in stored data

### Data Security
- **Encryption**: HTTPS in transit, PostgreSQL encryption at rest (Railway default)
- **Sensitive Data**: No personal identifiers stored (food descriptions only)
- **Audit Logging**: Basic error logging, no audit trail needed for single-user app
- **Environment Variables**: Store database URL, OpenAI API key securely in deployment environment

## Business Logic & Services

### Service Layer Pattern
```typescript
// AI Nutrition Analysis Service
export class NutritionAnalysisService {
  constructor(
    private openAIClient: OpenAI,
    private cache: Map<string, NutritionData> = new Map()
  ) {}

  async analyzeFoodNutrition(description: string): Promise<NutritionAnalysis> {
    // Check cache first to reduce API costs
    const cacheKey = description.toLowerCase().trim();
    if (this.cache.has(cacheKey)) {
      return {
        nutrition: this.cache.get(cacheKey)!,
        source: 'CACHED'
      };
    }

    // Validate input
    await this.validateFoodDescription(description);

    try {
      // Call OpenAI API
      const nutrition = await this.callOpenAINutritionAPI(description);

      // Cache the result
      this.cache.set(cacheKey, nutrition);

      return {
        nutrition,
        source: 'AI_GENERATED'
      };
    } catch (error) {
      throw new AIAnalysisError(
        `Failed to analyze nutrition for "${description}"`,
        true
      );
    }
  }

  private async validateFoodDescription(description: string): Promise<void> {
    if (!description || description.trim().length === 0) {
      throw new FoodValidationError('Food description cannot be empty', 'description');
    }

    if (description.length > 200) {
      throw new FoodValidationError('Food description too long (max 200 characters)', 'description');
    }
  }

  private async callOpenAINutritionAPI(description: string): Promise<NutritionData> {
    const prompt = `Analyze the nutrition content of: "${description}".
    Provide approximate values in the following JSON format:
    {
      "calories": number,
      "fat": number (grams),
      "carbohydrates": number (grams),
      "protein": number (grams)
    }

    Only respond with valid JSON.`;

    const response = await this.openAIClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 150
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      throw new Error('Invalid JSON response from OpenAI');
    }
  }
}
```

### Domain Models
```typescript
// Core domain types for food tracking
export interface FoodEntry {
  id: string;
  description: string;
  nutrition: Nutrition | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Nutrition {
  calories: number;
  fat: number;
  carbohydrates: number;
  protein: number;
  source: NutritionSource;
}

export enum NutritionSource {
  AI_GENERATED = 'AI_GENERATED',
  USER_ENTERED = 'USER_ENTERED',
  USER_MODIFIED = 'USER_MODIFIED'
}

export interface NutritionAnalysis {
  nutrition: NutritionData;
  source: 'AI_GENERATED' | 'CACHED';
}

export interface CreateFoodEntryData {
  description: string;
  nutrition?: NutritionData;
}
```

## Development Workflow

### Environment Setup
```bash
# Backend development commands
npm install                    # Install dependencies
npm run dev                   # Start development server with hot reload
npm run build                 # Build for production
npm run start                 # Start production server

# Database commands
npx prisma migrate dev        # Run database migrations in development
npx prisma generate          # Generate Prisma client
npx prisma studio           # Open database browser

# Testing commands
npm run test                 # Run unit tests
npm run test:watch          # Run tests in watch mode
npm run test:integration    # Run integration tests
```

### Error Handling Patterns
```typescript
// GraphQL error handling with proper error types
export const resolvers = {
  Mutation: {
    addFoodEntry: async (parent, args, context) => {
      try {
        const foodEntry = await context.foodEntryService.create(args.input);
        return foodEntry;
      } catch (error) {
        if (error instanceof FoodValidationError) {
          throw new GraphQLError('Validation failed', {
            extensions: {
              code: 'VALIDATION_ERROR',
              field: error.field
            }
          });
        }

        if (error instanceof AIAnalysisError) {
          throw new GraphQLError('AI analysis failed', {
            extensions: {
              code: 'AI_ANALYSIS_ERROR',
              retryable: error.retryable
            }
          });
        }

        throw new GraphQLError('Internal server error', {
          extensions: { code: 'INTERNAL_ERROR' }
        });
      }
    }
  }
};
```

## Food Tracking Specific Guidelines

### AI Integration Best Practices
- **Cost Management**: Cache nutrition analysis results to minimize OpenAI API calls
- **Error Handling**: Gracefully handle AI failures with manual entry fallbacks
- **Prompt Engineering**: Use consistent, structured prompts for reliable nutrition data
- **Response Validation**: Validate AI responses before storing to database

### Data Validation Rules
- **Food Descriptions**: Non-empty, max 200 characters, basic XSS prevention
- **Nutrition Values**: Positive numbers, reasonable ranges (calories 0-10000, macros 0-1000g)
- **Date Handling**: Store and query by date ranges for daily food logs
- **User Input Sanitization**: Clean and validate all user-provided food descriptions

### Performance Considerations
- **Database Queries**: Index on createdAt for efficient date-based queries
- **AI API Calls**: Implement caching and request deduplication
- **GraphQL Optimization**: Use DataLoader patterns if needed for N+1 queries
- **Memory Management**: Limit cache size for nutrition analysis results

This document ensures Claude Code understands the food tracking backend architecture and follows established patterns when implementing GraphQL resolvers, services, and database operations.

