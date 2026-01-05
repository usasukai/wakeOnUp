// Simple generator to create public/favicon.ico from public/icon.png
// Usage: npm run gen:favicon

const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

(async () => {
  const src = path.resolve(__dirname, '..', 'public', 'icon.png');
  const out = path.resolve(__dirname, '..', 'public', 'favicon.ico');

  if (!fs.existsSync(src)) {
    console.error('Source icon not found:', src);
    process.exit(1);
  }

  try {
    const buf = await pngToIco(src);
    fs.writeFileSync(out, buf);
    console.log('Generated favicon:', out);
  } catch (e) {
    console.error('Failed to generate favicon.ico:', e);
    process.exit(1);
  }
})();
