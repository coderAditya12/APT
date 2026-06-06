const API_BASE = 'http://localhost:3000/api/orders';

// ── State ────────────────────────────────────────────────────────────────────
const orders = new Map(); // id → order object

// ── DOM refs ─────────────────────────────────────────────────────────────────
const ordersGrid       = document.getElementById('ordersGrid');
const emptyState       = document.getElementById('emptyState');
const connectionDot    = document.getElementById('connectionDot');
const connectionLabel  = document.getElementById('connectionLabel');
const tickerText       = document.getElementById('tickerText');
const orderCountEl     = document.getElementById('orderCount');
const createForm       = document.getElementById('createForm');
const updateForm       = document.getElementById('updateForm');
const deleteForm       = document.getElementById('deleteForm');
const updateIdInput    = document.getElementById('updateId');
const deleteIdInput    = document.getElementById('deleteId');
const toastEl          = document.getElementById('toast');

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(message, type = 'info') {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3200);
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function setTicker(text) {
  tickerText.textContent = text;
  tickerText.style.animation = 'none';
  requestAnimationFrame(() => {
    tickerText.style.animation = '';
  });
}

// ── Time formatter ────────────────────────────────────────────────────────────
function formatTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Render order card ─────────────────────────────────────────────────────────
function renderCard(order) {
  const card = document.createElement('div');
  card.className = `order-card ${order.status}`;
  card.dataset.id = order._id;
  card.innerHTML = `
    <div class="order-card-header">
      <div>
        <div class="order-customer">${escapeHtml(order.customer_name)}</div>
        <div class="order-product"> ${escapeHtml(order.product_name)}</div>
      </div>
      <span class="status-badge ${order.status}">${order.status}</span>
    </div>
    <div class="order-card-footer">
      <span class="order-id">${order._id}</span>
      <span class="order-time">${formatTime(order.updated_at)}</span>
    </div>
    <div style="margin-top:0.4rem">
      <span class="copy-hint">Click to copy ID →</span>
    </div>
  `;

  // Click to copy ID and pre-fill update/delete forms
  card.addEventListener('click', () => {
    navigator.clipboard.writeText(order._id).catch(() => {});
    updateIdInput.value = order._id;
    deleteIdInput.value = order._id;
    showToast(`ID copied: ${order._id.slice(-8)}...`, 'info');
  });

  return card;
}

// ── Update the DOM grid ───────────────────────────────────────────────────────
function syncGrid() {
  // Remove cards for deleted orders
  ordersGrid.querySelectorAll('.order-card').forEach(card => {
    if (!orders.has(card.dataset.id)) {
      card.remove();
    }
  });

  // Add/update cards for current orders
  orders.forEach((order) => {
    const existing = ordersGrid.querySelector(`[data-id="${order._id}"]`);
    if (existing) {
      // Update existing card in place
      const badge = existing.querySelector('.status-badge');
      const time  = existing.querySelector('.order-time');
      badge.className = `status-badge ${order.status}`;
      badge.textContent = order.status;
      time.textContent = formatTime(order.updated_at);
      existing.className = `order-card ${order.status} flash-update`;
      setTimeout(() => existing.classList.remove('flash-update'), 700);
    } else {
      // Prepend new card
      const card = renderCard(order);
      ordersGrid.insertBefore(card, ordersGrid.firstChild);
    }
  });

  // Toggle empty state
  emptyState.style.display = orders.size === 0 ? 'flex' : 'none';
  orderCountEl.textContent = orders.size;
}

// ── Handle SSE events ─────────────────────────────────────────────────────────
function handleSSEEvent(payload) {
  const { type, data } = payload;

  if (type === 'connected') {
    setTicker(`Connected — client ID: ${data.clientId}`);
    return;
  }

  if (type === 'insert') {
    orders.set(data._id, data);
    syncGrid();
    setTicker(`[INSERT] ${data.customer_name} → ${data.product_name} (${data.status})`);
    showToast(`New order: ${data.product_name} for ${data.customer_name}`, 'success');
  }

  else if (type === 'update') {
    orders.set(data._id, data);
    syncGrid();
    setTicker(`[UPDATE] ${data.customer_name}'s ${data.product_name} → ${data.status}`);
    showToast(`Status updated → ${data.status}`, 'info');
  }

  else if (type === 'delete') {
    const id = data._id;
    // Animate card out before removing
    const card = ordersGrid.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.classList.add('flash-delete');
      setTimeout(() => {
        orders.delete(id);
        syncGrid();
      }, 420);
    } else {
      orders.delete(id);
      syncGrid();
    }
    setTicker(`[DELETE] Order ${String(id).slice(-8)}... removed`);
    showToast('Order deleted', 'error');
  }
}

// ── SSE Connection ────────────────────────────────────────────────────────────
function connectSSE() {
  connectionDot.className  = 'connection-dot connecting';
  connectionLabel.textContent = 'Connecting...';

  const evtSource = new EventSource(`${API_BASE}/stream`);

  evtSource.onopen = () => {
    connectionDot.className  = 'connection-dot connected';
    connectionLabel.textContent = 'Live';
  };

  evtSource.onmessage = (e) => {
    try {
      const payload = JSON.parse(e.data);
      handleSSEEvent(payload);
    } catch (err) {
      console.warn('Failed to parse SSE message:', e.data);
    }
  };

  evtSource.onerror = () => {
    connectionDot.className  = 'connection-dot error';
    connectionLabel.textContent = 'Reconnecting...';
    // EventSource auto-reconnects — no manual retry needed
  };
}

// ── Fetch initial orders ──────────────────────────────────────────────────────
async function loadOrders() {
  try {
    const res  = await fetch(API_BASE);
    const data = await res.json();
    data.forEach(order => orders.set(order._id, order));
    syncGrid();
  } catch (err) {
    showToast('Failed to load orders from server', 'error');
  }
}

// ── Create order ──────────────────────────────────────────────────────────────
createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('createBtn');
  btn.disabled = true;

  const body = {
    customer_name: document.getElementById('customerName').value.trim(),
    product_name:  document.getElementById('productName').value.trim(),
    status:        document.getElementById('createStatus').value,
  };

  try {
    const res = await fetch(API_BASE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    createForm.reset();
    // SSE will handle the DOM update automatically
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
  }
});

// ── Update status ─────────────────────────────────────────────────────────────
updateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('updateBtn');
  btn.disabled = true;

  const id     = updateIdInput.value.trim();
  const status = document.getElementById('updateStatus').value;

  if (!id) { showToast('Paste an Order ID first', 'error'); btn.disabled = false; return; }

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    updateForm.reset();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
  }
});

// ── Delete order ──────────────────────────────────────────────────────────────
deleteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('deleteBtn');
  btn.disabled = true;

  const id = deleteIdInput.value.trim();
  if (!id) { showToast('Paste an Order ID first', 'error'); btn.disabled = false; return; }

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).error);
    deleteForm.reset();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Boot ──────────────────────────────────────────────────────────────────────
loadOrders();
connectSSE();
