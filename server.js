import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Sirve index.html, estilos, scripts, etc. desde /public
app.use(express.static(path.join(__dirname, "public")));

// ================================
// BASE DE DATOS MANUAL DE CPK
// SOLO DEJA AQUÍ LOS CPK LIMPIOS
// ================================
const CPK_DB = {
  "260443": {
    estado: "EN AGENCIA",
    descripcion: "Tu paquete fue recibido y ya está en agencia, listo para continuar avanzando dentro del proceso logístico."
  },
  "260440": {
    estado: "EN AGENCIA",
    descripcion: "Tu paquete fue recibido y ya se encuentra en agencia, en espera de continuar su recorrido logístico."
  },
  "259847": {
    estado: "EN AGENCIA",
    descripcion: "Tu paquete ya está en agencia y debidamente registrado para seguir avanzando en el proceso."
  },
  "259844": {
    estado: "EN AGENCIA",
    descripcion: "Tu paquete fue recibido en agencia y está preparado para continuar con su siguiente fase logística."
  }
};

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta para consultar CPK
app.get("/api/rastreo/:cpk", (req, res) => {
  const cpk = String(req.params.cpk || "").replace(/\D/g, "");
  const info = CPK_DB[cpk];

  if (!info) {
    return res.status(404).json({
      ok: false,
      mensaje: "No encontramos ese número en este momento."
    });
  }

  return res.json({
    ok: true,
    cpk,
    estado: info.estado,
    descripcion: info.descripcion
  });
});

// Ruta de prueba del servidor
app.get("/api/health", (req, res) => {
  res.json({ ok: true, mensaje: "Servidor Chambatina activo" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
