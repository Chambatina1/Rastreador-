import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "2mb" }));

const BUSINESS_CONTEXT = `
Eres el asistente oficial de Chambatina.

Responde siempre en español claro, profesional, útil y directo.
No inventes precios, condiciones, políticas ni disponibilidad.
No hables de backend, claves, configuración interna ni detalles técnicos.
Si no sabes algo con certeza, dilo con honestidad.

INFORMACIÓN GENERAL DEL NEGOCIO
- Precio por libra: 1.99 más 10 dólares por manejo, seguro, arancel y transporte.
- Si recogemos en la puerta de su casa: 2.30 por libra.
- Si compran por nuestros links de TikTok: 1.80 por libra.
- Tiempo de entrega: de 18 a 30 días hábiles una vez que toca puerto.
- Aproximadamente a los 7 días de la entrega toca puerto.

CAJAS
- 12x12x12 hasta 60 libras: 45 dólares.
- 15x15x15 hasta 100 libras: 65 dólares.
- 16x16x16 hasta 100 libras: 85 dólares.

CARGOS Y MANEJO
- Equipos: de 15 a 35 dólares adicionales.
- Equipos de más de 200 libras: 45 dólares adicionales.
- Bicicleta niño sin empacar: 25 dólares.
- Bicicleta niño empacada: 15 dólares.
- Bicicleta adulto sin empacar: 45 dólares.
- Bicicleta adulto empacada: 25 dólares.
- Bicicleta eléctrica en caja: 35 dólares.
- Bicicleta eléctrica sin caja: 50 dólares.
- Colchones hasta 50 lb: 15 dólares.
- Colchones de más de 50 lb: 40 dólares total.
- Ollas pequeñas: 12 dólares.
- Olla arrocera o multifuncional: 22 dólares.
- Manejo general: 25 dólares.
- Equipos con retractilado empacados: 35 dólares.
- Equipos con retractilado sin empacar: 50 dólares.
- Retractilado externo: cargo variable.

OFICINA
- Dirección: 7523 Aloma Ave, Winter Park, FL 32792, Suite 112.
- Teléfono Geo: 786-942-6904.
- Teléfono Adriana: 786-784-6421.

PROCESO DE COMPRA POR TIKTOK O AMAZON
- El cliente compra el producto por el link de TikTok que le brinda la oficina.
- Luego lo envía a la dirección de Chambatina.
- En TikTok la dirección debe ponerse completa manualmente.
- Es importante escribir “7523 Aloma Ave” correctamente.
- A veces TikTok sugiere automáticamente “Aloma Pine”, pero eso no es correcto.
- Debe usarse “Aloma Ave” y también incluir Suite 112.

COMPORTAMIENTO DEL CHAT
- Si preguntan por precios, responde con cifras concretas.
- Si preguntan por precio llevando los productos a la oficina, siempre es a 1.99 la libra.
- Si preguntan por recogida en casa, responde 2.30 la libra.
- Si preguntan por precio usando links de TikTok, responde 1.80 la libra.
- Si preguntan por la oficina, da dirección y teléfonos.
- Si preguntan cómo funciona TikTok o Amazon, explica el proceso anterior con claridad.
- Si preguntan por rastreo específico, indícales que usen el CPK.
- Si preguntan por tiempo de entrega, responde: 18 a 30 días hábiles una vez que toca puerto.
- El paquete toca puerto aproximadamente en 7 días luego de la entrega.
- Mantén tono serio, comercial y ordenado.
`;

