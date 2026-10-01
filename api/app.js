const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const file = path.join(process.cwd(), 'index.html');
  let html = fs.readFileSync(file, 'utf8');

  const headTags = [];

  if (!/rel=["']manifest["']/i.test(html)) {
    headTags.push('<link rel="manifest" href="/manifest.webmanifest">');
  }
  if (!/name=["']theme-color["']/i.test(html)) {
    headTags.push('<meta name="theme-color" content="#0b2f63">');
  }
  if (!/name=["']mobile-web-app-capable["']/i.test(html)) {
    headTags.push('<meta name="mobile-web-app-capable" content="yes">');
  }
  if (!/name=["']apple-mobile-web-app-capable["']/i.test(html)) {
    headTags.push('<meta name="apple-mobile-web-app-capable" content="yes">');
  }
  if (!/name=["']apple-mobile-web-app-status-bar-style["']/i.test(html)) {
    headTags.push('<meta name="apple-mobile-web-app-status-bar-style" content="default">');
  }
  if (!/name=["']apple-mobile-web-app-title["']/i.test(html)) {
    headTags.push('<meta name="apple-mobile-web-app-title" content="OportuLab">');
  }
  if (!/rel=["']apple-touch-icon["']/i.test(html)) {
    headTags.push('<link rel="apple-touch-icon" href="/icons/icon-192.png">');
  }

  if (headTags.length) {
    html = html.replace(/<\/head>/i, `  ${headTags.join('\n  ')}\n</head>`);
  }

  if (!/src=["']\/pwa\.js["']/i.test(html)) {
    html = html.replace(/<\/body>/i, '  <script src="/pwa.js" defer></script>\n</body>');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.statusCode = 200;
  res.end(html);
};
