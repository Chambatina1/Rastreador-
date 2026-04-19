let token = null;

document.getElementById("loginBtn").addEventListener("click", async () => {
  const inputToken = document.getElementById("tokenInput").value;
  if (!inputToken) return;
  token = inputToken;
  // Probar autenticación
  try {
    const res = await fetch("/admin/registros", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      document.getElementById("loginPanel").style.display = "none";
      document.getElementById("adminPanel").style.display = "block";
      cargarRegistros();
    } else {
      document.getElementById("loginError").innerText = "Token inválido";
      token = null;
    }
  } catch {
    document.getElementById("loginError").innerText = "Error de conexión";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  token = null;
  document.getElementById("loginPanel").style.display = "block";
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("tokenInput").value = "";
});

document.getElementById("refreshBtn").addEventListener("click", cargarRegistros);
document.getElementById("nuevoBtn").addEventListener("click", () => mostrarFormulario());
document.getElementById("cancelarBtn").addEventListener("click", () => {
  document.getElementById("formulario").classList.add("hidden");
});
document.getElementById("guardarBtn").addEventListener("click", guardarRegistro);

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

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function(m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

function mostrarFormulario(registro = null) {
  const form = document.getElementById("formulario");
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
    fechaInput.value = "";
    descripcionInput.value = "";
  }
  form.classList.remove("hidden");
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
    document.getElementById("formulario").classList.add("hidden");
    cargarRegistros();
  } else {
    const error = await res.json();
    alert("Error: " + (error.error || "No se pudo guardar"));
  }
}

window.editarRegistro = async (id) => {
  const res = await fetch(`/admin/registros`, {
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
