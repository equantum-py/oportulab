(() => {
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isChromium = () => /chrome|crios|edg|edga|edgios/i.test(navigator.userAgent);

  let deferredPrompt = window.__oportulabDeferredPrompt || null;
  let refreshing = false;

  const cover = document.getElementById('oportulab-install-cover');
  const installBtn = document.getElementById('oportulab-cover-install');
  const continueBtn = document.getElementById('oportulab-cover-continue');
  const note = document.getElementById('oportulab-cover-note');
  const sponsorSlot = document.getElementById('oportulab-cover-sponsor-slot');
  const developerSlot = document.getElementById('oportulab-cover-developer-slot');
  const logoSlot = document.getElementById('oportulab-cover-logo-slot');

  const setNote = text => {
    if (note) note.textContent = text || '';
  };

  const hideCover = () => {
    if (cover) cover.hidden = true;
  };

  const showCover = () => {
    if (!cover || isStandalone()) return;
    cover.hidden = false;
  };

  const enableInstall = () => {
    if (!installBtn || isStandalone()) return;
    installBtn.disabled = false;
    installBtn.textContent = isIOS() ? 'Cómo instalar en iPhone' : 'Instalar App';
  };

  const captureInstallPrompt = event => {
    if (isStandalone()) return;
    if (event?.preventDefault) event.preventDefault();

    deferredPrompt = event || window.__oportulabDeferredPrompt || null;
    if (deferredPrompt) {
      window.__oportulabDeferredPrompt = deferredPrompt;
      enableInstall();
      setNote('Instalá OportuLab en tu dispositivo para usarlo como una app.');
      showCover();
    }
  };

  const cloneImage = (img, className, alt) => {
    if (!img) return null;
    const clone = img.cloneNode(true);
    clone.removeAttribute('id');
    clone.removeAttribute('style');
    clone.className = className;
    clone.alt = alt;
    clone.loading = 'eager';
    clone.decoding = 'async';
    return clone;
  };

  const hydrateCoverImages = () => {
    const images = Array.from(document.images);
    if (!images.length) return;

    const byText = matcher =>
      images.find(img => matcher(`${img.alt || ''} ${img.src || ''}`.toLowerCase()));

    const sponsor =
      byText(text => text.includes('vida') || text.includes('cooperativa')) ||
      images[0] ||
      null;

    const developer =
      byText(text => text.includes('equantum')) ||
      images[1] ||
      null;

    const oportulab = new Image();
    oportulab.src = '/icons/oportulab-logo.jpeg';
    oportulab.alt = 'OportuLab';

    if (sponsorSlot && sponsor && !sponsorSlot.firstElementChild) {
      const clone = cloneImage(sponsor, 'oportulab-cover-partner-logo', 'Cooperativa Vida y Luz Ltda.');
      if (clone) sponsorSlot.appendChild(clone);
    }

    if (developerSlot && developer && !developerSlot.firstElementChild) {
      const clone = cloneImage(developer, 'oportulab-cover-partner-logo', 'eQuantum Consulting Group');
      if (clone) developerSlot.appendChild(clone);
    }

    if (logoSlot && !logoSlot.firstElementChild) {
      const clone = cloneImage(oportulab, 'oportulab-cover-logo', 'OportuLab');
      if (clone) logoSlot.appendChild(clone);
    }
  };

  const setupCover = () => {
    if (!cover) return;

    if (isStandalone()) {
      hideCover();
      return;
    }

    hydrateCoverImages();
    showCover();
    if (isIOS()) {
      enableInstall();
      setNote('En iPhone o iPad: Compartir → Agregar a pantalla de inicio.');
    } else if (deferredPrompt) {
      enableInstall();
      setNote('OportuLab está lista para instalarse como aplicación.');
    } else {
      // Mantener la experiencia tipo app aunque Chrome todavía no habilite
      // la instalación nativa. El usuario siempre puede entrar a OportuLab.
      if (installBtn) {
        installBtn.disabled = false;
        installBtn.textContent = 'Instalar App';
      }
      setNote('También podés continuar y usar OportuLab directamente desde la web.');
    }

    installBtn?.addEventListener('click', async () => {
      if (isStandalone()) {
        hideCover();
        return;
      }

      if (isIOS()) {
        setNote('En Safari: tocá Compartir → Agregar a pantalla de inicio.');
        return;
      }

      deferredPrompt = deferredPrompt || window.__oportulabDeferredPrompt || null;

      if (!deferredPrompt) {
        setNote(
          isChromium()
            ? 'En Chrome, abrí el menú ⋮ y elegí “Instalar app” o “Crear acceso directo”.'
            : 'Usá el menú del navegador para agregar OportuLab a tu pantalla de inicio.'
        );
        return;
      }

      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      window.__oportulabDeferredPrompt = null;
      installBtn.disabled = true;

      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;

        if (choice?.outcome === 'accepted') {
          hideCover();
        } else {
          enableInstall();
          setNote('Podés instalar OportuLab cuando quieras o continuar en la web.');
        }
      } catch (error) {
        console.error('[OportuLab PWA] No se pudo abrir el instalador:', error);
        enableInstall();
        setNote('No se pudo abrir el instalador. Probá desde el menú del navegador.');
      }
    });

    continueBtn?.addEventListener('click', hideCover);
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const hadController = Boolean(navigator.serviceWorker.controller);
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      registration.update().catch(() => {});

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            installing.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController || refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
    } catch (error) {
      console.error('[OportuLab PWA] Error registrando Service Worker:', error);
    }
  };

  window.addEventListener('beforeinstallprompt', captureInstallPrompt);
  window.addEventListener('oportulab:installprompt', () => {
    captureInstallPrompt(window.__oportulabDeferredPrompt);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.__oportulabDeferredPrompt = null;
    hideCover();
  });

  window.matchMedia('(display-mode: standalone)').addEventListener?.('change', event => {
    if (event.matches) {
      deferredPrompt = null;
      window.__oportulabDeferredPrompt = null;
      hideCover();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCover, { once: true });
  } else {
    setupCover();
  }

  // Registrar el Service Worker inmediatamente: no esperar al evento load.
  // OportuLab carga un HTML grande y esperar todos los recursos podía hacer que
  // Chrome evaluara la instalación antes de que existiera un registro activo.
  registerServiceWorker();

  window.addEventListener('load', () => {
    hydrateCoverImages();
  }, { once: true });
})();
