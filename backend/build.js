// Build script for Railway deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting backend build process...');
console.log('📁 Working directory:', process.cwd());

// Check if required files exist
const requiredFiles = [
  'src/index.ts',
  'src/lib/prisma.ts',
  'src/schema/index.ts',
  'src/schema/builder.ts',
  'prisma/schema.prisma',
  'package.json',
  'tsconfig.json'
];

console.log('📋 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
  }
}

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔄 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🏗️ Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}