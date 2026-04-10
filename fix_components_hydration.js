const fs = require('fs');

const filesToFix = [
  'src/app/donation/page.js',
  'src/app/search/page.js',
  'src/app/register/page.js'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix `const params = new URLSearchParams(window.location.search);` by wrapping it safely
    content = content.replace(
      /const params = new URLSearchParams\(window\.location\.search\);/g,
      'const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();'
    );

    fs.writeFileSync(file, content);
  }
});
