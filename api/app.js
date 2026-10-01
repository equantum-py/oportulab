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

  const installCover = `
  <style id="oportulab-install-cover-styles">
    #oportulab-install-cover {
      position: fixed;
      inset: 0;
      z-index: 100000;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: max(24px, env(safe-area-inset-top)) 22px max(24px, env(safe-area-inset-bottom));
      background: #f7f9fc;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #0b2f63;
    }
    #oportulab-install-cover[hidden] { display: none !important; }
    .oportulab-cover-card {
      width: min(100%, 460px);
      min-height: min(760px, calc(100dvh - 48px));
      background: #ffffff;
      border: 1px solid #e4eaf2;
      border-radius: 28px;
      box-shadow: 0 18px 50px rgba(11, 47, 99, .10);
      padding: 26px 24px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .oportulab-cover-partners {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      align-items: start;
    }
    .oportulab-cover-partner {
      text-align: center;
      min-width: 0;
    }
    .oportulab-cover-kicker {
      display: block;
      margin-bottom: 10px;
      font-size: 10px;
      line-height: 1.2;
      letter-spacing: .14em;
      font-weight: 800;
      color: #6f7f96;
    }
    .oportulab-cover-partner img {
      width: 100%;
      max-width: 118px;
      height: 58px;
      object-fit: contain;
    }
    .oportulab-cover-main {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 28px 0 24px;
    }
    .oportulab-cover-logo {
      width: min(76vw, 300px);
      max-height: 300px;
      object-fit: contain;
      margin-bottom: 14px;
    }
    .oportulab-cover-title {
      margin: 0 0 8px;
      font-size: clamp(20px, 5vw, 28px);
      line-height: 1.15;
      font-weight: 900;
      color: #0b2f63;
    }
    .oportulab-cover-copy {
      max-width: 320px;
      margin: 0;
      font-size: 14px;
      line-height: 1.55;
      color: #667894;
    }
    .oportulab-cover-actions {
      display: grid;
      gap: 10px;
    }
    #oportulab-cover-install {
      width: 100%;
      min-height: 54px;
      border: 0;
      border-radius: 14px;
      background: #0b2f63;
      color: #ffffff;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 10px 24px rgba(11, 47, 99, .18);
    }
    #oportulab-cover-install:disabled {
      opacity: .55;
      cursor: default;
    }
    #oportulab-cover-continue {
      width: 100%;
      min-height: 46px;
      border: 0;
      background: transparent;
      color: #0b2f63;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }
    #oportulab-cover-note {
      min-height: 20px;
      margin: 2px 0 0;
      text-align: center;
      font-size: 12px;
      line-height: 1.45;
      color: #7b8799;
    }
    @media (max-width: 520px) {
      #oportulab-install-cover { padding-left: 14px; padding-right: 14px; }
      .oportulab-cover-card {
        min-height: calc(100dvh - 28px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
        border-radius: 22px;
        padding: 20px 18px 18px;
      }
      .oportulab-cover-partner img { max-width: 100px; height: 50px; }
      .oportulab-cover-main { padding: 18px 0; }
      .oportulab-cover-logo { width: min(80vw, 280px); }
    }
  </style>
  <div id="oportulab-install-cover" hidden>
    <div class="oportulab-cover-card" role="dialog" aria-modal="true" aria-label="Instalar OportuLab">
      <div class="oportulab-cover-partners">
        <div class="oportulab-cover-partner">
          <span class="oportulab-cover-kicker">PATROCINADO POR</span>
          <div id="oportulab-cover-sponsor-slot"></div>
        </div>
        <div class="oportulab-cover-partner">
          <span class="oportulab-cover-kicker">DESARROLLADO POR</span>
          <div id="oportulab-cover-developer-slot"></div>
        </div>
      </div>
      <div class="oportulab-cover-main">
        <div id="oportulab-cover-logo-slot"></div>
        <h1 class="oportulab-cover-title">OportuLab</h1>
        <p class="oportulab-cover-copy">Convierte problemas en oportunidades de negocio</p>
      </div>
      <div class="oportulab-cover-actions">
        <button id="oportulab-cover-install" type="button" disabled>Instalar App</button>
        <button id="oportulab-cover-continue" type="button">Continuar en la web</button>
        <p id="oportulab-cover-note">Preparando instalación…</p>
      </div>
    </div>
  </div>
  `;

  if (!/id=["']oportulab-install-cover["']/i.test(html)) {
    html = html.replace(/<body([^>]*)>/i, `<body$1>${installCover}`);
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
