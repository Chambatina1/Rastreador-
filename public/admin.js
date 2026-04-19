let token = null;

// Esperar a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const nuevoBtn = document.getElementById("nuevoBtn");
  const cancelarBtn = document.getElementById("cancelarBtn");
  const guardarBtn = document.getElementById("guardarBtn");
  const tabBtns = document.querySelectorAll(".tab-btn");

  if (loginBtn) loginBtn.addEventListener("click", login);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (refreshBtn) refreshBtn.addEventListener("click", () => cargarDatosActivos());
  if (nuevoBtn) nuevoBtn.addEventListener("click", () => mostrarFormulario());
  if (cancelarBtn) cancelarBtn.addEventListener("click", () => ocultarFormulario());
  if (guardarBtn) guardarBtn.addEventListener("click", guardarRegistro);
  if (tabBtns.length) tabBtns.forEach(btn => btn.addEventListener("click", cambiarPestana));
});

async function login() {
  const inputToken = document.getElementById("tokenInput").value;
  if (!inputToken) return;
  token = inputToken;
  try {
    const res = await fetch("/admin/registros", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      document.getElementById("loginPanel").style.display = "none";
      document.getElementById("adminPanel").style.display = "block";
      cargarDatosActivos();
    } else {
      document.getElementById("loginError").innerText = "Token inválido";
      token = null;
    }
  } catch {
    document.getElementById("loginError").innerText = "Error de conexión";
    token = null;
  }
}

function logout() {
  token = null;
  document.getElementById("loginPanel").style.display = "block";
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("tokenInput").value = "";
}

function cambiarPestana(e) {
  const targetId = e.target.getAttribute("data-tab");
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.add("hidden"));
  document.getElementById(targetId).classList.remove("hidden");
  cargarDatosActivos();
}

function cargarDatosActivos() {
  const visible = document.querySelector(".tab-content:not(.hidden)").id;
  if (visible === "tabRegistros") cargarRegistros();
  else if (visible === "tabPedidos") cargarPedidos();
}

