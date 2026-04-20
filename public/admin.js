// admin.js - Panel de administración para Chambatina
// Con autenticación mediante Bearer token

const API_BASE = '/api';
let token = localStorage.getItem('admin_token') || '';

// Elementos del DOM (verifica que estos IDs existan en tu admin.html)
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const tokenInput = document.getElementById('tokenInput');
const loginBtn = document.getElementById('loginBtn');
const pedidosBody = document.getElementById('pedidosBody');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const errorMsg = document.getElementById('errorMsg');

// Inicialización: mostrar la sección correspondiente según si hay token guardado
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    mostrarDashboard(true);
    cargarPedidos();
  } else {
    mostrarDashboard(false);
  }
});

// Evento de login
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const inputToken = tokenInput.value.trim();
    if (!inputToken) {
      mostrarError('Ingrese el token de administrador');
      return;
    }
    localStorage.setItem('admin_token', inputToken);
    token = inputToken;
    mostrarDashboard(true);
    cargarPedidos();
  });
}

// Cargar lista de pedidos desde el servidor (ruta protegida)
async function cargarPedidos() {
  mostrarError('');
  if (pedidosBody) pedidosBody.innerHTML = '<tr><td colspan="6">Cargando...<\/td><\/tr>';

  try {
    const response = await fetch(`${API_BASE}/pedidos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      mostrarError('Token inválido o expirado. Inicie sesión nuevamente.');
      logout();
      return;
    }

    if (!response.ok) {
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
    if (pedidosBody) pedidosBody.innerHTML = '<tr><td colspan="6">Error al cargar<\/td><\/tr>';
  }
}

// Renderizar tabla de pedidos
function mostrarPedidos(pedidos) {
  if (!pedidosBody) return;
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

// Mostrar mensaje de error
function mostrarError(msg) {
  if (errorMsg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = msg ? 'block' : 'none';
  }
}

// Mostrar/ocultar secciones de login y dashboard
function mostrarDashboard(show) {
  if (loginSection && dashboardSection) {
    loginSection.style.display = show ? 'none' : 'block';
    dashboardSection.style.display = show ? 'block' : 'none';
  }
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('admin_token');
  token = '';
  mostrarDashboard(false);
  if (tokenInput) tokenInput.value = '';
}

// Eventos de logout y refresh
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (refreshBtn) refreshBtn.addEventListener('click', cargarPedidos);

// Utilidad para escapar HTML y evitar XSS
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}
