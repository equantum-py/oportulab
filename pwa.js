(() => {
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    });
  }

  let deferredPrompt = null;

  const showFallback = () => {
    let modal = document.getElementById('oportulab-install-help');
    if (modal) {
      modal.style.display = 'flex';
      return;
    }

    modal = document.createElement('div');
    modal.id = 'oportulab-install-help';
    Object.assign(modal.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '10000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(10, 31, 68, .42)'
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      width: 'min(92vw, 420px)',
      background: '#fff',
      borderRadius: '18px',
      padding: '22px',
      boxShadow: '0 20px 60px rgba(0,0,0,.20)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: '#102a56'
    });

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isChrome = /chrome|crios/i.test(navigator.userAgent) && !/edg|opr/i.test(navigator.userAgent);

    let helpText = 'Abrí el menú del navegador y elegí “Instalar aplicación” o “Instalar OportuLab”.';
    if (isIOS) helpText = 'Tocá Compartir y luego “Agregar a pantalla de inicio”.';
    else if (isChrome) helpText = 'En Chrome, abrí el menú ⋮ y elegí “Instalar OportuLab” o “Instalar aplicación”.';

    box.innerHTML = `
      <div style="font-weight:800;font-size:20px;margin-bottom:8px">Instalar OportuLab</div>
      <div style="font-size:14px;line-height:1.55;color:#4d6483;margin-bottom:18px">${helpText}</div>
      <button id="oportulab-install-help-close" type="button" style="width:100%;border:0;border-radius:12px;padding:12px 16px;background:#0b2f63;color:#fff;font-weight:800;cursor:pointer">Entendido</button>
    `;

    modal.appendChild(box);
    document.body.appendChild(modal);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.style.display = 'none';
    });
    box.querySelector('#oportulab-install-help-close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  };

  const ensureInstallButton = () => {
    if (isStandalone() || document.getElementById('oportulab-install-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'oportulab-install-btn';
    btn.type = 'button';
    btn.innerHTML = '<span aria-hidden="true">⇩</span>&nbsp; Instalar OportuLab';
    btn.setAttribute('aria-label', 'Instalar OportuLab como aplicación');

    Object.assign(btn.style, {
      position: 'fixed',
      right: '18px',
      bottom: '18px',
      zIndex: '9999',
      border: '1px solid rgba(255,255,255,.16)',
      borderRadius: '999px',
      padding: '13px 18px',
      background: '#0b2f63',
      color: '#fff',
      fontWeight: '800',
      fontSize: '14px',
      lineHeight: '1',
      boxShadow: '0 10px 28px rgba(11,47,99,.28)',
      cursor: 'pointer',
      display: 'block'
    });

    btn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try {
          const choice = await deferredPrompt.userChoice;
          if (choice?.outcome === 'accepted') btn.style.display = 'none';
        } catch (_) {}
        deferredPrompt = null;
        return;
      }

      showFallback();
    });

    document.body.appendChild(btn);
  };

  const init = () => {
    ensureInstallButton();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event;
      const btn = document.getElementById('oportulab-install-btn');
      if (btn && !isStandalone()) btn.style.display = 'block';
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      const btn = document.getElementById('oportulab-install-btn');
      if (btn) btn.style.display = 'none';
    });

    window.matchMedia('(display-mode: standalone)').addEventListener?.('change', (event) => {
      const btn = document.getElementById('oportulab-install-btn');
      if (btn) btn.style.display = event.matches ? 'none' : 'block';
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
