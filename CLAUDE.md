# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Documentation System

This repository uses an AI-first documentation approach to help Claude Code understand your application context and follow your development patterns. Key documentation is located in `docs/ai-guidelines/`:

- **`docs/ai-guidelines/PRODUCT_OVERVIEW.md`** - Business context, user personas, and product domain knowledge
- **`docs/ai-guidelines/FRONTEND_GUIDELINES.md`** - Frontend architecture patterns, component standards, and development practices
- **`docs/ai-guidelines/BACKEND_GUIDELINES.md`** - Backend architecture, API design, database patterns, and service layer guidelines
- **`docs/ai-guidelines/DATABASE_GUIDELINES.md`** - Database design patterns, migration strategies, and query optimization
- **`docs/ai-guidelines/QUALITY_GUIDELINES.md`** - Code quality standards, testing requirements, and documentation standards
- **`docs/ai-guidelines/DEPLOYMENT_GUIDELINES.md`** - Deployment practices, environment configuration, and infrastructure requirements
- **`docs/ai-guidelines/TASK_VERIFICATION_GUIDELINES.md`** - Quality standards, testing requirements, and deployment verification process

**Before working on any task, Claude Code should reference these documents to understand your specific application context and follow established patterns.**

## Project Overview Template

*Note: Replace this section with your actual application details. This is a template for any software project.*

[Your Application Name] - [Brief description of your application]:
- **Frontend**: [Your frontend technology stack]
- **Backend**: [Your backend technology stack]
- **Focus**: [Your development goals and priorities]

## Common Development Commands Template

*Replace these with your actual project commands:*

### Frontend Commands
```bash
# Example commands - replace with your actual commands
cd [frontend-directory]
[install command]        # Install dependencies
[dev command]           # Start development server
[build command]         # Build for production
[test command]          # Run tests
[lint command]          # Lint code
```

### Backend Commands
```bash
# Example commands - replace with your actual commands
cd [backend-directory]
[install command]        # Install dependencies
[dev command]           # Start development server
[build command]         # Build for production
[test command]          # Run tests
[migration command]     # Run database migrations
```

## Template Usage Instructions

This repository serves as a template for AI-enhanced software development. To use this template for your project:

### 1. Customize the AI Documentation
Fill out the template files in `docs/ai-guidelines/` with your specific application details:

- **`docs/ai-guidelines/PRODUCT_OVERVIEW.md`**: Replace with your business domain, user personas, and product context
- **`docs/ai-guidelines/FRONTEND_GUIDELINES.md`**: Update with your frontend technology stack, component patterns, and coding standards
- **`docs/ai-guidelines/BACKEND_GUIDELINES.md`**: Update with your backend architecture, API design patterns, and data layer details
- **`docs/ai-guidelines/DATABASE_GUIDELINES.md`**: Update with your database technology, schema design patterns, and migration strategies
- **`docs/ai-guidelines/QUALITY_GUIDELINES.md`**: Customize code quality standards, testing requirements, and performance benchmarks
- **`docs/ai-guidelines/DEPLOYMENT_GUIDELINES.md`**: Update with your deployment platform, CI/CD pipeline, and infrastructure configuration
- **`docs/ai-guidelines/TASK_VERIFICATION_GUIDELINES.md`**: Customize quality standards and testing requirements for your project

### 2. Update This CLAUDE.md File
Replace the template sections above with your actual:
- Project overview and technology stack
- Development commands for your specific setup
- Architecture patterns and key configuration files

### 3. Customize Claude Commands
Update the command files in `.claude/` directory if needed:
- `create-prd.md` - For creating Product Requirements Documents
- `generate-task.md` - For breaking down features into tasks
- `complete-task.md` - For implementing tasks
- `verify-and-push-task.md` - For verifying and deploying completed work

### 4. Copy Template to Your Project
1. Copy this entire directory structure to your project
2. Replace all template content with your project-specific information
3. Commit the customized documentation to your repository
4. Claude Code will now understand your project context and follow your patterns

## Benefits of This AI Documentation System

- **Context-Aware Development**: Claude Code understands your business domain and technical patterns
- **Consistent Code Quality**: Enforces your coding standards and architectural patterns
- **Faster Onboarding**: New developers (human or AI) can quickly understand your project structure
- **Standardized Workflow**: Consistent task breakdown, implementation, and verification process
- **Scalable Documentation**: Documentation that evolves with your project

## Getting Started

1. **Fork or copy this template** to your project repository
2. **Fill out the documentation templates** in `docs/ai/` with your project details
3. **Update this CLAUDE.md file** with your actual project information
4. **Test with Claude Code** by asking it to implement a small feature
5. **Iterate and improve** the documentation based on your experience

---

*This template helps create a development environment where AI assistants can work effectively within your project's context and standards.*