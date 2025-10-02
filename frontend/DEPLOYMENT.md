# Frontend Deployment Guide

## GraphQL Code Generation for Deployment

The frontend uses GraphQL Code Generator to create TypeScript types from the GraphQL schema. This process requires special handling for deployment environments where the GraphQL server may not be available.

### Local Development

For local development, run the full codegen process:

```bash
npm run codegen
```

This will:
1. Connect to the GraphQL server at `localhost:4000`
2. Generate TypeScript types and hooks
3. Create an introspection file for deployment use

### Deployment

For deployment environments, use the deployment-specific codegen:

```bash
npm run codegen:deploy
```

This will:
1. Use the existing introspection file (generated locally)
2. Generate TypeScript types without requiring a running server
3. Fail gracefully if introspection file is missing

### Build Process

The build process automatically handles codegen:

```bash
npm run build
```

This runs `codegen:deploy` followed by `next build`.

### Prerequisites for Deployment

Before deploying, ensure you have:

1. **Generated files committed**: The `src/generated/` directory should be committed to the repository
2. **Introspection file**: `src/generated/introspection.json` should exist
3. **GraphQL operations**: All `.graphql` files in `src/graphql/` should be committed

### Troubleshooting

#### "No introspection file found"
- Run `npm run codegen` locally first
- Commit the generated files to the repository
- Ensure `src/generated/introspection.json` exists

#### "Codegen failed, using existing generated files"
- This is expected in deployment environments
- The build will use existing generated files
- Ensure generated files are up to date

#### "connect ECONNREFUSED ::1:4000"
- This happens when the GraphQL server isn't running
- Use `npm run codegen:deploy` instead of `npm run codegen`
- Or use `npm run build:no-codegen` to skip codegen entirely

### Alternative Build Commands

- `npm run build:local` - Full codegen + build (requires running server)
- `npm run build:no-codegen` - Build without codegen (uses existing files)
- `npm run build` - Standard build with deployment codegen
