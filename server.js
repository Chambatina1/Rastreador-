import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor Chambatina activo");
});

// =====================================================
// PEGA AQUI TU TEXTO BRUTO TAL COMO SALE DEL SISTEMA
// PUEDES PEGARLO DESORGANIZADO
// =====================================================
const RAW_DATA = `
CHAMBATINA MIAMI	GEO MIA		CPK-0260443	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	MISCELANEAS		2026-03-26	DIANARA CORREA SANCHEZ
CHAMBATINA MIAMI	GEO MIA		CPK-0260440	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	MISCELANEAS		2026-03-26	YISEL LOPEZ ALVAREZ
CHAMBATINA MIAMI	GEO MIA		CPK-0259847	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	MISCELANEAS		2026-03-24	CLIENTE EJEMPLO
CHAMBATINA MIAMI	GEO MIA		CPK-0259844	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	MISCELANEAS		2026-03-24	CLIENTE EJEMPLO 2
`;

// =====================================================
// PRECIOS CHAMBATINA
// =====================================================
const PRECIOS = {
  libraGeneral: 1.99,
  libraPuertaCasa: 2.30,
  libraTikTok: 1.80,
  feeManejoSeguroArancelTransporte: 10,
  equipos15a35: "15 a 35",
  equiposMas200Lb: 45,
  caja12: { medida: "12x12x12", maxLb: 60, precio: 45 },
  caja15: { medida: "15x15x15", maxLb: 100, precio: 65 },
  caja16: { medida: "16x16x16", maxLb: 100, precio: 85 }
};

function limpiarCodigo(valor = "") {
  return String(valor).replace(/\D/g, "").replace(/^0+/, "");
}

function extraerEstado(linea = "") {
  const estados = [
    "ENTREGADO",
    "EN DISTRIBUCION",
    "EN DISTRIBUCIÓN",
    "DISTRIBUCION",
    "DISTRIBUCIÓN",
    "DESPACHO",
    "DESAGRUPE",
    "CLASIFICADO",
    "EN AGENCIA",
    "EN ALMACEN",
    "EN ALMACÉN",
    "ARRIBO",
    "CANAL ROJO"
  ];

  const lineaUpper = linea.toUpperCase();

  for (const estado of estados) {
    if (lineaUpper.includes(estado)) return estado;
  }

  return "EN PROCESO";
}

function extraerFecha(linea = "") {
  const match = linea.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return match ? match[1] : "";
}

function generarDescripcion(estado) {
  switch (estado) {
    case "EN AGENCIA":
      return "Tu paquete fue recibido y ya se encuentra en agencia.";
    case "EN ALMACEN":
    case "EN ALMACÉN":
      return "Tu paquete se encuentra en almacén en proceso logístico.";
    case "CLASIFICADO":
      return "Tu paquete ya fue identificado y organizado para su ruta correspondiente.";
    case "DESAGRUPE":
      return "Tu paquete está siendo separado del contenedor para continuar el proceso.";
    case "DESPACHO":
      return "Tu paquete está saliendo del área aduanal para avanzar en la logística.";
    case "EN DISTRIBUCION":
    case "EN DISTRIBUCIÓN":
    case "DISTRIBUCION":
    case "DISTRIBUCIÓN":
      return "Tu paquete está en distribución hacia su zona de destino.";
    case "ARRIBO":
      return "Tu paquete ya arribó y continúa el proceso interno.";
    case "CANAL ROJO":
      return "Tu paquete está en revisión logística especial antes de continuar.";
    case "ENTREGADO":
      return "Tu paquete fue entregado correctamente.";
    default:
      return "Tu paquete continúa en proceso logístico.";
  }
}

function construirBaseDesdeTexto(rawText = "") {
  const db = {};
  const lineas = rawText
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  for (const linea of lineas) {
    const cpkMatch = linea.match(/CPK[-\s]*0*(\d+)/i);
    if (!cpkMatch) continue;

    const codigo = limpiarCodigo(cpkMatch[1]);
    if (!codigo) continue;

    const estado = extraerEstado(linea);
    const fecha = extraerFecha(linea);
    const descripcion = generarDescripcion(estado);

    db[codigo] = {
      fecha,
      estado,
      descripcion
    };
  }

  return db;
}

function diasTranscurridos(fechaStr) {
  if (!fechaStr) return 0;
  const inicio = new Date(fechaStr + "T00:00:00");
  const hoy = new Date();
  const ms = hoy - inicio;
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function mensajePorEstadoYTiempo(estado, dias) {
  if (estado === "ENTREGADO") {
    return "Entrega finalizada. Si desea, puede grabar un video de su experiencia con Chambatina.";
  }

  if (estado === "EN AGENCIA") {
    if (dias <= 3) return "Su paquete fue recibido y está iniciando el proceso logístico.";
    if (dias <= 6) return "Su paquete continúa en agencia, siendo preparado para los siguientes movimientos.";
    if (dias <= 9) return "Su paquete sigue avanzando en el flujo interno de organización.";
    return "Su paquete permanece en proceso y continúa su curso logístico normal.";
  }

  if (estado === "CLASIFICADO") {
    if (dias <= 3) return "Su paquete ya fue clasificado por ruta y destino.";
    if (dias <= 6) return "La clasificación fue realizada y continúa el paso siguiente de logística.";
    return "Su paquete sigue su avance luego de ser clasificado.";
  }

  if (estado === "DESAGRUPE") {
    if (dias <= 3) return "Su paquete está siendo separado del contenedor para continuar.";
    if (dias <= 6) return "El proceso de desagrupación sigue avanzando con normalidad.";
    return "Su paquete continúa luego del proceso de separación logística.";
  }

  if (estado === "DESPACHO") {
    if (dias <= 3) return "Su paquete está en salida desde el área correspondiente.";
    if (dias <= 6) return "El despacho continúa avanzando dentro del proceso.";
    return "Su paquete sigue su curso luego del despacho.";
  }

  if (
    estado === "EN DISTRIBUCION" ||
    estado === "EN DISTRIBUCIÓN" ||
    estado === "DISTRIBUCION" ||
    estado === "DISTRIBUCIÓN"
  ) {
    if (dias <= 3) return "Su paquete está siendo movido hacia el área de entrega.";
    if (dias <= 6) return "La distribución continúa según la logística de la zona.";
    return "Su paquete sigue en la etapa final de distribución.";
  }

  return "Su paquete continúa en proceso logístico.";
}

app.get("/api/rastreo/:codigo", (req, res) => {
  const DB = construirBaseDesdeTexto(RAW_DATA);
  const codigo = limpiarCodigo(req.params.codigo);
  const paquete = DB[codigo];

  if (!paquete) {
    return res.json({
      ok: false,
      mensaje: "No encontramos ese código en este momento. Revíselo y vuelva a intentarlo."
    });
  }

  const dias = diasTranscurridos(paquete.fecha);
  const explicacion = mensajePorEstadoYTiempo(paquete.estado, dias);

  return res.json({
    ok: true,
    codigo,
    fecha: paquete.fecha,
    estado: paquete.estado,
    descripcion: paquete.descripcion,
    explicacion
  });
});

app.get("/api/precios", (req, res) => {
  res.json(PRECIOS);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
