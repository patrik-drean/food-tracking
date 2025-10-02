# Deployment Guidelines

This document provides Claude Code with comprehensive deployment and infrastructure guidance for the food tracking application, including CI/CD pipelines, environment management, and production deployment strategies.

## Deployment Architecture

### Infrastructure Overview
- **Frontend Hosting**: GitHub Pages (static export from Next.js 14)
- **Backend Hosting**: Railway (GraphQL Yoga + Node.js with auto-deploy)
- **Database Hosting**: PostgreSQL on Railway with automatic backups
- **CDN**: GitHub Pages built-in CDN for static assets
- **External APIs**: OpenAI GPT-4o-mini for nutrition analysis
- **Monitoring**: Railway built-in monitoring + custom health checks

### Environment Strategy
```yaml
# Food tracking application environments
environments:
  development:
    purpose: "Local development and testing"
    frontend: "Next.js dev server (localhost:3000)"
    backend: "Local GraphQL server (localhost:4000)"
    database: "Local PostgreSQL with sample food data"
    external_apis: "OpenAI API with development quota limits"
    logging_level: "DEBUG"
    features:
      - Hot reload enabled
      - Debug nutrition analysis
      - Mock external APIs available

  production:
    purpose: "Live food tracking application"
    frontend: "GitHub Pages static export"
    backend: "Railway auto-deployed GraphQL API"
    database: "Railway PostgreSQL with automatic backups"
    external_apis: "OpenAI GPT-4o-mini production endpoints"
    logging_level: "WARN"
    features:
      - Production nutrition analysis
      - Rate limiting enabled
      - Performance monitoring
      - Automated backups
```

## CI/CD Pipeline

### GitHub Actions for Frontend (GitHub Pages)
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]
    paths: ['frontend/**']
  workflow_dispatch:

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      # Quality checks
      - name: Run TypeScript type checking
        run: npm run type-check

      - name: Run ESLint
        run: npm run lint

      - name: Run unit tests
        run: npm run test

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_GRAPHQL_URL: ${{ vars.NEXT_PUBLIC_GRAPHQL_URL }}

      # Build for GitHub Pages
      - name: Build static export
        run: npm run build:static
        env:
          NEXT_PUBLIC_GRAPHQL_URL: ${{ vars.NEXT_PUBLIC_GRAPHQL_URL }}
          NEXT_PUBLIC_APP_URL: ${{ vars.NEXT_PUBLIC_APP_URL }}

      # Deploy to GitHub Pages
      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./frontend/out

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

  notify-backend:
    needs: test-and-build
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cache warming
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.BACKEND_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"action": "warm_cache", "source": "frontend_deploy"}' \
            ${{ vars.BACKEND_URL }}/api/admin/cache
```

### Railway Auto-Deploy for Backend
```yaml
# Railway automatically deploys on push to main branch
# Configuration in railway.toml:

