(function() {
  // 1. PERSIST VIEW STATE (30-Min View Persistence)
  const VIEW_KEY = 'poshella_saved_page';
  const TIME_KEY = 'poshella_saved_time';
  const THIRTY_MINS = 30 * 60 * 1000;

  // Intercept view switches
  function applyPersistence() {
    if (typeof window.switchView === 'function' && !window._persistenceWrapped) {
      const originalSwitch = window.switchView;
      window.switchView = function(viewId) {
        try {
          localStorage.setItem(VIEW_KEY, viewId);
          localStorage.setItem(TIME_KEY, Date.now().toString());
        } catch(e) {}
        originalSwitch(viewId);
      };
      window._persistenceWrapped = true;
    }
  }

  // Restore active view immediately
  function restoreView() {
    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      const savedTime = localStorage.getItem(TIME_KEY);
      if (savedView && savedTime) {
        if (Date.now() - parseInt(savedTime, 10) < THIRTY_MINS) {
          if (typeof window.switchView === 'function') {
            window.switchView(savedView);
          }
        }
      }
    } catch(e) {}
  }

  // 2. SILENT TOAST NOTIFICATION (Replaces Browser Alerts)
  window.alert = function(msg) {
    showToast(msg || 'Added to cart!');
  };

  function showToast(msg) {
    let toast = document.getElementById('poshella-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'poshella-toast';
      toast.style.cssText = 'position:fixed; bottom:75px; left:50%; transform:translateX(-50%); background:#ff2a75; color:#ffffff; padding:10px 22px; border-radius:25px; font-size:0.82rem; font-weight:bold; z-index:10000; box-shadow:0 4px 15px rgba(255, 42, 117, 0.4); text-align:center; transition:opacity 0.3s ease; opacity:0; pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2200);
  }

  // 3. CALL TO ORDER MODAL (09020211981)
  window.openCallToOrder = function() {
    let modal = document.getElementById('callOrderModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'callOrderModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:10001; padding:20px; box-sizing:border-box;';
    modal.innerHTML = `
      <div style="background:#141414; border:1px solid #222; border-radius:16px; width:100%; max-width:320px; padding:22px; text-align:center; color:#fff; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        <h3 style="margin:0 0 10px 0; font-size:1.1rem; color:#ff2a75; font-weight:bold;">📞 Call to Order</h3>
        <p style="font-size:0.82rem; color:#aaa; margin-bottom:20px; line-height:1.4;">Speak with our Poshella sales representative to place your order directly.</p>
        <a href="tel:09020211981" style="display:block; background:#ff2a75; color:#fff; text-decoration:none; padding:12px; border-radius:10px; font-weight:bold; margin-bottom:10px; font-size:0.88rem;">Call 09020211981</a>
        <a href="https://wa.me/2349020211981" target="_blank" style="display:block; background:#25D366; color:#fff; text-decoration:none; padding:12px; border-radius:10px; font-weight:bold; margin-bottom:16px; font-size:0.88rem;">WhatsApp Chat</a>
        <button onclick="document.getElementById('callOrderModal').remove()" style="background:transparent; border:none; color:#777; font-size:0.82rem; cursor:pointer; font-weight:bold;">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  };

  // 4. CATEGORIES TOGGLE
  window.openCategoryView = function() {
    if (typeof window.switchView === 'function') {
      window.switchView('categories');
    }
  };

  // 5. ORDERS HISTORY VIEW
  window.renderOrdersHistory = function() {
    const container = document.getElementById('ordersListContainer') || document.getElementById('orders-container');
    if (!container) return;

    const orders = JSON.parse(localStorage.getItem('poshella_orders') || '[]');

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="background: #ffffff; border-radius: 12px; padding: 40px 20px; text-align: center; margin: 20px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
          <div style="font-size: 2.8rem; margin-bottom: 10px;">🛍️</div>
          <h3 style="color: #111111; font-size: 1.05rem; font-weight: bold; margin-bottom: 6px;">You haven't made any orders yet</h3>
          <p style="color: #666666; font-size: 0.8rem; margin-bottom: 20px; line-height: 1.4;">Explore our wide range of cosmetics and place your first order today!</p>
          <a href="javascript:void(0)" onclick="switchView('home')" style="display: inline-block; background: #ff2a75; color: #ffffff; padding: 10px 24px; border-radius: 20px; font-weight: bold; font-size: 0.85rem; text-decoration: none; box-shadow: 0 4px 10px rgba(255, 42, 117, 0.4);">Order Now</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div style="background: #141414; border: 1px solid #222; border-radius: 10px; padding: 12px; margin-bottom: 12px; color: #fff;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #222; padding-bottom: 8px; margin-bottom: 10px;">
          <span style="color: #ff2a75; font-weight: bold; font-size: 0.8rem;">Order #${order.id || 'N/A'}</span>
          <span style="color: #28a745; background: rgba(40,167,69,0.15); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">${order.status || 'Confirmed'}</span>
        </div>
        <div style="font-size: 0.75rem; color: #aaa; margin-bottom: 8px;">Date: ${order.date || 'Recent'}</div>
        <div style="border-top: 1px solid #222; padding-top: 8px; display: flex; justify-content: space-between; font-weight: bold; color: #fff; font-size: 0.85rem;">
          <span>Total Paid:</span>
          <span style="color: #ff2a75;">₦${(order.totalAmount || 0).toLocaleString()}</span>
        </div>
      </div>
    `).join('');
  };

  // Attach handlers immediately & after DOM ready
  function initFixes() {
    applyPersistence();
    restoreView();

    // Wire Call to Order header trigger
    document.querySelectorAll('.call-to-order, [onclick*="Call"], header span, header div').forEach(el => {
      if (el.textContent.includes('Call to Order')) {
        el.style.cursor = 'pointer';
        el.onclick = (e) => {
          e.preventDefault();
          window.openCallToOrder();
        };
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFixes);
  } else {
    initFixes();
  }
})();
