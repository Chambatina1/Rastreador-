import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-session-id"]
}));

app.use(express.json({ limit: "2mb" }));

// ================= CONTEXTO DEL CHAT =================
const BUSINESS_CONTEXT = `
========================================
ASISTENTE OFICIAL CHAMBATINA
========================================

Responde siempre en español claro, directo y profesional.
No inventes precios ni condiciones.
Si no sabes algo con certeza, dilo claramente.

IDENTIDAD
Chambatina es una empresa logística especializada en envíos a Cuba
y en la orientación sobre equipos de energía renovable, especialmente sistemas solares.

El nombre proviene de los abuelos del fundador Geo Cabezas:
- Manuel Muñoz (Chamba)
- Agustina (Tina)

LIDERAZGO DIGITAL
Geo y Lili, conocidos en TikTok, forman parte del equipo que impulsa
el crecimiento y la orientación comercial de Chambatina.

SERVICIOS
- Envíos a Cuba
- Orientación sobre compras (Amazon, TikTok, etc.)
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

CARGOS ESPECIALES

BICICLETAS
- Bicicleta de niño sin empacar: $25
- Bicicleta de niño empacada: $15
- Bicicleta de adulto sin empacar: $45
- Bicicleta de adulto empacada: $25
- Bicicleta eléctrica en caja: $35
- Bicicleta eléctrica sin caja: $50

COLCHONES
- Hasta 50 lb: $15
- Más de 50 lb: $40

ELECTRODOMÉSTICOS
- Ollas pequeñas: $12
- Olla arrocera o multifuncional: $22

EQUIPOS GRANDES
- Más de 200 lb: $45 adicionales

RETRACTILADO
- Empacado: $35
- Sin empacar: $50
- Externo: cargo variable

CAJAS
- 12x12x12 hasta 60 lb: $45
- 15x15x15 hasta 100 lb: $65
- 16x16x16 hasta 100 lb: $85

TIEMPOS
- Aproximadamente 18 a 30 días una vez que toca puerto
- Aproximadamente a los 7 días de la entrega toca puerto

OFICINA
- Dirección: 7523 Aloma Ave, Winter Park, FL 32792, Suite 112
- Teléfono Geo: 786-942-6904
- Teléfono Adriana: 786-784-6421

FORMA DE RESPONDER
- Ser claro, breve y útil
- No repetir información innecesaria
- Si el sistema ya calculó por código, no recalcular diferente
- Si preguntan por rastreo, orientar con el CPK
`;

// ================= BASE MANUAL =================
// PEGA AQUÍ TUS LÍNEAS COMPLETAS DESDE TU SISTEMA
const RAW_TRACKING_SOURCE = `
PEGA_AQUI_TU_BLOQUE_COMPLETO_DE_CPK
`;

// ================= UTILIDADES GENERALES =================
function soloDigitos(v) {
  return String(v || "").replace(/\D/g, "");
}

function normalizarCPK(v) {
  const limpio = soloDigitos(v);
  if (limpio.length < 6 || limpio.length > 10) return "";
  return limpio;
}

function primerNombre(nombre) {
  return String(nombre || "").trim().split(/\s+/)[0] || "";
}

function fechaToYYYYMMDD(d) {
  const fecha = new Date(d);
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseFechaSegura(fechaTexto) {
  const m = String(fechaTexto || "").match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function diasNaturalesEntre(desdeTexto, hastaFecha = new Date()) {
  const desde = parseFechaSegura(desdeTexto);
  if (!desde) return 0;
  const hasta = new Date(hastaFecha);
  desde.setHours(0, 0, 0, 0);
  hasta.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((hasta - desde) / 86400000));
}

function sumarDiasNaturales(fechaTexto, dias) {
  const base = parseFechaSegura(fechaTexto) || new Date();
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return d;
}

function diasHabilesEntre(desdeTexto, hastaFecha = new Date()) {
  const desde = parseFechaSegura(desdeTexto);
  if (!desde) return 0;

  const inicio = new Date(desde);
  const fin = new Date(hastaFecha);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  let count = 0;
  const cur = new Date(inicio);

  while (cur <= fin) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }

  return Math.max(0, count - 1);
}

