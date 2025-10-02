# Database Guidelines - Food Tracking Application

This document provides Claude Code with comprehensive database design, management, and optimization guidance for the food tracking application.

## Database Architecture

### Database Technology
- **Primary Database**: PostgreSQL 15.x (hosted on Railway)
- **Database Version**: PostgreSQL 15.x with full ACID compliance
- **ORM/Query Builder**: Prisma ORM with automatic client generation
- **Connection Management**: Prisma connection pooling (5-10 connections)
- **Backup Strategy**: Railway automatic daily backups + manual export capability

### Database Environment Setup
```bash
# Local development setup
npx prisma generate                    # Generate Prisma client
npx prisma migrate dev                 # Run database migrations in development
npx prisma migrate deploy              # Apply migrations to production
npx prisma db push                     # Push schema changes without migration
npx prisma studio                      # Open database browser
npx prisma db seed                     # Seed database with test data
npx prisma migrate reset              # Reset database and reapply all migrations
```

### Prisma Configuration
```typescript
// Prisma client configuration
import { PrismaClient } from '@prisma/client';

// Global Prisma client instance
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
```

```prisma
// schema.prisma - Prisma schema file
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
```

## Schema Design Standards

### Naming Conventions
#### Tables (Prisma Models)
- **Format**: PascalCase for Prisma models, translated to snake_case for PostgreSQL
- **Examples**: `Food` (Prisma) → `foods` (PostgreSQL), `FoodCache` → `food_cache`
- **Prefixes**: No prefixes, keep model names simple and domain-focused

#### Columns (Prisma Fields)
- **Format**: camelCase for Prisma fields, translated to snake_case for PostgreSQL
- **Examples**: `createdAt` → `created_at`, `isManual` → `is_manual`, `foodDescription` → `food_description`
- **Nutrition Fields**: Use full names for clarity: `calories`, `protein`, `carbohydrates` (not `carbs`)
- **Reserved words**: Avoid SQL reserved words; Prisma handles escaping automatically

#### Indexes
- **Format**: Prisma generates indexes automatically for foreign keys and unique constraints
- **Custom Indexes**: Use `@@index()` in Prisma schema for performance-critical queries
- **Examples**: Date-based queries for food entries, text search on food descriptions

#### Constraints
- **Primary Keys**: Auto-generated `id` fields (Int with @id @default(autoincrement()))
- **Foreign Keys**: Defined through Prisma relations, no manual naming required
- **Unique Constraints**: Use `@unique` or `@@unique()` for compound uniqueness
- **Check Constraints**: Use Prisma validators and application-level validation

### Data Types Standards
```prisma
// Food tracking specific data types in Prisma schema

// Primary identifiers
id        Int      @id @default(autoincrement())

// Food description and metadata
description String              // Food description with quantity (e.g., "2 slices pizza")
isManual    Boolean @default(false)  // True if nutrition manually entered vs AI-generated

// Nutrition data (nullable for gradual data entry)
calories    Float?              // Calories per serving
protein     Float?              // Protein in grams
carbs       Float?              // Carbohydrates in grams (rename from carbohydrates)
fat         Float?              // Fat in grams

// Temporal fields for food tracking
createdAt   DateTime @default(now())  // When food was logged
updatedAt   DateTime @updatedAt       // Last nutrition update

// Food caching for AI optimization (future)
descriptionHash String?         // Hash of description for cache lookups
cacheData       Json?           // Cached AI nutrition response

// Validation constraints
// Use @check constraints for nutrition validation:
// calories >= 0, protein >= 0, carbs >= 0, fat >= 0
```

