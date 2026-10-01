(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  let deferredPrompt = null;

  const ensureInstallButton = () => {
    if (document.getElementById('oportulab-install-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'oportulab-install-btn';
    btn.type = 'button';
    btn.textContent = 'Instalar OportuLab';
    btn.setAttribute('aria-label', 'Instalar OportuLab');
    Object.assign(btn.style, {
      position: 'fixed',
      right: '18px',
      bottom: '18px',
      zIndex: '9999',
      border: '0',
      borderRadius: '999px',
      padding: '12px 18px',
      background: '#0b2f63',
      color: '#fff',
      fontWeight: '800',
      fontSize: '14px',
      boxShadow: '0 8px 24px rgba(11,47,99,.25)',
      cursor: 'pointer',
      display: 'none'
    });

    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) {}
      deferredPrompt = null;
      btn.style.display = 'none';
    });

    document.body.appendChild(btn);
  };

  const init = () => {
    ensureInstallButton();
    const btn = document.getElementById('oportulab-install-btn');

    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      deferredPrompt = event;
      if (btn) btn.style.display = 'block';
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (btn) btn.style.display = 'none';
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
