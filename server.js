import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// ========== MIDDLEWARES ==========
app.set("trust proxy", true);
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type", "x-session-id"] }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Ruta absoluta

// ========== POSTGRESQL PARA PEDIDOS ==========
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ========== CONTEXTO DEL CHAT ==========
const BUSINESS_CONTEXT = `...`; // (Mantén tu contexto, lo he abreviado por espacio, pero tú pon el original)

// ========== BASE LOCAL PEGADA (TABLA DE RASTREO) ==========
const RAW_TRACKING_SOURCE = `...`; // (Mantén tu tabla de rastreo completa)

// ========== HELPERS (todos los que ya tenías) ==========
function soloDigitos(v = "") { return String(v).replace(/\D/g, ""); }
function primerNombre(nombre = "") { return String(nombre).trim().split(/\s+/)[0] || ""; }
function normalizarLinea(linea = "") { return String(linea).replace(/\r/g, "").trim(); }
function normalizarCPK(texto = "") { const match = String(texto).match(/CPK[-\s]?(\d{6,10})/i); return match ? match[1] : ""; }
function parseFechaSegura(fechaTexto = "") { const m = String(fechaTexto).match(/\b(20\d{2})-(\d{2})-(\d{2})\b/); if (!m) return null; const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`); return Number.isNaN(d.getTime()) ? null : d; }
function diasNaturalesEntre(desdeTexto, hastaFecha = new Date()) { const desde = parseFechaSegura(desdeTexto); if (!desde) return 0; const hasta = new Date(hastaFecha); desde.setHours(0,0,0,0); hasta.setHours(0,0,0,0); return Math.max(0, Math.floor((hasta - desde) / 86400000)); }
function getSessionKey(req) { const explicit = String(req.headers["x-session-id"] || "").trim(); if (explicit) return explicit; const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim(); const ip = forwarded || req.ip || "anon"; return `sess:${ip}`; }
function construirSaludo(embarcador = "", consignatario = "", estado = "") { const nombre = primerNombre(consignatario || embarcador || "cliente"); return `Hola ${nombre}, su envío se encuentra actualmente en: ${estado}.`; }

// ========== ETAPAS POR DÍAS ==========
const ETAPAS = { ... }; // (Mantén tu objeto ETAPAS)

function estadoPorTiempo(fechaTexto = "") { ... } // (Mantén tu función)

// ========== PARSER DE LA BASE DE RASTREO ==========
function extraerCPKDesdeLinea(linea) { ... }
function extraerFechaDesdeLinea(linea) { ... }
function extraerNombreProbable(linea, fechaTexto) { ... }
function extraerCarnetsDeLinea(linea) { ... }
function extraerDescripcionProbable(linea) { ... }
function parseTrackingSource(raw) { ... }
function getTrackingDb() { return parseTrackingSource(RAW_TRACKING_SOURCE); }
function extraerResultadosLocalesPorCarnet(carnet) { ... }

// ========== MEMORIA TEMPORAL PARA CHAT ==========
const MEMORIA = new Map();
function getMemory(key) { ... }
function setMemory(key, patch) { ... }

// ========== DETECCIÓN DE INTENCIÓN ==========
function detectarPeso(texto) { ... }
function detectarTipoBicicleta(texto) { ... }
function detectarEcoflow(texto) { ... }
function detectarIntencion(texto) { ... }

function calcularEnvioGeneral(peso) { ... }
function calcularBicicleta(tipo) { ... }
function responderEcoflow(nombreProducto, peso = null) { ... }

async function consultarOpenAI(mensaje, contextoExtra = []) { ... }

// ========== RUTAS DE RASTREO (CPK y CARNET) ==========
app.get("/api/health", (req, res) => {
  try {
    const db = getTrackingDb();
    res.json({ ok: true, mensaje: "Servidor activo", totalCPK: Object.keys(db).length });
  } catch(e) { res.status(500).json({ ok: false, mensaje: "Error interno" }); }
});

// Búsqueda por CPK (ej: /api/rastreo/CPK-0266228)
app.get("/api/rastreo/:cpk", (req, res) => {
  try {
    const cpk = normalizarCPK(req.params.cpk);
    if (!cpk) return res.status(400).json({ ok: false, mensaje: "CPK inválido" });
    const item = getTrackingDb()[cpk];
    if (!item) return res.status(404).json({ ok: false, mensaje: "No encontramos información para ese CPK." });
    res.json({
      ok: true,
      tipoBusqueda: "cpk",
      cpk: item.cpk,
      fecha: item.fecha,
      estado: item.estado,
      descripcion: item.descripcion,
      embarcador: item.embarcador,
      consignatario: item.consignatario,
      carnet: item.carnetPrincipal,
      saludo: construirSaludo(item.embarcador, item.consignatario, item.estado)
    });
  } catch(e) { res.status(500).json({ ok: false, mensaje: "Error interno" }); }
});

// Búsqueda por carnet (ej: /api/buscar-carnet?carnet=94111138336)
app.get("/api/buscar-carnet", (req, res) => {
  try {
    const carnet = soloDigitos(req.query.carnet || "");
    if (!carnet) return res.status(400).json({ ok: false, mensaje: "Carnet requerido", resultados: [] });
    const resultados = extraerResultadosLocalesPorCarnet(carnet);
    if (!resultados.length) return res.status(404).json({ ok: false, mensaje: "No se encontraron resultados", resultados: [] });
    res.json({ ok: true, tipoBusqueda: "carnet", total: resultados.length, resultados });
  } catch(e) { res.status(500).json({ ok: false, mensaje: "Error interno" }); }
});

// Búsqueda general (acepta CPK o carnet)
app.get("/api/buscar/:termino", (req, res) => {
  try {
    const terminoRaw = String(req.params.termino).trim();
    const terminoDigits = soloDigitos(terminoRaw);
    if (!terminoDigits) return res.status(400).json({ ok: false, mensaje: "Debe escribir un CPK o carnet válido." });
    const db = getTrackingDb();
    const cpkNormalizado = normalizarCPK(terminoRaw);
    if (cpkNormalizado && db[cpkNormalizado]) {
      const item = db[cpkNormalizado];
      return res.json({ ok: true, tipoBusqueda: "cpk", cpk: item.cpk, estado: item.estado, fecha: item.fecha, descripcion: item.descripcion, embarcador: item.embarcador, consignatario: item.consignatario, carnet: item.carnetPrincipal, saludo: construirSaludo(item.embarcador, item.consignatario, item.estado) });
    }
    if (db[terminoDigits]) {
      const item = db[terminoDigits];
      return res.json({ ok: true, tipoBusqueda: "cpk", cpk: item.cpk, estado: item.estado, fecha: item.fecha, descripcion: item.descripcion, embarcador: item.embarcador, consignatario: item.consignatario, carnet: item.carnetPrincipal, saludo: construirSaludo(item.embarcador, item.consignatario, item.estado) });
    }
    const resultadosCarnet = extraerResultadosLocalesPorCarnet(terminoDigits);
    if (resultadosCarnet.length) return res.json({ ok: true, tipoBusqueda: "carnet", total: resultadosCarnet.length, resultados: resultadosCarnet });
    res.status(404).json({ ok: false, mensaje: "No se encontró información para ese CPK o carnet." });
  } catch(e) { res.status(500).json({ ok: false, mensaje: "Error interno" }); }
});

// ========== CHAT ==========
app.post("/api/chat", async (req, res) => {
  // (Mantén tu código de chat exactamente como lo tenías)
  // ...
});

// ========== RUTAS DE PEDIDOS (POSTGRESQL) ==========
app.post("/api/pedidos", async (req, res) => {
  const { nombre, email, telefono, direccion, producto } = req.body;
  if (!nombre || !telefono || !producto) return res.status(400).json({ ok: false, mensaje: "Faltan datos" });
  try {
    const query = `INSERT INTO pedidos (nombre, email, telefono, direccion, producto, estado, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *;`;
    const values = [nombre, email || null, telefono, direccion || null, producto, "pendiente"];
    const result = await pool.query(query, values);
    res.json({ ok: true, pedido: result.rows[0] });
  } catch (error) { console.error(error); res.status(500).json({ ok: false, mensaje: "Error del servidor" }); }
});

// Ruta /registros para compatibilidad con paneles antiguos
app.get('/registros', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM pedidos ORDER BY created_at DESC`);
    res.json({ ok: true, pedidos: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: "Error al obtener registros" });
  }
});

// Ruta principal para obtener pedidos (usada por admin.js)
app.get("/api/pedidos", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM pedidos ORDER BY created_at DESC`);
    res.json({ ok: true, pedidos: result.rows });
  } catch (error) { console.error(error); res.status(500).json({ ok: false, mensaje: "Error al obtener pedidos" }); }
});

app.get("/api/status", (req, res) => { res.json({ status: "ok", mensaje: "Servidor funcionando" }); });

// ========== RUTA PRINCIPAL ==========
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html");
  res.sendFile(indexPath, (err) => { if (err) res.send("<h1>Rastreador activo</h1>"); });
});

// ========== MANEJADOR 404 (SIEMPRE AL FINAL) ==========
app.use((req, res) => { res.status(404).json({ ok: false, mensaje: "Ruta no encontrada" }); });

// ========== INICIO DEL SERVIDOR ==========
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => { console.log(`Servidor escuchando en http://0.0.0.0:${port}`); });
