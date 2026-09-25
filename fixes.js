(function() {
  const VIEW_KEY = 'poshella_saved_page';

  function initApp() {
    // 1. Force cart view render using the exact function name from index.html
    if (typeof window.renderCartView === 'function') {
      window.renderCartView();
    }

    // 2. Restore active page view on refresh
    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView && typeof window.switchView === 'function') {
        window.switchView(savedView);
        if ((savedView === 'cart' || savedView === 'cart-view') && typeof window.renderCartView === 'function') {
          window.renderCartView();
        }
      }
    } catch(e) {}
  }

  // Intercept view switching to always trigger renderCartView when opening Cart
  if (typeof window.switchView === 'function' && !window._wrapped) {
    const origSwitch = window.switchView;
    window.switchView = function(viewId) {
      try { localStorage.setItem(VIEW_KEY, viewId); } catch(e) {}
      origSwitch(viewId);
      if ((viewId === 'cart' || viewId === 'cart-view') && typeof window.renderCartView === 'function') {
        window.renderCartView();
      }
    };
    window._wrapped = true;
  }

  // Intercept browser alerts to display silent toast notifications
  window.alert = function(msg) {
    let toast = document.getElementById('poshella-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'poshella-toast';
      toast.style.cssText = 'position:fixed; bottom:75px; left:50%; transform:translateX(-50%); background:#ff2a75; color:#ffffff; padding:10px 22px; border-radius:25px; font-size:0.82rem; font-weight:bold; z-index:10000; box-shadow:0 4px 15px rgba(255, 42, 117, 0.4); text-align:center; transition:opacity 0.3s ease; opacity:0; pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg || 'Item added to cart!';
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
