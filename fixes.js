(function() {
  const VIEW_KEY = 'poshella_saved_page';

  // 1. Sync global cart variable and storage keys
  function syncCartState() {
    let currentCart = [];
    if (Array.isArray(window.cart)) {
      currentCart = window.cart;
    } else {
      const raw = localStorage.getItem('cart') || localStorage.getItem('poshella_cart') || '[]';
      try { currentCart = JSON.parse(raw); } catch(e) { currentCart = []; }
      window.cart = currentCart;
    }

    // Keep storage keys mirrored
    try {
      localStorage.setItem('cart', JSON.stringify(currentCart));
      localStorage.setItem('poshella_cart', JSON.stringify(currentCart));
    } catch(e) {}

    return currentCart;
  }

  // 2. Overwrite renderCartView to calculate math and display all items accurately
  window.renderCartView = function() {
    const container = document.getElementById('cartItemsContainer') || document.getElementById('cart-items');
    const summaryBox = document.getElementById('cartSummary') || document.querySelector('.cart-summary');
    const timerBox = document.getElementById('cartTimer');

    const cart = syncCartState();

    let totalUnits = 0;
    let subtotal = 0;

    cart.forEach(item => {
      const qty = parseInt(item.qty || item.quantity || 1, 10);
      const price = parseFloat(item.price || item.unitPrice || 0);
      totalUnits += qty;
      subtotal += (price * qty);
    });

    // Update Header Badges & Count
    document.querySelectorAll('.cart-badge, [id*="cart-count"]').forEach(badge => {
      badge.textContent = totalUnits;
      badge.style.display = totalUnits > 0 ? 'inline-block' : 'none';
    });

    document.querySelectorAll('header h2, .view-title').forEach(el => {
      if (el.textContent && el.textContent.toLowerCase().includes('shopping cart')) {
        el.textContent = `Shopping Cart (${cart.length})`;
      }
    });

    // Empty state check
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

    // Render each item row from productsDatabase
    let itemsHtml = '';
    cart.forEach((item, index) => {
      const qty = parseInt(item.qty || item.quantity || 1, 10);
      const price = parseFloat(item.price || item.unitPrice || 0);
      const name = item.name || item.title || 'Cosmetic Item';
      const imgSrc = item.img || item.image || '';

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

    // Calculate Totals accurately
    const delivery = subtotal > 0 ? 1500 : 0;
    const grandTotal = subtotal + delivery;

    // Direct text replace on target summary nodes
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0) {
        const text = el.textContent.trim();
        if (text === 'Subtotal' && el.nextElementSibling) {
          el.nextElementSibling.textContent = `₦${subtotal.toLocaleString()}`;
        }
        if (text === 'Estimated Delivery' && el.nextElementSibling) {
          el.nextElementSibling.textContent = `₦${delivery.toLocaleString()}`;
        }
        if (text === 'Total' && el.nextElementSibling) {
          el.nextElementSibling.textContent = `₦${grandTotal.toLocaleString()}`;
        }
      }
    });
  };

  // Quantity modification (+ / -)
  window.changeCartQty = function(index, delta) {
    let cart = syncCartState();
    if (cart[index]) {
      let currentQty = parseInt(cart[index].qty || cart[index].quantity || 1, 10);
      currentQty += delta;

      if (currentQty <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].qty = currentQty;
        if (cart[index].quantity !== undefined) cart[index].quantity = currentQty;
      }

      window.cart = cart;
      syncCartState();
      window.renderCartView();
    }
  };

  // 3. Intercept addToCart so every new item addition immediately triggers re-render
  function patchAddToCart() {
    if (typeof window.addToCart === 'function' && !window._addToCartPatched) {
      const origAddToCart = window.addToCart;
      window.addToCart = function(productId) {
        origAddToCart(productId);
        syncCartState();
        if (typeof window.renderCartView === 'function') {
          window.renderCartView();
        }
      };
      window._addToCartPatched = true;
    }
  }

  // Intercept switchView
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

  // Startup initializations
  function init() {
    patchAddToCart();
    syncCartState();

    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView && typeof window.switchView === 'function') {
        window.switchView(savedView);
      }
    } catch(e) {}

    window.renderCartView();
  }

  // Replace alert modal with soft floating toast
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
