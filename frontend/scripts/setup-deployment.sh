#!/bin/bash

# Setup script for deployment
# This script ensures all required files are generated and ready for deployment

echo "🚀 Setting up frontend for deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the frontend directory"
    exit 1
fi

# Check if backend is running
echo "🔍 Checking if GraphQL server is available..."
if curl -s http://localhost:4000/graphql > /dev/null 2>&1; then
    echo "✅ GraphQL server is running, generating fresh types..."
    npm run codegen
else
    echo "⚠️  GraphQL server not running, checking for existing generated files..."
    
    if [ -f "src/generated/graphql.ts" ] && [ -f "src/generated/introspection.json" ]; then
        echo "✅ Found existing generated files"
    else
        echo "❌ No generated files found and GraphQL server not running"
        echo "Please either:"
        echo "1. Start the backend server and run 'npm run codegen'"
        echo "2. Or ensure the generated files are committed to the repository"
        exit 1
    fi
fi

# Test the deployment build
echo "🧪 Testing deployment build..."
if npm run build; then
    echo "✅ Deployment build successful!"
    echo "🚀 Ready for deployment!"
else
    echo "❌ Deployment build failed"
    exit 1
fi
