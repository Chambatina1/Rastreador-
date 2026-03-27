import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor Chambatina activo");
});

/*
PEGA TUS DATOS AQUÍ ABAJO, TAL COMO LOS CORTAS Y PEGAS
No importa si tienen muchas columnas, espacios o tabulaciones.
*/
const rawData = `
CHAMBATINA MIAMI	GEO MIA		CPK-0260443	EN AGENCIA	No	ENVIOS FACTURADOS
CHAMBATINA MIAMI	GEO MIA		CPK-0260440	EN AGENCIA	No	ENVIOS FACTURADOS
CHAMBATINA MIAMI	GEO MIA		CPK-0260445	EN AGENCIA	No	ENVIOS FACTURADOS
CHAMBATINA MIAMI	GEO MIA		CPK-0260199	EMBARCADO	Sí	CPK-314 STORM/(SEGU 5662210)	ENVIO	BATERIA 51 V 100 AH
CHAMBATINA MIAMI	GEO MIA		CPK-0260200	EMBARCADO	Sí	CPK-314 STORM/(SEGU 5662210)	ENVIO	INVERSOR 10 MIL WATTS
`;

// Estados posibles. Puedes agregar más cuando quieras.
const ESTADOS_VALIDOS = [
  "ENTREGADO",
  "EN AGENCIA",
  "EN AGENCIA ",
  "EMBARCADO",
  "CLASIFICADO",
  "DESAGRUPE",
  "DESPACHO",
  "DISTRIBUCION",
  "DISTRIBUCIÓN",
  "EN ALMACEN",
  "EN ALMACÉN",
  "ARRIBO",
  "CANAL ROJO",
  "EN DISTRIBUCION",
  "EN DISTRIBUCIÓN"
];

function limpiarTexto(texto) {
  return String(texto || "")
    .replace(/\r/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extraerCPK(linea) {
  const m = linea.match(/CPK-\s*0*([0-9]+)/i);
  return m ? m[1] : null;
}

function extraerEstado(linea) {
  const lineaMayus = limpiarTexto(linea).toUpperCase();

  for (const estado of ESTADOS_VALIDOS) {
    if (lineaMayus.includes(estado.toUpperCase().trim())) {
      return estado.trim();
    }
  }
  return "SIN ESTADO";
}

function explicarEstado(estado) {
  const e = estado.toUpperCase();

  if (e === "ENTREGADO") {
    return "Su paquete fue entregado. Si desea, puede grabar un video de la entrega para compartir su experiencia con Chambatina.";
  }
  if (e.includes("EN AGENCIA")) {
    return "Su paquete ya fue recibido en agencia y está dentro del flujo logístico previo a la salida.";
  }
  if (e === "EMBARCADO") {
    return "Su paquete ya salió en barco y continúa su trayecto logístico hacia Cuba.";
  }
  if (e === "CLASIFICADO") {
    return "Su paquete fue identificado y organizado según destino, provincia o almacén para su siguiente movimiento.";
  }
  if (e === "DESAGRUPE") {
    return "Su paquete está siendo separado del contenedor para continuar el proceso interno.";
  }
  if (e === "DESPACHO") {
    return "Su paquete se encuentra en fase de despacho y avanzando dentro del proceso aduanal o logístico.";
  }
  if (e.includes("DISTRIBUCION") || e.includes("DISTRIBUCIÓN")) {
    return "Su paquete está en distribución hacia almacén, provincia o ruta final de entrega.";
  }
  if (e.includes("ALMACEN") || e.includes("ALMACÉN")) {
    return "Su paquete se encuentra en almacén, pendiente del próximo movimiento logístico.";
  }
  if (e === "ARRIBO") {
    return "Su paquete ya arribó y continúa el proceso interno correspondiente.";
  }
  if (e === "CANAL ROJO") {
    return "Su paquete está en una revisión más detallada dentro del proceso. Esto puede añadir tiempo adicional.";
  }

  return "Su paquete está dentro del proceso logístico.";
}

function construirBase(raw) {
  const base = {};
  const lineas = String(raw || "").split("\n");

  for (const lineaOriginal of lineas) {
    const linea = limpiarTexto(lineaOriginal);
    if (!linea) continue;

    const cpk = extraerCPK(linea);
    if (!cpk) continue;

    const estado = extraerEstado(linea);

    base[cpk] = {
      cpk,
      estado,
      explicacion: explicarEstado(estado),
      lineaOriginal
    };
  }

  return base;
}

const paquetes = construirBase(rawData);

app.post("/buscar", (req, res) => {
  const codigo = String(req.body.cpk || "")
    .replace(/[^\d]/g, "")
    .trim();

  if (!codigo) {
    return res.json({
      ok: false,
      mensaje: "Debe escribir un número CPK válido"
    });
  }

  const resultado = paquetes[codigo];

  if (!resultado) {
    return res.json({
      ok: false,
      mensaje: "No encontramos ese CPK"
    });
  }

  return res.json({
    ok: true,
    cpk: resultado.cpk,
    estado: resultado.estado,
    explicacion: resultado.explicacion
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