### Schema Design Patterns
#### Food Tracking Schema
```prisma
// Core Food model for tracking daily nutrition
model Food {
  id          Int      @id @default(autoincrement())
  description String   // "2 slices pizza", "1 cup rice with butter"

  // Nutrition data (nullable for gradual entry)
  calories    Float?   // Total calories for this food entry
  protein     Float?   // Grams of protein
  carbs       Float?   // Grams of carbohydrates
  fat         Float?   // Grams of fat

  // Metadata
  isManual    Boolean  @default(false) // True if manually entered, false if AI-generated

  // Temporal tracking
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Indexes for performance
  @@index([createdAt]) // For daily queries
  @@index([description]) // For food suggestions
}

// Future: Food cache for AI optimization
model FoodCache {
  id              Int      @id @default(autoincrement())
  descriptionHash String   @unique // Hash of normalized food description
  description     String   // Original description for reference

  // Cached nutrition data from AI
  calories        Float?
  protein         Float?
  carbs           Float?
  fat             Float?

  // Cache metadata
  createdAt       DateTime @default(now())
  lastUsed        DateTime @default(now())
  useCount        Int      @default(1)

  @@index([lastUsed]) // For cache cleanup
}
```

#### Food Tracking Query Patterns
```typescript
// Daily food queries - core application pattern
const todaysFoods = await prisma.food.findMany({
  where: {
    createdAt: {
      gte: startOfDay(new Date()),
      lt: startOfDay(addDays(new Date(), 1))
    }
  },
  orderBy: { createdAt: 'asc' }
});

// Recent unique foods for suggestions
const recentUniqueFoods = await prisma.food.findMany({
  distinct: ['description'],
  take: 10,
  orderBy: { createdAt: 'desc' }
});

// Weekly nutrition summary
const weeklyNutrition = await prisma.food.aggregate({
  where: {
    createdAt: {
      gte: startOfWeek(new Date()),
      lt: endOfWeek(new Date())
    }
  },
  _sum: {
    calories: true,
    protein: true,
    carbs: true,
    fat: true
  }
});
```

## Migration Management

### Prisma Migration Strategy
- **Migration Files**: Auto-generated timestamped files in `prisma/migrations/`
- **Version Control**: All migrations and schema.prisma committed to Git
- **Schema-First**: Modify `schema.prisma`, then generate migrations
- **Environment Sync**: Same migrations applied across all environments

### Prisma Migration Workflow
```bash
# Development workflow
npx prisma migrate dev --name add_food_model     # Create and apply migration
npx prisma generate                              # Generate Prisma client
npx prisma db push                               # Push schema without migration (dev only)
npx prisma migrate reset                         # Reset database and reapply all migrations

# Production workflow
npx prisma migrate deploy                        # Apply pending migrations to production
npx prisma generate                              # Generate client for production

# Database inspection
npx prisma studio                                # Open database browser
npx prisma db seed                               # Run seed script
```

### Food Tracking Migration Examples
```sql
-- Example: Initial food model migration
-- File: prisma/migrations/20241001_init_food_model/migration.sql

-- CreateTable
CREATE TABLE "foods" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "calories" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "foods_created_at_idx" ON "foods"("created_at");

-- CreateIndex
CREATE INDEX "foods_description_idx" ON "foods"("description");
```

```sql
-- Example: Add food cache table migration
-- File: prisma/migrations/20241002_add_food_cache/migration.sql

-- CreateTable
CREATE TABLE "food_cache" (
    "id" SERIAL NOT NULL,
    "description_hash" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "calories" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "use_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "food_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_cache_description_hash_key" ON "food_cache"("description_hash");

-- CreateIndex
CREATE INDEX "food_cache_last_used_idx" ON "food_cache"("last_used");
```

### Schema Evolution Best Practices
```prisma
// ✅ Good: Additive changes that don't break existing data
model Food {
  id          Int      @id @default(autoincrement())
  description String
  calories    Float?
  protein     Float?
  carbs       Float?   // Renamed from carbohydrates - migration handles this
  fat         Float?
  isManual    Boolean  @default(false)

  // ✅ Safe to add new optional fields
  fiber       Float?   // New field, nullable
  sugar       Float?   // New field, nullable

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([createdAt])
  @@index([description])
}
```

## Query Optimization

### Indexing Strategy
#### When to Add Indexes
- **Primary Keys**: Automatically indexed
- **Foreign Keys**: Always index foreign key columns
- **Unique Constraints**: Automatically indexed
- **Frequently Queried Columns**: WHERE, ORDER BY, GROUP BY clauses
- **Join Columns**: Columns used in JOIN conditions