// ================= ESTADOS LOGÍSTICOS =================
const ETAPAS = {
  ENTREGADO: "ENTREGADO",
  EN_AGENCIA: "EN AGENCIA",
  TRASLADO_NAVIERA: "TRASLADO A NAVIERA",
  EN_CONTENEDOR: "EN CONTENEDOR",
  SALIDA_PUERTO: "SALIDA DE PUERTO",
  ARRIBO: "ARRIBO",
  DESAGRUPE_ADUANA: "DESAGRUPE / ADUANA",
  CLASIFICACION: "CLASIFICACIÓN",
  ALMACEN_PROVINCIA: "ALMACÉN DE PROVINCIA",
  PREPARANDO_DISTRIBUCION: "PREPARANDO DISTRIBUCIÓN",
  DISTRIBUCION: "DISTRIBUCIÓN",
  ULTIMA_MILLA: "ÚLTIMA MILLA",
  CONTINUACION_DISTRIBUCION: "EN CONTINUACIÓN DE DISTRIBUCIÓN",
  EN_PROCESO: "EN PROCESO"
};

function mapearEstadoTexto(estadoTexto) {
  const e = String(estadoTexto || "").toUpperCase();

  if (e.includes("ENTREGADO")) return ETAPAS.ENTREGADO;
  if (e.includes("EN DISTRIBUCION") || e.includes("EN DISTRIBUCIÓN") || e === "DISTRIBUCION" || e === "DISTRIBUCIÓN") return ETAPAS.DISTRIBUCION;
  if (e.includes("CLASIFIC")) return ETAPAS.CLASIFICACION;
  if (e.includes("DESAGRUPE") || e.includes("ADUANA")) return ETAPAS.DESAGRUPE_ADUANA;
  if (e.includes("ARRIBO")) return ETAPAS.ARRIBO;
  if (e.includes("SALIDA") && e.includes("PUERTO")) return ETAPAS.SALIDA_PUERTO;
  if (e.includes("CONTENEDOR")) return ETAPAS.EN_CONTENEDOR;
  if (e.includes("NAVIERA")) return ETAPAS.TRASLADO_NAVIERA;
  if (e.includes("AGENCIA")) return ETAPAS.EN_AGENCIA;
  if (e.includes("DESPACH")) return "DESPACHO";
  if (e.includes("EMBARC")) return "EMBARCADO";

  return "";
}

function estadoPorTiempo(fechaTexto) {
  if (!fechaTexto) return ETAPAS.EN_PROCESO;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diasNaturales = diasNaturalesEntre(fechaTexto, hoy);

  if (diasNaturales <= 3) return ETAPAS.EN_AGENCIA;
  if (diasNaturales <= 5) return ETAPAS.TRASLADO_NAVIERA;
  if (diasNaturales <= 7) return ETAPAS.EN_CONTENEDOR;
  if (diasNaturales <= 9) return ETAPAS.SALIDA_PUERTO;

  const fechaPuerto = sumarDiasNaturales(fechaTexto, 10);
  const fechaPuertoTexto = fechaToYYYYMMDD(fechaPuerto);
  const diasHabiles = diasHabilesEntre(fechaPuertoTexto, hoy);

  if (diasHabiles <= 3) return ETAPAS.ARRIBO;
  if (diasHabiles <= 6) return ETAPAS.DESAGRUPE_ADUANA;
  if (diasHabiles <= 10) return ETAPAS.CLASIFICACION;
  if (diasHabiles <= 14) return ETAPAS.ALMACEN_PROVINCIA;
  if (diasHabiles < 28) return ETAPAS.PREPARANDO_DISTRIBUCION;
  if (diasHabiles <= 30) return ETAPAS.DISTRIBUCION;
  if (diasHabiles <= 34) return ETAPAS.ULTIMA_MILLA;

  return ETAPAS.CONTINUACION_DISTRIBUCION;
}

function construirSaludo(embarcador, consignatario, estado) {
  const nombreEmbarcador = primerNombre(embarcador);
  const nombreConsignatario = primerNombre(consignatario);

  if (nombreEmbarcador && nombreConsignatario) {
    return `Hola ${nombreEmbarcador}, tus paquetes a ${nombreConsignatario} se encuentran en: ${estado}.`;
  }
  if (nombreEmbarcador) {
    return `Hola ${nombreEmbarcador}, tus paquetes se encuentran en: ${estado}.`;
  }
  return `Hola, tu mercancía se encuentra en: ${estado}.`;
}

