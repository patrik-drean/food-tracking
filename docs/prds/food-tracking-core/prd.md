# Personal Food Tracking App - Product Requirements Document

> **Document Status**: Draft
> **Created**: 2025-10-01
> **Last Updated**: 2025-10-01
> **Owner**: Personal Project
> **Technical Lead**: Self-directed learning project

## Executive Summary

### Problem Statement
Need a simple, mobile-responsive food tracking solution for daily calorie and macronutrient monitoring. Current spreadsheet solution is cumbersome on mobile devices and lacks automated nutritional analysis.

### Solution Overview
Build a personal food tracking web application with AI-powered nutritional estimation using modern TypeScript/React/GraphQL stack. Focus on ease of mobile input with smart food suggestions to minimize repeated AI API calls.

### Success Metrics
- **Primary Learning Goal**: Hands-on experience with Yoga GraphQL Server, Pothos Schemas, Urql Client, Prisma ORM, Next.js, and TailwindCSS
- **Functional Goal**: Replace spreadsheet-based food tracking with mobile-friendly web app
- **Timeline**: Complete before 10/13/2025 job start date

## Business Requirements

### User Stories

**As the sole user, I want to:**
- Log food items quickly on my mobile device so that I can track nutrition without friction
- See my daily food log with running totals so that I can monitor progress throughout the day
- Reuse previously logged foods so that I don't have to wait for AI analysis every time
- Get automated calorie and macro estimates so that I don't have to look up nutritional data manually
- Override AI estimates with manual values when I have more accurate nutrition information

### Business Value
- **Primary Value**: Learning modern full-stack development patterns for career preparation
- **Secondary Benefits**: Improved personal nutrition tracking compared to spreadsheet method
- **ROI Justification**: Educational investment for upcoming role starting 10/13

### Stakeholders
- **Primary User**: Personal use only
- **Learning Objective**: Preparation for new development role

## Functional Requirements

### Feature Scope

#### In Scope
- Mobile-responsive web application (PWA approach)
- Text-based food entry with smart typeahead from previous entries
- Daily food log view with line items and running totals
- AI-powered nutritional analysis (calories, fat, carbs, protein)
- Food history caching to reduce AI API calls
- Basic data persistence and retrieval

#### Out of Scope (Future Enhancements)
- Historical trends and analytics
- Photo-based food logging
- Offline functionality
- Push notifications
- Multi-user support
- Advanced meal planning
- Integration with fitness trackers

### User Experience Flow

1. **Entry Point**: Open web app on mobile device
2. **Primary Flow**:
   - Type food description in input field (including quantity, e.g., "2 slices pizza")
   - See typeahead suggestions from previous foods
   - Select existing food OR submit new food for AI analysis
   - Optionally edit AI-generated nutrition values manually
   - View food added to daily log with nutrition data
   - See updated daily totals
3. **Alternative Flows**:
   - Browse recent foods list if preferred over typing
   - Handle AI API failures gracefully (food logged without nutrition data)
4. **Exit Points**: Navigate away or close browser

### Acceptance Criteria

**Feature: Food Entry**
```
Given I am on the main food tracking page
When I start typing a food description
Then I see a dropdown of matching previously logged foods
And I can either select an existing food or submit new text for AI analysis
And I can optionally edit the nutrition values before saving
```

**Feature: Daily Log Display**
```
Given I have logged foods for today
When I view the main page
Then I see a list of today's food entries with individual nutrition data
And I see running totals for calories, fat, carbs, and protein
```

**Feature: AI Nutritional Analysis**
```
Given I enter a new food description
When I submit the food for logging
Then the app calls OpenAI API to estimate nutritional content
And I can review and edit the AI-generated values before saving
And the food is saved with either AI-generated or manually-entered nutrition data
And if the API fails, I can manually enter nutrition values or save without data for later retry
```

**Feature: Manual Nutrition Override**
```
Given I have AI-generated nutrition estimates for a food
When I want to use more accurate nutrition information
Then I can edit the calories, fat, carbs, and protein values
And the food is saved with my manual values instead of AI estimates
```

### Data Requirements

#### Input Data
- Food description (free text, including quantity if applicable, e.g., "2 cups rice")
- Nutrition values (AI-generated or manually entered: calories, fat, carbs, protein)
- Timestamp (auto-generated)

#### Display Data
- Daily food log entries
- Individual nutrition estimates per food
- Daily running totals
- Previous food suggestions

#### Stored Data
- Food entries (description, timestamp, nutrition data, source: AI or manual)
- AI analysis cache (food description → nutrition mapping)
- User preferences (future: favorite foods, etc.)

#### External Data
- OpenAI API for nutritional analysis

