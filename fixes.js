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

// --- ITEM 2: SILENT TOAST NOTIFICATION ---
(function() {
  function showToast(message) {
    let toast = document.getElementById('poshella-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'poshella-toast';
      toast.style.cssText = 'position:fixed; bottom:75px; left:50%; transform:translateX(-50%); background:#ff2a75; color:#ffffff; padding:10px 22px; border-radius:25px; font-size:0.82rem; font-weight:bold; z-index:10000; box-shadow:0 4px 15px rgba(255, 42, 117, 0.4); text-align:center; transition:opacity 0.3s ease; opacity:0; pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  }

  // Intercept standard browser alerts
  const originalAlert = window.alert;
  window.alert = function(msg) {
    if (msg && (msg.toLowerCase().includes('cart') || msg.toLowerCase().includes('added') || msg.toLowerCase().includes('item'))) {
      showToast(msg);
    } else {
      showToast(msg || 'Item added to cart!');
    }
  };
})();

// --- FIX: CART BADGE & EMPTY STATE SYNC ---
(function() {
  function syncCartUI() {
    const rawCart = localStorage.getItem('poshella_cart') || localStorage.getItem('cart') || '[]';
    let cart = [];
    try {
      cart = JSON.parse(rawCart);
    } catch(e) {
      cart = [];
    }

    const cartCount = Array.isArray(cart) ? cart.length : 0;

    // Update Header Text
    document.querySelectorAll('.view-title, header h2, .cart-header-title').forEach(el => {
      if (el.textContent.includes('Shopping Cart')) {
        el.textContent = `Shopping Cart (${cartCount})`;
      }
    });

    // Update Bottom Nav Badge
    document.querySelectorAll('.cart-badge, [id*="cart-count"], [class*="badge"]').forEach(badge => {
      if (cartCount > 0) {
        badge.textContent = cartCount;
        badge.style.display = 'inline-block';
      } else {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
    });

    // If cart array has items but page shows empty view, trigger UI refresh
    const cartContainer = document.getElementById('cartItemsContainer') || document.getElementById('cart-items');
    if (cartCount > 0 && cartContainer && cartContainer.innerHTML.includes('currently empty')) {
      if (typeof window.renderCart === 'function') {
        window.renderCart();
      }
    }
  }

  // Intercept cart updates
  const originalAddToCart = window.addToCart;
  if (typeof originalAddToCart === 'function') {
    window.addToCart = function(...args) {
      originalAddToCart.apply(this, args);
      setTimeout(syncCartUI, 100);
    };
  }

  // Run sync on page load and view switch
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncCartUI);
  } else {
    syncCartUI();
  }
})();

// --- HIDE GREEN ALERT BANNER ---
(function() {
  // Inject CSS to instantly hide green alert banners
  const style = document.createElement('style');
  style.textContent = `
    .alert-success, .cart-alert, [class*="alert-green"], [style*="background-color: green"], [style*="background: green"], [style*="background: rgb(40, 167, 69)"], [style*="background:#28a745"] {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
    }
  `;
  document.head.appendChild(style);

  // Monitor DOM and remove banner elements if injected dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && (node.textContent.includes('Cart successfully updated') || node.classList.contains('alert-success'))) {
          node.remove();
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();

// --- FIX: ACCURATE CART PRICING & QUANTITY TOTALS ---
(function() {
  function recalculateCartTotals() {
    const rawCart = localStorage.getItem('poshella_cart') || localStorage.getItem('cart') || '[]';
    let cart = [];
    try {
      cart = JSON.parse(rawCart);
    } catch(e) {
      cart = [];
    }

    if (!Array.isArray(cart)) return;

    let totalItemUnits = 0;
    let subtotalPrice = 0;

    cart.forEach(item => {
      const qty = parseInt(item.quantity || item.qty || 1, 10);
      const unitPrice = parseFloat(item.unitPrice || item.price || 0);
      
      totalItemUnits += qty;
      subtotalPrice += (unitPrice * qty);
    });

    const deliveryFee = subtotalPrice > 0 ? 1500 : 0;
    const grandTotal = subtotalPrice + deliveryFee;

    // Update Header Count to total items
    document.querySelectorAll('.view-title, header h2, .cart-header-title').forEach(el => {
      if (el.textContent.includes('Shopping Cart')) {
        el.textContent = `Shopping Cart (${totalItemUnits})`;
      }
    });

    // Update Bottom Nav Badge to match total item units
    document.querySelectorAll('.cart-badge, [id*="cart-count"], [class*="badge"]').forEach(badge => {
      if (totalItemUnits > 0) {
        badge.textContent = totalItemUnits;
        badge.style.display = 'inline-block';
      } else {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
    });

    // Update Subtotal and Total DOM elements accurately
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0) {
        if (el.textContent.trim() === 'Subtotal' && el.nextElementSibling) {
          el.nextElementSibling.textContent = `₦${subtotalPrice.toLocaleString()}`;
        }
        if (el.textContent.trim() === 'Total' && el.nextElementSibling) {
          el.nextElementSibling.textContent = `₦${grandTotal.toLocaleString()}`;
        }
      }
    });
  }

  // Intercept cart rendering and quantity changes
  const originalRenderCart = window.renderCart;
  if (typeof originalRenderCart === 'function') {
    window.renderCart = function(...args) {
      originalRenderCart.apply(this, args);
      setTimeout(recalculateCartTotals, 50);
    };
  }

  // Monitor DOM changes inside cart view
  const observer = new MutationObserver(() => {
    recalculateCartTotals();
  });

  document.addEventListener('DOMContentLoaded', () => {
    recalculateCartTotals();
    const cartView = document.getElementById('cart-view') || document.getElementById('cart');
    if (cartView) {
      observer.observe(cartView, { childList: true, subtree: true });
    }
  });
})();
