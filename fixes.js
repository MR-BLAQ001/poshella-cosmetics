(function() {
  const VIEW_KEY = 'poshella_saved_page';

  // Override switchView to remember the current tab
  function initPersistence() {
    if (typeof window.switchView === 'function' && !window._wrappedSwitch) {
      const originalSwitchView = window.switchView;
      window.switchView = function(viewId) {
        try {
          localStorage.setItem(VIEW_KEY, viewId);
        } catch(e) {}
        originalSwitchView(viewId);
      };
      window._wrappedSwitch = true;
    }

    // Restore saved view on page refresh
    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView && savedView !== 'home' && typeof window.switchView === 'function') {
        window.switchView(savedView);
      }
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPersistence);
  } else {
    initPersistence();
  }
})();

// --- ITEM 2: SILENT TOAST NOTIFICATION ---
(function() {
  function showToast(message) {
    let toast = document.getElementById('poshella-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'poshella-toast';
      toast.style.cssText = 'position:fixed; bottom:75px; left:50%; transform:translateX(-50%); background:#ff2a75; color:#ffffff; padding:10px 22px; border-radius:25px; font-size:0.82rem; font-weight:bold; z-index:10000; box-shadow:0 4px 15px rgba(255, 42, 117, 0.4); text-align:center; transition:opacity 0.3s ease; opacity:0; pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  }

  // Intercept standard browser alerts
  const originalAlert = window.alert;
  window.alert = function(msg) {
    if (msg && (msg.toLowerCase().includes('cart') || msg.toLowerCase().includes('added') || msg.toLowerCase().includes('item'))) {
      showToast(msg);
    } else {
      showToast(msg || 'Item added to cart!');
    }
  };
})();
