#!/bin/bash

# Codegen script for deployment
# This script uses the deployment-specific configuration that doesn't require a running server

echo "Running GraphQL code generation for deployment..."

# Check if we're in GitHub Pages deployment environment
if [ "$GITHUB_PAGES" = "true" ]; then
    echo "📦 GitHub Pages deployment detected"

    # Check if generated files exist
    if [ -f "src/generated/graphql.ts" ] && [ -f "src/generated/introspection.json" ]; then
        echo "✅ GraphQL types already generated, skipping codegen"
        exit 0
    else
        echo "⚠️  No generated files found, but this is a static build"
        echo "Creating minimal type stubs for build..."

        # Create generated directory if it doesn't exist
        mkdir -p src/generated

        # Create minimal stub file for build
        cat > src/generated/graphql.ts << 'EOF'
// Minimal GraphQL type stubs for static build
// These will be replaced with actual types when running locally

export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
};

// Add minimal types as needed for build
EOF

        echo "✅ Created type stubs for static build"
        exit 0
    fi
fi

# Check if introspection file exists (local development)
if [ -f "src/generated/introspection.json" ]; then
    echo "✅ Found introspection file, running codegen with deployment config..."

    # Run codegen with deployment config
    if npx graphql-codegen --config codegen.deploy.yml; then
        echo "✅ Code generation successful"
    else
        echo "❌ Code generation failed"
        exit 1
    fi
else
    echo "❌ No introspection file found"
    echo "Please run 'npm run codegen' locally first to generate the required files"
    exit 1
fi