// ================= PARSER Y LIMPIEZA DE CPK =================
function normalizarLinea(linea) {
  return String(linea || "").replace(/\r/g, "").trim();
}

function extraerCPKDesdeLinea(linea) {
  const m = String(linea || "").match(/CPK[-\s]?(\d{6,10})/i);
  return m ? m[1] : "";
}

function extraerFechaDesdeLinea(linea) {
  const m = String(linea || "").match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return m ? m[1] : "";
}

function extraerEstadoDesdeLinea(linea) {
  const bruto = String(linea || "");
  const posibles = [
    "ENTREGADO",
    "EN DISTRIBUCION",
    "EN DISTRIBUCIÓN",
    "DISTRIBUCION",
    "DISTRIBUCIÓN",
    "DESPACHADO",
    "DESPACHO",
    "EN AGENCIA",
    "EMBARCADO",
    "ARRIBO",
    "CLASIFICADO",
    "DESAGRUPE",
    "ADUANA"
  ];

  const up = bruto.toUpperCase();
  const encontrado = posibles.find(p => up.includes(p));
  return encontrado ? encontrado.replace("EN DISTRIBUCIÓN", "EN DISTRIBUCION") : "";
}

function extraerNombreProbable(linea, fechaTexto) {
  const s = String(linea || "");
  if (!fechaTexto) return "";

  const idx = s.indexOf(fechaTexto);
  if (idx === -1) return "";

  const despues = s.slice(idx + fechaTexto.length).trim();
  const parts = despues.split(/\t+/).map(v => v.trim()).filter(Boolean);

  for (const p of parts) {
    if (/^[A-ZÁÉÍÓÚÑ ]{6,}$/i.test(p) && !/\d/.test(p)) {
      return p;
    }
  }
  return "";
}

function esTextoDescripcionUtil(p) {
  const up = String(p || "").toUpperCase();
  if (!up) return false;
  if (up.startsWith("CPK-")) return false;
  if (/\b20\d{2}-\d{2}-\d{2}\b/.test(up)) return false;
  if (["ENTREGADO","EN AGENCIA","EMBARCADO","DESPACHADO","EN DISTRIBUCION","DISTRIBUCION","SI","NO","ENVIO"].includes(up)) return false;
  if (/^[0-9.\-]+$/.test(up)) return false;
  return /[A-ZÁÉÍÓÚÑ]/i.test(up) && up.length >= 4;
}

function extraerDescripcionProbable(linea) {
  const parts = String(linea || "")
    .split(/\t+/)
    .map(v => v.trim())
    .filter(Boolean);

  const preferidas = [];

  for (const p of parts) {
    const up = p.toUpperCase();

    if (
      esTextoDescripcionUtil(p) &&
      (
        up.includes("ECOFLOW") ||
        up.includes("DELTA") ||
        up.includes("RIVER") ||
        up.includes("BATERIA") ||
        up.includes("BATERÍA") ||
        up.includes("INVERSOR") ||
        up.includes("GENERADOR") ||
        up.includes("TV") ||
        up.includes("IMPRESORA") ||
        up.includes("OLLA") ||
        up.includes("SILLA") ||
        up.includes("PISCINA") ||
        up.includes("SECADORA") ||
        up.includes("COLCHON") ||
        up.includes("LAPTOP") ||
        up.includes("MISCELANEA") ||
        up.includes("MISCELANEAS") ||
        up.includes("MISCELÁNEA")
      )
    ) {
      preferidas.push(p);
    }
  }

  if (preferidas.length) {
    return preferidas.sort((a, b) => b.length - a.length)[0];
  }

  for (const p of parts) {
    if (esTextoDescripcionUtil(p)) return p;
  }

  return "Sin descripción disponible.";
}

function puntajeEstado(estado) {
  const e = String(estado || "").toUpperCase();
  if (e.includes("ENTREGADO")) return 100;
  if (e.includes("DISTRIBUC")) return 80;
  if (e.includes("DESPACH")) return 70;
  if (e.includes("EMBARC")) return 60;
  if (e.includes("ARRIBO")) return 50;
  if (e.includes("CLASIFIC")) return 40;
  if (e.includes("AGENCIA")) return 30;
  return 10;
}

