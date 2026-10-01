const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const file = path.join(process.cwd(), 'index.html');
  let html = fs.readFileSync(file, 'utf8');

  const pwaHead = `
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#111827">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="OportuLab">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
`;

  if (!/rel=["']manifest["']/i.test(html)) {
    html = html.replace(/<\/head>/i, `${pwaHead}</head>`);
  }

  if (!/src=["']\/pwa\.js["']/i.test(html)) {
    html = html.replace(/<\/body>/i, '  <script src="/pwa.js" defer></script>\n</body>');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.statusCode = 200;
  res.end(html);
};
