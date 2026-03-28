<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Rastreador Chambatina</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0e0e0e;
      color: #fff;
      margin: 0;
      padding: 0;
    }

    .wrap {
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
    }

    .card {
      background: #1a1a1a;
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 25px;
      box-shadow: 0 0 20px rgba(0,0,0,0.4);
    }

    h1 {
      text-align: center;
      color: orange;
    }

    input {
      width: 80%;
      padding: 14px;
      border-radius: 10px;
      border: 2px solid #333;
      background: #111;
      color: #fff;
      font-size: 16px;
    }

    button {
      padding: 14px 20px;
      border-radius: 10px;
      border: none;
      background: orange;
      color: #000;
      font-weight: bold;
      cursor: pointer;
      margin-left: 10px;
    }

    #resultado {
      margin-top: 20px;
      font-size: 18px;
      padding: 15px;
      background: #111;
      border-radius: 10px;
      border: 1px solid #333;
    }

    .ok {
      color: #00ff88;
    }

    .error {
      color: #ff4d4d;
    }

    .info h2 {
      color: orange;
    }

    .info p {
      margin: 6px 0;
    }
  </style>
</head>

<body>

<div class="wrap">

  <!-- BUSCADOR -->
  <div class="card">
    <h1>Rastreador Chambatina</h1>

    <input id="cpk" placeholder="Ejemplo: 260443">
    <button onclick="buscar()">Buscar</button>

    <div id="resultado"></div>
  </div>

  <!-- INFORMACIÓN -->
  <div class="card info">
    <h2>Información de Servicios</h2>

    <p>Precio por libra: $1.99</p>
    <p>Compras por nuestros links: $1.80 por libra</p>
    <p>Recogida en puerta: $2.30 por libra</p>
    <p>Fee / arancel: entre $15 y $35 según el equipo</p>

    <br>

    <strong>Cajas:</strong>
    <p>12x12x12 hasta 60 lb → $45</p>
    <p>15x15x15 hasta 100 lb → $65</p>
    <p>16x16x16 hasta 100 lb → $85</p>

    <br>

    <strong>Equipos pesados:</strong>
    <p>15 a 35 lb → fee adicional</p>
    <p>Más de 200 lb → $45 adicional</p>

    <br>

    <strong>Tiempo estimado:</strong>
    <p>18 a 30 días una vez embarcado</p>

    <br>

    <strong>Productos:</strong>
    <p>Baterías, inversores, sistemas solares y más</p>
  </div>

</div>

<script>
async function buscar() {
  const cpk = document.getElementById("cpk").value.trim();
  const resultado = document.getElementById("resultado");

  if (!cpk) {
    resultado.innerHTML = "<span class='error'>Escribe un número válido.</span>";
    return;
  }

  resultado.innerHTML = "Buscando...";

  try {
    const url = `https://rastreador-tj5b.onrender.com/api/rastreo/${encodeURIComponent(cpk)}`;
    const res = await fetch(url);

    if (!res.ok) {
      resultado.innerHTML = "<span class='error'>Error del servidor.</span>";
      return;
    }

    const data = await res.json();

    if (!data.ok) {
      resultado.innerHTML = "<span class='error'>No se encontró el paquete.</span>";
      return;
    }

    resultado.innerHTML = `
      <span class="ok">
        Estado: ${data.estado}<br><br>
        ${data.descripcion}
      </span>
    `;

  } catch (err) {
    resultado.innerHTML = "<span class='error'>No hay conexión con el servidor.</span>";
    console.error(err);
  }
}
</script>

</body>
</html>
