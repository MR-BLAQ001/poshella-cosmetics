(function() {
  const VIEW_KEY = 'poshella_saved_page';
  const CART_KEY = 'poshella_cart';

  // Restore cart array globally and re-render the view
  function restoreAndRenderCart() {
    const rawData = localStorage.getItem(CART_KEY) || localStorage.getItem('cart') || '[]';
    let savedCart = [];
    try {
      savedCart = JSON.parse(rawData);
    } catch(e) {
      savedCart = [];
    }

    // Force global window.cart variable to hold the stored items
    window.cart = savedCart;

    // Trigger the page's cart view renderer
    if (typeof window.renderCartView === 'function') {
      window.renderCartView();
    }
  }

  // Intercept view switching so navigation stays synced
  if (typeof window.switchView === 'function' && !window._switchFixed) {
    const originalSwitch = window.switchView;
    window.switchView = function(viewId) {
      try { localStorage.setItem(VIEW_KEY, viewId); } catch(e) {}
      originalSwitch(viewId);
      if (viewId === 'cart' || viewId === 'cart-view') {
        restoreAndRenderCart();
      }
    };
    window._switchFixed = true;
  }

  // Page refresh execution strategy
  function onPageRefresh() {
    restoreAndRenderCart();

    try {
      const activeView = localStorage.getItem(VIEW_KEY);
      if (activeView && typeof window.switchView === 'function') {
        window.switchView(activeView);
        if (activeView === 'cart' || activeView === 'cart-view') {
          restoreAndRenderCart();
        }
      }
    } catch(e) {}
  }

  // Replace intrusive alert popups with silent bottom toasts
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
    document.addEventListener('DOMContentLoaded', onPageRefresh);
  } else {
    onPageRefresh();
  }
})();
