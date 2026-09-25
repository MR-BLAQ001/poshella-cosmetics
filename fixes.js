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
