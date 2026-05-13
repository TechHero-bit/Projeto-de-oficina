const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist/oficina-system');
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');

try {
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    fs.writeFileSync(notFoundPath, content);
    console.log('✓ 404.html created successfully');
  } else {
    console.warn('⚠ index.html not found in dist folder');
  }
} catch (error) {
  console.error('Error creating 404.html:', error);
  process.exit(1);
}
