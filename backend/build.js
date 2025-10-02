// Build script for Railway deployment
const { execSync } = require('child_process');

try {
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}