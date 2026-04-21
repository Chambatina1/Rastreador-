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

// ========== MIDDLEWARES GENERALES ==========
app.set("trust proxy", true);
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type", "x-session-id", "Authorization"] }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ========== MIDDLEWARE DE AUTENTICACIÓN PARA ADMIN ==========
const verificarAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    console.warn("⚠️  ADMIN_TOKEN no configurado. Las rutas admin están desprotegidas.");
    return next();
  }
  if (!token || token !== adminToken) {
    return res.status(401).json({ ok: false, mensaje: "No autorizado. Token inválido." });
  }
  next();
};

// ========== POSTGRESQL PARA PEDIDOS ==========
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ========== CONTEXTO DEL CHAT ==========
const BUSINESS_CONTEXT = `
ASISTENTE OFICIAL CHAMBATINA

Responde siempre en español claro, directo y profesional.
No inventes precios ni condiciones.
Si no sabes algo con certeza, dilo claramente.

IDENTIDAD
Chambatina es una empresa logística especializada en envíos a Cuba
y en la orientación sobre equipos de energía renovable, especialmente sistemas solares.

SERVICIOS
- Envíos a Cuba
- Orientación sobre compras
- Asesoría en sistemas solares
- Seguimiento de paquetes (CPK)

PRECIOS BASE
- Precio por libra: $1.99
- Cargo por equipo: $25
- Recogida en casa: $2.30 por libra
- Compras por links de TikTok: $1.80 por libra

IMPORTANTE:
El cálculo general de equipo es:
(Peso × 1.99) + 25

BICICLETAS
- Bicicleta de niño sin empacar: $25
- Bicicleta de niño empacada: $15
- Bicicleta de adulto sin empacar: $45
- Bicicleta de adulto empacada: $25
- Bicicleta eléctrica en caja: $35
- Bicicleta eléctrica sin caja: $50

CAJAS
- 12x12x12 hasta 60 lb: $45
- 15x15x15 hasta 100 lb: $65
- 16x16x16 hasta 100 lb: $85

OFICINA
- Dirección: 7523 Aloma Ave, Winter Park, FL 32792, Suite 112
- Teléfono Geo: 786-942-6904
- Teléfono Adriana: 786-784-6421
`;

// ========== BASE DE DATOS DE CPK Y CARNET (productos y personas) ==========
const info_cpk = {
  "CPK100": { producto: "Laptop Gamer", destino: "Bodega Central", peso: "2.5 kg", descripcion: "Equipo de cómputo de alto rendimiento." },
  "CPK200": { producto: "Monitor 24\"", destino: "Sucursal Norte", peso: "3.1 kg", descripcion: "Pantalla LED Full HD." },
  "CPK300": { producto: "Teclado Mecánico", destino: "Oficina Sur", peso: "0.8 kg", descripcion: "Teclado con switches mecánicos." },
  "CPK400": { producto: "Mouse Inalámbrico", destino: "Almacén Este", peso: "0.2 kg", descripcion: "Mouse ergonómico Bluetooth." },
  "CPK999": { producto: "Carga de Pedro", destino: "Embarcado", peso: "15 kg", descripcion: "Paquete especial para envío urgente." },
};

const info_carnet = {
  "CARN123456": { nombre: "Juan Pérez", tipo: "Estudiante", destino: "Biblioteca", descripcion: "Carnet de acceso a instalaciones." },
  "CARN789012": { nombre: "María Gómez", tipo: "Docente", destino: "Aulas", descripcion: "Carnet con privilegios de profesor." },
  "CARN555666": { nombre: "Pedro López", tipo: "Embarcado", destino: "Zona de carga", descripcion: "Carnet especial para operaciones de embarque." },
  "CARN111222": { nombre: "Ana Torres", tipo: "Visitante", destino: "Recepción", descripcion: "Carnet temporal por 1 día." },
};