[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[env]
# Railway automatically injects these from project settings
DATABASE_URL = "${{DATABASE_URL}}"
OPENAI_API_KEY = "${{OPENAI_API_KEY}}"
NODE_ENV = "production"
PORT = "${{PORT}}"

# Custom environment variables
CORS_ORIGINS = "${{CORS_ORIGINS}}"
JWT_SECRET = "${{JWT_SECRET}}"
RATE_LIMIT_MAX = "1000"
RATE_LIMIT_WINDOW_MS = "900000"
OPENAI_MODEL = "gpt-4o-mini"
```

### Quality Gates
Before deployment, ensure all quality gates pass:
- [ ] **All tests pass** (unit, integration, e2e for frontend; GraphQL schema tests for backend)
- [ ] **TypeScript compilation** succeeds without errors
- [ ] **ESLint** passes with no errors (warnings allowed)
- [ ] **Next.js static export** builds successfully
- [ ] **Database migrations** run successfully on Railway
- [ ] **OpenAI API connectivity** verified (health check)
- [ ] **GraphQL schema** is valid and backwards compatible
- [ ] **Environment variables** properly configured in Railway and GitHub
- [ ] **CORS configuration** allows frontend domain
- [ ] **Rate limiting** configured for nutrition analysis endpoints

## Environment Configuration

### Environment Variables Management

#### Development Environment (.env.local)
```bash
# Backend Development Environment
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/food_tracking_dev
PORT=4000
LOG_LEVEL=debug

# OpenAI Configuration
OPENAI_API_KEY=sk-...your-dev-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000

# Security Settings
JWT_SECRET=dev-jwt-secret-min-32-chars-long
CORS_ORIGINS=http://localhost:3000

# Rate Limiting (relaxed for development)
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW_MS=900000

# Food Data Configuration
NUTRITION_CACHE_TTL=3600
FOOD_SEARCH_LIMIT=20
```

```bash
# Frontend Development Environment (.env.local)
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development
```

#### Production Environment (Railway + GitHub Variables)

**Railway Environment Variables:**
```bash
# Automatically provided by Railway
DATABASE_URL=${DATABASE_URL}  # PostgreSQL connection string
PORT=${PORT}                  # Auto-assigned port

# Custom variables set in Railway dashboard
NODE_ENV=production
LOG_LEVEL=warn

# OpenAI Configuration
OPENAI_API_KEY=${OPENAI_API_KEY}  # Production API key
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000

# Security Settings
JWT_SECRET=${JWT_SECRET}      # Secure random string (min 32 chars)
CORS_ORIGINS=https://username.github.io

# Rate Limiting (production values)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes

# Food Tracking Specific
NUTRITION_CACHE_TTL=86400     # 24 hours in production
FOOD_SEARCH_LIMIT=10
ENABLE_ANALYTICS=true
```

**GitHub Repository Variables:**
```bash
# Set in GitHub repo Settings > Secrets and variables > Actions
NEXT_PUBLIC_GRAPHQL_URL=https://your-app.railway.app/graphql
NEXT_PUBLIC_APP_URL=https://username.github.io/food-tracking
```

**GitHub Repository Secrets:**
```bash
# Set in GitHub repo Settings > Secrets and variables > Actions
BACKEND_API_KEY=your-backend-api-key-for-cache-warming
BACKEND_URL=https://your-app.railway.app
```

### Secrets Management
- **Development**: `.env.local` files (gitignored, not committed to version control)
- **Production Backend**: Railway environment variables dashboard
- **Production Frontend**: GitHub repository secrets and variables
- **OpenAI API Key**: Stored securely in Railway, monitored for usage limits
- **Access Control**: Railway team access controls, GitHub repository permissions

### Configuration Validation
```typescript
// Food tracking app configuration validation
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().min(1000).max(65535).default(4000),

  // Security
  JWT_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().transform(origins => origins.split(',')),

  // OpenAI Configuration
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_MAX_TOKENS: z.coerce.number().min(100).max(4000).default(1000),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().min(10).max(10000).default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().min(60000).default(900000),

  // Food Tracking Specific
  NUTRITION_CACHE_TTL: z.coerce.number().min(300).default(3600),
  FOOD_SEARCH_LIMIT: z.coerce.number().min(5).max(50).default(10),

  // Optional configuration
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('warn'),
  ENABLE_ANALYTICS: z.coerce.boolean().default(false),
});

export const config = configSchema.parse(process.env);

// Frontend environment validation
const frontendConfigSchema = z.object({
  NEXT_PUBLIC_GRAPHQL_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'production']).optional(),
});

export const frontendConfig = frontendConfigSchema.parse({
  NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
});
```

## Database Deployment

### Prisma Migration Strategy
#### Migration Deployment Process
1. **Pre-deployment**: Validate migrations locally with `npx prisma migrate diff`
2. **Automatic Backup**: Railway PostgreSQL performs automatic daily backups
3. **Migration Execution**: Railway runs `npx prisma migrate deploy` during deployment
4. **Schema Validation**: Verify Prisma schema matches database state
5. **Rollback Plan**: Use Railway database restore or Prisma migration rollback

#### Migration Commands
```bash
# Local development
npx prisma migrate dev --name add_nutrition_data    # Create and apply migration
npx prisma db seed                                  # Seed development database
npx prisma studio                                   # View database in browser

