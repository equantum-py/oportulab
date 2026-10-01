(() => {
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const hasContinuedOnWeb = () => sessionStorage.getItem('oportulab-continue-web') === '1';

  let deferredPrompt = null;

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
    if (!cover || isStandalone() || hasContinuedOnWeb()) return;
    cover.hidden = false;
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

    const byText = matcher => images.find(img => matcher(`${img.alt || ''} ${img.src || ''}`.toLowerCase()));

    const sponsor =
      byText(text => text.includes('vida') || text.includes('cooperativa')) ||
      images[0] ||
      null;

    const developer =
      byText(text => text.includes('equantum')) ||
      images[1] ||
      null;

    const oportulab =
      byText(text => text.includes('oportu')) ||
      images
        .filter(img => img !== sponsor && img !== developer)
        .sort((a, b) => ((b.naturalWidth || b.width || 0) * (b.naturalHeight || b.height || 0)) - ((a.naturalWidth || a.width || 0) * (a.naturalHeight || a.height || 0)))[0] ||
      null;

    if (sponsorSlot && sponsor && !sponsorSlot.firstElementChild) {
      const clone = cloneImage(sponsor, 'oportulab-cover-partner-logo', 'Cooperativa Vida y Luz Ltda.');
      if (clone) sponsorSlot.appendChild(clone);
    }

    if (developerSlot && developer && !developerSlot.firstElementChild) {
      const clone = cloneImage(developer, 'oportulab-cover-partner-logo', 'eQuantum Consulting Group');
      if (clone) developerSlot.appendChild(clone);
    }

    if (logoSlot && oportulab && !logoSlot.firstElementChild) {
      const clone = cloneImage(oportulab, 'oportulab-cover-logo', 'OportuLab');
      if (clone) logoSlot.appendChild(clone);
    }
  };

  const setupCover = () => {
    if (!cover) return;

    hydrateCoverImages();
    showCover();

    if (isIOS()) {
      if (installBtn) {
        installBtn.disabled = false;
        installBtn.textContent = 'Cómo instalar en iPhone';
      }
      setNote('En iPhone se instala desde Compartir → Agregar a pantalla de inicio.');
    } else {
      setNote('Preparando instalación…');
    }

    installBtn?.addEventListener('click', async () => {
      if (isIOS()) {
        setNote('Tocá Compartir y luego “Agregar a pantalla de inicio”.');
        return;
      }

      if (!deferredPrompt) {
        setNote('La instalación todavía no está disponible. Probá nuevamente en unos segundos.');
        return;
      }

      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      installBtn.disabled = true;

      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === 'accepted') {
          hideCover();
        } else {
          installBtn.disabled = false;
          setNote('Podés instalar OportuLab cuando quieras o continuar en la web.');
        }
      } catch (error) {
        console.error('[OportuLab PWA] No se pudo abrir el instalador:', error);
        installBtn.disabled = false;
        setNote('No se pudo abrir el instalador. También podés continuar en la web.');
      }
    });

    continueBtn?.addEventListener('click', () => {
      sessionStorage.setItem('oportulab-continue-web', '1');
      hideCover();
    });
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

    if (installBtn) {
      installBtn.disabled = false;
      installBtn.textContent = 'Instalar App';
    }
    setNote('Instalá OportuLab en tu celular para usarlo como una app.');
    showCover();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideCover();
  });

  window.matchMedia('(display-mode: standalone)').addEventListener?.('change', event => {
    if (event.matches) {
      deferredPrompt = null;
      hideCover();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCover, { once: true });
  } else {
    setupCover();
  }

  window.addEventListener('load', hydrateCoverImages, { once: true });
})();