// ========== BASE DE DATOS DE RASTREO (TSV) - VERSIÓN DINÁMICA ==========
const RAW_TRACKING_SOURCE_INICIAL = `
CHAMBATINA MIAMI	GEO MIA		CPK-0266228	EMBARCADO	Sí	CPK-323	REGULA/(SEGU 5278396)/(CWPS26188262)	ENVIO	ACEITE DE MOTOR 4 L	11481	2026-04-13	ARIANNA CORDERO MARTINEZ		94111138336	CALLE TOMAS PEREZ CASTRO # 113 INTERIOR e/ AGRAMONTE y AVENIDA LIBERTAD, CABAIGUAN, SANCTI SPIRITUS	54357818	ROLANDO AQUINO CANCIO			0	0	1	9.7	0.072	0	0	0		
CHAMBATINA MIAMI	GEO MIA		CPK-0269283	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	MISCELANEA 12		2026-04-20	ALEXIS MARCOS DOLZ ZEQUEIRA		92011036022	CALLE RAFAEL TREJO # 68 A Rpto. LA POPA e/ PIRO GUINAL y CAMPOS, TRINIDAD, SANCTI SPIRITUS	53531245	IRELYS SUÁREZ			0	0	1	36.3	1	219.32	0	0		
CHAMBATINA MIAMI	GEO MIA		CPK-0269278	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	MISCELANEA 15		2026-04-20	JASSIEL SUAREZ HERNANDEZ		82071508065	CALLE 57 # 5408 e/ 54 y 56, CIENFUEGOS, CIENFUEGOS	52710454	IRELYS SUÁREZ			2.99	0	1	54.1	1.953	219.32	0	0		
`;

// ========== NORMALIZACIÓN DE BLOQUES DE TRACKING ==========
function normalizarTracking(bloqueSucio) {
  const lineas = bloqueSucio.split(/\r?\n/);
  const lineasLimpias = [];
  for (let linea of lineas) {
    linea = linea.trim();
    if (!linea) continue;
    linea = linea.replace(/[ \t]+/g, '\t');
    lineasLimpias.push(linea);
  }
  return lineasLimpias.join('\n');
}

// Variables dinámicas de tracking
let currentTrackingSource = normalizarTracking(RAW_TRACKING_SOURCE_INICIAL);
let currentTrackingDb = {};

