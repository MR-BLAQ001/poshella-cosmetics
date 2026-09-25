(function() {
  // --- FIX 1: Active Page View Persistence on Refresh ---
  const SAVED_VIEW_KEY = 'poshella_active_view';

  // Save current view whenever switchView is called
  const originalSwitchView = window.switchView;
  window.switchView = function(viewId) {
    if (typeof originalSwitchView === 'function') {
      originalSwitchView(viewId);
    } else {
      // Fallback view toggle if default switchView is missing
      document.querySelectorAll('.view-section, [id$="-view"]').forEach(el => el.style.display = 'none');
      const target = document.getElementById(viewId) || document.getElementById(viewId + '-view');
      if (target) target.style.display = 'block';
    }
    localStorage.setItem(SAVED_VIEW_KEY, viewId);
  };

  // Restore saved view on page refresh
  document.addEventListener('DOMContentLoaded', () => {
    const savedView = localStorage.getItem(SAVED_VIEW_KEY);
    if (savedView && savedView !== 'home') {
      setTimeout(() => {
        window.switchView(savedView);
      }, 100);
    }
  });

  // --- FIX 2: Silent Add-to-Cart Notification ---
  // Overrides standard browser alert with a clean toast notification
  window.alert = function(msg) {
    if (msg && (msg.toLowerCase().includes('cart') || msg.toLowerCase().includes('added'))) {
      showToast(msg);
      return;
    }
    console.log("Alert suppressed:", msg);
  };

  function showToast(message) {
    let toast = document.getElementById('poshella-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'poshella-toast';
      toast.style.cssText = 'position:fixed; bottom:70px; left:50%; transform:translateX(-50%); background:#ff2a75; color:#fff; padding:10px 20px; border-radius:20px; font-size:0.85rem; font-weight:bold; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:opacity 0.3s; opacity:0;';
      document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  }

  // --- FIX 3: Categories Section Toggle ---
  window.openCategory = function(catName) {
    const categoryView = document.getElementById('categories') || document.getElementById('categories-view');
    if (categoryView) {
      window.switchView('categories');
    }
    // Filter products if filter function exists
    if (typeof window.filterProductsByCategory === 'function') {
      window.filterProductsByCategory(catName);
    }
  };

  // --- FIX 4: Call to Order Modal ---
  window.openCallToOrder = function() {
    let modal = document.getElementById('callOrderModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'callOrderModal';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:10000;';
      modal.innerHTML = `
        <div style="background:#1c1c1e; border:1px solid #333; border-radius:16px; width:85%; max-width:320px; padding:20px; text-align:center; color:#fff;">
          <h3 style="margin-bottom:15px; font-size:1.1rem; color:#ff2a75;">📞 Call to Order</h3>
          <p style="font-size:0.85rem; color:#ccc; margin-bottom:20px;">Speak directly with our sales representative to place your order instantly.</p>
          <a href="tel:09020211981" style="display:block; background:#ff2a75; color:#fff; text-decoration:none; padding:12px; border-radius:10px; font-weight:bold; margin-bottom:10px; font-size:0.9rem;">Call 09020211981</a>
          <a href="https://wa.me/2349020211981" target="_blank" style="display:block; background:#25D366; color:#fff; text-decoration:none; padding:12px; border-radius:10px; font-weight:bold; margin-bottom:15px; font-size:0.9rem;">WhatsApp Us</a>
          <button onclick="document.getElementById('callOrderModal').remove()" style="background:transparent; border:none; color:#888; font-size:0.85rem; cursor:pointer;">Close</button>
        </div>
      `;
      document.body.appendChild(modal);
    }
  };

  // Attach Call to Order trigger to header elements automatically
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.call-to-order, [onclick*="Call"], header a[href*="tel"]').forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        window.openCallToOrder();
      };
    });
  });

})();

// --- FIX 5: Render Orders History Section ---
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

// Automatically attempt rendering orders on page load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.renderOrdersHistory === 'function') {
    window.renderOrdersHistory();
  }
});
