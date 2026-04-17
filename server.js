import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

app.set("trust proxy", true);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-session-id"]
  })
);

app.use(express.json({ limit: "2mb" }));

// ================= CONTEXTO DEL CHAT =================
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

TIEMPOS
- Aproximadamente 18 a 30 días una vez que toca puerto
- Aproximadamente a los 7 días de la entrega toca puerto

OFICINA
- Dirección: 7523 Aloma Ave, Winter Park, FL 32792, Suite 112
- Teléfono Geo: 786-942-6904
- Teléfono Adriana: 786-784-6421
`;

// ================= BASE MANUAL =================
const RAW_TRACKING_SOURCE = `
CHAMBATINA MIAMI	GEO MIA		CPK-0255139	ENTREGADO	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEA	10916	2026-03-09	ELSA BARRIOS PEREZ		86012204812	AVE 25 # 3017 Rpto. LA SIERRA e/ 30 y 34, PLAYA, LA HABANA	53358593	ERISBEL FORNARIS			0	0	1	19.8	0.579	0	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0266860	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	GENERADOR ELECTRICO 2400 W		2026-04-14	JULIO SÁNCHEZ HERNANDEZ		50092905351	CALLE PASEO DE LA PAZ # 362 Rpto. CHAMBERY e/ NUEVA GERONA y PRIMERA DEL OESTE, SANTA CLARA, VILLA CLARA	53382367	ISMAEL PÉREZ			0	0	1	59.1	1.588	0	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0266858	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	MISCELANEA 16		2026-04-14	JULIO SÁNCHEZ HERNANDEZ		50092905351	CALLE PASEO DE LA PAZ # 362 Rpto. CHAMBERY e/ NUEVA GERONA y PRIMERA DEL OESTE, SANTA CLARA, VILLA CLARA	53382367	ISMAEL PÉREZ			0	0	1	43	2.37	219.32	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0266857	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	MISCELANEA 16		2026-04-14	JULIO SÁNCHEZ HERNANDEZ		50092905351	CALLE PASEO DE LA PAZ # 362 Rpto. CHAMBERY e/ NUEVA GERONA y PRIMERA DEL OESTE, SANTA CLARA, VILLA CLARA	53382367	ISMAEL PÉREZ			0	0	1	58	2.37	219.32	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0266460	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	BATERIA		2026-04-13	MAURA EUGENIA RODRIGUEZ VELAZQUEZ		53111507356	CALLE CAVADA # 6 e/ FRANCISCO VICENTE AGUILERA y JUSTO AGUILERA, GIBARA, HOLGUIN	54800232	RADIEL CABRERA			0	0	1	118.74	1.588	0	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0266459	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	INVERSOR ELECTRICO		2026-04-13	MAURA EUGENIA RODRIGUEZ VELAZQUEZ		53111507356	CALLE CAVADA # 6 e/ FRANCISCO VICENTE AGUILERA y JUSTO AGUILERA, GIBARA, HOLGUIN	54800232	RADIEL CABRERA			0	0	1	68.66	1.588	0	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0256106	ENTREGADO	Sí	169(CPK-314)	STORM/(SEGU 5662210)/(CWPS26170645)	ENVIO	MISCELANEA 15	11113	2026-03-12	MAXIMO LUZ RUIZ		66011324582	AVE 33 # 1817 e/ 18 y 20, CAIBARIEN, VILLA CLARA	52133160	ARMANDO DEL RIO			0	0	1	63.2	1.953	219.32	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0255532	ENTREGADO	Sí	169(CPK-314)	STORM/(SEGU 5662210)/(CWPS26170645)	ENVIO	MISCELANEA	11113	2026-03-10	MERCEDES RIVERO VALLADARES		51060212412	CALLE CALZADA ALDAY EDIFICIO 6 APTO 31 Rpto. EL TRIGAL, BOYEROS, LA HABANA	59803613	VIVIANNE VILLALON			0	0	1	11.6	0.072	219.32	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0253092	EN DISTRIBUCION	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEA 12	10917	2026-03-01	ANNIA LUISA CARABALLO BELLO		83032106338	CALLE AGRAMONTE # 162 INTERIOR Rpto. ROSARIO e/ GUINERA y SIMON BOLIVAR, ARROYO NARANJO, LA HABANA	53245456	MARIA ELENA RODRIGUEZ			0	0	1	37	1	219.32	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0264373	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	GENERADOR ELECTRICO DELTA 3 MAX/2400 WATTS		2026-04-07	PABLO ENRIQUE CABRERA FIGUERAS		00012068886	CALLE 139 # 14802 A Rpto. REYNOLD GARCIA e/ 148 y 154, MATANZAS, MATANZAS	56469740	RAFA JIMENEZ			0	0	1	49.5	1.588	0	0	0
`;

// ================= MEMORIA =================
const MEMORIA = new Map();

// ================= HELPERS =================
function soloDigitos(v = "") {
  return String(v).replace(/\D/g, "");
}

function primerNombre(nombre = "") {
  return String(nombre).trim().split(/\s+/)[0] || "";
}

function normalizarLinea(linea = "") {
  return String(linea).replace(/\r/g, "").trim();
}

function normalizarCPK(texto = "") {
  const match = String(texto).match(/CPK[-\s]?(\d{6,10})/i);
  if (match) return match[1];
  return "";
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
  desde.setHours(0, 0, 0, 0);
  hasta.setHours(0, 0, 0, 0);

  return Math.max(0, Math.floor((hasta - desde) / 86400000));
}

function getSessionKey(req) {
  const explicit = String(req.headers["x-session-id"] || "").trim();
  if (explicit) return explicit;

  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = forwarded || req.ip || "anon";
  return `sess:${ip}`;
}

function construirSaludo(embarcador = "", consignatario = "", estado = "") {
  const nombreBase = primerNombre(consignatario || embarcador || "cliente");
  return `Hola ${nombreBase}, su envío se encuentra actualmente en: ${estado}.`;
}

function getTrackingDb() {
  return parseTrackingSource(RAW_TRACKING_SOURCE);
}

function extraerResultadosLocalesPorCarnet(carnet = "") {
  const carnetLimpio = soloDigitos(carnet);
  if (!carnetLimpio) return [];

  const lineas = String(RAW_TRACKING_SOURCE).split("\n").map(normalizarLinea).filter(Boolean);
  const resultados = [];

  for (const linea of lineas) {
    const partes = linea.split(/\t+/).map((v) => String(v).trim());
    const cpk = extraerCPKDesdeLinea(linea);
    const fecha = extraerFechaDesdeLinea(linea);

    const posibles = partes.map(soloDigitos).filter(Boolean);
    const coincideCarnet = posibles.includes(carnetLimpio);

    if (!coincideCarnet || !cpk) continue;

    resultados.push({
      cpk,
      estado: estadoPorTiempo(fecha),
      fecha: fecha || "",
      embarcador: extraerNombreProbable(linea, fecha),
      consignatario: "",
      carnet: carnetLimpio,
      mercancia: extraerDescripcionProbable(linea),
      saludo: construirSaludo(extraerNombreProbable(linea, fecha), "", estadoPorTiempo(fecha))
    });
  }

  return resultados;
}

// ================= ETAPAS =================
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

// ================= ESTADO POR FECHA DE REGISTRO =================
function estadoPorTiempo(fechaTexto = "") {
  if (!fechaTexto) return ETAPAS.EN_AGENCIA;

  const dias = diasNaturalesEntre(fechaTexto);

  if (dias <= 2) return ETAPAS.EN_AGENCIA; // días 1-3
  if (dias <= 5) return ETAPAS.TRANSPORTE_NAVIERA; // días 4-6
  if (dias <= 7) return ETAPAS.EN_CONTENEDOR; // días 7-8
  if (dias <= 10) return ETAPAS.RUMBO_CUBA; // días 9-11
  if (dias <= 12) return ETAPAS.NAVIERA; // días 12-13
  if (dias <= 14) return ETAPAS.DESAGRUPE; // días 14-15
  if (dias <= 19) return ETAPAS.ADUANA; // días 16-20
  if (dias <= 21) return ETAPAS.CLASIFICACION; // días 21-22
  if (dias <= 23) return ETAPAS.ALMACEN_CENTRAL; // días 23-24
  if (dias <= 25) return ETAPAS.TRASLADO_PROVINCIA; // días 25-26
  if (dias <= 26) return ETAPAS.ALMACEN_PROVINCIAL; // día 27
  if (dias === 27) return ETAPAS.PREPARACION_DISTRIBUCION; // día 28
  if (dias <= 29) return ETAPAS.CLASIFICACION_DISTRIBUCION; // días 29-30

  return ETAPAS.EN_DISTRIBUCION; // día 31 en adelante infinito
}

// ================= PARSER TRACKING =================
function extraerCPKDesdeLinea(linea = "") {
  const m = String(linea).match(/CPK[-\s]?(\d{6,10})/i);
  return m ? m[1] : "";
}

function extraerFechaDesdeLinea(linea = "") {
  const m = String(linea).match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return m ? m[1] : "";
}

function extraerNombreProbable(linea = "", fechaTexto = "") {
  if (!fechaTexto) return "";

  const s = String(linea);
  const idx = s.indexOf(fechaTexto);
  if (idx === -1) return "";

  const despues = s.slice(idx + fechaTexto.length).trim();
  const parts = despues.split(/\t+/).map((v) => v.trim()).filter(Boolean);

  for (const p of parts) {
    if (/^[A-ZÁÉÍÓÚÑ ]{6,}$/i.test(p) && !/\d/.test(p)) return p;
  }

  return "";
}

function extraerDescripcionProbable(linea = "") {
  const parts = String(linea).split(/\t+/).map((v) => v.trim()).filter(Boolean);

  for (const p of parts) {
    if (/[A-ZÁÉÍÓÚÑ]/i.test(p) && p.length >= 4 && !/\d{4}-\d{2}-\d{2}/.test(p)) {
      return p;
    }
  }

  return "Sin descripción disponible.";
}

function parseTrackingSource(raw = "") {
  const lineas = String(raw).split("\n").map(normalizarLinea).filter(Boolean);
  const db = {};

  for (const linea of lineas) {
    const cpk = extraerCPKDesdeLinea(linea);
    if (!cpk) continue;

    const fecha = extraerFechaDesdeLinea(linea);

    db[cpk] = {
      cpk,
      fecha,
      estado: estadoPorTiempo(fecha),
      descripcion: extraerDescripcionProbable(linea),
      embarcador: extraerNombreProbable(linea, fecha),
      consignatario: "",
      raw: linea
    };
  }

  return db;
}

// ================= MEMORIA TEMPORAL =================
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
function detectarPeso(texto = "") {
  const t = String(texto).toLowerCase();
  const m =
    t.match(/(\d+(?:\.\d+)?)\s*(lb|libras?)/i) ||
    t.match(/peso\s*(\d+(?:\.\d+)?)/i);

  return m ? Number(m[1]) : null;
}

function detectarTipoBicicleta(texto = "") {
  const t = String(texto).toLowerCase();
  if (!t.includes("bicic")) return null;

  const esElectrica = /el[eé]ctrica/.test(t);
  const esNino = /niñ|nino/.test(t);
  const empacada = /empacad|en caja|caja/.test(t);
  const sinEmpacar = /sin empacar|sin caja/.test(t);

  if (esElectrica) {
    return sinEmpacar ? "bicicleta_electrica_sin_caja" : "bicicleta_electrica_en_caja";
  }

  if (esNino) {
    return empacada ? "bicicleta_nino_empacada" : "bicicleta_nino_sin_empacar";
  }

  return empacada ? "bicicleta_adulto_empacada" : "bicicleta_adulto_sin_empacar";
}

function detectarEcoflow(texto = "") {
  const t = String(texto).toLowerCase();
  if (!/(eco ?flow|delta pro|delta 2|delta|river)/i.test(t)) return null;

  if (/delta pro ultra/i.test(t)) return "EcoFlow Delta Pro Ultra";
  if (/delta pro/i.test(t)) return "EcoFlow Delta Pro";
  if (/delta 2/i.test(t)) return "EcoFlow Delta 2";
  if (/river 2 pro/i.test(t)) return "EcoFlow River 2 Pro";
  if (/river/i.test(t)) return "EcoFlow River";
  return "EcoFlow";
}

function detectarIntencion(texto = "") {
  const t = String(texto).toLowerCase();

  const peso = detectarPeso(t);
  const cpkNormalizado = normalizarCPK(texto);
  const bicicleta = detectarTipoBicicleta(t);
  const ecoflow = detectarEcoflow(t);

  const esCPK = !!cpkNormalizado;
  const esSolar = /(inversor|bater[ií]a|panel|solar|kwh|kw|generador)/i.test(t);
  const esCaja = /(caja 12x12|caja 15x15|caja 16x16|cajas)/i.test(t);
  const esDireccion = /(direcci[oó]n|oficina|suite 112|aloma)/i.test(t);
  const esTiempo = /(tiempo|demora|cu[aá]nto tarda|entrega)/i.test(t);
  const esCalculo = !!peso || /cu[aá]nto cuesta \d+/i.test(t);

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
    return `${intro}\n\nSi me dice el peso en libras, le calculo el envío exacto.`;
  }

  const calc = calcularEnvioGeneral(peso);
  return `${intro}\n\nCálculo de envío:\n${calc.texto}`;
}

// ================= OPENAI =================
async function consultarOpenAI(mensaje, contextoExtra = []) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: BUSINESS_CONTEXT },
        ...(contextoExtra.length ? [{ role: "system", content: contextoExtra.join("\n") }] : []),
        { role: "user", content: mensaje }
      ],
      temperature: 0.25
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    }
  );

  return response.data?.choices?.[0]?.message?.content || "Sin respuesta";
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

// ================= RUTA ESPECÍFICA PRIMERO =================
app.get("/api/rastreo/carnet/:carnet", async (req, res) => {
  try {
    const carnet = soloDigitos(req.params.carnet || "");

    if (!carnet) {
      return res.status(400).json({
        ok: false,
        mensaje: "Carnet inválido"
      });
    }

    const response = await axios.post(
      "https://www.solvedc.com/tracking/kanguro/",
      new URLSearchParams({ ci: carnet, hbl: "" }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        },
        timeout: 15000
      }
    );

    const html = response.data;
    const $ = cheerio.load(html);
    const filas = $("table tr");

    if (filas.length < 2) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró información en Kanguro"
      });
    }

    const fila = filas.eq(1);
    const tds = fila.find("td");

    if (!tds.length) {
      return res.status(404).json({
        ok: false,
        mensaje: "No se encontró información en Kanguro"
      });
    }

    const estado = tds.eq(2).text().trim();
    const embarcador = tds.eq(5).text().trim();
    const consignatario = tds.eq(6).text().trim();

    return res.json({
      ok: true,
      tipoBusqueda: "kanguro",
      resultados: [
        {
          cpk: tds.eq(1).text().trim(),
          estado,
          fecha: tds.eq(3).text().trim(),
          guia: tds.eq(4).text().trim(),
          embarcador,
          consignatario,
          carnet: tds.eq(7).text().trim(),
          mercancia: tds.eq(8).text().trim(),
          saludo: construirSaludo(embarcador, consignatario, estado)
        }
      ]
    });
  } catch (error) {
    console.error("Error en /api/rastreo/carnet/:carnet:", error?.message || error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error consultando Kanguro"
    });
  }
});

// ================= RASTREO POR CPK =================
app.get("/api/rastreo/:cpk", (req, res) => {
  try {
    const cpk = normalizarCPK(req.params.cpk);

    if (!cpk) {
      return res.json({
        ok: false,
        mensaje: "CPK inválido"
      });
    }

    const item = getTrackingDb()[cpk];

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

// ================= BUSCAR POR CARNET =================
app.get("/api/buscar-carnet", async (req, res) => {
  try {
    const carnet = soloDigitos(req.query.carnet || "");

    if (!carnet) {
      return res.status(400).json({
        ok: false,
        source: "local",
        message: "Carnet requerido",
        results: []
      });
    }

    const resultadosLocales = extraerResultadosLocalesPorCarnet(carnet);

    if (resultadosLocales.length > 0) {
      return res.status(200).json({
        ok: true,
        source: "local",
        total: resultadosLocales.length,
        results: resultadosLocales
      });
    }

    try {
      const response = await axios.post(
        "https://www.solvedc.com/tracking/kanguro/",
        new URLSearchParams({ ci: carnet, hbl: "" }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 ChambatinaRastreador/1.0"
          },
          timeout: 15000
        }
      );

      const html = response.data;
      const $ = cheerio.load(html);
      const filas = $("table tr");

      if (filas.length >= 2) {
        const fila = filas.eq(1);
        const tds = fila.find("td");

        if (tds.length > 0) {
          const estado = tds.eq(2).text().trim();
          const embarcador = tds.eq(5).text().trim();
          const consignatario = tds.eq(6).text().trim();

          return res.status(200).json({
            ok: true,
            source: "external",
            total: 1,
            results: [
              {
                cpk: tds.eq(1).text().trim(),
                estado,
                fecha: tds.eq(3).text().trim(),
                embarcador,
                consignatario,
                carnet: tds.eq(7).text().trim(),
                mercancia: tds.eq(8).text().trim(),
                saludo: construirSaludo(embarcador, consignatario, estado)
              }
            ]
          });
        }
      }
    } catch (err) {
      console.error("Error consultando Kanguro en /api/buscar-carnet:", err?.message || err);
    }

    return res.status(404).json({
      ok: false,
      source: "mixed",
      message: "No se encontraron resultados",
      results: []
    });
  } catch (error) {
    console.error("Error en /api/buscar-carnet:", error);
    return res.status(500).json({
      ok: false,
      source: "server",
      message: "Error interno del servidor",
      results: []
    });
  }
});

// ================= BÚSQUEDA GENERAL =================
app.get("/api/buscar/:termino", async (req, res) => {
  try {
    const terminoRaw = String(req.params.termino || "");
    const termino = soloDigitos(terminoRaw);

    if (!termino) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debe escribir un CPK o carnet válido."
      });
    }

    const item = getTrackingDb()[termino];

    if (item) {
      return res.json({
        ok: true,
        tipoBusqueda: "cpk",
        cpk: termino,
        estado: item.estado,
        fecha: item.fecha || "No disponible",
        descripcion: item.descripcion || "Sin descripción",
        embarcador: item.embarcador || "No disponible",
        consignatario: item.consignatario || "",
        saludo: construirSaludo(item.embarcador, item.consignatario, item.estado)
      });
    }

    const resultadosCarnet = extraerResultadosLocalesPorCarnet(termino);

    if (resultadosCarnet.length > 0) {
      return res.json({
        ok: true,
        tipoBusqueda: "carnet",
        resultados: resultadosCarnet
      });
    }

    try {
      const response = await axios.post(
        "https://www.solvedc.com/tracking/kanguro/",
        new URLSearchParams({ ci: termino, hbl: "" }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0"
          },
          timeout: 15000
        }
      );

      const html = response.data;
      const $ = cheerio.load(html);
      const filas = $("table tr");

      if (filas.length >= 2) {
        const fila = filas.eq(1);
        const tds = fila.find("td");

        if (tds.length > 0) {
          const estado = tds.eq(2).text().trim();
          const embarcador = tds.eq(5).text().trim();
          const consignatario = tds.eq(6).text().trim();

          return res.json({
            ok: true,
            tipoBusqueda: "kanguro",
            resultados: [
              {
                cpk: tds.eq(1).text().trim(),
                estado,
                fecha: tds.eq(3).text().trim(),
                embarcador,
                consignatario,
                carnet: tds.eq(7).text().trim(),
                descripcion: tds.eq(8).text().trim(),
                saludo: construirSaludo(embarcador, consignatario, estado)
              }
            ]
          });
        }
      }
    } catch (error) {
      console.error("Error consultando Kanguro en /api/buscar/:termino:", error?.message || error);
    }

    return res.status(404).json({
      ok: false,
      mensaje: "No se encontró información en ningún sistema."
    });
  } catch (error) {
    console.error("Error en /api/buscar/:termino:", error);
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

    if (info.intent === "direccion") {
      return res.json({
        ok: true,
        respuesta: "La oficina está en 7523 Aloma Ave, Winter Park, FL 32792, Suite 112."
      });
    }

    if (info.intent === "tiempo") {
      return res.json({
        ok: true,
        respuesta:
          "El estado logístico se calcula automáticamente por días naturales desde la fecha de registro."
      });
    }

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

    if (
      !info.peso &&
      mem.lastIntent === "calculo" &&
      /(y con eso|cu[aá]nto ser[ií]a|el total|entonces)/i.test(mensaje)
    ) {
      const r = calcularEnvioGeneral(mem.lastWeight);
      return res.json({
        ok: true,
        respuesta: r.texto
      });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        ok: false,
        mensaje: "Falta OPENAI_API_KEY"
      });
    }

    const promptExtra = [];
    if (mem.lastProduct) promptExtra.push(`Último producto consultado: ${mem.lastProduct}`);
    if (mem.lastWeight) promptExtra.push(`Último peso consultado: ${mem.lastWeight} lb`);
    if (mem.lastCPK) promptExtra.push(`Último CPK consultado: ${mem.lastCPK}`);

    const respuesta = await consultarOpenAI(mensaje, promptExtra);

    setMemory(sessionKey, {
      lastIntent: "chat"
    });

    return res.json({
      ok: true,
      respuesta
    });
  } catch (error) {
    console.error("Error en /api/chat:", error?.response?.data || error?.message || error);
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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en 0.0.0.0:${PORT}`);
});
