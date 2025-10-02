# Task: Project Setup - Initialize Monorepo with TypeScript Stack

> **Parent PRD**: [food-tracking-core/prd.md](../prd.md)
> **Task ID**: TASK-001
> **Status**: ✅ COMPLETED
> **Priority**: High
> **Estimated Effort**: 1-2 days
> **Assignee**: Self-directed learning
> **Created**: 2025-10-01
> **Updated**: 2025-10-01

## Task Overview

### Description
Initialize a new monorepo structure with modern TypeScript tooling for the food tracking application. Set up frontend (Next.js) and backend (Node.js + GraphQL) with proper development workflow, linting, and package management.

### Context
This is the foundational task that establishes the development environment and project structure. All subsequent tasks depend on this setup. Focus on learning modern monorepo patterns and TypeScript tooling.

### Dependencies
- **Prerequisite Tasks**: None (foundational task)
- **Blocking Tasks**: All other implementation tasks
- **External Dependencies**: Node.js 18+, npm/yarn/pnpm, Git

## Technical Specifications

### Scope of Changes

#### Project Structure Setup
```
food-tracking/
├── frontend/                 # Next.js + React + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── graphql/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/                  # GraphQL + Prisma + TypeScript
│   ├── src/
│   │   ├── schema/
│   │   ├── resolvers/
│   │   ├── services/
│   │   └── lib/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
├── package.json              # Root package.json for monorepo
├── .gitignore
├── README.md
└── docs/                     # Existing docs directory
```

#### Frontend Configuration (Next.js + TailwindCSS)
- **Framework**: Next.js 14+ with App Router
- **Styling**: TailwindCSS with mobile-first responsive design
- **TypeScript**: Strict mode configuration
- **Package Manager**: npm workspaces (or yarn/pnpm workspaces)

#### Backend Configuration (GraphQL + Prisma)
- **GraphQL Server**: Yoga GraphQL Server
- **Schema**: Pothos for code-first schema generation
- **Database**: Prisma ORM with PostgreSQL
- **TypeScript**: Strict mode with path mapping

#### Development Tooling
- **Linting**: ESLint with shared configuration
- **Formatting**: Prettier with consistent rules
- **Git Hooks**: Husky for pre-commit validation
- **Scripts**: Unified development commands

### Implementation Details

#### Root Package.json Configuration
```json
{
  "name": "food-tracking-app",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "lint": "npm run lint:frontend && npm run lint:backend"
  }
}
```

#### Frontend Dependencies
**Core:**
- next@14+
- react@18+
- react-dom@18+
- typescript
- @urql/next (GraphQL client)
- urql

**Styling:**
- tailwindcss
- @tailwindcss/forms
- @tailwindcss/typography

**Development:**
- @types/react
- @types/node
- eslint
- eslint-config-next
- prettier

#### Backend Dependencies
**Core:**
- graphql-yoga
- @pothos/core
- @pothos/plugin-prisma
- prisma
- @prisma/client
- typescript

**Development:**
- @types/node
- tsx (TypeScript execution)
- nodemon
- eslint
- prettier

### Key Configuration Files

#### Frontend Next.js Config
```javascript
// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  env: {
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  },
}

module.exports = nextConfig
```

#### TailwindCSS Config
```javascript
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#22c55e',
          900: '#14532d',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

#### Prisma Schema Foundation
```prisma
// backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Food {
  id          String   @id @default(cuid())
  description String
  calories    Float?
  fat         Float?
  carbs       Float?
  protein     Float?
  isManual    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("foods")
}

model FoodCache {
  id             String   @id @default(cuid())
  descriptionHash String   @unique
  nutritionData   Json
  createdAt      DateTime @default(now())

  @@map("food_cache")
}
```

### Deployment Configuration

#### Railway Backend Setup

**Railway Project Configuration:**
```yaml
# railway.json (backend deployment configuration)
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/graphql",
    "healthcheckTimeout": 100
  }
}
```

**Backend Package.json Production Scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "postinstall": "prisma generate"
  }
}
```

