#!/bin/bash

# Codegen script for deployment
# This script uses the deployment-specific configuration that doesn't require a running server

echo "Running GraphQL code generation for deployment..."

# Check if introspection file exists
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