#### Index Types
```sql
-- B-tree index (default, good for equality and range queries)
CREATE INDEX idx_users_email ON users(email);

-- Composite index (multiple columns)
CREATE INDEX idx_orders_user_id_status ON orders(user_id, status);

-- Partial index (with WHERE condition)
CREATE INDEX idx_active_users ON users(email) WHERE deleted_at IS NULL;

-- Full-text search index (PostgreSQL example)
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));

-- JSON indexes (PostgreSQL example)
CREATE INDEX idx_user_preferences ON users USING gin(preferences);
```

### Food Tracking Query Performance Patterns
```typescript
// ✅ Efficient Prisma queries for food tracking

// Daily food queries with proper indexing
const todaysFoods = await prisma.food.findMany({
  where: {
    createdAt: {
      gte: startOfToday(),    // Use date functions for clarity
      lt: startOfTomorrow()
    }
  },
  orderBy: { createdAt: 'asc' },
  select: {                 // Only select needed fields
    id: true,
    description: true,
    calories: true,
    protein: true,
    carbs: true,
    fat: true,
    isManual: true,
    createdAt: true
  }
});

// Efficient food suggestions using distinct and proper indexing
const foodSuggestions = await prisma.food.findMany({
  where: {
    description: {
      contains: searchTerm,
      mode: 'insensitive'     // Case-insensitive search
    }
  },
  distinct: ['description'],
  take: 10,
  orderBy: { createdAt: 'desc' },
  select: {
    description: true,
    calories: true,
    protein: true,
    carbs: true,
    fat: true
  }
});

// Aggregated nutrition totals for performance
const dailyTotals = await prisma.food.aggregate({
  where: {
    createdAt: {
      gte: startOfToday(),
      lt: startOfTomorrow()
    }
  },
  _sum: {
    calories: true,
    protein: true,
    carbs: true,
    fat: true
  }
});

// ✅ Use cursor-based pagination for large datasets
const foodHistory = await prisma.food.findMany({
  take: 20,
  skip: cursor ? 1 : 0,     // Skip cursor item
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' }
});

// ✅ Efficient cache lookup pattern
const cachedNutrition = await prisma.foodCache.findUnique({
  where: { descriptionHash: hashDescription(description) },
  select: {
    calories: true,
    protein: true,
    carbs: true,
    fat: true
  }
});
```

### Query Analysis for Food Tracking
```sql
-- PostgreSQL query analysis for food tracking patterns
EXPLAIN (ANALYZE, BUFFERS)
SELECT f.description, f.calories, f.protein, f.carbs, f.fat
FROM foods f
WHERE f.created_at >= '2024-10-01'::date
  AND f.created_at < '2024-10-02'::date
ORDER BY f.created_at ASC;

-- Expected: Index Scan on foods_created_at_idx
-- Watch for: Sequential Scan indicates missing or unused index

EXPLAIN (ANALYZE, BUFFERS)
SELECT DISTINCT f.description, f.calories, f.protein, f.carbs, f.fat
FROM foods f
WHERE f.description ILIKE '%pizza%'
ORDER BY f.created_at DESC
LIMIT 10;

-- Expected: Index Scan with LIKE filter
-- Consider: GIN index for full-text search if needed

-- Monitor query patterns specific to food tracking
-- Look for:
-- - Date range queries using created_at index efficiently
-- - Text search performance on food descriptions
-- - Aggregation performance for daily nutrition totals
-- - Cache hit rates for repeated food lookups
```

```typescript
// Prisma query optimization monitoring
const prismaClient = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' }
  ]
});

// Log slow queries for food tracking optimization
prismaClient.$on('query', (e) => {
  if (e.duration > 1000) {  // Log queries > 1 second
    console.log('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params
    });
  }
});
```

## Data Modeling Best Practices