# Pre-deployment validation
npx prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma
npx prisma validate                                 # Validate schema syntax
npx prisma generate                                 # Generate Prisma client

# Production deployment (automatic via Railway)
npx prisma migrate deploy                           # Apply pending migrations
npx prisma generate                                 # Generate production client

# Troubleshooting
npx prisma migrate status                           # Check migration status
npx prisma migrate resolve --applied "migration_name"  # Mark migration as applied
npx prisma db push --force-reset                    # Reset development database
```

#### Food Tracking Zero-Downtime Migrations
```sql
-- Example: Adding nutrition analysis caching
-- Step 1: Add cache table (safe, no data loss)
CREATE TABLE nutrition_cache (
  id SERIAL PRIMARY KEY,
  food_name VARCHAR(255) NOT NULL,
  nutrition_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Step 2: Add optional columns to existing tables
ALTER TABLE food_entries ADD COLUMN ai_confidence DECIMAL(3,2);
ALTER TABLE food_entries ADD COLUMN analysis_version INTEGER DEFAULT 1;

-- Step 3: Create indexes after data population
CREATE INDEX CONCURRENTLY idx_nutrition_cache_food_name ON nutrition_cache(food_name);
CREATE INDEX CONCURRENTLY idx_food_entries_date ON food_entries(date_logged);

-- Step 4: Backfill data with background job (not in migration)
-- This runs separately to avoid blocking deployment
```

### Railway Database Management
```bash
# Railway CLI commands for database management
railway login                                       # Authenticate with Railway
railway environment                                 # Check current environment
railway variables                                   # View environment variables

# Database operations via Railway CLI
railway run npx prisma migrate deploy               # Run migrations in production
railway run npx prisma studio                       # Access production database (careful!)
railway run npx prisma db seed                      # Seed production database

# Database backup and restore
railway database:backup create                      # Manual backup creation
railway database:backup list                        # List available backups
railway database:backup restore <backup-id>         # Restore from backup

# Monitoring
railway logs                                         # View application logs
railway metrics                                      # View resource usage
```

### Database Backup Strategy
Railway provides automatic backups:
- **Frequency**: Daily automatic backups
- **Retention**: 7 days for free plan, configurable for paid plans
- **Manual Backups**: Available via Railway dashboard or CLI
- **Point-in-time Recovery**: Available for paid plans

```typescript
// Custom backup verification script
export async function verifyDatabaseIntegrity() {
  const checks = {
    userCount: await prisma.user.count(),
    foodEntriesCount: await prisma.foodEntry.count(),
    nutritionCacheCount: await prisma.nutritionCache.count(),
    latestEntry: await prisma.foodEntry.findFirst({
      orderBy: { dateLogged: 'desc' }
    }),
    indexes: await prisma.$queryRaw`
      SELECT schemaname, tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
    `
  };

  console.log('Database integrity check:', checks);
  return checks;
}
```

## Food Tracking Specific Deployment Considerations

### OpenAI API Integration
```typescript
// OpenAI service configuration for production
export class NutritionAnalysisService {
  private openai: OpenAI;
  private rateLimiter: RateLimiter;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
      timeout: 30000, // 30 second timeout
      maxRetries: 3,
    });

    // Rate limiting for OpenAI API calls
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 50,
      interval: 'minute',
    });
  }

  async analyzeFood(foodDescription: string): Promise<NutritionData> {
    await this.rateLimiter.removeTokens(1);

    // Check cache first
    const cached = await this.getCachedAnalysis(foodDescription);
    if (cached && !this.isCacheExpired(cached)) {
      return cached.nutritionData;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: config.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Analyze food descriptions and return structured nutrition data.'
          },
          {
            role: 'user',
            content: `Analyze this food: ${foodDescription}`
          }
        ],
        max_tokens: config.OPENAI_MAX_TOKENS,
        temperature: 0.1, // Low temperature for consistent results
      });

      const nutritionData = this.parseNutritionResponse(response);

      // Cache the result
      await this.cacheAnalysis(foodDescription, nutritionData);

      return nutritionData;
    } catch (error) {
      logger.error('OpenAI API error', { error, foodDescription });

      // Fallback to basic nutrition data
      return this.getFallbackNutrition(foodDescription);
    }
  }
}
```

### Next.js Static Export Configuration
```javascript
// next.config.js for GitHub Pages deployment
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for GitHub Pages static export
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js Image Optimization
  },

  // Environment-specific configuration
  env: {
    GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  },

  // GitHub Pages specific configuration
  assetPrefix: process.env.NODE_ENV === 'production' ? '/food-tracking' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/food-tracking' : '',

  // PWA configuration for offline food tracking
  experimental: {
    webpackBuildWorker: true,
  },
};