**Railway Environment Variables Setup:**
- `DATABASE_URL`: Automatically provided by Railway PostgreSQL
- `NODE_ENV=production`
- `PORT`: Automatically provided by Railway
- `FRONTEND_URL`: GitHub Pages URL (e.g., https://username.github.io/food-tracking)

#### GitHub Pages Frontend Setup

**GitHub Actions Workflow for Auto-Deploy:**
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Build
        run: |
          cd frontend
          npm run build
        env:
          NEXT_PUBLIC_GRAPHQL_ENDPOINT: ${{ secrets.RAILWAY_BACKEND_URL }}/graphql

      - name: Setup Pages
        uses: actions/configure-pages@v3

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: './frontend/out'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

**Next.js Static Export Configuration:**
```javascript
// frontend/next.config.js (updated for GitHub Pages)
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  },
  // Base path for GitHub Pages (if repo name is not username.github.io)
  basePath: process.env.NODE_ENV === 'production' ? '/food-tracking' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/food-tracking/' : '',
}

module.exports = nextConfig
```

**Frontend Package.json Build Scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next export",
    "deploy": "npm run build && npm run export"
  }
}
```

#### Environment Configuration Files

**Backend Environment Variables:**
```bash
# backend/.env.example
DATABASE_URL="postgresql://username:password@localhost:5432/food_tracking?schema=public"
NODE_ENV="development"
PORT="4000"
FRONTEND_URL="http://localhost:3000"

# Production (Railway will provide these automatically)
# DATABASE_URL=<railway-postgresql-url>
# NODE_ENV=production
# PORT=<railway-assigned-port>
# FRONTEND_URL=https://username.github.io/food-tracking
```

**Frontend Environment Variables:**
```bash
# frontend/.env.local
NEXT_PUBLIC_GRAPHQL_ENDPOINT="http://localhost:4000/graphql"

# frontend/.env.example
NEXT_PUBLIC_GRAPHQL_ENDPOINT="http://localhost:4000/graphql"