function puntajeRegistro(r) {
  const fecha = parseFechaSegura(r.fecha)?.getTime() || 0;
  const descripcionScore = r.descripcion && r.descripcion !== "Sin descripción disponible." ? 500 : 0;
  return puntajeEstado(r.estado) * 1e12 + fecha * 1e3 + descripcionScore + (r.raw?.length || 0);
}

function parseTrackingSource(raw) {
  const lineas = String(raw || "")
    .split("\n")
    .map(normalizarLinea)
    .filter(Boolean);

  const db = {};

  for (const linea of lineas) {
    const cpk = extraerCPKDesdeLinea(linea);
    if (!cpk) continue;

    const fecha = extraerFechaDesdeLinea(linea);
    const estadoDirecto = extraerEstadoDesdeLinea(linea);
    const estado = mapearEstadoTexto(estadoDirecto) || estadoPorTiempo(fecha);
    const embarcador = extraerNombreProbable(linea, fecha);
    const consignatario = "";
    const descripcion = extraerDescripcionProbable(linea);

    const nuevo = {
      cpk,
      fecha,
      estado,
      descripcion,
      embarcador,
      consignatario,
      raw: linea
    };

    if (!db[cpk] || puntajeRegistro(nuevo) > puntajeRegistro(db[cpk])) {
      db[cpk] = nuevo;
    }
  }

  return db;
}

let TRACKING_DB_CACHE = parseTrackingSource(RAW_TRACKING_SOURCE);

function getTrackingDb() {
  return TRACKING_DB_CACHE;
}

// ================= MEMORIA TEMPORAL =================
const MEMORIA = new Map();

function getSessionKey(req) {
  return String(req.headers["x-session-id"] || req.ip || "anon");
}

function getMemory(key) {
  const item = MEMORIA.get(key);
  if (!item) return {};

  if (Date.now() - (item.ts || 0) > 10 * 60 * 1000) {
    MEMORIA.delete(key);
    return {};
  }

  return item;
}

function setMemory(key, patch) {
  const prev = getMemory(key);
  MEMORIA.set(key, {
    ...prev,
    ...patch,
    ts: Date.now()
  });
}

// ================= DETECCIÓN DE INTENCIÓN =================
function detectarPeso(texto) {
  const t = String(texto || "").toLowerCase();
  const m =
    t.match(/(\d+(?:\.\d+)?)\s*(lb|libras?)/i) ||
    t.match(/peso\s*(\d+(?:\.\d+)?)/i);
  return m ? Number(m[1]) : null;
}

function detectarTipoBicicleta(texto) {
  const t = String(texto || "").toLowerCase();

  if (!t.includes("bicic")) return null;

  const esElectrica = /el[eé]ctrica/.test(t);
  const esNino = /niñ|nino/.test(t);
  const empacada = /empacad|en caja|caja/.test(t);
  const sinEmpacar = /sin empacar|sin caja/.test(t);

  if (esElectrica) {
    if (sinEmpacar) return "bicicleta_electrica_sin_caja";
    return "bicicleta_electrica_en_caja";
  }

  if (esNino) {
    if (empacada) return "bicicleta_nino_empacada";
    return "bicicleta_nino_sin_empacar";
  }

  if (empacada) return "bicicleta_adulto_empacada";
  return "bicicleta_adulto_sin_empacar";
}

function detectarEcoflow(texto) {
  const t = String(texto || "").toLowerCase();
  if (!/(eco ?flow|delta pro|delta 2|delta|river)/i.test(t)) return null;

  if (/delta pro ultra/i.test(t)) return "EcoFlow Delta Pro Ultra";
  if (/delta pro/i.test(t)) return "EcoFlow Delta Pro";
  if (/delta 2/i.test(t)) return "EcoFlow Delta 2";
  if (/river 2 pro/i.test(t)) return "EcoFlow River 2 Pro";
  if (/river/i.test(t)) return "EcoFlow River";
  return "EcoFlow";
}