### Food Tracking Entity Design
#### Core Food Entity
```prisma
// Primary food tracking model
model Food {
  id          Int      @id @default(autoincrement())

  // Core food data
  description String   // "2 slices pepperoni pizza" or "1 cup cooked rice"

  // Nutrition information (nullable for gradual entry)
  calories    Float?   @db.DoublePrecision  // Total calories
  protein     Float?   @db.DoublePrecision  // Grams of protein
  carbs       Float?   @db.DoublePrecision  // Grams of carbohydrates
  fat         Float?   @db.DoublePrecision  // Grams of fat

  // Data source tracking
  isManual    Boolean  @default(false)      // Manual entry vs AI-generated
  aiModel     String?                       // Which AI model was used (e.g., "gpt-4o-mini")

  // Timestamps for daily tracking
  createdAt   DateTime @default(now())      // When food was logged
  updatedAt   DateTime @updatedAt           // Last nutrition update

  // Performance indexes
  @@index([createdAt])    // Essential for daily queries
  @@index([description])  // For food suggestions and search
  @@map("foods")          // PostgreSQL table name
}

// Validation constraints (implemented in application layer)
// - calories >= 0
// - protein >= 0
// - carbs >= 0
// - fat >= 0
// - description.length > 0
```

#### Supporting Models for Optimization
```prisma
// AI response caching to reduce API calls
model FoodCache {
  id              Int      @id @default(autoincrement())

  // Cache key and metadata
  descriptionHash String   @unique @db.VarChar(64)  // SHA-256 hash
  originalDesc    String                            // For debugging/reference

  // Cached nutrition data
  calories        Float?   @db.DoublePrecision
  protein         Float?   @db.DoublePrecision
  carbs           Float?   @db.DoublePrecision
  fat             Float?   @db.DoublePrecision

  // Cache management
  aiModel         String                            // AI model used
  createdAt       DateTime @default(now())
  lastUsed        DateTime @default(now())
  useCount        Int      @default(1)

  @@index([lastUsed])  // For cache cleanup
  @@map("food_cache")
}

// Future: User preferences and goals
model UserPreferences {
  id              Int      @id @default(autoincrement())

  // Daily nutrition goals
  dailyCalories   Float?   @db.DoublePrecision
  dailyProtein    Float?   @db.DoublePrecision
  dailyCarbs      Float?   @db.DoublePrecision
  dailyFat        Float?   @db.DoublePrecision

  // App preferences
  defaultPortions Json?    // Common portion sizes
  favoriteFoods   String[] // Frequently logged foods

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("user_preferences")
}
```

### Food Tracking Data Integrity
```typescript
// Application-level validation for food tracking data
export const foodValidationSchema = z.object({
  description: z.string()
    .min(1, 'Food description is required')
    .max(500, 'Description too long'),

  calories: z.number()
    .min(0, 'Calories cannot be negative')
    .max(10000, 'Calories seem unrealistic')
    .optional(),

  protein: z.number()
    .min(0, 'Protein cannot be negative')
    .max(1000, 'Protein amount seems unrealistic')
    .optional(),

  carbs: z.number()
    .min(0, 'Carbs cannot be negative')
    .max(1000, 'Carbs amount seems unrealistic')
    .optional(),

  fat: z.number()
    .min(0, 'Fat cannot be negative')
    .max(1000, 'Fat amount seems unrealistic')
    .optional(),
});

// Business rules for food tracking
export const validateFoodEntry = (food: FoodInput) => {
  // Ensure at least some nutrition data if marked as manual
  if (food.isManual && !food.calories && !food.protein && !food.carbs && !food.fat) {
    throw new Error('Manual entries must include some nutrition information');
  }

  // Validate nutrition data consistency
  if (food.calories && food.protein && food.carbs && food.fat) {
    const calculatedCalories = (food.protein * 4) + (food.carbs * 4) + (food.fat * 9);
    const difference = Math.abs(food.calories - calculatedCalories);

    if (difference > food.calories * 0.3) { // 30% tolerance
      console.warn('Nutrition values may be inconsistent:', {
        provided: food.calories,
        calculated: calculatedCalories,
        difference
      });
    }
  }
};
```

```sql
-- Database-level constraints for nutrition data
ALTER TABLE foods
ADD CONSTRAINT ck_foods_calories_positive
CHECK (calories IS NULL OR calories >= 0);

ALTER TABLE foods
ADD CONSTRAINT ck_foods_protein_positive
CHECK (protein IS NULL OR protein >= 0);

ALTER TABLE foods
ADD CONSTRAINT ck_foods_carbs_positive
CHECK (carbs IS NULL OR carbs >= 0);

ALTER TABLE foods
ADD CONSTRAINT ck_foods_fat_positive
CHECK (fat IS NULL OR fat >= 0);

-- Ensure description is not empty
ALTER TABLE foods
ADD CONSTRAINT ck_foods_description_not_empty
CHECK (length(trim(description)) > 0);

-- Cache table constraints
ALTER TABLE food_cache
ADD CONSTRAINT ck_food_cache_use_count_positive
CHECK (use_count > 0);
```

