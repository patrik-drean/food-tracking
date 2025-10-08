# Product Overview - Food Tracking Application

This document provides context about the food tracking application to help Claude Code understand the product domain, users, and business objectives when working on tasks.

## Application Summary

**Product Name**: Personal Food Tracking Application
**Domain**: Health & Wellness / Nutrition Tracking
**Target Users**: Individual health-conscious users wanting to track daily food intake and nutrition
**Core Value Proposition**: Simplifies food tracking with AI-powered nutrition analysis, removing the friction of manual nutrition lookup while maintaining accuracy and flexibility

## Business Context

### Primary Objectives
- **Simplify food tracking**: Reduce friction in daily food logging through intelligent AI-powered nutrition analysis
- **Maintain accuracy**: Allow users to review and override AI suggestions to ensure precise nutrition tracking
- **Enable consistency**: Build habits through easy-to-use daily logging interface with smart suggestions
- **Support learning**: Help users understand nutrition content of their food choices over time

### Key Metrics & Success Criteria
- **User Retention**: Daily logging consistency (target: 70% of days over 30 days)
- **Data Accuracy**: User satisfaction with AI nutrition estimates (target: 85% accuracy rate)
- **Usability**: Average time to log a meal (target: under 30 seconds per food item)
- **Learning Value**: Users reporting increased nutrition awareness (target: 80% positive feedback)

### User Personas
**Primary User**: "Health-conscious individuals tracking nutrition"
- **Needs**: Quick and accurate food logging, understanding nutrition content of meals, maintaining consistent tracking habits
- **Pain Points**: Manual nutrition lookup is time-consuming, nutrition databases are often inaccurate or incomplete, existing apps are too complex or rigid
- **Success Scenarios**: Effortlessly log all meals with accurate nutrition data, identify patterns in eating habits, maintain consistent tracking without friction

**Secondary User**: "Casual food trackers exploring nutrition awareness"
- **Needs**: Simple way to understand what they're eating, occasional food logging without commitment pressure
- **Pain Points**: Intimidated by complex nutrition apps, unsure about portion sizes and nutrition values
- **Success Scenarios**: Gain nutrition awareness without feeling overwhelmed, log food when curious without complex setup or requirements

## Product Architecture Overview

### Application Type
Personal food tracking web application - Mobile-responsive Progressive Web App (PWA) with full-stack TypeScript implementation

### Core Features
1. **Food Entry System**: AI-powered food logging with intelligent nutrition analysis
   - Text-based food entry with natural language processing
   - AI-powered nutrition analysis using OpenAI GPT-4o-mini
   - Manual override capability for nutrition adjustments
   - Smart typeahead suggestions from user's food history

2. **Daily Food Log**: Comprehensive daily nutrition tracking and visualization
   - Daily food entry display with running nutrition totals
   - Calories, fat, carbohydrates, and protein tracking
   - Meal categorization (breakfast, lunch, dinner, snacks)
   - Historical day navigation and food log review

3. **Smart Food Database**: Learning food database with personalized suggestions
   - User-specific food history and preferences
   - Incremental learning from user corrections
   - Quick access to frequently eaten foods
   - Portion size intelligence and suggestions

### Technology Stack Summary
- **Frontend**: Next.js 14+ with App Router, React 18+, TypeScript, TailwindCSS
- **Backend**: GraphQL Yoga Server with Pothos schema builder, TypeScript, Node.js 18+
- **Database**: PostgreSQL with Prisma ORM, hosted on Railway
- **External APIs**: OpenAI GPT-4o-mini for food nutrition analysis
- **Authentication**: NextAuth.js with Google OAuth for multi-user support
- **Deployment**: Frontend on Vercel (SSR with API routes), Backend on Railway with auto-deploy

## Domain-Specific Context

