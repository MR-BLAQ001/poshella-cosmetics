(function() {
  const VIEW_KEY = 'poshella_saved_page';

  // 1. Core function to ensure cart items render if cart has data
  function checkAndRenderCart() {
    const rawCart = localStorage.getItem('poshella_cart') || localStorage.getItem('cart') || '[]';
    let cart = [];
    try { cart = JSON.parse(rawCart); } catch(e) { cart = []; }

    if (Array.isArray(cart) && cart.length > 0) {
      if (typeof window.renderCart === 'function') {
        window.renderCart();
      }
    }
  }

  // 2. Intercept switchView to handle cart rendering instantly on tab switch
  function setupViewSwitchInterceptor() {
    if (typeof window.switchView === 'function' && !window._switchViewIntercepted) {
      const originalSwitch = window.switchView;
      window.switchView = function(viewId) {
        try { localStorage.setItem(VIEW_KEY, viewId); } catch(e) {}
        originalSwitch(viewId);
        
        if (viewId === 'cart' || viewId === 'cart-view') {
          setTimeout(checkAndRenderCart, 50);
        }
      };
      window._switchViewIntercepted = true;
    }
  }

  // 3. Restore active view and force cart render on refresh
  function restoreSavedView() {
    setupViewSwitchInterceptor();
    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView && typeof window.switchView === 'function') {
        window.switchView(savedView);
        if (savedView === 'cart' || savedView === 'cart-view') {
          setTimeout(checkAndRenderCart, 100);
          setTimeout(checkAndRenderCart, 300);
        }
      }
    } catch(e) {}
  }

  // 4. Suppress browser alerts & replace with toast
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

  // Run immediately and after DOM completes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreSavedView);
  } else {
    restoreSavedView();
  }
})();
