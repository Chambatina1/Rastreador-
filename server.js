import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "2mb" }));

// ================= CONTEXTO DEL CHAT =================
const BUSINESS_CONTEXT = `
Eres el asistente oficial de Chambatina.

Responde siempre en español claro, profesional, útil y directo.
No inventes precios, condiciones ni políticas.

INFORMACIÓN GENERAL:
- Precio por libra general: 1.99 más costos de manejo según el tipo de carga.
- Recogida en puerta: 2.30 por libra.
- Compras por links de TikTok: 1.80 por libra.
- Tiempo estimado: de 18 a 30 días hábiles una vez que toca puerto.
`;

// ================= BASE MANUAL =================
// PEGA AQUÍ LAS LÍNEAS COMPLETAS DE SOLVECARGO O TU SISTEMA.
// Puedes pegar miles de líneas si quieres.
const RAW_TRACKING_SOURCE = `
CHAMBATINA MIAMI	GEO MIA		CPK-0255139	ENTREGADO	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEA	10916	2026-03-09	ELSA BARRIOS PEREZ		86012204812	AVE 25 # 3017 Rpto. LA SIERRA e/ 30 y 34, PLAYA, LA HABANA	53358593	ERISBEL FORNARIS			0	0	1	19.8	0.579	0	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0253092	EN DISTRIBUCION	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEA 12	10917	2026-03-01	ANNIA LUISA CARABALLO BELLO		83032106338	CALLE AGRAMONTE # 162 INTERIOR Rpto. ROSARIO e/ GUINERA y SIMON BOLIVAR, ARROYO NARANJO, LA HABANA	53245456	MARIA ELENA RODRIGUEZ			0	0	1	37	1	219.32	0	0
`;

// ================= UTILIDADES =================
function limpiarTexto(texto) {
  return String(texto || "").replace(/\s+/g, " ").trim();
}

function normalizarCPK(cpk) {
  return String(cpk || "").replace(/\D/g, "");
}

