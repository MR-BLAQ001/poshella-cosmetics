function renderOrdersHistory() {
  const container = document.getElementById('ordersListContainer');
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
    <div style="background: #141414; border: 1px solid #222; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #222; padding-bottom: 8px; margin-bottom: 10px;">
        <span style="color: #ff2a75; font-weight: bold; font-size: 0.8rem;">Order #${order.id}</span>
        <span style="color: #28a745; background: rgba(40,167,69,0.15); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">${order.status || 'Confirmed'}</span>
      </div>
      <div style="font-size: 0.75rem; color: #aaa; margin-bottom: 8px;">Date: ${order.date}</div>
      <div style="border-top: 1px solid #222; padding-top: 8px; display: flex; justify-content: space-between; font-weight: bold; color: #fff; font-size: 0.85rem;">
        <span>Total Paid:</span>
        <span style="color: #ff2a75;">₦${(order.totalAmount || 0).toLocaleString()}</span>
      </div>
    </div>
  `).join('');
}
