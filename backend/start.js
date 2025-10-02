// Simple start script for Railway deployment
const { spawn } = require('child_process');
const path = require('path');

// Ensure we're in the backend directory
process.chdir(__dirname);

console.log('🔄 Starting backend server...');
console.log('📁 Working directory:', process.cwd());
console.log('📦 NODE_ENV:', process.env.NODE_ENV);

// Start the compiled backend
const server = spawn('node', ['dist/index.js'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`🔚 Server exited with code ${code}`);
  process.exit(code);
});