function parseFecha(fechaTexto) {
  if (!fechaTexto) return null;
  const d = new Date(`${fechaTexto}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatearFecha(fechaTexto) {
  return fechaTexto || "";
}

function diasNaturalesEntre(fechaInicio, fechaFin = new Date()) {
  const start = parseFecha(fechaInicio);
  if (!start) return 0;

  const end = new Date(fechaFin);
  end.setHours(0, 0, 0, 0);

  const diff = end.getTime() - start.getTime();
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dias < 0 ? 0 : dias;
}

function diasHabilesEntre(fechaInicio, fechaFin = new Date()) {
  const start = parseFecha(fechaInicio);
  if (!start) return 0;

  const end = new Date(fechaFin);
  end.setHours(0, 0, 0, 0);

  if (start > end) return 0;

  let count = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

function sumarDiasNaturales(fechaTexto, dias) {
  const base = parseFecha(fechaTexto);
  if (!base) return null;
  const nueva = new Date(base);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
}

function fechaToYYYYMMDD(fecha) {
  if (!fecha) return "";
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function extraerFecha(linea) {
  const match = String(linea || "").match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return match ? match[1] : "";
}

function primerNoVacio(array, startIndex) {
  for (let i = startIndex; i < array.length; i++) {
    const v = limpiarTexto(array[i]);
    if (v) return v;
  }
  return "";
}

function extraerDatosPersonalesDesdeCampos(campos, fechaIndex) {
  // En tus líneas, normalmente:
  // [fecha] [embarcador] [vacío] [id] [dirección] [teléfono] [consignatario] ...
  const embarcador = primerNoVacio(campos, fechaIndex + 1);

  let consignatario = "";
  for (let i = fechaIndex + 2; i < campos.length; i++) {
    const actual = limpiarTexto(campos[i]);
    if (!actual) continue;

    const esNumero = /^\d+(\.\d+)?$/.test(actual);
    const pareceFecha = /^\d{4}-\d{2}-\d{2}$/.test(actual);
    const pareceTelefono = /^\d{6,}$/.test(actual);
    const pareceDireccion = /#|CALLE|AVE|AVENIDA|Rpto|REPARTO|e\/|INTERIOR|LA HABANA|PINAR|MATANZAS|SANTIAGO|HOLGUIN|CAMAGUEY/i.test(actual);

    if (actual === embarcador) continue;
    if (esNumero || pareceFecha || pareceTelefono || pareceDireccion) continue;

    consignatario = actual;
    break;
  }

  return {
    embarcador,
    consignatario
  };
}

// ================= LÓGICA DE ETAPAS =================
const ETAPAS = {
  EN_AGENCIA: "EN AGENCIA",
  TRASLADO_A_NAVIERA: "TRASLADO A NAVIERA",
  EN_CONTENEDOR: "EN CONTENEDOR",
  SALIDA_A_PUERTO: "SALIDA A PUERTO",
  ARRIBO: "ARRIBO",
  DESAGRUPE_ADUANA: "DESAGRUPE ADUANA",
  CLASIFICACION: "CLASIFICACIÓN",
  TRASLADO_A_PROVINCIA: "TRASLADO A LOS ALMACENES CABEZADAS DE PROVINCIA",
  PREPARANDO_DISTRIBUCION: "PREPARÁNDOSE PARA DISTRIBUCIÓN",
  DISTRIBUCION: "DISTRIBUCIÓN",
  ULTIMA_MILLA: "ÚLTIMA MILLA",
  CONTINUACION_DISTRIBUCION: "CONTINUACIÓN DE JORNADA DE DISTRIBUCIÓN",
  ENTREGADO: "ENTREGADO",
  EN_PROCESO: "EN PROCESO"
};

function descripcionPorEstado(estado) {
  switch (estado) {
    case ETAPAS.EN_AGENCIA:
      return "Tu mercancía fue recibida en nuestra agencia. En esta etapa se valida la entrada del envío, se organiza la información del CPK y se prepara la carga para comenzar el flujo logístico.";

    case ETAPAS.TRASLADO_A_NAVIERA:
      return "Tu mercancía salió de la agencia y está siendo trasladada hacia la naviera. Este paso conecta la recepción inicial con el proceso de embarque marítimo.";

    case ETAPAS.EN_CONTENEDOR:
      return "Tu mercancía ya fue ubicada dentro del contenedor. Esto indica que avanzó correctamente dentro del proceso de consolidación de carga previo a su salida.";

    case ETAPAS.SALIDA_A_PUERTO:
      return "Tu mercancía va saliendo hacia puerto como parte del trayecto previo al arribo. Esta fase forma parte del avance normal dentro de la operación logística.";

    case ETAPAS.ARRIBO:
      return "Tu mercancía ya arribó. A partir de esta etapa comienza el conteo principal del proceso en días hábiles dentro del flujo interno posterior al puerto.";

    case ETAPAS.DESAGRUPE_ADUANA:
      return "Tu mercancía se encuentra en desagrupe y revisión aduanal. Aquí la carga se separa del contenedor y se realizan controles normales del proceso logístico.";

    case ETAPAS.CLASIFICACION:
      return "Tu mercancía está en proceso de clasificación. En esta fase se organiza según destino, provincia y ruta para continuar hacia la siguiente etapa.";

    case ETAPAS.TRASLADO_A_PROVINCIA:
      return "Tu mercancía está siendo trasladada a los almacenes cabezadas de provincia. Este paso acerca la carga a la zona final donde será preparada para su entrega.";

    case ETAPAS.PREPARANDO_DISTRIBUCION:
      return "Tu mercancía ya se encuentra en almacén y está preparándose para distribución. Aquí se organiza la salida hacia el reparto territorial correspondiente.";

    case ETAPAS.DISTRIBUCION:
      return "Tu mercancía ya está en distribución. Esto significa que entró en el proceso activo de entrega dentro del territorio.";

    case ETAPAS.ULTIMA_MILLA:
      return "Tu mercancía se encuentra en última milla. Esta es una de las fases más cercanas a la entrega final al destinatario.";

    case ETAPAS.CONTINUACION_DISTRIBUCION:
      return "Tu mercancía continúa en jornada de distribución. Esto puede ocurrir cuando la ruta de entrega sigue avanzando en días sucesivos dentro del proceso final.";

    case ETAPAS.ENTREGADO:
      return "Tu mercancía ya fue entregada satisfactoriamente. Gracias por confiar en Chambatina.";

    default:
      return "Tu mercancía continúa avanzando dentro del proceso logístico.";
  }
}

function normalizarEstadoDesdeTexto(estadoRaw) {
  const e = limpiarTexto(estadoRaw).toUpperCase();

  if (!e) return "";

  if (e.includes("ENTREGADO")) return ETAPAS.ENTREGADO;
  if (e.includes("CONTINUACIÓN") && e.includes("DISTRIBU")) return ETAPAS.CONTINUACION_DISTRIBUCION;
  if (e.includes("CONTINUACION") && e.includes("DISTRIBU")) return ETAPAS.CONTINUACION_DISTRIBUCION;
  if (e.includes("ÚLTIMA MILLA")) return ETAPAS.ULTIMA_MILLA;
  if (e.includes("ULTIMA MILLA")) return ETAPAS.ULTIMA_MILLA;
  if (e.includes("PREPAR") && e.includes("DISTRIBU")) return ETAPAS.PREPARANDO_DISTRIBUCION;
  if (e.includes("CABEZADAS DE PROVINCIA")) return ETAPAS.TRASLADO_A_PROVINCIA;
  if (e.includes("TRASLADO") && e.includes("PROVINCIA")) return ETAPAS.TRASLADO_A_PROVINCIA;
  if (e.includes("CLASIFIC")) return ETAPAS.CLASIFICACION;
  if (e.includes("DESAGRUPE")) return ETAPAS.DESAGRUPE_ADUANA;
  if (e.includes("ADUANA")) return ETAPAS.DESAGRUPE_ADUANA;
  if (e.includes("ARRIBO")) return ETAPAS.ARRIBO;
  if (e.includes("SALIDA") && e.includes("PUERTO")) return ETAPAS.SALIDA_A_PUERTO;
  if (e.includes("CONTENEDOR")) return ETAPAS.EN_CONTENEDOR;
  if (e.includes("NAVIERA")) return ETAPAS.TRASLADO_A_NAVIERA;
  if (e.includes("AGENCIA")) return ETAPAS.EN_AGENCIA;
  if (e.includes("EN DISTRIBUCIÓN")) return ETAPAS.DISTRIBUCION;
  if (e.includes("EN DISTRIBUCION")) return ETAPAS.DISTRIBUCION;
  if (e === "DISTRIBUCIÓN" || e === "DISTRIBUCION") return ETAPAS.DISTRIBUCION;

  return "";
}

// Esta función aplica tu lógica cronológica cuando la línea no trae un estado claro.
function estadoPorTiempo(fechaTexto) {
  if (!fechaTexto) return ETAPAS.EN_PROCESO;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaBase = parseFecha(fechaTexto);
  if (!fechaBase) return ETAPAS.EN_PROCESO;

  const diasNaturales = diasNaturalesEntre(fechaTexto, hoy);

  // Etapa previa a puerto
  if (diasNaturales <= 3) return ETAPAS.EN_AGENCIA;
  if (diasNaturales <= 5) return ETAPAS.TRASLADO_A_NAVIERA;
  if (diasNaturales <= 7) return ETAPAS.EN_CONTENEDOR;
  if (diasNaturales <= 9) return ETAPAS.SALIDA_A_PUERTO;

  // Aproximadamente al día 10 natural consideramos arribo/inicio de etapa post-puerto
  const fechaPuerto = sumarDiasNaturales(fechaTexto, 10);
  const fechaPuertoTexto = fechaToYYYYMMDD(fechaPuerto);
  const diasHabiles = diasHabilesEntre(fechaPuertoTexto, hoy);

  if (diasHabiles <= 3) return ETAPAS.ARRIBO;
  if (diasHabiles <= 6) return ETAPAS.DESAGRUPE_ADUANA;
  if (diasHabiles <= 10) return ETAPAS.CLASIFICACION;
  if (diasHabiles <= 14) return ETAPAS.TRASLADO_A_PROVINCIA;
  if (diasHabiles <= 18) return ETAPAS.PREPARANDO_DISTRIBUCION;

  // Según tu criterio: distribución a partir de los 28 días hábiles
  if (diasHabiles < 28) return ETAPAS.PREPARANDO_DISTRIBUCION;
  if (diasHabiles <= 30) return ETAPAS.DISTRIBUCION;
  if (diasHabiles <= 34) return ETAPAS.ULTIMA_MILLA;

  return ETAPAS.CONTINUACION_DISTRIBUCION;
}

function construirSaludo(nombreEmbarcador, nombreConsignatario, estado) {
  const embarcador = limpiarTexto(nombreEmbarcador);
  const consignatario = limpiarTexto(nombreConsignatario);

  if (embarcador && consignatario) {
    return `Hola ${embarcador}, tu mercancía a consignatario ${consignatario} se encuentra en: ${estado}.`;
  }

  if (embarcador) {
    return `Hola ${embarcador}, tu mercancía se encuentra en: ${estado}.`;
  }

  if (consignatario) {
    return `Hola, tu mercancía a consignatario ${consignatario} se encuentra en: ${estado}.`;
  }

  return `Hola, tu mercancía se encuentra en: ${estado}.`;
}

// ================= PARSER DE LA BASE PEGADA =================
function parseTrackingSource(rawText) {
  const db = {};
  const lines = String(rawText || "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const cpkMatch = line.match(/CPK[-\s]?0*([0-9]{5,})/i);
    if (!cpkMatch) continue;

    const cpk = normalizarCPK(cpkMatch[1]);
    if (!cpk) continue;

    const fecha = extraerFecha(line);
    const campos = line.split("\t");
    const fechaIndex = campos.findIndex(c => limpiarTexto(c) === fecha);

    const { embarcador, consignatario } = fechaIndex >= 0
      ? extraerDatosPersonalesDesdeCampos(campos, fechaIndex)
      : { embarcador: "", consignatario: "" };

    // Intentar primero extraer estado explícito de la línea completa
    let estado = normalizarEstadoDesdeTexto(line);

    // Si no existe un estado claro en la línea, aplicar lógica por tiempo con la fecha
    if (!estado) {
      estado = estadoPorTiempo(fecha);
    }

    db[cpk] = {
      cpk,
      fecha,
      estado,
      descripcion: descripcionPorEstado(estado),
      embarcador,
      consignatario,
      raw: line
    };
  }

  return db;
}

function getTrackingDb() {
  return parseTrackingSource(RAW_TRACKING_SOURCE);
}

// ================= API =================
app.get("/api/health", (req, res) => {
  try {
    const db = getTrackingDb();

    return res.json({
      ok: true,
      mensaje: "Servidor activo",
      totalCPK: Object.keys(db).length
    });
  } catch (error) {
    console.error("Error en /api/health:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno en health"
    });
  }
});

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
      fecha: formatearFecha(item.fecha),
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

app.post("/api/chat", async (req, res) => {
  try {
    const mensaje = String(req.body?.mensaje || "").trim();

    if (!mensaje) {
      return res.status(400).json({
        ok: false,
        mensaje: "Falta mensaje"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        ok: false,
        mensaje: "Falta API KEY"
      });
    }

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
          { role: "user", content: mensaje }
        ],
        temperature: 0.35
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

// 404
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