// ================== REGISTROS (carnets) ==================
async function cargarRegistros() {
  const res = await fetch("/admin/registros", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  const contenedor = document.getElementById("listaRegistros");
  if (!Array.isArray(data)) {
    contenedor.innerHTML = "<p>Error al cargar datos</p>";
    return;
  }
  if (data.length === 0) {
    contenedor.innerHTML = "<p>No hay registros aún.</p>";
    return;
  }
  contenedor.innerHTML = data.map(reg => `
    <div class="card" data-id="${reg.id}">
      <h3>${escapeHtml(reg.carnet)} - ${escapeHtml(reg.estado)}</h3>
      <p><strong>Fecha:</strong> ${escapeHtml(reg.fecha)}</p>
      <p><strong>Descripción:</strong> ${escapeHtml(reg.descripcion)}</p>
      <div class="card-actions">
        <button class="editar" onclick="editarRegistro(${reg.id})">✏️ Editar</button>
        <button class="eliminar" onclick="eliminarRegistro(${reg.id})">🗑️ Eliminar</button>
      </div>
    </div>
  `).join("");
}

window.editarRegistro = async (id) => {
  const res = await fetch("/admin/registros", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const registros = await res.json();
  const registro = registros.find(r => r.id === id);
  if (registro) mostrarFormulario(registro);
};

window.eliminarRegistro = async (id) => {
  if (!confirm("¿Eliminar este registro?")) return;
  const res = await fetch(`/admin/registros/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (res.ok) cargarRegistros();
  else alert("Error al eliminar");
};

function mostrarFormulario(registro = null) {
  const form = document.getElementById("formularioRegistro");
  const title = document.getElementById("formTitle");
  const editId = document.getElementById("editId");
  const carnetInput = document.getElementById("carnet");
  const estadoInput = document.getElementById("estado");
  const fechaInput = document.getElementById("fecha");
  const descripcionInput = document.getElementById("descripcion");

  if (registro) {
    title.innerText = "Editar registro";
    editId.value = registro.id;
    carnetInput.value = registro.carnet;
    estadoInput.value = registro.estado;
    fechaInput.value = registro.fecha || "";
    descripcionInput.value = registro.descripcion || "";
  } else {
    title.innerText = "Nuevo registro";
    editId.value = "";
    carnetInput.value = "";
    estadoInput.value = "";
    fechaInput.value = new Date().toLocaleDateString();
    descripcionInput.value = "";
  }
  form.classList.remove("hidden");
}

function ocultarFormulario() {
  document.getElementById("formularioRegistro").classList.add("hidden");
}

async function guardarRegistro() {
  const id = document.getElementById("editId").value;
  const carnet = document.getElementById("carnet").value.trim();
  const estado = document.getElementById("estado").value.trim();
  const fecha = document.getElementById("fecha").value.trim() || new Date().toLocaleDateString();
  const descripcion = document.getElementById("descripcion").value.trim();

  if (!carnet || !estado) {
    alert("Carnet y estado son obligatorios");
    return;
  }

  const method = id ? "PUT" : "POST";
  const url = id ? `/admin/registros/${id}` : "/admin/registros";
  const body = JSON.stringify({ carnet, estado, fecha, descripcion });

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body
  });

  if (res.ok) {
    ocultarFormulario();
    cargarRegistros();
  } else {
    const error = await res.json();
    alert("Error: " + (error.error || "No se pudo guardar"));
  }
}

// ================== PEDIDOS ==================
async function cargarPedidos() {
  const res = await fetch("/admin/pedidos", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  const contenedor = document.getElementById("listaPedidos");
  if (!Array.isArray(data)) {
    contenedor.innerHTML = "<p>Error al cargar pedidos</p>";
    return;
  }
  if (data.length === 0) {
    contenedor.innerHTML = "<p>No hay pedidos aún.</p>";
    return;
  }
  contenedor.innerHTML = data.map(ped => `
    <div class="card pedido-card" data-id="${ped.id}">
      <h3>Pedido #${ped.id} - ${escapeHtml(ped.estado)}</h3>
      <p><strong>Link:</strong> <a href="${escapeHtml(ped.link)}" target="_blank">${escapeHtml(ped.link.substring(0, 60))}...</a></p>
      <p><strong>Comprador:</strong> ${escapeHtml(ped.compradorNombre || "-")} (${escapeHtml(ped.compradorTelefono || "-")})</p>
      <p><strong>Recibe:</strong> ${escapeHtml(ped.recibeNombre || "-")} - Carnet: ${escapeHtml(ped.recibeCarnet || "-")}</p>
      <p><strong>Dirección:</strong> ${escapeHtml(ped.direccion || "-")}</p>
      <p><strong>Notas:</strong> ${escapeHtml(ped.notas || "-")}</p>
      <p><strong>Fecha creación:</strong> ${new Date(ped.createdAt).toLocaleString()}</p>
      <div class="card-actions">
        <select class="estado-select" data-id="${ped.id}">
          <option value="pendiente" ${ped.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="confirmado" ${ped.estado === "confirmado" ? "selected" : ""}>Confirmado</option>
          <option value="entregado" ${ped.estado === "entregado" ? "selected" : ""}>Entregado</option>
          <option value="cancelado" ${ped.estado === "cancelado" ? "selected" : ""}>Cancelado</option>
        </select>
        <button class="actualizar-estado" data-id="${ped.id}">Actualizar</button>
        <button class="eliminar-pedido" data-id="${ped.id}">🗑️ Eliminar</button>
      </div>
    </div>
  `).join("");

  // Event listeners para los selects y botones de pedidos
  document.querySelectorAll(".actualizar-estado").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = btn.getAttribute("data-id");
      const select = document.querySelector(`.estado-select[data-id="${id}"]`);
      const nuevoEstado = select.value;
      await actualizarEstadoPedido(id, nuevoEstado);
    });
  });
  document.querySelectorAll(".eliminar-pedido").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = btn.getAttribute("data-id");
      if (confirm("¿Eliminar este pedido permanentemente?")) {
        await eliminarPedido(id);
      }
    });
  });
}

async function actualizarEstadoPedido(id, estado) {
  const res = await fetch(`/admin/pedidos/${id}/estado`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ estado })
  });
  if (res.ok) {
    cargarPedidos();
  } else {
    alert("Error al actualizar estado");
  }
}

async function eliminarPedido(id) {
  const res = await fetch(`/admin/pedidos/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (res.ok) cargarPedidos();
  else alert("Error al eliminar");
}

// Utilidad
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function(m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}