function detectarIntencion(texto) {
  const t = String(texto || "").toLowerCase();

  const peso = detectarPeso(t);
  const cpkNormalizado = normalizarCPK(t);
  const bicicleta = detectarTipoBicicleta(t);
  const ecoflow = detectarEcoflow(t);

  const esCPK = !!cpkNormalizado;
  const esSolar = /(inversor|bater[ií]a|panel|solar|kwh|kw|generador)/i.test(t);
  const esCaja = /(caja 12x12|caja 15x15|caja 16x16|cajas)/i.test(t);
  const esDireccion = /(direcci[oó]n|oficina|suite 112|aloma)/i.test(t);
  const esTiempo = /(tiempo|demora|cu[aá]nto tarda|entrega)/i.test(t);
  const esCalculo = !!peso || /cu[aá]nto cuesta \d+/i.test(t) || /(\d+(?:\.\d+)?)\s*(lb|libras?)/i.test(t);

  if (esCPK) return { intent: "rastreo", peso, cpk: cpkNormalizado };
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

// ================= CÁLCULOS =================
function calcularEnvioGeneral(peso) {
  const base = Number((peso * 1.99).toFixed(2));
  const cargoEquipo = 25;
  const total = Number((base + cargoEquipo).toFixed(2));

  return {
    tipo: "equipo",
    peso,
    base,
    cargoEquipo,
    total,
    texto:
      `${peso} × 1.99 = ${base.toFixed(2)}\n` +
      `+ 25 = ${total.toFixed(2)}\n\n` +
      `Total: $${total.toFixed(2)}`
  };
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
  const intro =
    `${nombreProducto || "EcoFlow"} es un sistema de energía portátil y solar ` +
    `que puede servir para respaldo eléctrico, refrigeradores, ventiladores, luces y otros equipos del hogar.`;

  if (!peso) {
    return intro + `\n\nSi me dice el peso en libras, le calculo el envío exacto.`;
  }

  const calc = calcularEnvioGeneral(peso);

  return (
    intro +
    `\n\nCálculo de envío:\n${calc.texto}`
  );
}

// ================= HEALTH =================
app.get("/api/health", (req, res) => {
  try {
    const db = getTrackingDb();
    return res.json({
      ok: true,
      mensaje: "Servidor activo",
      totalCPK: Object.keys(db).length,
      ejemplos: Object.keys(db).slice(0, 10)
    });
  } catch (error) {
    console.error("Error en /api/health:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno en health"
    });
  }
});

// ================= RASTREO =================
app.get("/api/rastreo/:cpk", (req, res) => {
  try {
    const cpk = normalizarCPK(req.params.cpk);

    if (!cpk) {
      return res.json({
        ok: false,
        mensaje: "CPK inválido"
      });
    }

    const db = getTrackingDb();
    const item = db[cpk];

    if (!item) {
      return res.json({
        ok: false,
        mensaje: "No encontramos información para ese CPK."
      });
    }

    return res.json({
      ok: true,
      cpk: item.cpk,
      fecha: item.fecha || "",
      estado: item.estado,
      descripcion: item.descripcion,
      embarcador: item.embarcador,
      consignatario: item.consignatario,
      saludo: construirSaludo(item.embarcador, item.consignatario, item.estado)
    });
  } catch (error) {
    console.error("Error en /api/rastreo/:cpk:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor"
    });
  }
});