## Security and Access Control

### Database Security
#### Connection Security
- **SSL/TLS**: Always use encrypted connections in production
- **Authentication**: Strong passwords, certificate-based auth where possible
- **Network Security**: Firewall rules, VPN access, IP whitelisting

#### User Management
```sql
-- Create application-specific database users
CREATE USER app_read_only WITH PASSWORD 'secure_password';
CREATE USER app_read_write WITH PASSWORD 'secure_password';
CREATE USER app_admin WITH PASSWORD 'secure_password';

-- Grant appropriate permissions
GRANT CONNECT ON DATABASE myapp TO app_read_only;
GRANT USAGE ON SCHEMA public TO app_read_only;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_read_only;

GRANT CONNECT ON DATABASE myapp TO app_read_write;
GRANT USAGE ON SCHEMA public TO app_read_write;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_read_write;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_read_write;
```

### Data Protection
#### Sensitive Data Handling
```sql
-- Encrypt sensitive data at application level before storing
CREATE TABLE user_payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),

  -- Store encrypted data
  card_number_encrypted TEXT NOT NULL,    -- Encrypted credit card number
  cardholder_name_encrypted TEXT NOT NULL, -- Encrypted name

  -- Store non-sensitive metadata
  card_type VARCHAR(20) NOT NULL,         -- Visa, MasterCard, etc.
  last_four_digits CHAR(4) NOT NULL,      -- For display purposes
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,

  -- Security
  encryption_key_id VARCHAR(255) NOT NULL, -- Reference to encryption key

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Row-Level Security (PostgreSQL example)
```sql
-- Enable row-level security
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Create policy - users can only see their own documents
CREATE POLICY user_documents_policy ON user_documents
  FOR ALL TO app_user
  USING (user_id = current_setting('app.current_user_id')::INTEGER);
```

## Performance Monitoring

### Database Metrics
#### Key Performance Indicators
- **Query Performance**: Average response time, slow query count
- **Connection Pool**: Active connections, pool utilization
- **Resource Usage**: CPU, memory, disk I/O
- **Lock Contention**: Deadlocks, lock wait times
- **Index Usage**: Index hit ratio, unused indexes

#### Monitoring Queries
```sql
-- PostgreSQL monitoring examples

-- Find slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;

-- Monitor connection usage
SELECT state, count(*)
FROM pg_stat_activity
GROUP BY state;

-- Check table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Performance Optimization
#### Query Optimization Checklist
- [ ] **Indexes**: Appropriate indexes on filtered and joined columns
- [ ] **Query Structure**: Efficient JOINs, avoid N+1 queries
- [ ] **Data Types**: Appropriate data types for storage efficiency
- [ ] **Pagination**: Efficient pagination (cursor-based for large datasets)
- [ ] **Caching**: Query result caching where appropriate

#### Database Maintenance
```sql
-- Regular maintenance tasks

-- Update table statistics
ANALYZE;

-- Reclaim space and update statistics
VACUUM ANALYZE;

-- Rebuild indexes if needed
REINDEX INDEX idx_name;

-- Check for unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

## Backup and Recovery

### Backup Strategy
#### Backup Types
- **Full Backups**: [e.g., Daily full database backups]
- **Incremental Backups**: [e.g., Hourly transaction log backups]
- **Point-in-Time Recovery**: [e.g., Continuous WAL archiving]

#### Backup Commands
```bash
# PostgreSQL backup examples
pg_dump -h localhost -U postgres -d myapp > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -h localhost -U postgres -d myapp | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Custom format (faster restore)
pg_dump -h localhost -U postgres -d myapp -Fc > backup_$(date +%Y%m%d_%H%M%S).dump

