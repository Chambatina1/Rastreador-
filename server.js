<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rastreador Chambatina</title>

<style>
body {
  font-family: Arial, sans-serif;
  background: #111;
  color: #fff;
  margin: 0;
  padding: 0;
}

.wrap {
  max-width: 900px;
  margin: 60px auto;
  padding: 20px;
}

.card {
  background: #1b1b1b;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
}

input {
  width: 70%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-size: 16px;
}

button {
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  background: orange;
  color: black;
  font-weight: bold;
  cursor: pointer;
}

.result {
  margin-top: 20px;
  padding: 20px;
  border-radius: 12px;
  background: #222;
}

.estado {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
}

.ok { color: #00ff88; }
.warn { color: orange; }
.error { color: red; }

</style>
</head>

<body>

<div class="wrap">
  <div class="card">
    <h1>Rastreador Chambatina</h1>
    <p>Ingrese su número CPK</p>

    <input id="codigo" placeholder="Ej: 260443">
    <button onclick="buscar()">Buscar</button>

    <div id="resultado" class="result"></div>
  </div>
</div>

<script>

// ===============================
// 🔒 BASE DE DATOS PRIVADA
// (PEGA AQUÍ SIN ORDEN, COMO VIENE)
// ===============================

const DATA = `
CPK-0260443 EN AGENCIA 2026-03-26
CPK-0260440 EN AGENCIA 2026-03-26
CPK-0259847 CLASIFICADO 2026-03-24
CPK-0259557 DESPACHO 2026-03-23
`;

// ===============================
// 🔧 PROCESADOR AUTOMÁTICO
// ===============================

function parseData(text) {
  const db = {};
  const lines = text.split("\n");

  lines.forEach(line => {
    const clean = line.trim();
    if (!clean) return;

    const numero = clean.match(/\d+/);
    if (!numero) return;

    const estadoMatch = clean.match(/EN AGENCIA|CLASIFICADO|DESPACHO|DESAGRUPE|DISTRIBUCION|ENTREGADO/i);

    db[numero[0]] = {
      estado: estadoMatch ? estadoMatch[0].toUpperCase() : "PROCESANDO",
      raw: clean
    };
  });

  return db;
}

const DB = parseData(DATA);

// ===============================
// 🚀 BUSCADOR
// ===============================

function buscar() {
  const codigo = document.getElementById("codigo").value.trim();
  const resultado = document.getElementById("resultado");

  if (!codigo) {
    resultado.innerHTML = "<div class='error'>Ingrese un código válido</div>";
    return;
  }

  const data = DB[codigo];

  if (!data) {
    resultado.innerHTML = "<div class='error'>No encontrado</div>";
    return;
  }

  const mensaje = generarMensaje(data.estado);

  resultado.innerHTML = `
    <div class="estado ok">${data.estado}</div>
    <div>${mensaje}</div>
  `;
}

// ===============================
// 🧠 MENSAJES INTELIGENTES
// ===============================

function generarMensaje(estado) {

  if (estado === "EN AGENCIA") {
    return "Tu paquete fue recibido y se encuentra en nuestras instalaciones.";
  }

  if (estado === "CLASIFICADO") {
    return "Tu paquete fue organizado por destino y está listo para su próximo movimiento.";
  }

  if (estado === "DESPACHO") {
    return "Tu paquete está saliendo del proceso logístico.";
  }

  if (estado === "DESAGRUPE") {
    return "Tu paquete está siendo separado del contenedor.";
  }

  if (estado === "DISTRIBUCION") {
    return "Tu paquete está en ruta final.";
  }

  if (estado === "ENTREGADO") {
    return "Entrega completada.";
  }

  return "Tu paquete está en proceso.";
}

</script>

</body>
</html>
