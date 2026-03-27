import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor Chambatina activo");
});

const rawData = `
CHAMBATINA MIAMI GEO MIA CPK-0260443 EN AGENCIA
CHAMBATINA MIAMI GEO MIA CPK-0260440 EN AGENCIA
CHAMBATINA MIAMI GEO MIA CPK-0260199 EMBARCADO
`;

const ESTADOS_VALIDOS = [
  "ENTREGADO",
  "EN AGENCIA",
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
    if (lineaMayus.includes(estado.toUpperCase())) {
      return estado;
    }
  }

  return "SIN ESTADO";
}

function explicarEstado(estado) {
  const e = estado.toUpperCase();

  if (e === "ENTREGADO") return "Su paquete fue entregado.";
  if (e.includes("EN AGENCIA")) return "Su paquete fue recibido en agencia.";
  if (e === "EMBARCADO") return "Su paquete ya salió en barco.";
  if (e === "CLASIFICADO") return "Su paquete fue clasificado.";
  if (e === "DESAGRUPE") return "Su paquete está en desagrupación.";
  if (e === "DESPACHO") return "Su paquete está en despacho.";
  if (e.includes("DISTRIBUCION") || e.includes("DISTRIBUCIÓN")) return "Su paquete está en distribución.";
  if (e.includes("ALMACEN") || e.includes("ALMACÉN")) return "Su paquete está en almacén.";
  if (e === "ARRIBO") return "Su paquete arribó.";
  if (e === "CANAL ROJO") return "Su paquete está en revisión.";
  return "Su paquete está en proceso logístico.";
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
      explicacion: explicarEstado(estado)
    };
  }

  return base;
}

const paquetes = construirBase(rawData);

app.post("/buscar", (req, res) => {
  const codigo = String(req.body.cpk || "").replace(/[^\d]/g, "").trim();

  if (!codigo) {
    return res.json({ ok: false, mensaje: "Debe escribir un CPK válido" });
  }

  const resultado = paquetes[codigo];

  if (!resultado) {
    return res.json({ ok: false, mensaje: "No encontramos ese CPK" });
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
