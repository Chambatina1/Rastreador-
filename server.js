import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "2mb" }));

// Espacio interno para pegar información de rastreo sin organizar.
const RAW_TRACKING_SOURCE = `
PEGUE AQUÍ SU INFORMACIÓN DE RASTREO SIN ORGANIZAR
Ejemplo:
CHAMBATINA MIAMI	GEO MIA		CPK-0255140	ENTREGADO	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEAS	10915	2026-03-09	ELSA BARRIOS PEREZ		86012204812	AVE 25 # 3017 Rpto. LA SIERRA e/ 30 y 34, PLAYA, LA HABANA	53358593	ERISBEL FORNARIS			2.99	0	1	42.7	0.579	0.5	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0255139	ENTREGADO	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEA	10916	2026-03-09	ELSA BARRIOS PEREZ		86012204812	AVE 25 # 3017 Rpto. LA SIERRA e/ 30 y 34, PLAYA, LA HABANA	53358593	ERISBEL FORNARIS			0	0	1	19.8	0.579	0	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0255137	ENTREGADO	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEAS	10916	2026-03-09	ELSA BARRIOS PEREZ		86012204812	AVE 25 # 3017 Rpto. LA SIERRA e/ 30 y 34, PLAYA, LA HABANA	53358593	ERISBEL FORNARIS			2.99	0	1	34.9	0.579	0.5	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0255136	EN DISTRIBUCION	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	MISCELANEAS	10917	2026-03-09	ELSA BARRIOS PEREZ		86012204812	AVE 25 # 3017 Rpto. LA SIERRA e/ 30 y 34, PLAYA, LA HABANA	53358593	ERISBEL FORNARIS			2.99	0	1	19.6	0.579	0.5	0	0
CHAMBATINA MIAMI	GEO MIA		CPK-0255135	EN DISTRIBUCION	Sí	140(CPK-309)	REGULA/(BSIU 9722526)/(CWPS26167603)	ENVIO	JUEGO DE HERRAMIENTAS DE MANO	10916	2026-03-09	ELSA BARRIOS PEREZ		86012204812	AVE 25 # 3017 Rpto. LA SIERRA e/ 30 y 34, PLAYA, LA HABANA	53358593	ERISBEL FORNARIS			0	0	1	20	0.579	0	0	0
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

function descripcionPorEstado(estado) {
  const e = String(estado || "").toUpperCase().trim();

  if (e === "EN AGENCIA") {
    return "Tu paquete fue recibido y ya está en agencia.";
  }
  if (e === "EN DISTRIBUCION" || e === "EN DISTRIBUCIÓN") {
    return "Tu paquete se encuentra en distribución.";
  }
  if (e === "ENTREGADO") {
    return "Tu paquete fue entregado.";
  }
  if (e === "EN ALMACEN" || e === "EN ALMACÉN") {
    return "Tu paquete se encuentra en almacén.";
  }
  if (e === "DESPACHO") {
    return "Tu paquete se encuentra en despacho.";
  }
  if (e === "CLASIFICADO") {
    return "Tu paquete fue clasificado y continúa su proceso logístico.";
  }
  if (e === "ARRIBO") {
    return "Tu paquete arribó y sigue su proceso logístico.";
  }
  if (e === "CANAL ROJO") {
    return "Tu paquete está en revisión logística.";
  }

  return "Tu paquete se encuentra en proceso logístico.";
}

function extraerEstado(linea) {
  const estadosOrdenados = [
    "EN DISTRIBUCION",
    "EN DISTRIBUCIÓN",
    "EN AGENCIA",
    "EN ALMACEN",
    "EN ALMACÉN",
    "CANAL ROJO",
    "CLASIFICADO",
    "DESPACHO",
    "ENTREGADO",
    "ARRIBO"
  ];

  const upper = String(linea || "").toUpperCase();

  for (const estado of estadosOrdenados) {
    if (upper.includes(estado)) {
      return estado;
    }
  }

  return "EN PROCESO";
}

function limpiarDescripcion(texto) {
  return String(texto || "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRawTrackingSource(rawText) {
  const result = {};
  const lines = String(rawText || "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const upper = line.toUpperCase();

    if (
      upper.includes("PEGUE AQUÍ") ||
      upper.includes("EJEMPLO:")
    ) {
      continue;
    }

    const cpkMatch = line.match(/CPK[-\s]?0*([0-9]{5,})/i);
    if (!cpkMatch) continue;

    const cpk = normalizarCPK(cpkMatch[1]);
    if (!cpk) continue;

    const fechaMatch = line.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    const fecha = fechaMatch ? fechaMatch[1] : "";

    const estado = extraerEstado(line);

    let descripcion = "";

    if (fecha) {
      const partes = line.split(fecha);
      descripcion = limpiarDescripcion(partes.slice(1).join(" "));
    }

    if (!descripcion) {
      const estadoIndex = upper.indexOf(estado);
      if (estadoIndex >= 0) {
        descripcion = limpiarDescripcion(line.slice(estadoIndex + estado.length));
      }
    }

    if (!descripcion) {
      descripcion = descripcionPorEstado(estado);
    }

    result[cpk] = {
      fecha,
      estado,
      descripcion
    };
  }

  return result;
}

function buildTrackingDb() {
  const rawParsed = parseRawTrackingSource(RAW_TRACKING_SOURCE);

  return {
    ...rawParsed,
    ...CPK_DB
  };
}

function getActiveTrackingDb() {
  return buildTrackingDb();
}

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
- Tiempo de entrega: de 18 a 30 días hábiles.

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

EQUIPOS DISPONIBLES EN OFICINA
INVERSORES
- 6.5 kW: costo equipo 988, envío 145, total 1133.
- 10 kW: costo equipo 1254, envío 178, total 1432.
- 12 kW: costo equipo 2146, envío 257, total 2403.

BATERÍAS
- 5 kilos, aproximadamente 5 kWh: costo equipo 886, envío 352, total 1238.
- 10 kilos, aproximadamente 10 kWh: costo equipo 1651, envío 536, total 2187.
- 16 kilos, aproximadamente 16 kWh: costo equipo 1825, envío 696, total 2521.

OFICINA
- Dirección: 7523 Aloma Ave, Winter Park, FL 32792, Suite 112.
- Teléfono Geo Adriana: 786-942-6904.
- Teléfono adicional: 786-784-6421.

PROCESO DE COMPRA POR TIKTOK O AMAZON
- El cliente compra el producto.
- Luego lo envía a la dirección de Chambatina.
- En TikTok la dirección debe ponerse completa manualmente.
- Es importante escribir “7523 Aloma Ave” correctamente.
- A veces TikTok sugiere automáticamente “Aloma Pine”, pero eso no es correcto.
- Debe usarse “Aloma Ave” y también incluir Suite 112.

COMPORTAMIENTO DEL CHAT
- Si preguntan por precios, responde con cifras concretas.
- Si preguntan por equipos disponibles, menciona primero los inversores y baterías de oficina.
- Si preguntan por la oficina, da dirección y teléfonos.
- Si preguntan cómo funciona TikTok o Amazon, explica el proceso anterior con claridad.
- Si preguntan por rastreo específico, indícales que usen el CPK.
- Si preguntan por tiempo de entrega, responde: 18 a 30 días hábiles.
- Mantén tono serio, comercial y ordenado.
`;

app.get("/api/health", (req, res) => {
  const rawParsed = parseRawTrackingSource(RAW_TRACKING_SOURCE);
  const activeDb = getActiveTrackingDb();

  res.json({
    ok: true,
    rastreosManuales: Object.keys(CPK_DB).length,
    rastreosRaw: Object.keys(rawParsed).length,
    rastreosActivos: Object.keys(activeDb).length
  });
});

app.get("/api/rastreo/:cpk", (req, res) => {
  try {
    const activeDb = getActiveTrackingDb();
    const cpk = normalizarCPK(req.params.cpk || "");
    const data = activeDb[cpk];

    if (!data) {
      return res.json({
        ok: false,
        mensaje: "No se encontró el CPK"
      });
    }

    return res.json({
      ok: true,
      cpk,
      fecha: data.fecha || "",
      estado: data.estado || "EN PROCESO",
      descripcion: data.descripcion || "Tu paquete se encuentra en proceso logístico."
    });
  } catch (error) {
    console.error("Error en /api/rastreo:", error);
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
