(function() {
  const VIEW_KEY = 'poshella_saved_page';

  function getCartData() {
    const rawCart = localStorage.getItem('poshella_cart') || localStorage.getItem('cart') || '[]';
    try {
      return JSON.parse(rawCart);
    } catch(e) {
      return [];
    }
  }

  // Force-render items directly into DOM if cart array has items
  function forceRenderCartItems() {
    const cart = getCartData();
    const container = document.getElementById('cartItemsContainer') || document.getElementById('cart-items');
    
    if (!container) return;

    if (Array.isArray(cart) && cart.length > 0) {
      let html = '';
      let subtotal = 0;

      cart.forEach((item, index) => {
        const qty = parseInt(item.quantity || item.qty || 1, 10);
        const unitPrice = parseFloat(item.unitPrice || item.price || 0);
        const itemTotal = unitPrice * qty;
        subtotal += itemTotal;

        html += `
          <div class="cart-item" style="display:flex; align-items:center; justify:space-between; background:#181818; padding:12px; margin-bottom:10px; border-radius:8px; border:1px solid #282828;">
            <img src="${item.image || item.img || ''}" style="width:50px; height:50px; object-fit:cover; border-radius:6px; margin-right:12px;" onerror="this.style.display='none'">
            <div style="flex:1;">
              <h4 style="margin:0 0 4px 0; color:#fff; font-size:0.9rem;">${item.name || item.title || 'Product'}</h4>
              <p style="margin:0; color:#ff2a75; font-weight:bold; font-size:0.85rem;">₦${(unitPrice || itemTotal).toLocaleString()}</p>
            </div>
            <div style="color:#aaa; font-size:0.85rem; font-weight:bold;">Qty: ${qty}</div>
          </div>
        `;
      });

      container.innerHTML = html;

      // Ensure summary box is visible if present
      const summaryBox = document.getElementById('cartSummary') || document.querySelector('.cart-summary');
      if (summaryBox) summaryBox.style.display = 'block';
    }
  }

  // Intercept view switching
  if (typeof window.switchView === 'function' && !window._wrapped) {
    const origSwitch = window.switchView;
    window.switchView = function(viewId) {
      try { localStorage.setItem(VIEW_KEY, viewId); } catch(e) {}
      origSwitch(viewId);
      if (viewId === 'cart' || viewId === 'cart-view') {
        setTimeout(forceRenderCartItems, 50);
      }
    };
    window._wrapped = true;
  }

  // Restore on page load
  function init() {
    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView && typeof window.switchView === 'function') {
        window.switchView(savedView);
      }
    } catch(e) {}

    forceRenderCartItems();
    setTimeout(forceRenderCartItems, 200);
    setTimeout(forceRenderCartItems, 600);
  }

  // Toast replacements for alerts
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
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
