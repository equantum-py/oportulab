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

  const installUi = `
  <button id="oportulab-install-btn" type="button" aria-label="Instalar OportuLab como aplicación" style="position:fixed;right:18px;bottom:18px;z-index:99999;border:0;border-radius:999px;padding:14px 20px;background:#0b2f63;color:#fff;font-weight:800;font-size:14px;box-shadow:0 10px 28px rgba(11,47,99,.28);cursor:pointer;display:block">⇩ Instalar OportuLab</button>
  <script>
  (() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      const b = document.getElementById('oportulab-install-btn');
      if (b) b.style.display = 'none';
      return;
    }

    let deferredPrompt = null;
    const btn = document.getElementById('oportulab-install-btn');

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {}));
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (btn) btn.style.display = 'block';
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (btn) btn.style.display = 'none';
    });

    if (btn) {
      btn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          try {
            const choice = await deferredPrompt.userChoice;
            if (choice && choice.outcome === 'accepted') btn.style.display = 'none';
          } catch (_) {}
          deferredPrompt = null;
          return;
        }

        const ua = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
          alert('En iPhone/iPad: toca Compartir y luego “Agregar a pantalla de inicio”.');
        } else {
          alert('En Chrome: abre el menú ⋮ y elige “Instalar OportuLab” o “Instalar aplicación”.');
        }
      });
    }
  })();
  </script>
`;

  if (!/id=["']oportulab-install-btn["']/i.test(html)) {
    html = html.replace(/<\/body>/i, `${installUi}</body>`);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.statusCode = 200;
  res.end(html);
};