// ========== HELPERS (rastreo) ==========
function soloDigitos(v = "") { return String(v).replace(/\D/g, ""); }
function primerNombre(nombre = "") { return String(nombre).trim().split(/\s+/)[0] || ""; }
function normalizarLinea(linea = "") { return String(linea).replace(/\r/g, ""); }
function normalizarCPK(texto = "") { 
  // Acepta CPK-123456 o CPK123456
  const match = String(texto).match(/CPK[-\s]?(\d{6,10})/i); 
  return match ? match[1] : ""; 
}
function parseFechaSegura(fechaTexto = "") { 
  const m = String(fechaTexto).match(/\b(20\d{2})-(\d{2})-(\d{2})\b/); 
  if (!m) return null; 
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`); 
  return Number.isNaN(d.getTime()) ? null : d; 
}
function diasNaturalesEntre(desdeTexto, hastaFecha = new Date()) { 
  const desde = parseFechaSegura(desdeTexto); 
  if (!desde) return 0; 
  const hasta = new Date(hastaFecha); 
  desde.setHours(0,0,0,0); 
  hasta.setHours(0,0,0,0); 
  return Math.max(0, Math.floor((hasta - desde) / 86400000)); 
}
function getSessionKey(req) { 
  const explicit = String(req.headers["x-session-id"] || "").trim(); 
  if (explicit) return explicit; 
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim(); 
  const ip = forwarded || req.ip || "anon"; 
  return `sess:${ip}`; 
}

// NUEVO: construir saludo mostrando el CPK y el nombre
function construirSaludoConCPK(cpk, embarcador = "", consignatario = "", estado = "") {
  const nombre = primerNombre(consignatario || embarcador || "cliente");
  return `Hola ${nombre}, su envío CPK: ${cpk} se encuentra actualmente en: ${estado}.`;
}

// ========== ETAPAS POR DÍAS ==========
const ETAPAS = {
  EN_AGENCIA: "EN AGENCIA",
  TRANSPORTE_NAVIERA: "TRANSPORTE A NAVIERA",
  EN_CONTENEDOR: "EN CONTENEDOR",
  RUMBO_CUBA: "RUMBO A CUBA",
  NAVIERA: "NAVIERA",
  DESAGRUPE: "DESAGRUPE",
  ADUANA: "ADUANA",
  CLASIFICACION: "CLASIFICACIÓN",
  ALMACEN_CENTRAL: "ALMACÉN CENTRAL",
  TRASLADO_PROVINCIA: "TRASLADO A PROVINCIA",
  ALMACEN_PROVINCIAL: "ALMACÉN PROVINCIAL",
  PREPARACION_DISTRIBUCION: "PREPARACIÓN PARA DISTRIBUCIÓN",
  CLASIFICACION_DISTRIBUCION: "CLASIFICACIÓN PARA DISTRIBUCIÓN",
  EN_DISTRIBUCION: "EN DISTRIBUCIÓN"
};

function estadoPorTiempo(fechaTexto = "") {
  if (!fechaTexto) return ETAPAS.EN_AGENCIA;
  const dias = diasNaturalesEntre(fechaTexto);
  if (dias <= 2) return ETAPAS.EN_AGENCIA;
  if (dias <= 5) return ETAPAS.TRANSPORTE_NAVIERA;
  if (dias <= 7) return ETAPAS.EN_CONTENEDOR;
  if (dias <= 10) return ETAPAS.RUMBO_CUBA;
  if (dias <= 12) return ETAPAS.NAVIERA;
  if (dias <= 14) return ETAPAS.DESAGRUPE;
  if (dias <= 19) return ETAPAS.ADUANA;
  if (dias <= 21) return ETAPAS.CLASIFICACION;
  if (dias <= 23) return ETAPAS.ALMACEN_CENTRAL;
  if (dias <= 25) return ETAPAS.TRASLADO_PROVINCIA;
  if (dias <= 26) return ETAPAS.ALMACEN_PROVINCIAL;
  if (dias === 27) return ETAPAS.PREPARACION_DISTRIBUCION;
  if (dias <= 29) return ETAPAS.CLASIFICACION_DISTRIBUCION;
  return ETAPAS.EN_DISTRIBUCION;
}

// ========== PARSER DE RASTREO ==========
function extraerCPKDesdeColumnas(columnas) {
  for (const col of columnas) {
    const cpk = normalizarCPK(col);
    if (cpk) return cpk;
  }
  return "";
}

function extraerFechaDesdeColumnas(columnas) {
  for (const col of columnas) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(col)) return col;
  }
  return "";
}

function extraerNombreDesdeColumnas(columnas, fechaIndex) {
  for (let i = fechaIndex + 1; i < columnas.length; i++) {
    const campo = columnas[i].trim();
    if (campo && /[A-ZÁÉÍÓÚÑ]/i.test(campo) && !/\d/.test(campo)) return campo;
  }
  return "";
}

function extraerCarnetsDesdeColumnas(columnas, cpk) {
  const carnets = new Set();
  for (const col of columnas) {
    const num = soloDigitos(col);
    if (num.length >= 8 && num.length <= 12) {
      if (cpk && num === cpk) continue;
      carnets.add(num);
    }
  }
  return Array.from(carnets);
}

function extraerDescripcionDesdeColumnas(columnas, cpk, fecha) {
  for (const col of columnas) {
    const limpio = col.trim();
    if (!limpio) continue;
    if (normalizarCPK(limpio)) continue;
    if (/^\d{4}-\d{2}-\d{2}$/.test(limpio)) continue;
    if (/^[\d.]+$/.test(limpio)) continue;
    if (limpio.length < 4) continue;
    if (/[A-ZÁÉÍÓÚÑ]/i.test(limpio)) return limpio;
  }
  return "Sin descripción disponible.";
}

function parseTrackingSource(raw) {
  const lineas = String(raw).split("\n").map(normalizarLinea).filter(Boolean);
  const db = {};
  for (const linea of lineas) {
    const columnas = linea.split(/\t+/);
    const cpkNum = extraerCPKDesdeColumnas(columnas);
    if (!cpkNum) continue;
    const fecha = extraerFechaDesdeColumnas(columnas);
    const fechaIndex = columnas.findIndex(col => col === fecha);
    const embarcador = fechaIndex !== -1 ? extraerNombreDesdeColumnas(columnas, fechaIndex) : "";
    const carnets = extraerCarnetsDesdeColumnas(columnas, cpkNum);
    const descripcion = extraerDescripcionDesdeColumnas(columnas, cpkNum, fecha);
    db[cpkNum] = {
      cpk: cpkNum,
      fecha,
      estado: estadoPorTiempo(fecha),
      descripcion,
      embarcador,
      consignatario: "",
      carnetPrincipal: carnets[0] || "",
      carnets,
      raw: linea
    };
  }
  return db;
}

function recargarTrackingDesdeTexto(nuevoTexto) {
  const normalizado = normalizarTracking(nuevoTexto);
  currentTrackingSource = normalizado;
  currentTrackingDb = parseTrackingSource(normalizado);
  return currentTrackingDb;
}

function getTrackingDb() { return currentTrackingDb; }

function extraerResultadosLocalesPorCarnet(carnet) {
  const carnetLimpio = soloDigitos(carnet);
  if (!carnetLimpio) return [];
  const db = getTrackingDb();
  const resultados = [];
  for (const item of Object.values(db)) {
    if (!item.carnets.includes(carnetLimpio)) continue;
    resultados.push({
      cpk: item.cpk,
      estado: item.estado,
      fecha: item.fecha,
      embarcador: item.embarcador,
      consignatario: item.consignatario,
      carnet: carnetLimpio,
      descripcion: item.descripcion,
    });
  }
  return resultados;
}

// Inicializar la base de datos dinámica
recargarTrackingDesdeTexto(RAW_TRACKING_SOURCE_INICIAL);

// ========== NUEVAS FUNCIONES PARA CPK/CARNET Y SALUDO PEDRO ==========
function extraerCPKProducto(texto) {
  const match = String(texto).match(/CPK[-\s]?(\d{6,10})/i);
  return match ? `CPK${match[1]}` : null;
}

function extraerCarnetPorTexto(texto) {
  const match = String(texto).match(/\b(carnet)[-\s]?(\d{8,12})\b/i);
  if (match) return `CARN${match[2]}`;
  const soloNum = soloDigitos(texto);
  if (soloNum.length >= 8 && soloNum.length <= 12 && !extraerCPKProducto(texto)) return `CARN${soloNum}`;
  return null;
}

function detectarSaludoPedro(texto) {
  const t = texto.toLowerCase();
  return t.includes('hola pedro') || t.includes('embarcado');
}

// ========== MEMORIA CHAT ==========
const MEMORIA = new Map();
function getMemory(key) { 
  const item = MEMORIA.get(key); 
  if (!item) return {}; 
  if (Date.now() - (item.ts||0) > 10*60*1000) { 
    MEMORIA.delete(key); 
    return {}; 
  } 
  return item; 
}
function setMemory(key, patch) { 
  const prev = getMemory(key); 
  MEMORIA.set(key, {...prev, ...patch, ts: Date.now()}); 
}

// ========== DETECCIÓN DE INTENCIÓN ==========
function detectarPeso(texto) { 
  const t = String(texto).toLowerCase(); 
  const m = t.match(/(\d+(?:\.\d+)?)\s*(lb|libras?)/i) || t.match(/peso\s*(\d+(?:\.\d+)?)/i); 
  return m ? Number(m[1]) : null; 
}
function detectarTipoBicicleta(texto) { 
  const t = String(texto).toLowerCase(); 
  if (!t.includes("bicic")) return null; 
  const esElectrica = /el[eé]ctrica/.test(t); 
  const esNino = /niñ|nino/.test(t); 
  const empacada = /empacad|en caja|caja/.test(t); 
  const sinEmpacar = /sin empacar|sin caja/.test(t); 
  if (esElectrica) return sinEmpacar ? "bicicleta_electrica_sin_caja" : "bicicleta_electrica_en_caja"; 
  if (esNino) return empacada ? "bicicleta_nino_empacada" : "bicicleta_nino_sin_empacar"; 
  return empacada ? "bicicleta_adulto_empacada" : "bicicleta_adulto_sin_empacar"; 
}
function detectarEcoflow(texto) { 
  const t = String(texto).toLowerCase(); 
  if (!/(eco ?flow|delta pro|delta 2|delta|river)/i.test(t)) return null; 
  if (/delta pro ultra/i.test(t)) return "EcoFlow Delta Pro Ultra"; 
  if (/delta pro/i.test(t)) return "EcoFlow Delta Pro"; 
  if (/delta 2/i.test(t)) return "EcoFlow Delta 2"; 
  if (/river 2 pro/i.test(t)) return "EcoFlow River 2 Pro"; 
  if (/river/i.test(t)) return "EcoFlow River"; 
  return "EcoFlow"; 
}
function detectarIntencion(texto) { 
  const t = String(texto).toLowerCase(); 
  const peso = detectarPeso(t); 
  const cpkNormalizado = normalizarCPK(texto); 
  const bicicleta = detectarTipoBicicleta(t); 
  const ecoflow = detectarEcoflow(t); 
  const esCPK = !!cpkNormalizado; 
  const esCarnet = /\b\d{8,12}\b/.test(t) && !esCPK; 
  const esSolar = /(inversor|bater[ií]a|panel|solar|kwh|kw|generador)/i.test(t); 
  const esCaja = /(caja 12x12|caja 15x15|caja 16x16|cajas)/i.test(t); 
  const esDireccion = /(direcci[oó]n|oficina|suite 112|aloma)/i.test(t); 
  const esTiempo = /(tiempo|demora|cu[aá]nto tarda|entrega)/i.test(t); 
  const esCalculo = !!peso || /cu[aá]nto cuesta \d+/i.test(t); 
  if (esCPK) return { intent: "rastreo_cpk", cpk: cpkNormalizado }; 
  if (esCarnet) { const carnet = (t.match(/\b(\d{8,12})\b/) || [])[1] || ""; return { intent: "rastreo_carnet", carnet }; } 
  if (bicicleta) return { intent: "bicicleta", bicicleta, peso }; 
  if (ecoflow && peso) return { intent: "ecoflow_calculo", ecoflow, peso }; 
  if (ecoflow) return { intent: "ecoflow", ecoflow, peso }; 
  if (esCalculo && esSolar) return { intent: "calculo_producto", peso }; 
  if (esCalculo) return { intent: "calculo", peso }; 
  if (esSolar) return { intent: "solar", peso }; 
  if (esCaja) return { intent: "cajas" }; 
  if (esDireccion) return { intent: "direccion" }; 
  if (esTiempo) return { intent: "tiempo" }; 
  return { intent: "chat", peso }; 
}

function calcularEnvioGeneral(peso) { 
  const base = Number((peso * 1.99).toFixed(2)); 
  const cargoEquipo = 25; 
  const total = Number((base + cargoEquipo).toFixed(2)); 
  return { tipo: "equipo", peso, base, cargoEquipo, total, texto: `${peso} × 1.99 = ${base.toFixed(2)}\n+ 25 = ${total.toFixed(2)}\n\nTotal: $${total.toFixed(2)}` }; 
}
function calcularBicicleta(tipo) { 
  const tabla = { 
    bicicleta_nino_sin_empacar: { nombre: "Bicicleta de niño sin empacar", total: 25 }, 
    bicicleta_nino_empacada: { nombre: "Bicicleta de niño empacada", total: 15 }, 
    bicicleta_adulto_sin_empacar: { nombre: "Bicicleta de adulto sin empacar", total: 45 }, 
    bicicleta_adulto_empacada: { nombre: "Bicicleta de adulto empacada", total: 25 }, 
    bicicleta_electrica_en_caja: { nombre: "Bicicleta eléctrica en caja", total: 35 }, 
    bicicleta_electrica_sin_caja: { nombre: "Bicicleta eléctrica sin caja", total: 50 } 
  }; 
  return tabla[tipo] || null; 
}
function responderEcoflow(nombreProducto, peso = null) { 
  const intro = `${nombreProducto || "EcoFlow"} es un sistema de energía portátil y solar que puede servir para respaldo eléctrico, refrigeradores, ventiladores, luces y otros equipos del hogar.`; 
  if (!peso) return `${intro}\n\nSi me dice el peso en libras, le calculo el envío exacto.`; 
  const calc = calcularEnvioGeneral(peso); 
  return `${intro}\n\nCálculo de envío:\n${calc.texto}`; 
}

async function consultarOpenAI(mensaje, contextoExtra = []) {
  if (!OPENAI_API_KEY) return "El servidor no tiene configurada la variable OPENAI_API_KEY.";
  const response = await fetch("https://api.openai.com/v1/chat/completions", { 
    method: "POST", 
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" }, 
    body: JSON.stringify({ 
      model: "gpt-4o-mini", 
      temperature: 0.25, 
      messages: [{ role: "system", content: BUSINESS_CONTEXT }, ...(contextoExtra.length ? [{ role: "system", content: contextoExtra.join("\n") }] : []), { role: "user", content: mensaje }] 
    }) 
  });
  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "Sin respuesta";
}

// ========== RUTAS PÚBLICAS ==========
app.get("/api/health", (req, res) => { 
  try { 
    const db = getTrackingDb(); 
    res.json({ ok: true, mensaje: "Servidor activo", totalCPK: Object.keys(db).length }); 
  } catch(e) { 
    res.status(500).json({ ok: false, mensaje: "Error interno" }); 
  } 
});

app.get("/api/rastreo/:cpk", (req, res) => { 
  try { 
    const cpkNum = normalizarCPK(req.params.cpk); 
    if (!cpkNum) return res.status(400).json({ ok: false, mensaje: "CPK inválido" }); 
    const item = getTrackingDb()[cpkNum]; 
    if (!item) return res.status(404).json({ ok: false, mensaje: "No encontramos información para ese CPK." }); 
    const saludo = construirSaludoConCPK(item.cpk, item.embarcador, item.consignatario, item.estado);
    res.json({ ok: true, tipoBusqueda: "cpk", cpk: item.cpk, fecha: item.fecha, estado: item.estado, descripcion: item.descripcion, embarcador: item.embarcador, consignatario: item.consignatario, carnet: item.carnetPrincipal, saludo }); 
  } catch(e) { 
    res.status(500).json({ ok: false, mensaje: "Error interno" }); 
  } 
});

app.get("/api/buscar-carnet", (req, res) => { 
  try { 
    const carnet = soloDigitos(req.query.carnet || ""); 
    if (!carnet) return res.status(400).json({ ok: false, mensaje: "Carnet requerido", resultados: [] }); 
    const resultados = extraerResultadosLocalesPorCarnet(carnet); 
    if (!resultados.length) return res.status(404).json({ ok: false, mensaje: "No se encontraron resultados", resultados: [] }); 
    res.json({ ok: true, tipoBusqueda: "carnet", total: resultados.length, resultados }); 
  } catch(e) { 
    res.status(500).json({ ok: false, mensaje: "Error interno" }); 
  } 
});

app.get("/api/buscar/:termino", (req, res) => { 
  try { 
    const terminoRaw = String(req.params.termino).trim(); 
    const terminoDigits = soloDigitos(terminoRaw); 
    if (!terminoDigits) return res.status(400).json({ ok: false, mensaje: "Debe escribir un CPK o carnet válido." }); 
    const db = getTrackingDb(); 
    const cpkNormalizado = normalizarCPK(terminoRaw); 
    if (cpkNormalizado && db[cpkNormalizado]) { 
      const item = db[cpkNormalizado]; 
      const saludo = construirSaludoConCPK(item.cpk, item.embarcador, item.consignatario, item.estado);
      return res.json({ ok: true, tipoBusqueda: "cpk", cpk: item.cpk, estado: item.estado, fecha: item.fecha, descripcion: item.descripcion, embarcador: item.embarcador, consignatario: item.consignatario, carnet: item.carnetPrincipal, saludo }); 
    } 
    if (db[terminoDigits]) { 
      const item = db[terminoDigits]; 
      const saludo = construirSaludoConCPK(item.cpk, item.embarcador, item.consignatario, item.estado);
      return res.json({ ok: true, tipoBusqueda: "cpk", cpk: item.cpk, estado: item.estado, fecha: item.fecha, descripcion: item.descripcion, embarcador: item.embarcador, consignatario: item.consignatario, carnet: item.carnetPrincipal, saludo }); 
    } 
    const resultadosCarnet = extraerResultadosLocalesPorCarnet(terminoDigits); 
    if (resultadosCarnet.length) return res.json({ ok: true, tipoBusqueda: "carnet", total: resultadosCarnet.length, resultados: resultadosCarnet }); 
    res.status(404).json({ ok: false, mensaje: "No se encontró información para ese CPK o carnet." }); 
  } catch(e) { 
    res.status(500).json({ ok: false, mensaje: "Error interno" }); 
  } 
});

// ========== ENDPOINT PARA ACTUALIZAR TRACKING (PROTEGIDO) ==========
app.post("/api/tracking/actualizar", verificarAdmin, async (req, res) => {
  try {
    const { bloque } = req.body;
    if (!bloque) return res.status(400).json({ ok: false, mensaje: "Falta el campo 'bloque'" });
    const nuevaDb = recargarTrackingDesdeTexto(bloque);
    res.json({ ok: true, mensaje: `Tracking actualizado. ${Object.keys(nuevaDb).length} CPKs cargados.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: "Error al actualizar tracking" });
  }
});

