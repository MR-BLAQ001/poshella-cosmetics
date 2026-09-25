(function() {
  const VIEW_KEY = 'poshella_saved_page';

  // 1. Force cart re-render safely once element is ready in DOM
  function forceCartRender() {
    const rawCart = localStorage.getItem('poshella_cart') || localStorage.getItem('cart') || '[]';
    let cart = [];
    try { cart = JSON.parse(rawCart); } catch(e) { cart = []; }

    if (cart.length > 0) {
      if (typeof window.renderCart === 'function') {
        window.renderCart();
      }
    }
  }

  // 2. Intercept switchView and save active tab
  if (typeof window.switchView === 'function' && !window._switchWrapped) {
    const origSwitch = window.switchView;
    window.switchView = function(viewId) {
      try { localStorage.setItem(VIEW_KEY, viewId); } catch(e) {}
      origSwitch(viewId);
      if (viewId === 'cart' || viewId === 'cart-view') {
        setTimeout(forceCartRender, 50);
      }
    };
    window._switchWrapped = true;
  }

  // 3. Monitor the Cart container until it appears on screen
  function observeCartAndRender() {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };

    const callback = function(mutationsList, observer) {
      const rawCart = localStorage.getItem('poshella_cart') || localStorage.getItem('cart') || '[]';
      let cart = [];
      try { cart = JSON.parse(rawCart); } catch(e) { cart = []; }

      if (cart.length > 0) {
        forceCartRender();
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    // Stop observing after 3 seconds to save performance
    setTimeout(() => observer.disconnect(), 3000);
  }

  // 4. On page refresh: restore view and trigger cart checks
  function initOnRefresh() {
    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView && typeof window.switchView === 'function') {
        window.switchView(savedView);
      }
    } catch(e) {}

    forceCartRender();
    observeCartAndRender();
  }

  // Toast notifications replacement for alerts
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
    document.addEventListener('DOMContentLoaded', initOnRefresh);
  } else {
    initOnRefresh();
  }
})();