## Technical Requirements

### System Integration

**Frontend (Next.js + React + TailwindCSS)**:
- Food entry component with typeahead
- Daily log display component
- Running totals component
- Mobile-responsive layout
- Urql GraphQL client integration

**Backend (TypeScript + Yoga GraphQL + Prisma)**:
- GraphQL schema with Pothos
- Food entry mutations and queries
- OpenAI API integration service
- Database persistence layer

**Database (PostgreSQL via Railway + Prisma ORM)**:
- Foods table (id, description, calories, fat, carbs, protein, is_manual, created_at)
- Food_cache table (description_hash, nutrition_data) for AI result caching
- Railway PostgreSQL with zero-configuration deployment

### Tech Stack Architecture

**Backend Stack**:
- **Yoga GraphQL Server**: Modern GraphQL server with TypeScript
- **Pothos**: Code-first GraphQL schema building
- **Prisma ORM**: Type-safe database client and migrations
- **OpenAI API**: GPT-4o-mini for food analysis

**Frontend Stack**:
- **Next.js**: React framework with SSR/SSG capabilities
- **Urql**: Lightweight GraphQL client with caching
- **TailwindCSS**: Utility-first CSS framework
- **TypeScript**: Type safety across the stack

### Performance Requirements
- **Response Time**: < 2 seconds for cached foods, < 10 seconds for AI analysis
- **Scalability**: Personal use only, minimal load requirements
- **Reliability**: Graceful degradation when OpenAI API unavailable

### Security & Privacy
- **Data Protection**: Personal nutrition data stored in Railway PostgreSQL with SSL
- **API Key Management**: OpenAI API key via Railway environment variables
- **Access Control**: Basic authentication (simple since personal use)
- **Database Security**: Railway provides SSL-enabled PostgreSQL with secure connections

### Dependencies
- **External Dependencies**: OpenAI API, Railway PostgreSQL database
- **Technical Dependencies**: Node.js runtime, npm/yarn/pnpm
- **Deployment Dependencies**: Railway CLI, GitHub integration for Railway deployments

## Design Specifications

### User Interface Requirements
- **Mobile-first responsive design** using TailwindCSS breakpoints
- **Clean, minimal interface** focused on quick data entry
- **Accessibility**: Proper semantic HTML, keyboard navigation support
- **Progressive Web App** features for mobile browser experience

### Key UI Components
- **Food Entry Form**: Text input with smart typeahead/suggestions
- **Nutrition Edit Form**: Optional fields to override AI estimates (calories, fat, carbs, protein)
- **Daily Log**: Clean list view of today's foods with nutrition data and edit options
- **Running Totals**: Prominent display of daily macro totals
- **Recent Foods**: Quick-select grid or list of frequently used foods

### User Experience Considerations
- **Quick Entry**: Minimize taps/typing required
- **Visual Feedback**: Loading states during AI analysis
- **Error Handling**: Clear messaging when AI API fails
- **Responsive Layout**: Works well on various mobile screen sizes

## Implementation Approach

### Development Phases

**Phase 1: Project Setup & Core Architecture (Learning Focus: Modern TS tooling)**
- Initialize monorepo with frontend/backend structure
- Set up Next.js with TypeScript and TailwindCSS
- Configure Yoga GraphQL server with Pothos schemas
- Set up Prisma with initial database schema
- **Learning Objectives**: Modern tooling setup, GraphQL code-first approach

**Phase 2: Core Food Logging (Learning Focus: GraphQL operations)**
- Implement basic food entry GraphQL mutations
- Create simple food display queries
- Build basic mobile-responsive UI
- Add Urql client integration
- **Learning Objectives**: Full-stack GraphQL workflow, type-safe operations

**Phase 3: AI Integration & Smart Features (Learning Focus: External API integration)**
- Integrate OpenAI API for nutrition analysis
- Implement food caching strategy
- Add typeahead/suggestions functionality
- Error handling for API failures
- **Learning Objectives**: External API patterns, caching strategies

**Phase 4: Polish & Optimization (Learning Focus: Performance & UX)**
- Optimize mobile UX and responsive design
- Add loading states and error handling
- Implement daily totals calculation
- Final testing and deployment setup
- **Learning Objectives**: Performance optimization, production readiness

### Technical Architecture

**GraphQL Schema Design**:
```graphql
type Food {
  id: ID!
  description: String!
  calories: Float
  fat: Float
  carbs: Float
  protein: Float
  isManual: Boolean!
  createdAt: DateTime!
}

input NutritionInput {
  calories: Float
  fat: Float
  carbs: Float
  protein: Float
}

type Query {
  todaysFoods: [Food!]!
  recentFoods(limit: Int = 10): [Food!]!
}

type Mutation {
  addFood(description: String!, nutrition: NutritionInput): Food!
  updateFoodNutrition(id: ID!, nutrition: NutritionInput!): Food!
}
```