# Restore examples
psql -h localhost -U postgres -d myapp < backup_20241201_120000.sql
pg_restore -h localhost -U postgres -d myapp backup_20241201_120000.dump
```

### Disaster Recovery
#### Recovery Testing
- **Regular Testing**: Test backup restoration monthly
- **RTO/RPO Targets**: [e.g., RTO < 4 hours, RPO < 1 hour]
- **Failover Procedures**: Documented procedures for database failover
- **Data Validation**: Verify data integrity after restoration

## Development Workflow

### Local Development
```bash
# Local database setup
[setup command]              # Set up local database
[start command]              # Start database service
[create db command]          # Create development database
[run migrations command]     # Apply all migrations
[seed command]              # Load sample data
[reset command]             # Reset database to clean state
```

### Testing Databases
#### Test Database Strategy
- **Separate Test DB**: Isolated test database
- **Transaction Rollback**: Tests wrapped in transactions that rollback
- **Database Seeding**: Consistent test data setup
- **Parallel Testing**: Separate test databases for parallel test execution

```typescript
// Example test database setup
beforeEach(async () => {
  // Start transaction
  await db.beginTransaction();

  // Seed test data
  await seedTestData();
});

afterEach(async () => {
  // Rollback transaction to clean state
  await db.rollback();
});
```

### Database Versioning
#### Schema Versioning
- **Migration Files**: Version-controlled migration scripts
- **Schema Documentation**: Document schema changes and reasoning
- **Breaking Changes**: Careful handling of breaking schema changes
- **Data Migration**: Scripts for migrating existing data

---

## Food Tracking Database Commands Quick Reference

```bash
# Development workflow with Prisma
npx prisma generate                              # Generate Prisma client after schema changes
npx prisma migrate dev --name add_food_model     # Create and apply new migration
npx prisma db push                               # Push schema changes without migration (dev only)
npx prisma migrate reset                         # Reset database and reapply all migrations
npx prisma db seed                               # Seed database with sample food data

# Production deployment
npx prisma migrate deploy                        # Apply pending migrations to production
npx prisma generate                              # Generate client for production build

# Database inspection and management
npx prisma studio                                # Open web-based database browser
npx prisma db pull                               # Pull schema from existing database
npx prisma validate                              # Validate schema.prisma file
npx prisma format                                # Format schema.prisma file

# Railway PostgreSQL specific
psql postgresql://[connection-url]               # Connect to Railway PostgreSQL directly
pg_dump postgresql://[connection-url] > backup.sql  # Create backup
psql postgresql://[connection-url] < backup.sql     # Restore from backup