module.exports = nextConfig;
```

### Docker Compose for Local Development
```yaml
# docker-compose.yml - Local food tracking development environment
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:foodtracking@db:5432/food_tracking_dev
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: food_tracking_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: foodtracking
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/seed.sql:/docker-entrypoint-initdb.d/seed.sql

volumes:
  postgres_data:
```

## Monitoring and Observability

### Food Tracking Application Health Checks
```typescript
// GraphQL health check endpoint for food tracking app
app.get('/health', async (req, res) => {
  const start = Date.now();

  const checks = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'ok',
    version: process.env.RAILWAY_DEPLOYMENT_ID || 'development',
    checks: {
      database: await checkDatabaseHealth(),
      openai: await checkOpenAIHealth(),
      prisma: await checkPrismaHealth(),
      nutrition_cache: await checkNutritionCacheHealth(),
    }
  };

  const isHealthy = Object.values(checks.checks).every(check => check.status === 'ok');
  const responseTime = Date.now() - start;

  res.status(isHealthy ? 200 : 503).json({
    ...checks,
    responseTimeMs: responseTime
  });
});

async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      responseTimeMs: Date.now() - start,
      connection: 'active'
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      connection: 'failed'
    };
  }
}

async function checkOpenAIHealth() {
  try {
    // Test with minimal API call
    const start = Date.now();
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
      },
    });

    return {
      status: response.ok ? 'ok' : 'error',
      responseTimeMs: Date.now() - start,
      rateLimit: response.headers.get('x-ratelimit-remaining'),
    };
  } catch (error) {
    return {
      status: 'error',
      error: 'OpenAI API unreachable'
    };
  }
}

async function checkPrismaHealth() {
  try {
    const start = Date.now();
    const count = await prisma.foodEntry.count();
    return {
      status: 'ok',
      responseTimeMs: Date.now() - start,
      foodEntriesCount: count
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

async function checkNutritionCacheHealth() {
  try {
    const start = Date.now();
    const cacheStats = await prisma.nutritionCache.aggregate({
      _count: true,
      where: {
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return {
      status: 'ok',
      responseTimeMs: Date.now() - start,
      activeCacheEntries: cacheStats._count
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}
```

#### Metrics Collection
```typescript
// Example metrics collection
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Request metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Business metrics
const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users'
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });

  next();
});
```

### Logging Strategy
```typescript
// Example structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'myapp',
    version: process.env.APP_VERSION
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage examples
logger.info('User created', {
  userId: user.id,
  email: user.email,
  correlationId: req.correlationId
});

logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  correlationId: req.correlationId
});
```

### Error Tracking
```typescript
// Example error tracking integration
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  tracesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,
});

// Error handling middleware
app.use((error, req, res, next) => {
  // Log error
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    correlationId: req.correlationId
  });

  // Send to error tracking service
  Sentry.captureException(error, {
    tags: {
      endpoint: req.path,
      method: req.method
    },
    user: {
      id: req.user?.id,
      email: req.user?.email
    }
  });

  // Return safe error response
  res.status(500).json({
    error: 'Internal server error',
    correlationId: req.correlationId
  });
});
```

## Security in Deployment

### Infrastructure Security
- **Network Security**: VPC, security groups, firewalls
- **Access Control**: IAM roles, least privilege principle
- **Encryption**: Data in transit (TLS) and at rest
- **Secrets Management**: Encrypted secrets storage
- **Regular Updates**: OS and dependency updates

### Application Security
```typescript
// Example security middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

