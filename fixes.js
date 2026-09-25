(function() {
  const VIEW_KEY = 'poshella_saved_page';

  // OVERWRITE the old renderCartView function in browser memory
  window.renderCartView = function() {
    const container = document.getElementById('cartItemsContainer') || document.getElementById('cart-items');
    const summaryBox = document.getElementById('cartSummary') || document.querySelector('.cart-summary');
    const timerBox = document.getElementById('cartTimer');

    // 1. Pull latest items from localStorage
    const rawCart = localStorage.getItem('poshella_cart') || localStorage.getItem('cart') || '[]';
    let cart = [];
    try {
      cart = JSON.parse(rawCart);
    } catch(e) {
      cart = [];
    }
    window.cart = cart;

    // 2. Update badge count if helper exists
    if (typeof window.updateCartBadge === 'function') {
      window.updateCartBadge();
    }

    // 3. If empty, render empty state
    if (!Array.isArray(cart) || cart.length === 0) {
      if (container) {
        container.innerHTML = `
          <div class="empty-cart-msg" style="text-align:center; padding:40px 20px;">
            <span style="font-size:3rem; display:block; margin-bottom:10px;">🛒</span>
            <p style="color:#aaa; font-size:1rem; margin:0;">Your cart is currently empty!</p>
          </div>
        `;
      }
      if (summaryBox) summaryBox.style.display = 'none';
      if (timerBox) timerBox.style.display = 'none';
      return;
    }

    // 4. If items exist, force display of items
    if (summaryBox) summaryBox.style.display = 'block';
    if (timerBox) timerBox.style.display = 'flex';

    let itemsHtml = '';
    let subtotal = 0;

    cart.forEach((item) => {
      const qty = parseInt(item.quantity || item.qty || 1, 10);
      const price = parseFloat(item.price || item.unitPrice || 0);
      const itemTotal = price * qty;
      subtotal += itemTotal;

      itemsHtml += `
        <div class="cart-item" style="display:flex; align-items:center; gap:12px; background:#181818; padding:12px; border-radius:10px; margin-bottom:10px; border:1px solid #282828;">
          <img src="${item.image || item.img || ''}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;" onerror="this.style.display='none'">
          <div style="flex:1;">
            <h4 style="margin:0 0 4px 0; color:#fff; font-size:0.95rem;">${item.name || item.title || 'Product'}</h4>
            <p style="margin:0; color:#ff2a75; font-weight:bold; font-size:0.9rem;">₦${price.toLocaleString()}</p>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:#fff; font-weight:bold; font-size:0.9rem;">Qty: ${qty}</span>
          </div>
        </div>
      `;
    });

    if (container) {
      container.innerHTML = itemsHtml;
    }

    // Update prices
    const delivery = 1500;
    const grandTotal = subtotal + delivery;

    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');

    if (subtotalEl) subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `₦${grandTotal.toLocaleString()}`;
  };

  // Intercept view navigation
  if (typeof window.switchView === 'function') {
    const origSwitch = window.switchView;
    window.switchView = function(viewId) {
      try { localStorage.setItem(VIEW_KEY, viewId); } catch(e) {}
      origSwitch(viewId);
      if (viewId === 'cart' || viewId === 'cart-view') {
        window.renderCartView();
      }
    };
  }

  // Restore active view on refresh and fire new renderCartView
  function initOnLoad() {
    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView && typeof window.switchView === 'function') {
        window.switchView(savedView);
      }
    } catch(e) {}

    window.renderCartView();
  }

  // Toast notification system replacing harsh alerts
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
    document.addEventListener('DOMContentLoaded', initOnLoad);
  } else {
    initOnLoad();
  }
})();
