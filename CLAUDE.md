# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Food Tracking App - A full-stack TypeScript application for learning modern development patterns:
- **Frontend**: Next.js + React + Urql + TailwindCSS (in `frontend/`)
- **Backend**: Yoga GraphQL Server + Pothos + Prisma ORM (in `backend/`)
- **Learning Focus**: Modern TypeScript/GraphQL stack for career preparation

## Common Development Commands

### Frontend (Next.js + React)
```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start development server (port 3000)
npm run build           # Build for production
npm test                # Run tests
npm run lint            # Lint code
```

### Backend (GraphQL + TypeScript)
```bash
cd backend
npm install             # Install dependencies
npm run dev             # Start GraphQL server with hot reload
npm run build           # Build TypeScript
npm test                # Run tests
npm run generate        # Generate Prisma client
```

### Database Operations (Prisma)
```bash
cd backend
npx prisma migrate dev  # Run/create migrations
npx prisma studio       # Open database browser
npx prisma generate     # Generate client after schema changes
```

## Architecture Overview

### Backend Architecture (GraphQL + Prisma)

The backend uses modern GraphQL-first architecture:

**GraphQL Layer** (Yoga + Pothos):
- Code-first GraphQL schema generation with Pothos
- Type-safe resolvers and schema building
- Built-in Yoga server features (CORS, validation, etc.)

**Data Layer** (Prisma ORM):
- Type-safe database client generated from schema
- Automatic migrations and database management
- Full TypeScript integration from DB to API

**Service Layer**:
- External API integrations (OpenAI for food analysis)
- Business logic and data transformation
- Caching strategies for API optimization

### Frontend Architecture (Next.js + React)

**Component Structure**:
- `src/components/` - React components with TailwindCSS styling
- `src/pages/` - Next.js pages and API routes
- `src/lib/` - Utilities and configuration
- `src/graphql/` - GraphQL queries and mutations

**Key Patterns**:
- Urql GraphQL client for type-safe API communication
- TailwindCSS for responsive, mobile-first design
- React hooks for state management
- Next.js App Router for modern routing patterns

### GraphQL Integration

Full-stack type safety with GraphQL:
- Shared TypeScript types between frontend and backend
- Urql client with automatic caching and error handling
- Code generation for type-safe GraphQL operations
- Real-time updates via GraphQL subscriptions (future)

### Database Strategy (Prisma)

Prisma ORM with PostgreSQL:
- Schema-first database design with Prisma Schema
- Type-safe database operations
- Automatic migrations and version control
- Built-in connection pooling and query optimization

## Key Configuration Files

**Frontend**:
- `.env` - Environment variables (API URLs, feature flags)
- `package.json` - Dependencies and build scripts

**Backend**:
- `appsettings.json` - Database connections and API keys
- `Makefile` - Development commands
- `.env` - Environment variables for local development

## Testing Strategy

**Frontend**: Jest and React Testing Library
**Backend**: xUnit with ASP.NET Core testing utilities

## External Integrations

- **OpenAI API**: GPT-4o-mini for food nutritional analysis
- **Database**: Railway PostgreSQL (zero-configuration deployment)
- **Deployment**: GitHub Pages (frontend) + Railway (backend + database)
- **Development**: Local development with hot reload and Railway staging

## Development Workflow

1. Both frontend and backend can be developed independently
2. Frontend uses mock API by default for offline development
3. Backend uses PostgreSQL (can be local or hosted)
4. All API contracts are strongly typed in both TypeScript and C#

## Common Patterns

**Backend**:
- Ports and Adapters pattern for external dependencies
- Repository pattern for data access
- Minimal APIs with route-based organization
- Environment-based configuration

**Frontend**:
- Service layer abstraction for API calls
- Custom hooks for state management
- Material-UI component composition
- Responsive design with breakpoint-aware layouts