# Performance monitoring
psql -c "SELECT * FROM pg_stat_user_tables WHERE relname = 'foods';"  # Table statistics
psql -c "SELECT * FROM pg_stat_user_indexes WHERE relname LIKE '%foods%';"  # Index usage
```

## Food Tracking Specific Database Patterns

```typescript
// Daily nutrition queries - most common pattern
const getTodaysNutrition = async () => {
  const foods = await prisma.food.findMany({
    where: {
      createdAt: {
        gte: startOfDay(new Date()),
        lt: startOfDay(addDays(new Date(), 1))
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return foods.reduce((totals, food) => ({
    calories: totals.calories + (food.calories || 0),
    protein: totals.protein + (food.protein || 0),
    carbs: totals.carbs + (food.carbs || 0),
    fat: totals.fat + (food.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

// Food suggestion patterns
const getFoodSuggestions = async (query: string) => {
  return prisma.food.findMany({
    where: {
      description: {
        contains: query,
        mode: 'insensitive'
      }
    },
    distinct: ['description'],
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
};

// Bulk nutrition analysis for weekly reports
const getWeeklyNutrition = async () => {
  return prisma.food.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: startOfWeek(new Date()),
        lt: endOfWeek(new Date())
      }
    },
    _sum: {
      calories: true,
      protein: true,
      carbs: true,
      fat: true
    }
  });
};
```

## Common Patterns

### Food Tracking Service Layer Pattern
```typescript
// Food service layer with Prisma for food tracking application
export interface FoodService {
  addFood(input: AddFoodInput): Promise<Food>;
  getTodaysFoods(): Promise<Food[]>;
  getRecentFoods(limit?: number): Promise<Food[]>;
  updateFoodNutrition(id: number, nutrition: NutritionInput): Promise<Food>;
  getDailyNutritionTotals(date?: Date): Promise<NutritionSummary>;
  searchFoods(query: string): Promise<Food[]>;
}

export class PrismaFoodService implements FoodService {
  constructor(private prisma: PrismaClient) {}

  async addFood(input: AddFoodInput): Promise<Food> {
    // Validate input
    const validated = foodValidationSchema.parse(input);

    return this.prisma.food.create({
      data: {
        description: validated.description,
        calories: validated.calories,
        protein: validated.protein,
        carbs: validated.carbs,
        fat: validated.fat,
        isManual: !!validated.calories, // True if nutrition provided
      }
    });
  }

  async getTodaysFoods(): Promise<Food[]> {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);

    return this.prisma.food.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getRecentFoods(limit = 10): Promise<Food[]> {
    return this.prisma.food.findMany({
      distinct: ['description'],
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: {
        // Only include foods with complete nutrition data for suggestions
        calories: { not: null },
        protein: { not: null },
        carbs: { not: null },
        fat: { not: null }
      }
    });
  }

  async getDailyNutritionTotals(date = new Date()): Promise<NutritionSummary> {
    const dayStart = startOfDay(date);
    const dayEnd = addDays(dayStart, 1);

    const result = await this.prisma.food.aggregate({
      where: {
        createdAt: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      _sum: {
        calories: true,
        protein: true,
        carbs: true,
        fat: true
      },
      _count: {
        id: true
      }
    });

    return {
      totalCalories: result._sum.calories || 0,
      totalProtein: result._sum.protein || 0,
      totalCarbs: result._sum.carbs || 0,
      totalFat: result._sum.fat || 0,
      foodCount: result._count.id,
      date: date
    };
  }

  async searchFoods(query: string): Promise<Food[]> {
    return this.prisma.food.findMany({
      where: {
        description: {
          contains: query,
          mode: 'insensitive'
        }
      },
      distinct: ['description'],
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
  }
}

// Nutrition cache service for AI optimization
export class FoodCacheService {
  constructor(private prisma: PrismaClient) {}

  async getCachedNutrition(description: string): Promise<NutritionData | null> {
    const hash = this.hashDescription(description);

    const cached = await this.prisma.foodCache.findUnique({
      where: { descriptionHash: hash }
    });

    if (cached) {
      // Update usage statistics
      await this.prisma.foodCache.update({
        where: { id: cached.id },
        data: {
          lastUsed: new Date(),
          useCount: { increment: 1 }
        }
      });
    }

    return cached ? {
      calories: cached.calories,
      protein: cached.protein,
      carbs: cached.carbs,
      fat: cached.fat
    } : null;
  }

  private hashDescription(description: string): string {
    // Normalize and hash the description for consistent cache keys
    const normalized = description.toLowerCase().trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }
}
```

---

## Food Tracking Database Summary

This database design supports a personal food tracking application with the following key characteristics:

### Core Features
- **Daily Food Logging**: Efficient date-based queries for tracking daily nutrition
- **AI Integration**: Caching system to optimize OpenAI API usage for nutrition analysis
- **Flexible Data Entry**: Support for both AI-generated and manually entered nutrition data
- **Food Suggestions**: Smart typeahead based on previously logged foods
- **Performance Optimized**: Proper indexing for common query patterns

### Technology Stack
- **Database**: PostgreSQL 15.x hosted on Railway
- **ORM**: Prisma with TypeScript for type-safe database operations
- **Migration Strategy**: Prisma migrate for schema evolution
- **Connection Management**: Prisma connection pooling

### Key Performance Patterns
- Date-range queries for daily/weekly nutrition summaries
- Distinct queries for food suggestions and typeahead
- Aggregation queries for nutrition totals
- Cache optimization for AI nutrition analysis

### Data Integrity
- Application-level validation with Zod schemas
- Database constraints for non-negative nutrition values
- Business logic validation for nutrition consistency
- Proper indexing for query performance

This database design ensures Claude Code can efficiently implement food tracking features while maintaining data quality and performance.