# Production (GitHub Actions will set this)
# NEXT_PUBLIC_GRAPHQL_ENDPOINT="https://your-railway-app.railway.app/graphql"
```

## Acceptance Criteria

### Functional Requirements
- [ ] **Monorepo Structure**: Root package.json with workspaces configured
- [ ] **Frontend Setup**: Next.js app runs on localhost:3000 with TailwindCSS
- [ ] **Backend Setup**: GraphQL server runs on localhost:4000 with basic schema
- [ ] **Database**: Prisma schema defined and can generate client
- [ ] **Development Workflow**: Single command starts both frontend and backend
- [ ] **Type Safety**: TypeScript strict mode enabled for both packages

### Technical Requirements
- [ ] **Code Quality**: ESLint and Prettier configured with shared rules
- [ ] **Git Workflow**: .gitignore properly excludes build artifacts and dependencies
- [ ] **Documentation**: README with setup instructions and development commands
- [ ] **Environment**: .env.example files for required environment variables
- [ ] **Scripts**: Build, test, and lint commands work from root

### Learning Requirements
- [ ] **Monorepo Patterns**: Understand workspace management and script coordination
- [ ] **Next.js App Router**: Learn modern Next.js patterns and file-based routing
- [ ] **Prisma Setup**: Database schema design and client generation
- [ ] **GraphQL Foundation**: Basic Yoga server with type-safe schema building

## Testing Strategy

### Setup Validation
- **Frontend Tests**:
  - Next.js dev server starts successfully
  - TailwindCSS compilation works
  - TypeScript compilation passes
- **Backend Tests**:
  - GraphQL server starts and responds to introspection
  - Prisma client generates without errors
  - TypeScript compilation passes

### Integration Tests
- **Workspace Management**: npm scripts run from root correctly
- **Build Process**: Both frontend and backend build successfully
- **Development Workflow**: Hot reload works in both environments

### Manual Testing Scenarios
1. **Fresh Clone**: Clone repo, run npm install, verify setup works
2. **Development Mode**: Run npm run dev, verify both servers start
3. **Build Process**: Run npm run build, verify production builds succeed
4. **Code Quality**: Run linting and formatting, verify no errors

## Implementation Notes

### Development Approach
1. **Step 1**: Initialize root package.json with workspace configuration
2. **Step 2**: Set up frontend with Next.js and TailwindCSS
3. **Step 3**: Set up backend with GraphQL Yoga and Prisma
4. **Step 4**: Configure shared tooling (ESLint, Prettier, Git hooks)
5. **Step 5**: Set up Railway backend deployment with auto-deploy
6. **Step 6**: Configure GitHub Pages frontend deployment
7. **Step 7**: Test full development workflow and deployment pipeline

### Learning Focus Areas
- **Modern Monorepo**: npm workspaces vs alternatives (Yarn, pnpm, Lerna)
- **Next.js App Router**: File-based routing, server components, client components
- **Prisma Workflow**: Schema design, migrations, client generation
- **GraphQL Code-First**: Pothos schema building vs schema-first approaches
- **TypeScript Configuration**: Path mapping, strict mode, workspace coordination
- **Railway Deployment**: Modern backend deployment with PostgreSQL integration
- **GitHub Pages**: Static site deployment with GitHub Actions CI/CD
- **Environment Management**: Production vs development configuration patterns

### Potential Challenges
- **Port Conflicts**: Ensure frontend (3000) and backend (4000) don't conflict
- **Workspace Dependencies**: Proper dependency management between packages
- **TypeScript Paths**: Correct import resolution between workspace packages
- **Railway Configuration**: Proper build commands and environment variable setup
- **GitHub Pages Static Export**: Next.js static generation for client-side app
- **CORS Configuration**: Proper cross-origin setup between GitHub Pages and Railway
- **Database Migrations**: Prisma migrations in Railway production environment

## Definition of Done

### Code Complete
- [ ] All package.json files configured with correct dependencies
- [ ] Frontend shows "Hello World" page with TailwindCSS styling
- [ ] Backend serves GraphQL playground with introspection working
- [ ] Prisma schema defined and client generation successful
- [ ] All npm scripts work from root directory
- [ ] Railway backend deployment configured with auto-deploy from main branch
- [ ] GitHub Pages frontend deployment configured with auto-deploy from main branch

### Documentation Complete
- [ ] README with setup, development, and build instructions
- [ ] .env.example files with required environment variables
- [ ] Package.json scripts documented
- [ ] Deployment setup documented for Railway and GitHub Pages
- [ ] Environment variable configuration for production deployments
- [ ] Learning notes added to task comments

### Deployment Ready
- [ ] .gitignore properly configured for both packages
- [ ] Environment variable structure documented
- [ ] Build process validated and working
- [ ] Development workflow tested and documented
- [ ] Railway deployment working with PostgreSQL database
- [ ] GitHub Pages deployment working with production build
- [ ] Auto-deployment from main branch configured for both platforms

## Related Tasks

### Follow-up Tasks
- [TASK-002]: Setup GraphQL schema with Pothos and basic Food type
- [TASK-003]: Create basic UI components and layout structure
- [TASK-004]: Configure Railway deployment and PostgreSQL connection

### Learning Resources
- Next.js 14 App Router documentation
- Prisma getting started guide
- GraphQL Yoga setup documentation
- Pothos schema builder examples

## Notes & Comments

### Learning Objectives for This Task
1. **Modern Development Setup**: Experience with monorepo tooling and workspace management
2. **TypeScript Configuration**: Understanding strict mode and cross-package type sharing
3. **Full-Stack Coordination**: Setting up development workflow that handles both frontend and backend
4. **Tool Integration**: ESLint, Prettier, and Git hooks in a monorepo context

### Key Technologies Learned
- **npm workspaces**: Modern monorepo management
- **Next.js App Router**: Latest React framework patterns
- **Prisma**: Modern ORM setup and schema design
- **GraphQL Yoga**: Lightweight GraphQL server setup

---

## Implementation Notes

### Completed Features
- ✅ Monorepo structure with npm workspaces
- ✅ Frontend: Next.js 14 + App Router + TailwindCSS + TypeScript
- ✅ Backend: GraphQL Yoga + Pothos + Prisma + TypeScript
- ✅ Database: PostgreSQL schema with Food and FoodCache models
- ✅ Development workflow: Unified scripts for dev, build, test, lint
- ✅ Code quality: ESLint + Prettier configuration
- ✅ Environment configuration for development and production
- ✅ Comprehensive documentation and README

### Learning Achievements
- Modern monorepo management with npm workspaces
- Next.js App Router patterns and static export configuration
- GraphQL schema-first development with Pothos
- Prisma ORM setup and schema design
- TypeScript strict mode configuration across full stack

### Next Steps
- Run database migrations when PostgreSQL is available
- Implement OpenAI integration for nutrition analysis (TASK-002)
- Create UI components for food entry and display (TASK-003)

**Task History**:
| Date | Status Change | Notes | Author |
|------|---------------|-------|--------|
| 2025-10-01 | Created | Initial task creation for project setup | Claude |
| 2025-10-01 | ✅ COMPLETED | Full monorepo setup with frontend, backend, database schema, and documentation | Claude |