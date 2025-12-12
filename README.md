# Food Tracking Application

A personal food tracking application with AI-powered nutrition analysis, built with modern TypeScript technologies.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (local or hosted)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd food-tracking
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database URL

   # Frontend
   cp frontend/.env.example frontend/.env.local
   # Edit frontend/.env.local with your GraphQL endpoint
   ```

3. **Set up the database:**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend GraphQL: http://localhost:4000/graphql

## 📁 Project Structure

```
food-tracking/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable React components
│   │   └── lib/             # Frontend utilities
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # GraphQL API server
│   ├── src/
│   │   ├── schema/          # GraphQL schema definitions
│   │   ├── services/        # Business logic
│   │   └── lib/             # Backend utilities
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── docs/                     # Project documentation
├── package.json              # Root workspace configuration
└── README.md
```

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI**: React 18 + TailwindCSS
- **Language**: TypeScript (strict mode)
- **GraphQL Client**: Urql
- **Deployment**: GitHub Pages (static export)

### Backend
- **API**: GraphQL Yoga Server
- **Schema**: Pothos (code-first GraphQL)
- **Database**: PostgreSQL + Prisma ORM
- **Language**: TypeScript (strict mode)
- **Deployment**: Railway

### Development
- **Monorepo**: npm workspaces
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library

## 📜 Available Scripts

### Root Commands
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run test             # Run all tests
npm run lint             # Lint all code
npm run format           # Format code with Prettier
```

### Frontend Commands
```bash
cd frontend
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run type-check       # TypeScript type checking
npm run lint             # ESLint
npm run codegen          # Generate GraphQL types (requires running backend)
npm run codegen:deploy   # Generate types for deployment (uses existing introspection)
```

### Backend Commands
```bash
cd backend
npm run dev              # Start GraphQL server with hot reload
npm run build            # Build TypeScript
npm run start            # Start production server
npm run db:migrate       # Run Prisma migrations
npm run db:studio        # Open Prisma Studio
npm run export:daily     # Export daily nutrition summaries to CSV
```

#### CSV Export Examples
```bash
# Export last 14 days (default)
npm run export:daily -- --email user@example.com

# Export last 30 days
npm run export:daily -- --email user@example.com --days 30

# Export specific date range
npm run export:daily -- --email user@example.com --start 2025-12-01 --end 2025-12-12

# Save to file
npm run export:daily -- --email user@example.com --days 14 --output report.csv
```

**Output format:**
```csv
Date,Calories,Protein,Carbs,Fat
2025-12-12,2000,200,300,50
2025-12-11,1850,180,250,45
```

## 🗃 Database Schema

The application uses PostgreSQL with Prisma ORM:

```prisma
model Food {
  id          String   @id @default(cuid())
  description String   # "2 slices pizza", "1 cup rice"

  // Nutrition data (nullable for gradual entry)
  calories    Float?
  fat         Float?
  carbs       Float?
  protein     Float?

  // Metadata
  isManual    Boolean  @default(false)
  aiModel     String?  # AI model used for analysis

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🔌 GraphQL API

### Code Generation

The frontend uses GraphQL Code Generator to create TypeScript types from the GraphQL schema:

```bash
# Local development (requires running backend)
npm run codegen

# Deployment (uses existing introspection file)
npm run codegen:deploy
```

This generates:
- TypeScript types for all GraphQL operations
- Urql hooks for queries and mutations
- Type-safe GraphQL operations

### Example Queries

```graphql
# Get today's food entries
query TodaysFoods {
  foodsByDate(date: "2024-01-01") {
    id
    description
    calories
    protein
    carbs
    fat
    createdAt
  }
}

# Add a food entry
mutation AddFood {
  addFood(input: {
    description: "1 medium apple"
    calories: 95
    protein: 0.5
    carbs: 25
    fat: 0.3
    isManual: true
  }) {
    id
    description
    calories
  }
}
```

## 🚢 Deployment

### Backend (Railway)
1. Create Railway project
2. Add PostgreSQL service
3. Connect GitHub repository
4. Set environment variables
5. Deploy automatically on push to main

### Frontend (GitHub Pages)
1. Enable GitHub Pages in repository settings
2. GitHub Actions automatically deploys on push to main
3. Static site generated from Next.js export

## 🔧 Environment Variables

### Backend (.env)
```bash
DATABASE_URL="postgresql://..."
NODE_ENV="development"
PORT="4000"
FRONTEND_URL="http://localhost:3000"
# OPENAI_API_KEY="..." # Future AI integration
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT="http://localhost:4000/graphql"
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend testing
cd frontend && npm test

# Backend testing
cd backend && npm test
```

## 📋 Development Workflow

1. **Feature Development**:
   - Create feature branch
   - Implement backend GraphQL changes
   - Update frontend components
   - Add tests
   - Update documentation

2. **Code Quality**:
   - ESLint and Prettier enforce code style
   - TypeScript ensures type safety
   - Tests validate functionality

3. **Deployment**:
   - Push to main branch
   - Railway auto-deploys backend
   - GitHub Actions deploys frontend

## 🎯 Future Features

- [ ] AI nutrition analysis with OpenAI
- [ ] Food photo recognition
- [ ] Nutrition goals and tracking
- [x] Export functionality (CSV)
- [ ] Export functionality (PDF)
- [ ] Weekly/monthly reports

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
- [Pothos GraphQL](https://pothos-graphql.dev/)
- [TailwindCSS](https://tailwindcss.com/docs)

## 🤝 Contributing

This is a personal learning project, but suggestions and feedback are welcome!

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ as a learning project for modern TypeScript full-stack development**