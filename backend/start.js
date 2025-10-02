// Start script for Railway deployment
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure we're in the backend directory
process.chdir(__dirname);

console.log('🔄 Starting backend server...');
console.log('📁 Working directory:', process.cwd());
console.log('📦 NODE_ENV:', process.env.NODE_ENV);
console.log('🔌 PORT:', process.env.PORT || '4000');

// Check if the compiled server exists
const serverPath = path.join(__dirname, 'dist', 'index.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ Compiled server not found at:', serverPath);
  console.error('Available files in dist:');
  try {
    const files = fs.readdirSync(path.join(__dirname, 'dist'));
    console.log(files);
  } catch (err) {
    console.error('❌ Dist directory not found');
  }
  process.exit(1);
}

console.log('✅ Compiled server found, starting...');

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