(function() {
  const VIEW_KEY = 'poshella_saved_page';

  // Helper to ensure window.cart is always synchronized with localStorage
  function syncGlobalCart() {
    const rawCart = localStorage.getItem('poshella_cart') || localStorage.getItem('cart') || '[]';
    try {
      const parsedCart = JSON.parse(rawCart);
      if (Array.isArray(parsedCart)) {
        window.cart = parsedCart;
      }
    } catch(e) {
      window.cart = window.cart || [];
    }
  }

  // 1. MONKEY-PATCH renderCartView: Force cart sync EVERY TIME renderCartView is called
  function patchRenderCartView() {
    if (typeof window.renderCartView === 'function' && !window._renderCartViewPatched) {
      const originalRender = window.renderCartView;
      window.renderCartView = function() {
        syncGlobalCart();
        originalRender.apply(this, arguments);
      };
      window._renderCartViewPatched = true;
    }
  }

  // 2. Intercept switchView
  function patchSwitchView() {
    if (typeof window.switchView === 'function' && !window._switchViewPatched) {
      const origSwitch = window.switchView;
      window.switchView = function(viewId) {
        try { localStorage.setItem(VIEW_KEY, viewId); } catch(e) {}
        origSwitch(viewId);
        if (viewId === 'cart' || viewId === 'cart-view') {
          syncGlobalCart();
          if (typeof window.renderCartView === 'function') {
            window.renderCartView();
          }
        }
      };
      window._switchViewPatched = true;
    }
  }

  // 3. Initialize immediately and restore active tab on refresh
  function init() {
    syncGlobalCart();
    patchRenderCartView();
    patchSwitchView();

    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView && typeof window.switchView === 'function') {
        window.switchView(savedView);
      }
    } catch(e) {}

    // Force one clean render after patches are applied
    if (typeof window.renderCartView === 'function') {
      window.renderCartView();
    }
  }

  // 4. Toast alert replacement
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

  init();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