// Espacio interno para pegar información de rastreo sin organizar.
const RAW_TRACKING_SOURCE = `
PEGUE AQUÍ SU INFORMACIÓN DE RASTREO SIN ORGANIZAR
Ejemplo:
CHAMBATINA MIAMI	GEO MIA		CPK-0255140	ENTREGADO	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEAS	10915	2026-03-09	ELSA BARRIOS PEREZ		86012204812	AVE 25 # 3017 Rpto. LA SIERRA e/ 30 y 34, PLAYA, LA HABANA	53358593	ERISBEL FORNARIS			2.99	0	1	42.7	0.579	0.5	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0253091	ENTREGADO	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEA 15	10919	2026-03-01	MARISELA GONZALEZ MIRABAL		63062002411	CALLE 56 # 24109 Rpto. PUNTA BRAVA e/ 241 y 243, LA LISA, LA HABANA	53995335	XIOMARA GONZALEZ			0	0	1	80	1.953	219.32	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0253089	EN TRANSITO PINAR DEL RIO	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEA 15	10916	2026-03-01	JOSE LUIS VELAZQUEZ HIDALGO		70101308149	CALLE B # 12A INTERIOR Rpto. 10 DE OCTUBRE e/ PRIMERA y SEGUNDA, PINAR DEL RIO, PINAR DEL RIO	53373909	ADELAIDA ROBAINA			0	0	1	50	1.953	219.32	0	0
CPK-0260443 EN AGENCIA 2026-03-26 Tu paquete fue recibido...
CPK-0259844 EN AGENCIA 2026-03-24 En proceso interno...
`;

// Base manual fija
const CPK_DB = {
  "260443": {
    fecha: "2026-03-26",
    estado: "EN AGENCIA",
    descripcion: "Tu paquete fue recibido y ya está en agencia."
  },
  "259844": {
    fecha: "2026-03-24",
    estado: "EN AGENCIA",
    descripcion: "Tu paquete fue recibido y se encuentra en proceso interno."
  }
};

function normalizarCPK(raw) {
  const soloNumeros = String(raw || "").replace(/\D/g, "");
  if (!soloNumeros) return "";
  return soloNumeros.replace(/^0+/, "") || soloNumeros;
}