**Database Schema** (Railway PostgreSQL + Prisma):
- Foods table with nutrition, timestamp, and is_manual flag fields
- Food cache table for AI response optimization
- Indexes on description and created_at for performance
- Railway PostgreSQL deployment with automatic SSL and backup

### Risk Assessment
- **Technical Risks**: Learning curve with new technologies - mitigate with good documentation
- **API Risks**: OpenAI rate limits/costs - mitigate with caching and fallback handling
- **Timeline Risk**: Technology learning vs 10/13 deadline - prioritize core functionality

## Testing Strategy

### Test Coverage
- **Unit Tests**: GraphQL resolvers, utility functions
- **Integration Tests**: Database operations, API integrations
- **Component Tests**: React components with user interactions
- **Learning Focus**: Testing patterns in GraphQL and React applications

### Quality Assurance
- **TypeScript**: Compile-time type checking across stack
- **ESLint/Prettier**: Code quality and formatting
- **Manual Testing**: Mobile browser testing on real devices

## Learning Outcomes

### Technology Deep Dives Per Phase

**Phase 1 Learning**:
- **Yoga GraphQL Server**: Modern alternative to Apollo Server
- **Pothos**: Code-first schema generation vs schema-first approaches
- **Prisma**: Modern ORM with excellent TypeScript integration
- **Monorepo Structure**: Best practices for full-stack TypeScript projects

**Phase 2 Learning**:
- **GraphQL Operations**: Queries, mutations, and subscriptions with Urql
- **Type Safety**: End-to-end TypeScript from database to frontend
- **Component Architecture**: Modern React patterns with hooks

**Phase 3 Learning**:
- **External API Integration**: Best practices for third-party service integration
- **Caching Strategies**: Reducing external API calls and improving performance
- **Error Boundaries**: Graceful handling of service failures

**Phase 4 Learning**:
- **Performance Optimization**: Bundle analysis, code splitting, lazy loading
- **Responsive Design**: Advanced TailwindCSS patterns and mobile-first development
- **Deployment**: Vercel (frontend with SSR) + Railway (backend + PostgreSQL)
- **Authentication**: NextAuth.js with Google OAuth for multi-user support
- **Environment Management**: Production environment variables and secrets

## Launch Plan

### Deployment Strategy
- **Frontend**: Vercel deployment with SSR from main branch
- **Backend**: Railway deployment with auto-deploy from GitHub
- **Database**: Railway PostgreSQL with automatic provisioning
- **Authentication**: Google OAuth via NextAuth.js for multi-user access
- **Environment Variables**: OpenAI API key and database URL via Railway, auth credentials via Vercel

### Success Criteria
- **Functional**: Can log foods and see daily totals on mobile device with authentication
- **Learning**: Hands-on experience with all specified technologies
- **Deployment**: Live application accessible on Vercel (https://food-tracking-frontend.vercel.app)
- **Timeline**: Completed before 10/13/2025

### Post-Implementation Review
- Document lessons learned with each technology
- Identify patterns for future projects
- Note areas for continued learning in new role

## Appendix

### OpenAI Integration Details

**Recommended Model**: GPT-4o-mini for cost-effectiveness and speed

**Sample Prompt**:
```
Analyze this food item and provide nutritional estimates in JSON format:
Food: "{food_description}"

Note: The description may include quantity (e.g., "2 slices pizza", "1 cup rice").
If no quantity is specified, assume a typical serving size.

Return only valid JSON with this structure:
{
  "calories": number,
  "fat": number,
  "carbs": number,
  "protein": number
}
```

### Architecture Decisions

**Monorepo vs Multi-repo**: Monorepo chosen for learning simplicity and easier cross-stack development

**Database Choice**: Railway PostgreSQL for both development and production (with local SQLite option for offline development)

**Deployment Strategy**:
- **Frontend**: Vercel (serverless SSR, free tier for personal projects)
- **Backend**: Railway (GraphQL server + PostgreSQL database)
- **Cost**: Free tier for both platforms (Vercel hobby plan + Railway usage-based)

**Why Railway for Backend**:
- Zero-configuration PostgreSQL deployment
- Usage-based pricing (cost-effective for personal projects)
- Excellent Prisma integration
- SSL-enabled connections
- Easy environment variable management

---

**Next Steps**:
1. Create initial project setup tasks
2. Define detailed technical implementation tasks
3. Set up development environment
4. Begin Phase 1 implementation