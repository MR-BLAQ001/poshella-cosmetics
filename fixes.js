(function() {
  const VIEW_KEY = 'poshella_saved_page';

  // Helper to fetch and normalize cart items from all potential storage keys
  function getCartData() {
    let items = [];

    // Try reading from all known cart keys
    const keys = ['poshella_cart', 'cart', 'cartItems', 'user_cart'];
    for (let key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed;
            break;
          }
        }
      } catch(e) {}
    }

    return items;
  }

  // Master function to render cart items and calculate totals accurately
  window.renderCartView = function() {
    const container = document.getElementById('cartItemsContainer') || document.getElementById('cart-items') || document.querySelector('.cart-items-list');
    const summaryBox = document.getElementById('cartSummary') || document.querySelector('.cart-summary');
    const timerBox = document.getElementById('cartTimer');

    const cart = getCartData();
    window.cart = cart;

    let totalUnits = 0;
    let subtotal = 0;

    cart.forEach(item => {
      const qty = parseInt(item.quantity || item.qty || item.count || 1, 10);
      const price = parseFloat(item.price || item.unitPrice || item.cost || item.amount || 0);
      totalUnits += qty;
      subtotal += (price * qty);
    });

    // 1. Update Header Title and Badges
    document.querySelectorAll('.view-title, header h2, .cart-header-title, h2, h3').forEach(el => {
      if (el.textContent && el.textContent.toLowerCase().includes('shopping cart')) {
        el.textContent = `Shopping Cart (${cart.length})`;
      }
    });

    document.querySelectorAll('.cart-badge, [id*="cart-count"], .badge').forEach(badge => {
      badge.textContent = totalUnits;
      badge.style.display = totalUnits > 0 ? 'inline-block' : 'none';
    });

    // 2. Handle Empty State
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

    if (summaryBox) summaryBox.style.display = 'block';
    if (timerBox) timerBox.style.display = 'flex';

    // 3. Build Item List for ALL selected items
    let itemsHtml = '';
    cart.forEach((item, index) => {
      const qty = parseInt(item.quantity || item.qty || item.count || 1, 10);
      const price = parseFloat(item.price || item.unitPrice || item.cost || item.amount || 0);
      const name = item.name || item.title || item.productName || item.product_name || 'Product Item';
      const imgSrc = item.image || item.img || item.src || item.imageUrl || '';

      itemsHtml += `
        <div class="cart-item" style="display:flex; align-items:center; gap:12px; background:#181818; padding:12px; border-radius:10px; margin-bottom:10px; border:1px solid #282828;">
          <img src="${imgSrc}" style="width:55px; height:55px; object-fit:cover; border-radius:8px;" onerror="this.style.display='none'">
          <div style="flex:1;">
            <h4 style="margin:0 0 4px 0; color:#fff; font-size:0.95rem;">${name}</h4>
            <p style="margin:0; color:#ff2a75; font-weight:bold; font-size:0.9rem;">₦${price.toLocaleString()}</p>
          </div>
          <div style="display:flex; align-items:center; gap:8px; background:#222; padding:4px 8px; border-radius:6px;">
            <button onclick="window.changeCartQty(${index}, -1)" style="background:none; border:none; color:#ff2a75; font-size:1.1rem; font-weight:bold; cursor:pointer; padding:0 4px;">-</button>
            <span style="color:#fff; font-weight:bold; font-size:0.9rem; min-width:18px; text-align:center;">${qty}</span>
            <button onclick="window.changeCartQty(${index}, 1)" style="background:none; border:none; color:#ff2a75; font-size:1.1rem; font-weight:bold; cursor:pointer; padding:0 4px;">+</button>
          </div>
        </div>
      `;
    });

    if (container) container.innerHTML = itemsHtml;

    // 4. Calculate Delivery and Grand Total
    const delivery = subtotal > 0 ? 1500 : 0;
    const grandTotal = subtotal + delivery;

    // Update Price elements directly by ID or Text match
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');

    if (subtotalEl) subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `₦${grandTotal.toLocaleString()}`;

    // Fallback: scan text elements if IDs aren't set
    document.querySelectorAll('div, p, span, td').forEach(el => {
      if (el.children.length === 0) {
        const txt = el.textContent.trim();
        if (txt === 'Subtotal' && el.nextElementSibling) {
          el.nextElementSibling.textContent = `₦${subtotal.toLocaleString()}`;
        }
        if (txt === 'Total' && el.nextElementSibling) {
          el.nextElementSibling.textContent = `₦${grandTotal.toLocaleString()}`;
        }
      }
    });
  };

  // Adjust item quantity (+ / -)
  window.changeCartQty = function(index, delta) {
    let cart = getCartData();
    if (cart[index]) {
      let currentQty = parseInt(cart[index].quantity || cart[index].qty || cart[index].count || 1, 10);
      currentQty += delta;

      if (currentQty <= 0) {
        cart.splice(index, 1);
      } else {
        if (cart[index].quantity !== undefined) cart[index].quantity = currentQty;
        if (cart[index].qty !== undefined) cart[index].qty = currentQty;
        if (cart[index].count !== undefined) cart[index].count = currentQty;
      }

      const keys = ['poshella_cart', 'cart'];
      keys.forEach(k => localStorage.setItem(k, JSON.stringify(cart)));
      window.renderCartView();
    }
  };

  // Intercept view navigation
  if (typeof window.switchView === 'function') {
    const origSwitch = window.switchView;
    window.switchView = function(viewId) {
      try { localStorage.setItem(VIEW_KEY, viewId); } catch(e) {}
      origSwitch(viewId);
      if (viewId === 'cart' || viewId === 'cart-view') {
        setTimeout(window.renderCartView, 20);
      }
    };
  }

  // Restore active tab and render cart on page load
  function init() {
    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView && typeof window.switchView === 'function') {
        window.switchView(savedView);
      }
    } catch(e) {}

    window.renderCartView();
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