function limpiarTexto(texto) {
  return String(texto || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarEstadoInterno(estadoRaw) {
  const e = limpiarTexto(estadoRaw).toUpperCase();

  if (!e) return "EN PROCESO";

  if (e.includes("CANAL ROJO")) return "RETORNO A ALMACEN";
  if (e.includes("ENTREGADO")) return "EN DISTRIBUCION";
  if (e.includes("DESPACHADO")) return "DESPACHO";
  if (e.includes("EN DISTRIBUCIÓN")) return "EN DISTRIBUCION";
  if (e.includes("EN ALMACÉN")) return "EN ALMACEN";
  if (e.includes("PRÓXIMO A DISTRIBUCIÓN")) return "PROXIMO A DISTRIBUCION";
  if (e.startsWith("EN TRÁNSITO")) return e.replace("TRÁNSITO", "TRANSITO");

  return e;
}

function calcularDiasDesdeEntrega(fechaTexto) {
  if (!fechaTexto) return 0;

  const hoy = new Date();
  const fecha = new Date(`${fechaTexto}T00:00:00`);

  if (isNaN(fecha.getTime())) return 0;

  const diffMs = hoy - fecha;
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return dias < 0 ? 0 : dias;
}

function calcularDiasHabilesDesdePuerto(fechaTexto) {
  if (!fechaTexto) return 0;

  const fechaEntrega = new Date(`${fechaTexto}T00:00:00`);
  if (isNaN(fechaEntrega.getTime())) return 0;

  const fechaPuerto = new Date(fechaEntrega);
  fechaPuerto.setDate(fechaPuerto.getDate() + 7);

  const hoy = new Date();
  if (fechaPuerto > hoy) return 0;

  let diasHabiles = 0;
  const cursor = new Date(fechaPuerto);

  while (cursor <= hoy) {
    const dia = cursor.getDay();
    if (dia !== 0 && dia !== 6) {
      diasHabiles++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return diasHabiles;
}

function faseLogisticaPorTiempo(fechaTexto) {
  const diasEntrega = calcularDiasDesdeEntrega(fechaTexto);
  const diasHabilesPuerto = calcularDiasHabilesDesdePuerto(fechaTexto);

  if (diasEntrega <= 7) return "PREVIO_A_PUERTO";
  if (diasHabilesPuerto <= 3) return "ARRIBO";
  if (diasHabilesPuerto <= 6) return "DESPACHO";
  if (diasHabilesPuerto <= 10) return "EN ALMACEN";
  if (diasHabilesPuerto <= 15) return "EN TRANSITO";
  if (diasHabilesPuerto <= 22) return "PROXIMO A DISTRIBUCION";
  if (diasHabilesPuerto <= 30) return "EN DISTRIBUCION";
  return "CONTACTAR SOPORTE";
}

function descripcionPorEstado(estado, fechaTexto) {
  const e = normalizarEstadoInterno(estado);
  const diasEntrega = calcularDiasDesdeEntrega(fechaTexto);
  const diasHabilesPuerto = calcularDiasHabilesDesdePuerto(fechaTexto);

  if (diasEntrega <= 7) {
    return "Tu paquete está en etapa previa a puerto, avanzando dentro del proceso inicial de salida y embarque.";
  }

  if (diasHabilesPuerto > 30 || e === "CONTACTAR SOPORTE") {
    return "Tu paquete presenta una demora mayor al rango habitual. Por favor, contacta con soporte para revisar tu caso.";
  }

  if (e === "RETORNO A ALMACEN") {
    return "Tu paquete fue redirigido al almacén central por solicitud de transitoria para revisión adicional.";
  }

  if (e === "EN AGENCIA") {
    return "Tu paquete fue recibido y ya está en agencia.";
  }

  if (e === "CLASIFICADO") {
    return "Tu paquete fue clasificado y continúa su proceso logístico.";
  }

  if (e === "EMBARCADO") {
    return "Tu paquete ya fue embarcado y continúa avanzando dentro del recorrido logístico.";
  }

  if (e === "ARRIBO") {
    return "Tu paquete arribó y sigue su proceso logístico.";
  }

  if (e === "DESPACHO") {
    return "Tu paquete se encuentra en despacho.";
  }

  if (e === "EN ALMACEN") {
    return "Tu paquete se encuentra en almacén.";
  }

  if (e.startsWith("EN TRANSITO")) {
    return "Tu paquete se encuentra en tránsito hacia su siguiente fase logística.";
  }

  if (e === "PROXIMO A DISTRIBUCION") {
    return "Tu paquete está próximo a distribución.";
  }

  if (e === "EN DISTRIBUCION") {
    return "Tu paquete se encuentra en distribución.";
  }

  return "Tu paquete se encuentra en proceso logístico.";
}

function detalleOptimistaCada3Dias(fechaTexto, estado) {
  const e = normalizarEstadoInterno(estado);
  const diasEntrega = calcularDiasDesdeEntrega(fechaTexto);
  const diasHabilesPuerto = calcularDiasHabilesDesdePuerto(fechaTexto);

  if (diasEntrega <= 3) {
    return "Tu paquete inició correctamente su proceso logístico. Se encuentra en organización y preparación inicial.";
  }
  if (diasEntrega <= 7) {
    return "Tu paquete continúa avanzando hacia puerto. Esta etapa forma parte del proceso previo al tránsito principal.";
  }

  if (diasHabilesPuerto > 30 || e === "CONTACTAR SOPORTE") {
    return "El tiempo supera el rango habitual de 18 a 30 días hábiles una vez que toca puerto. Te recomendamos contactar con soporte para una revisión personalizada.";
  }

  if (e === "RETORNO A ALMACEN") {
    if (diasHabilesPuerto <= 3) return "Tu paquete regresó al almacén central para una revisión adicional. Este control ayuda a que continúe correctamente.";
    if (diasHabilesPuerto <= 6) return "Tu paquete sigue bajo revisión adicional en almacén central. Este paso forma parte del control logístico.";
    if (diasHabilesPuerto <= 9) return "Tu paquete continúa en revisión y luego retomará su avance dentro del flujo normal.";
    return "Tu paquete se mantiene en control adicional para asegurar que siga su ruta de la mejor manera posible.";
  }

  if (diasHabilesPuerto <= 3) {
    return "Tu paquete ya tocó puerto y está entrando en su etapa inicial dentro del proceso principal.";
  }
  if (diasHabilesPuerto <= 6) {
    return "Tu paquete continúa avanzando luego de puerto y se encuentra en una fase de despacho y organización logística.";
  }
  if (diasHabilesPuerto <= 9) {
    return "Tu paquete sigue progresando de forma normal dentro del proceso posterior a puerto.";
  }
  if (diasHabilesPuerto <= 12) {
    return "Tu paquete avanza favorablemente y ya se encuentra en una etapa más organizada dentro del flujo logístico.";
  }
  if (diasHabilesPuerto <= 15) {
    return "Tu paquete continúa su recorrido de manera estable y se acerca a fases más avanzadas.";
  }
  if (diasHabilesPuerto <= 18) {
    return "Tu paquete sigue en movimiento dentro del rango habitual y con buen progreso logístico.";
  }
  if (diasHabilesPuerto <= 21) {
    return "Tu paquete se mantiene en tránsito dentro del proceso esperado y continúa acercándose a distribución.";
  }
  if (diasHabilesPuerto <= 24) {
    return "Tu paquete está entrando en una etapa muy avanzada del proceso y se acerca a distribución.";
  }
  if (diasHabilesPuerto <= 27) {
    return "Tu paquete continúa en tramo final del recorrido logístico. El proceso sigue caminando favorablemente.";
  }
  return "Tu paquete ya se encuentra en la fase final del proceso logístico, dentro del rango estimado.";
}

function extraerEstado(linea) {
  const upper = String(linea || "").toUpperCase();

  if (upper.includes("CANAL ROJO")) return "RETORNO A ALMACEN";
  if (upper.includes("ENTREGADO")) return "EN DISTRIBUCION";

  const estadosOrdenados = [
    "RETORNO A ALMACEN",
    "PRÓXIMO A DISTRIBUCIÓN",
    "PROXIMO A DISTRIBUCION",
    "EN DISTRIBUCIÓN",
    "EN DISTRIBUCION",
    "EN TRANSITO",
    "EN TRÁNSITO",
    "EN AGENCIA",
    "EN ALMACÉN",
    "EN ALMACEN",
    "CLASIFICADO",
    "EMBARCADO",
    "ARRIBO",
    "DESPACHADO",
    "DESPACHO"
  ];

  for (const estado of estadosOrdenados) {
    if (upper.includes(estado)) {
      return normalizarEstadoInterno(estado);
    }
  }

  return "EN PROCESO";
}

function resolverEstadoVisible(estadoReal, fechaTexto) {
  const diasEntrega = calcularDiasDesdeEntrega(fechaTexto);
  const diasHabilesPuerto = calcularDiasHabilesDesdePuerto(fechaTexto);
  const real = normalizarEstadoInterno(estadoReal);

  if (diasEntrega <= 7) {
    if (real === "EN AGENCIA" || real === "CLASIFICADO" || real === "EMBARCADO") {
      return real;
    }
    return "EMBARCADO";
  }

  if (diasHabilesPuerto > 30) {
    return "CONTACTAR SOPORTE";
  }

  const estadosValidos = [
    "EN AGENCIA",
    "CLASIFICADO",
    "EMBARCADO",
    "ARRIBO",
    "DESPACHO",
    "EN ALMACEN",
    "EN TRANSITO",
    "PROXIMO A DISTRIBUCION",
    "EN DISTRIBUCION",
    "RETORNO A ALMACEN"
  ];

  if (estadosValidos.includes(real) || real.startsWith("EN TRANSITO")) {
    return real;
  }

  return faseLogisticaPorTiempo(fechaTexto);
}

function parseRawTrackingSource(rawText) {
  const result = {};
  const lines = String(rawText || "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const upper = line.toUpperCase();

    if (upper.includes("PEGUE AQUÍ") || upper.includes("EJEMPLO:")) {
      continue;
    }

    const cpkMatch = line.match(/CPK[-\s]?0*([0-9]{5,})/i);
    if (!cpkMatch) continue;

    const cpk = normalizarCPK(cpkMatch[1]);
    if (!cpk) continue;

    const fechaMatch = line.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    const fecha = fechaMatch ? fechaMatch[1] : "";

    const estadoExtraido = extraerEstado(line);
    const estadoVisible = resolverEstadoVisible(estadoExtraido, fecha);

    let descripcion = "";
    if (fecha) {
      const partes = line.split(fecha);
      descripcion = limpiarTexto(partes.slice(1).join(" "));
    }

    if (!descripcion) {
      descripcion = descripcionPorEstado(estadoVisible, fecha);
    }

    result[cpk] = {
      fecha,
      estado: estadoVisible,
      descripcion
    };
  }

  return result;
}

function buildTrackingDb() {
  const rawParsed = parseRawTrackingSource(RAW_TRACKING_SOURCE);
  const baseNormalizada = {};

  for (const [cpk, item] of Object.entries(CPK_DB)) {
    const fecha = item.fecha || "";
    const estadoVisible = resolverEstadoVisible(item.estado, fecha);

    baseNormalizada[cpk] = {
      ...item,
      estado: estadoVisible,
      descripcion: item.descripcion || descripcionPorEstado(estadoVisible, fecha)
    };
  }

  return {
    ...rawParsed,
    ...baseNormalizada
  };
}

function getActiveTrackingDb() {
  return buildTrackingDb();
}

function resolverSeguimiento(cpkRaw) {
  const db = getActiveTrackingDb();
  const cpk = normalizarCPK(cpkRaw);

  if (!cpk) {
    return {
      ok: false,
      mensaje: "Debes escribir un número CPK válido."
    };
  }

  const item = db[cpk];

  if (!item) {
    return {
      ok: false,
      mensaje: "No encontramos información para ese CPK. Verifica el número y vuelve a intentarlo."
    };
  }

  const diasEntrega = calcularDiasDesdeEntrega(item.fecha);
  const diasHabilesPuerto = calcularDiasHabilesDesdePuerto(item.fecha);
  const estadoVisible = resolverEstadoVisible(item.estado, item.fecha);

  return {
    ok: true,
    cpk,
    fecha: item.fecha || "",
    diasDesdeEntrega: diasEntrega,
    diasHabilesDesdePuerto: diasHabilesPuerto,
    puertoEstimadoEn: "7 días después de la entrega",
    rangoEstimado: "18 a 30 días hábiles una vez que toca puerto",
    estado: estadoVisible,
    descripcion: descripcionPorEstado(estadoVisible, item.fecha),
    detalle: detalleOptimistaCada3Dias(item.fecha, estadoVisible)
  };
}

app.get("/api/health", (req, res) => {
  try {
    const rawParsed = parseRawTrackingSource(RAW_TRACKING_SOURCE);
    const activeDb = getActiveTrackingDb();

    res.json({
      ok: true,
      mensaje: "Servidor activo",
      rastreosManuales: Object.keys(CPK_DB).length,
      rastreosRaw: Object.keys(rawParsed).length,
      rastreosActivos: Object.keys(activeDb).length
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error interno en health",
      error: String(error.message || error)
    });
  }
});

app.get("/api/rastreo/:cpk", (req, res) => {
  try {
    const resultado = resolverSeguimiento(req.params.cpk);
    res.json(resultado);
  } catch (error) {
    console.error("Error en /api/rastreo:", error);
    res.status(500).json({
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
        mensaje: "Falta el mensaje"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        ok: false,
        mensaje: "No está configurada la variable OPENAI_API_KEY"
      });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("Error OpenAI:", data);
      return res.status(500).json({
        ok: false,
        mensaje: data?.error?.message || "Error al consultar OpenAI"
      });
    }

    const respuesta =
      data?.choices?.[0]?.message?.content?.trim() || "No hubo respuesta.";

    return res.json({
      ok: true,
      respuesta
    });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno del servidor"
    });
  }
});

app.get("/", (req, res) => {
  res.send("API de rastreo Chambatina activa.");
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: "Ruta no encontrada"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