// ================= CHAT =================
app.post("/api/chat", async (req, res) => {
  try {
    const mensaje = String(req.body?.mensaje || "").trim();

    if (!mensaje) {
      return res.status(400).json({
        ok: false,
        mensaje: "Falta mensaje"
      });
    }

    const sessionKey = getSessionKey(req);
    const mem = getMemory(sessionKey);
    const info = detectarIntencion(mensaje);

    // 1) Rastreo directo
    if (info.intent === "rastreo" && info.cpk) {
      const item = getTrackingDb()[info.cpk];

      if (!item) {
        return res.json({
          ok: false,
          mensaje: "No encontramos información para ese CPK."
        });
      }

      setMemory(sessionKey, {
        lastIntent: "rastreo",
        lastCPK: info.cpk
      });

      return res.json({
        ok: true,
        respuesta:
          `${construirSaludo(item.embarcador, item.consignatario, item.estado)}\n\n` +
          `Fecha: ${item.fecha || "No disponible"}\n\n` +
          `Descripción:\n${item.descripcion || "Sin descripción disponible."}`
      });
    }

    // 2) Cálculo general
    if (info.intent === "calculo" && info.peso) {
      const r = calcularEnvioGeneral(info.peso);

      setMemory(sessionKey, {
        lastIntent: "calculo",
        lastWeight: info.peso
      });

      return res.json({
        ok: true,
        respuesta: r.texto
      });
    }

    // 3) EcoFlow con cálculo
    if (info.intent === "ecoflow_calculo" && info.peso) {
      const respuesta = responderEcoflow(info.ecoflow, info.peso);

      setMemory(sessionKey, {
        lastIntent: "ecoflow",
        lastWeight: info.peso,
        lastProduct: info.ecoflow
      });

      return res.json({
        ok: true,
        respuesta
      });
    }

    // 4) EcoFlow sin peso
    if (info.intent === "ecoflow") {
      const pesoMem = info.peso || mem.lastWeight || null;

      setMemory(sessionKey, {
        lastIntent: "ecoflow",
        lastWeight: pesoMem,
        lastProduct: info.ecoflow
      });

      return res.json({
        ok: true,
        respuesta: responderEcoflow(info.ecoflow, pesoMem)
      });
    }

    // 5) Bicicletas
    if (info.intent === "bicicleta") {
      const bici = calcularBicicleta(info.bicicleta);

      if (!bici) {
        return res.json({
          ok: false,
          mensaje: "No pude identificar el tipo de bicicleta."
        });
      }

      setMemory(sessionKey, {
        lastIntent: "bicicleta",
        lastProduct: bici.nombre
      });

      return res.json({
        ok: true,
        respuesta: `${bici.nombre}: $${bici.total.toFixed(2)}`
      });
    }

    // 6) Dirección
    if (info.intent === "direccion") {
      return res.json({
        ok: true,
        respuesta: "La oficina está en 7523 Aloma Ave, Winter Park, FL 32792, Suite 112."
      });
    }

    // 7) Tiempos
    if (info.intent === "tiempo") {
      return res.json({
        ok: true,
        respuesta: "El tiempo estimado es aproximadamente de 18 a 30 días una vez que toca puerto."
      });
    }

    // 8) Cajas
    if (info.intent === "cajas") {
      return res.json({
        ok: true,
        respuesta:
          "Tenemos estas cajas:\n" +
          "- 12x12x12 hasta 60 lb: $45\n" +
          "- 15x15x15 hasta 100 lb: $65\n" +
          "- 16x16x16 hasta 100 lb: $85"
      });
    }

    // 9) Memoria corta para seguimiento de cálculo
    if (!info.peso && mem.lastIntent === "calculo" && /(y con eso|cu[aá]nto ser[ií]a|el total|entonces)/i.test(mensaje)) {
      const r = calcularEnvioGeneral(mem.lastWeight);
      return res.json({
        ok: true,
        respuesta: r.texto
      });
    }

    // 10) Fallback a OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        ok: false,
        mensaje: "Falta API KEY"
      });
    }

    const promptExtra = [];
    if (mem.lastProduct) promptExtra.push(`Último producto consultado: ${mem.lastProduct}`);
    if (mem.lastWeight) promptExtra.push(`Último peso consultado: ${mem.lastWeight} lb`);
    if (mem.lastCPK) promptExtra.push(`Último CPK consultado: ${mem.lastCPK}`);

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: BUSINESS_CONTEXT },
          ...(promptExtra.length ? [{ role: "system", content: promptExtra.join("\n") }] : []),
          { role: "user", content: mensaje }
        ],
        temperature: 0.25
      })
    });

    const data = await r.json();

    if (!r.ok) {
      console.error("Error OpenAI:", data);
      return res.status(500).json({
        ok: false,
        mensaje: data?.error?.message || "Error al consultar OpenAI"
      });
    }

    setMemory(sessionKey, {
      lastIntent: "chat"
    });

    return res.json({
      ok: true,
      respuesta: data?.choices?.[0]?.message?.content || "Sin respuesta"
    });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno"
    });
  }
});

// ================= 404 =================
app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    mensaje: "Ruta no encontrada"
  });
});

// ================= START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
