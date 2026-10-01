const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const file = path.join(process.cwd(), 'app.html');
  let html = fs.readFileSync(file, 'utf8');

  const headTags = [];

  if (!/rel=["']manifest["']/i.test(html)) {
    headTags.push('<link rel="manifest" href="/manifest.webmanifest">');
  }
  if (!/name=["']theme-color["']/i.test(html)) {
    headTags.push('<meta name="theme-color" content="#0b2f63">');
  }
  if (!/name=["']viewport["']/i.test(html)) {
    headTags.push('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');
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

  // Compatibilidad para botones “Atrás” generados por la aplicación.
  // Si el control no tiene acción propia, vuelve a la pantalla anterior real.
  if (!/id=["']oportulab-back-fix["']/i.test(html)) {
    html = html.replace(/<\/body>/i, `  <script id="oportulab-back-fix">
document.addEventListener('click', function (event) {
  const target = event.target.closest('button, a, [role="button"]');
  if (!target) return;
  const label = (target.textContent || '').replace(/\\s+/g, ' ').trim().toLowerCase();
  if (label !== 'atrás' && label !== '← atrás' && label !== '←atrás') return;

  const href = target.getAttribute('href');
  const hasInlineAction = target.hasAttribute('onclick');
  if (href && href !== '#' && !href.toLowerCase().startsWith('javascript:')) return;
  if (hasInlineAction) return;

  event.preventDefault();
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '/app';
  }
}, true);
</script>\n</body>`);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.statusCode = 200;
  res.end(html);
};