### Industry Standards & Compliance
- **Data Privacy**: Personal health information requires careful handling, though not subject to HIPAA as personal-use app
- **Nutrition Database Standards**: USDA nutrition data formats and measurement units (grams, calories, etc.)
- **Food Safety**: Basic food identification best practices, allergen awareness considerations
- **Accessibility**: WCAG 2.1 AA compliance for inclusive nutrition tracking

### Business Rules & Constraints
- **Multi-User Application**: Google OAuth authentication with per-user data isolation
- **Data Accuracy**: AI nutrition estimates must be manually reviewable and editable by user
- **Food Entry Validation**: Food descriptions must be non-empty, nutrition values must be positive numbers
- **Historical Data**: Food logs cannot be modified more than 7 days after entry (to maintain tracking integrity)
- **API Rate Limits**: OpenAI API calls must be throttled and cached to manage costs
- **Authentication**: All GraphQL queries require valid JWT authentication token

### External Integrations
- **OpenAI GPT-4o-mini**: AI-powered food description analysis and nutrition estimation
- **Railway Database**: PostgreSQL hosting with automated backups and scaling
- **Google OAuth**: Authentication provider for secure multi-user access
- **Vercel**: Serverless platform for frontend hosting with automatic deployments and SSR support

## Current Development Priorities

### High Priority Areas
1. **Core Food Entry Implementation**: Build the fundamental food logging and AI nutrition analysis system
2. **Mobile-First Responsive Design**: Ensure excellent mobile experience as primary use case
3. **AI Integration Quality**: Fine-tune OpenAI integration for accurate nutrition estimation and cost optimization

### Technical Debt & Known Issues
- **Pre-Implementation Phase**: No technical debt exists yet as project is in planning stage
- **Learning Project Focus**: Implementation priority on modern patterns rather than quick delivery
- **Single Developer Context**: Architecture designed for maintainability by one developer

### Future Roadmap (3-6 months)
- **Export Functionality**: Export food logs to CSV/PDF for external analysis
- **Nutrition Goals**: Set and track daily nutrition targets with progress visualization
- **Food Photos**: Add photo capture and AI image analysis for food identification
- **Meal Planning**: Basic meal planning and grocery list generation features

## Development Context

### Quality Standards
- **Code Coverage**: 80%+ test coverage for new code, with focus on business logic and API endpoints
- **Performance**: GraphQL queries under 200ms, frontend page loads under 1 second, mobile-optimized bundle sizes
- **Accessibility**: WCAG 2.1 AA compliance with proper ARIA labels, keyboard navigation, and screen reader support
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge) with mobile-first responsive design

### Development Workflow
- **Branching Strategy**: Feature branches with Claude Code implementation, manual testing before main branch merge
- **Code Review Process**: Self-review with comprehensive testing using Claude Code verification commands
- **Testing Strategy**: Unit tests for business logic, integration tests for GraphQL endpoints, manual testing for UI flows
- **Deployment Process**: Automated deployment via Vercel (frontend) and Railway auto-deploy (backend)

---

## Learning Project Context

This food tracking application serves as a **comprehensive learning project** for modern full-stack TypeScript development. Key learning objectives include:

### Technical Learning Goals
- **GraphQL Development**: Hands-on experience with GraphQL Yoga, Pothos schema builder, and Urql client
- **Modern React Patterns**: Next.js App Router, React Server Components, and TypeScript integration
- **Database Design**: PostgreSQL with Prisma ORM, migrations, and type-safe database operations
- **AI Integration**: Practical experience with OpenAI API integration and prompt engineering
- **Deployment & DevOps**: Railway hosting, GitHub Actions CI/CD, and environment management

### Development Philosophy
- **Quality over Speed**: Emphasis on writing clean, maintainable, well-tested code
- **Learning-Driven**: Implementing modern patterns and best practices rather than quick solutions
- **Documentation-First**: Comprehensive documentation to support learning and future maintenance
- **Single Developer Focus**: Architecture optimized for solo development and maintenance

This document helps Claude Code understand the business context when implementing features, ensuring solutions align with both the application requirements and the learning objectives of this project.