## Performance Optimization

### Application Performance
- **Caching Strategy**: Redis, CDN, application-level caching
- **Database Optimization**: Connection pooling, query optimization
- **Asset Optimization**: Minification, compression, CDN delivery
- **Load Balancing**: Horizontal scaling, session management

### CDN Configuration
```typescript
// Example CDN configuration for static assets
const cdnConfig = {
  // Cache static assets for 1 year
  staticAssets: {
    pattern: /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/,
    cacheControl: 'public, max-age=31536000, immutable'
  },

  // Cache API responses for 5 minutes
  apiResponses: {
    pattern: /^\/api\//,
    cacheControl: 'public, max-age=300, s-maxage=300'
  },

  // No caching for HTML pages
  htmlPages: {
    pattern: /\.html$/,
    cacheControl: 'no-cache, no-store, must-revalidate'
  }
};
```

## Rollback and Recovery

### Rollback Strategy
#### Application Rollback
```bash
# Example rollback commands
[rollback to previous version command]    # Rollback application deployment
[verify rollback command]                 # Verify rollback success
[health check command]                    # Check application health after rollback
```

#### Database Rollback
```bash
# Database rollback options
[rollback migration command]              # Rollback specific migration
[restore from backup command]             # Restore database from backup
[point in time recovery command]          # Point-in-time recovery (if supported)
```

### Disaster Recovery
#### Recovery Procedures
1. **Incident Detection**: Monitoring alerts, error rate spikes
2. **Impact Assessment**: Determine scope and severity
3. **Decision Point**: Fix forward vs. rollback decision
4. **Recovery Execution**: Execute recovery procedure
5. **Verification**: Verify system health and functionality
6. **Post-Incident**: Root cause analysis and prevention

#### Recovery Testing
- **Regular Testing**: Monthly disaster recovery drills
- **Backup Validation**: Regular backup restoration tests
- **Failover Testing**: Test database and application failover
- **Documentation**: Updated recovery procedures

---

## Deployment Commands Quick Reference

```bash
# Build and test
[install dependencies command]    # Install dependencies
[run tests command]              # Run full test suite
[build command]                  # Build application for production
[security audit command]        # Check for vulnerabilities

# Database
[run migrations command]         # Apply database migrations
[backup database command]       # Create database backup
[verify backup command]         # Verify backup integrity

# Deployment
[deploy staging command]         # Deploy to staging environment
[deploy production command]      # Deploy to production environment
[health check command]          # Check application health
[rollback command]              # Rollback to previous version

# Monitoring
[view logs command]             # View application logs
[check metrics command]         # Check performance metrics
[status command]                # Check deployment status
```

## Environment-Specific Configurations

### Development Environment
```yaml
development:
  database:
    host: localhost
    port: 5432
    ssl: false

  logging:
    level: debug
    console: true

  features:
    debug_mode: true
    hot_reload: true
```

### Staging Environment
```yaml
staging:
  database:
    host: staging-db.example.com
    port: 5432
    ssl: true

  logging:
    level: info
    console: false
    file: true

  features:
    debug_mode: false
    monitoring: basic
```

### Production Environment
```yaml
production:
  database:
    host: prod-db.example.com
    port: 5432
    ssl: true
    connection_pool:
      min: 5
      max: 20

  logging:
    level: warn
    console: false
    structured: true
    aggregation: true

  features:
    debug_mode: false
    monitoring: full
    alerting: enabled
```

---

## Instructions for Using This Template

1. **Replace platform-specific** configurations with your deployment platform
2. **Update CI/CD pipeline** configuration for your repository platform
3. **Customize environment variables** for your application needs
4. **Set up monitoring** and alerting appropriate for your infrastructure
5. **Test deployment procedures** regularly to ensure they work
6. **Reference this document** during deployment planning and execution

This document ensures Claude Code understands your deployment requirements and follows your established deployment practices when implementing and deploying features.