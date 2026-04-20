// admin.js - Panel de administración para Chambatina
// Conexión directa con /api/pedidos

const API_BASE = '/api';
let token = localStorage.getItem('admin_token') || '';

// Elementos del DOM (deben existir en admin.html)
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const tokenInput = document.getElementById('token-input');
const loginBtn = document.getElementById('login-btn');
const pedidosBody = document.getElementById('pedidos-body');
const logoutBtn = document.getElementById('logout-btn');
const refreshBtn = document.getElementById('refresh-btn');
const errorMsg = document.getElementById('error-msg');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    mostrarDashboard(true);
    cargarPedidos();
  } else {
    mostrarDashboard(false);
  }
});

// Login
loginBtn.addEventListener('click', async () => {
  const inputToken = tokenInput.value.trim();
  if (!inputToken) {
    mostrarError('Ingrese el token de administrador');
    return;
  }

  // Guardar token (en un sistema real deberías validarlo contra el backend)
  localStorage.setItem('admin_token', inputToken);
  token = inputToken;
  mostrarDashboard(true);
  cargarPedidos();
});

// Cargar pedidos desde el servidor
async function cargarPedidos() {
  mostrarError('');
  pedidosBody.innerHTML = '<tr><td colspan="6">Cargando...<\/td><\/tr>';

  try {
    const response = await fetch(`${API_BASE}/pedidos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        mostrarError('Token inválido o expirado. Inicie sesión nuevamente.');
        logout();
        return;
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok || !data.pedidos) {
      throw new Error(data.mensaje || 'Error al obtener pedidos');
    }

    mostrarPedidos(data.pedidos);
  } catch (error) {
    console.error('Error cargando pedidos:', error);
    mostrarError('No se pudieron cargar los pedidos: ' + error.message);
    pedidosBody.innerHTML = '<tr><td colspan="6">Error al cargar<\/td><\/tr>';
  }
}

function mostrarPedidos(pedidos) {
  if (!pedidos || pedidos.length === 0) {
    pedidosBody.innerHTML = '<tr><td colspan="6">No hay pedidos registrados<\/td><\/tr>';
    return;
  }

  pedidosBody.innerHTML = '';
  pedidos.forEach(pedido => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(pedido.id || '')}<\/td>
      <td>${escapeHtml(pedido.nombre || '')}<\/td>
      <td>${escapeHtml(pedido.email || '')}<\/td>
      <td>${escapeHtml(pedido.telefono || '')}<\/td>
      <td>${escapeHtml(pedido.producto || '')}<\/td>
      <td>${escapeHtml(pedido.estado || 'pendiente')}<\/td>
    `;
    pedidosBody.appendChild(row);
  });
}

function mostrarError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = msg ? 'block' : 'none';
}

function mostrarDashboard(show) {
  if (show) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
  } else {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
  }
}

function logout() {
  localStorage.removeItem('admin_token');
  token = '';
  mostrarDashboard(false);
  if (tokenInput) tokenInput.value = '';
}

// Eventos
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (refreshBtn) refreshBtn.addEventListener('click', cargarPedidos);

// Utilidad para evitar XSS
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}