// ========== CHAT (MODIFICADO) ==========
app.post("/api/chat", async (req, res) => {
  try {
    const mensaje = String(req.body?.mensaje || "").trim();
    if (!mensaje) return res.status(400).json({ ok: false, mensaje: "Falta mensaje" });
    const sessionKey = getSessionKey(req);
    const mem = getMemory(sessionKey);

    // 1. Saludo a Pedro (Embarcado) explícito
    if (detectarSaludoPedro(mensaje)) {
      return res.json({ ok: true, respuesta: "Hola Pedro tu carga asi." });
    }

    // 2. Búsqueda de CPK en tracking (primero) y luego en producto
    const cpkNum = normalizarCPK(mensaje);
    if (cpkNum) {
      const trackingItem = getTrackingDb()[cpkNum];
      if (trackingItem) {
        // Construir respuesta con saludo personalizado + CPK + estado + fecha + descripción
        let respuesta = construirSaludoConCPK(trackingItem.cpk, trackingItem.embarcador, trackingItem.consignatario, trackingItem.estado);
        respuesta += `\n\n📅 Fecha de registro: ${trackingItem.fecha || "No disponible"}`;
        respuesta += `\n📦 Descripción: ${trackingItem.descripcion || "Sin descripción"}`;
        // Si además hay información de producto en info_cpk (opcional)
        const cpkConPrefijo = `CPK${cpkNum}`;
        if (info_cpk[cpkConPrefijo]) {
          const prod = info_cpk[cpkConPrefijo];
          respuesta += `\n🛒 Producto asociado: ${prod.producto}, Destino: ${prod.destino}, Peso: ${prod.peso}. ${prod.descripcion}`;
        }
        setMemory(sessionKey, { lastIntent: "rastreo_cpk", lastCPK: cpkNum });
        return res.json({ ok: true, respuesta });
      } else {
        // Si no está en tracking, pero sí en info_cpk (producto sin seguimiento)
        const cpkConPrefijo = `CPK${cpkNum}`;
        if (info_cpk[cpkConPrefijo]) {
          const prod = info_cpk[cpkConPrefijo];
          const respuesta = `📦 ${cpkConPrefijo}: ${prod.producto}, Destino: ${prod.destino}, Peso: ${prod.peso}. ${prod.descripcion}\n\n⚠️ No hay seguimiento disponible para este CPK.`;
          setMemory(sessionKey, { lastIntent: "producto", lastCPK: cpkNum });
          return res.json({ ok: true, respuesta });
        } else {
          return res.json({ ok: false, mensaje: "No encontramos información para ese CPK." });
        }
      }
    }

    // 3. Búsqueda de carnet (solo información de persona, no tracking)
    const carnetTexto = extraerCarnetPorTexto(mensaje);
    if (carnetTexto && info_carnet[carnetTexto]) {
      const carn = info_carnet[carnetTexto];
      const respuesta = `🪪 ${carnetTexto}: ${carn.nombre} (${carn.tipo}), Destino: ${carn.destino}. ${carn.descripcion}`;
      setMemory(sessionKey, { lastIntent: "carnet", lastCarnet: carnetTexto });
      return res.json({ ok: true, respuesta });
    }

    // 4. Si el mensaje es un número suelto y podría ser carnet (sin la palabra "carnet")
    const soloNum = soloDigitos(mensaje);
    if (soloNum.length >= 8 && soloNum.length <= 12 && !cpkNum) {
      const resultadosCarnet = extraerResultadosLocalesPorCarnet(soloNum);
      if (resultadosCarnet.length) {
        let respuesta = `Encontré ${resultadosCarnet.length} envío(s) para el carnet ${soloNum}:\n\n`;
        for (let i = 0; i < resultadosCarnet.length; i++) {
          const r = resultadosCarnet[i];
          respuesta += `${i+1}. CPK: ${r.cpk}\n   Estado: ${r.estado}\n   Fecha: ${r.fecha}\n   Descripción: ${r.descripcion}\n\n`;
        }
        setMemory(sessionKey, { lastIntent: "rastreo_carnet", lastCarnet: soloNum });
        return res.json({ ok: true, respuesta });
      } else {
        return res.json({ ok: false, mensaje: "No se encontraron envíos para ese carnet." });
      }
    }

    // 5. Resto de la lógica original (intenciones, OpenAI, etc.)
    const info = detectarIntencion(mensaje);

    if (info.intent === "rastreo_cpk" && info.cpk) {
      // Ya se cubrió arriba, pero por si acaso
      const item = getTrackingDb()[info.cpk];
      if (!item) return res.json({ ok: false, mensaje: "No encontramos información para ese CPK." });
      const saludo = construirSaludoConCPK(item.cpk, item.embarcador, item.consignatario, item.estado);
      setMemory(sessionKey, { lastIntent: "rastreo_cpk", lastCPK: info.cpk });
      return res.json({ ok: true, respuesta: `${saludo}\n\nCPK: ${item.cpk}\nFecha: ${item.fecha || "No disponible"}\nCarnet: ${item.carnetPrincipal || "No disponible"}\n\nDescripción:\n${item.descripcion || "Sin descripción disponible."}` });
    }
    if (info.intent === "rastreo_carnet" && info.carnet) {
      const resultados = extraerResultadosLocalesPorCarnet(info.carnet);
      if (!resultados.length) return res.json({ ok: false, mensaje: "No encontramos envíos asociados a ese carnet." });
      setMemory(sessionKey, { lastIntent: "rastreo_carnet", lastCarnet: info.carnet });
      const texto = resultados.map((r,i)=>`${i+1}. CPK: ${r.cpk}\nEstado: ${r.estado}\nFecha: ${r.fecha}\nDescripción: ${r.descripcion}`).join("\n\n");
      return res.json({ ok: true, respuesta: `Encontré ${resultados.length} envío(s) para ese carnet:\n\n${texto}` });
    }
    if (info.intent === "calculo" && info.peso) {
      const r = calcularEnvioGeneral(info.peso);
      setMemory(sessionKey, { lastIntent: "calculo", lastWeight: info.peso });
      return res.json({ ok: true, respuesta: r.texto });
    }
    if (info.intent === "ecoflow_calculo" && info.peso) {
      const respuesta = responderEcoflow(info.ecoflow, info.peso);
      setMemory(sessionKey, { lastIntent: "ecoflow", lastWeight: info.peso, lastProduct: info.ecoflow });
      return res.json({ ok: true, respuesta });
    }
    if (info.intent === "ecoflow") {
      const pesoMem = info.peso || mem.lastWeight || null;
      setMemory(sessionKey, { lastIntent: "ecoflow", lastWeight: pesoMem, lastProduct: info.ecoflow });
      return res.json({ ok: true, respuesta: responderEcoflow(info.ecoflow, pesoMem) });
    }
    if (info.intent === "bicicleta") {
      const bici = calcularBicicleta(info.bicicleta);
      if (!bici) return res.json({ ok: false, mensaje: "No pude identificar el tipo de bicicleta." });
      setMemory(sessionKey, { lastIntent: "bicicleta", lastProduct: bici.nombre });
      return res.json({ ok: true, respuesta: `${bici.nombre}: $${bici.total.toFixed(2)}` });
    }
    if (info.intent === "direccion") return res.json({ ok: true, respuesta: "La oficina está en 7523 Aloma Ave, Winter Park, FL 32792, Suite 112." });
    if (info.intent === "tiempo") return res.json({ ok: true, respuesta: "El estado logístico se calcula automáticamente por días naturales desde la fecha de registro del envío." });
    if (info.intent === "cajas") return res.json({ ok: true, respuesta: "Tenemos estas cajas:\n- 12x12x12 hasta 60 lb: $45\n- 15x15x15 hasta 100 lb: $65\n- 16x16x16 hasta 100 lb: $85" });
    if (!info.peso && mem.lastIntent === "calculo" && /(y con eso|cu[aá]nto ser[ií]a|el total|entonces)/i.test(mensaje)) {
      const r = calcularEnvioGeneral(mem.lastWeight);
      return res.json({ ok: true, respuesta: r.texto });
    }

    const promptExtra = [];
    if (mem.lastProduct) promptExtra.push(`Último producto consultado: ${mem.lastProduct}`);
    if (mem.lastWeight) promptExtra.push(`Último peso consultado: ${mem.lastWeight} lb`);
    if (mem.lastCPK) promptExtra.push(`Último CPK consultado: ${mem.lastCPK}`);
    if (mem.lastCarnet) promptExtra.push(`Último carnet consultado: ${mem.lastCarnet}`);
    const respuesta = await consultarOpenAI(mensaje, promptExtra);
    setMemory(sessionKey, { lastIntent: "chat" });
    return res.json({ ok: true, respuesta });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: "Error interno" });
  }
});

// ========== RUTAS PROTEGIDAS (pedidos) ==========
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

app.get("/api/pedidos", verificarAdmin, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM pedidos ORDER BY created_at DESC`);
    res.json({ ok: true, pedidos: result.rows });
  } catch (error) { console.error(error); res.status(500).json({ ok: false, mensaje: "Error al obtener pedidos" }); }
});

app.get('/registros', verificarAdmin, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM pedidos ORDER BY created_at DESC`);
    res.json({ ok: true, pedidos: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: "Error al obtener registros" });
  }
});

app.get("/api/status", (req, res) => { res.json({ status: "ok", mensaje: "Servidor funcionando" }); });

// ========== RUTA PRINCIPAL ==========
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html");
  res.sendFile(indexPath, (err) => { if (err) res.send("<h1>Rastreador activo</h1>"); });
});

// ========== MANEJADOR 404 ==========
app.use((req, res) => { res.status(404).json({ ok: false, mensaje: "Ruta no encontrada" }); });

// ========== INICIO DEL SERVIDOR ==========
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => { console.log(`Servidor escuchando en http://0.0.0.0:${port}`); });
