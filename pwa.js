(() => {
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  let deferredPrompt = null;
  let installButton = null;

  const removeInstallButton = () => {
    if (installButton) {
      installButton.remove();
      installButton = null;
    }
  };

  const createInstallButton = () => {
    if (installButton || isStandalone()) return installButton;

    const btn = document.createElement('button');
    btn.id = 'oportulab-install-btn';
    btn.type = 'button';
    btn.textContent = 'Instalar OportuLab';
    btn.setAttribute('aria-label', 'Instalar OportuLab como aplicación');

    Object.assign(btn.style, {
      position: 'fixed',
      right: '18px',
      bottom: '18px',
      zIndex: '9999',
      border: '0',
      borderRadius: '999px',
      padding: '13px 18px',
      background: '#0b2f63',
      color: '#ffffff',
      fontWeight: '800',
      fontSize: '14px',
      lineHeight: '1',
      boxShadow: '0 10px 28px rgba(11,47,99,.28)',
      cursor: 'pointer'
    });

    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;

      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      btn.disabled = true;

      try {
        promptEvent.prompt();
        await promptEvent.userChoice;
      } catch (error) {
        console.error('[OportuLab PWA] No se pudo abrir el instalador:', error);
      } finally {
        removeInstallButton();
      }
    });

    document.body.appendChild(btn);
    installButton = btn;
    return btn;
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(error => console.error('[OportuLab PWA] Error registrando Service Worker:', error));
    });
  }

  window.addEventListener('beforeinstallprompt', event => {
    if (isStandalone()) return;

    event.preventDefault();
    deferredPrompt = event;
    createInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    removeInstallButton();
  });

  window.matchMedia('(display-mode: standalone)').addEventListener?.('change', event => {
    if (event.matches) {
      deferredPrompt = null;
      removeInstallButton();
    }
  });
})();
