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
    
    // Create _headers file for Vercel to serve SPA correctly
    const headersContent = `/*
  Cache-Control: public, max-age=0, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
`;
    fs.writeFileSync(path.join(distPath, '_headers'), headersContent);
    console.log('✓ _headers file created successfully');
    
  } else {
    console.warn('⚠ index.html not found in dist folder');
  }
} catch (error) {
  console.error('Error creating build files:', error);
  process.exit(1);
}

