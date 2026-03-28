import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor Chambatina activo");
});

// =====================================================
// BASE DE DATOS DE CPK
// AQUI PEGAS TUS CPK MANUALMENTE EN ESTE FORMATO
// =====================================================
const CPK_DB = {
  "260443": {
    fecha: "2026-03-26",
    estado: "EN AGENCIA",
    descripcion: "Tu paquete fue recibido y ya está en agencia."
  },

  "260440": {
    fecha: "2026-03-26",
    estado: "EN AGENCIA",
    descripcion: "Tu paquete fue recibido y ya se encuentra en agencia."
  },

  "259847": {
    fecha: "2026-03-24",
    estado: "EN AGENCIA",
    descripcion: "Tu paquete ya está en agencia y debidamente registrado."
  },

  "259844": {
    fecha: "2026-03-24",
    estado: "EN AGENCIA",
    descripcion: "Tu paquete fue recibido en agencia y está preparado para continuar."
  }
};

// =====================================================
// BASE DE DATOS DE PRECIOS CHAMBATINA
// =====================================================
const PRECIOS = {
  general: {
    bicicletaNinoSinEmpacar: 25,
    bicicletaNinoEmpacada: 15,
    bicicletaAdultoSinEmpacar: 45,
    bicicletaAdultoEmpacada: 25,
    bicicletaElectricaEnCaja: 35,
    bicicletaElectricaSinCaja: 50,
    colchonHasta50: 15,
    colchonMas50: 40,
    ollasPequenas: 12,
    ollaArroceraMultifuncional: 22,
    manejoGeneral: 25,
    equiposMas200: 45,
    retractiladoEmpacado: 35,
    retractiladoSinEmpacar: 50,
    retractiladoExterno: "Cargo variable"
  },

  solar: {
    inversores: {
      "6.5kw": { equipo: 988, envio: 145, total: 1133 },
      "10kw": { equipo: 1254, envio: 178, total: 1432 },
      "12kw": { equipo: 2146, envio: 257, total: 2403 }
    },
    baterias: {
      "5kwh": { equipo: 886, envio: 352, total: 1238 },
      "10kwh": { equipo: 1651, envio: 536, total: 2187 },
      "16kwh": { equipo: 1825, envio: 696, total: 2521 }
    }
  }
};

// =====================================================
// FUNCIONES DE APOYO
// =====================================================
function parseDateLocal(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(startDateStr) {
  const start = parseDateLocal(startDateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today - start;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function normalizeStatus(status) {
  return (status || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getEstimatedStage(days) {
  if (days <= 2) {
    return {
      estado: "EN AGENCIA",
      detalle: "Tu paquete fue recibido y se encuentra en la etapa inicial del proceso logístico."
    };
  }

  if (days <= 5) {
    return {
      estado: "CLASIFICADO",
      detalle: "Tu paquete ya fue organizado según su ruta y continúa avanzando dentro del proceso logístico."
    };
  }

  if (days <= 8) {
    return {
      estado: "DESPACHO",
      detalle: "Tu paquete continúa su recorrido interno y avanza hacia la siguiente fase logística."
    };
  }

  if (days <= 12) {
    return {
      estado: "EMBARCADO",
      detalle: "Tu paquete ya salió dentro del flujo principal del proceso y sigue avanzando."
    };
  }

  if (days <= 18) {
    return {
      estado: "EN TRANSITO",
      detalle: "Tu paquete se encuentra en tránsito dentro de su recorrido logístico estimado."
    };
  }

  if (days <= 24) {
    return {
      estado: "CLASIFICADO PARA ENTREGA",
      detalle: "Tu paquete ya está en una etapa avanzada y acercándose a la fase final de distribución."
    };
  }

  if (days <= 30) {
    return {
      estado: "DISTRIBUCION",
      detalle: "Tu paquete se encuentra en una fase final del proceso logístico y próximo a su entrega."
    };
  }

  return {
    estado: "PROCESO AVANZADO",
    detalle: "Tu paquete ha superado el tiempo estimado inicial y continúa dentro del proceso logístico."
  };
}

function getPriority(status) {
  const map = {
    "EN AGENCIA": 1,
    "CLASIFICADO": 2,
    "DESAGRUPE": 3,
    "DESPACHO": 4,
    "DESPACHADO": 5,
    "EMBARCADO": 6,
    "EN TRANSITO": 7,
    "CLASIFICADO PARA ENTREGA": 8,
    "DISTRIBUCION": 9,
    "EN ALMACEN": 9,
    "ENTREGADO": 10,
    "DEVUELTO": 10,
    "PROCESO AVANZADO": 11
  };

  const normalized = normalizeStatus(status);

  if (normalized.startsWith("EN DISTRIBUCION")) return 9;
  if (normalized.startsWith("EN TRANSITO")) return 7;
  if (normalized.startsWith("EN ALMACEN")) return 9;

  return map[normalized] || 0;
}

function mergeRealAndEstimated(realStatus, estimatedStatus) {
  const realPriority = getPriority(realStatus);
  const estimatedPriority = getPriority(estimatedStatus);

  if (!realStatus) return estimatedStatus;
  if (realPriority >= estimatedPriority) return realStatus;
  return estimatedStatus;
}

function getExplanationByStatus(status, customDescription, days) {
  const normalized = normalizeStatus(status);

  if (normalized === "ENTREGADO") {
    return "Tu paquete figura como entregado correctamente.";
  }

  if (normalized === "DEVUELTO") {
    return "Tu paquete figura como devuelto en el sistema.";
  }

  if (normalized === "EN AGENCIA") {
    return customDescription || "Tu paquete fue recibido y está en agencia, listo para continuar su proceso.";
  }

  if (normalized === "CLASIFICADO") {
    return "Tu paquete ya fue organizado según su ruta logística y sigue avanzando.";
  }

  if (normalized === "DESAGRUPE") {
    return "Tu paquete se encuentra en una fase de separación y preparación para continuar el proceso.";
  }

  if (normalized === "DESPACHO" || normalized === "DESPACHADO") {
    return "Tu paquete ya fue despachado y continúa avanzando dentro del proceso logístico.";
  }

  if (normalized === "EMBARCADO") {
    return "Tu paquete ya fue embarcado y sigue avanzando en su recorrido logístico.";
  }

  if (normalized.startsWith("EN TRANSITO")) {
    return "Tu paquete se encuentra en tránsito y continúa moviéndose dentro del proceso estimado.";
  }

  if (normalized.startsWith("EN ALMACEN")) {
    return "Tu paquete se encuentra en almacén dentro de una etapa avanzada del proceso logístico.";
  }

  if (normalized.startsWith("EN DISTRIBUCION") || normalized === "DISTRIBUCION") {
    return "Tu paquete se encuentra en distribución y próximo a completar su recorrido.";
  }

  if (normalized === "CLASIFICADO PARA ENTREGA") {
    return "Tu paquete ya está en una etapa avanzada y acercándose a la fase final.";
  }

  if (normalized === "PROCESO AVANZADO") {
    return "Tu paquete ha superado la ventana inicial estimada y sigue dentro del proceso logístico.";
  }

  return customDescription || `Han transcurrido ${days} días desde el registro y el paquete continúa avanzando dentro del proceso logístico.`;
}

function buildCPKReply(cpkNumber, record) {
  const days = daysBetween(record.fecha);
  const estimated = getEstimatedStage(days);
  const finalStatus = mergeRealAndEstimated(record.estado, estimated.estado);
  const explanation = getExplanationByStatus(finalStatus, record.descripcion, days);

  return [
    `CPK: ${cpkNumber}`,
    `Estado actual: ${finalStatus}`,
    `Fecha de referencia: ${record.fecha}`,
    `Días transcurridos: ${days}`,
    ``,
    explanation,
    ``,
    `Orientación automática: este estado se calcula con base en la fecha registrada y el avance lógico estimado del proceso.`
  ].join("\n");
}

function buildGeneralPriceReply() {
  return [
    "Tabla general de precios Chambatina:",
    "",
    `Bicicleta niño sin empacar: $${PRECIOS.general.bicicletaNinoSinEmpacar}`,
    `Bicicleta niño empacada: $${PRECIOS.general.bicicletaNinoEmpacada}`,
    `Bicicleta adulto sin empacar: $${PRECIOS.general.bicicletaAdultoSinEmpacar}`,
    `Bicicleta adulto empacada: $${PRECIOS.general.bicicletaAdultoEmpacada}`,
    `Bicicleta eléctrica en caja: $${PRECIOS.general.bicicletaElectricaEnCaja}`,
    `Bicicleta eléctrica sin caja: $${PRECIOS.general.bicicletaElectricaSinCaja}`,
    `Colchones hasta 50 lb: $${PRECIOS.general.colchonHasta50}`,
    `Colchones más de 50 lb: $${PRECIOS.general.colchonMas50} total`,
    `Ollas pequeñas: $${PRECIOS.general.ollasPequenas}`,
    `Olla arrocera / multifuncional: $${PRECIOS.general.ollaArroceraMultifuncional}`,
    `Manejo general: $${PRECIOS.general.manejoGeneral}`,
    `Equipos +200 lb: $${PRECIOS.general.equiposMas200}`,
    `Equipos con retractilado empacados: $${PRECIOS.general.retractiladoEmpacado}`,
    `Equipos con retractilado sin empacar: $${PRECIOS.general.retractiladoSinEmpacar}`,
    `Retractilado externo: ${PRECIOS.general.retractiladoExterno}`
  ].join("\n");
}

function buildSolarReply() {
  return [
    "Tabla de precios solar Chambatina:",
    "",
    "Inversores:",
    `6.5 kW → Equipo: $${PRECIOS.solar.inversores["6.5kw"].equipo} | Envío: $${PRECIOS.solar.inversores["6.5kw"].envio} | Total: $${PRECIOS.solar.inversores["6.5kw"].total}`,
    `10 kW → Equipo: $${PRECIOS.solar.inversores["10kw"].equipo} | Envío: $${PRECIOS.solar.inversores["10kw"].envio} | Total: $${PRECIOS.solar.inversores["10kw"].total}`,
    `12 kW → Equipo: $${PRECIOS.solar.inversores["12kw"].equipo} | Envío: $${PRECIOS.solar.inversores["12kw"].envio} | Total: $${PRECIOS.solar.inversores["12kw"].total}`,
    "",
    "Baterías:",
    `5 kilos (≈5 kWh) → Equipo: $${PRECIOS.solar.baterias["5kwh"].equipo} | Envío: $${PRECIOS.solar.baterias["5kwh"].envio} | Total: $${PRECIOS.solar.baterias["5kwh"].total}`,
    `10 kilos (≈10 kWh) → Equipo: $${PRECIOS.solar.baterias["10kwh"].equipo} | Envío: $${PRECIOS.solar.baterias["10kwh"].envio} | Total: $${PRECIOS.solar.baterias["10kwh"].total}`,
    `16 kilos (≈16 kWh) → Equipo: $${PRECIOS.solar.baterias["16kwh"].equipo} | Envío: $${PRECIOS.solar.baterias["16kwh"].envio} | Total: $${PRECIOS.solar.baterias["16kwh"].total}`
  ].join("\n");
}

// =====================================================
// CHAT
// =====================================================
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Falta el mensaje" });
    }

    const texto = userMessage.toLowerCase();
    const posibleCPK = userMessage.replace(/\D/g, "").replace(/^0+/, "");

    // CONSULTA CPK
    if (CPK_DB[posibleCPK]) {
      const item = CPK_DB[posibleCPK];

      return res.json({
        reply: buildCPKReply(posibleCPK, item)
      });
    }

    // PRECIOS GENERALES
    if (
      texto.includes("tabla general") ||
      texto.includes("precios generales") ||
      (texto.includes("precio") && texto.includes("general"))
    ) {
      return res.json({ reply: buildGeneralPriceReply() });
    }

    if (texto.includes("bicicleta")) {
      return res.json({
        reply: [
          "Precios de bicicletas:",
          `Niño sin empacar: $${PRECIOS.general.bicicletaNinoSinEmpacar}`,
          `Niño empacada: $${PRECIOS.general.bicicletaNinoEmpacada}`,
          `Adulto sin empacar: $${PRECIOS.general.bicicletaAdultoSinEmpacar}`,
          `Adulto empacada: $${PRECIOS.general.bicicletaAdultoEmpacada}`,
          `Eléctrica en caja: $${PRECIOS.general.bicicletaElectricaEnCaja}`,
          `Eléctrica sin caja: $${PRECIOS.general.bicicletaElectricaSinCaja}`
        ].join("\n")
      });
    }

    if (texto.includes("colchon")) {
      return res.json({
        reply: [
          "Precios de colchones:",
          `Hasta 50 lb: $${PRECIOS.general.colchonHasta50}`,
          `Más de 50 lb: $${PRECIOS.general.colchonMas50} total`
        ].join("\n")
      });
    }

    if (texto.includes("olla")) {
      return res.json({
        reply: [
          "Precios de ollas:",
          `Ollas pequeñas: $${PRECIOS.general.ollasPequenas}`,
          `Olla arrocera / multifuncional: $${PRECIOS.general.ollaArroceraMultifuncional}`
        ].join("\n")
      });
    }

    if (texto.includes("retractilado")) {
      return res.json({
        reply: [
          "Precios de retractilado:",
          `Equipos empacados: $${PRECIOS.general.retractiladoEmpacado}`,
          `Equipos sin empacar: $${PRECIOS.general.retractiladoSinEmpacar}`,
          `Retractilado externo: ${PRECIOS.general.retractiladoExterno}`
        ].join("\n")
      });
    }

    if (texto.includes("manejo general")) {
      return res.json({
        reply: `Manejo general: $${PRECIOS.general.manejoGeneral}`
      });
    }

    if (texto.includes("+200") || texto.includes("200 lb")) {
      return res.json({
        reply: `Equipos de más de 200 lb: $${PRECIOS.general.equiposMas200}`
      });
    }

    // PRECIOS SOLARES
    if (
      texto.includes("tabla solar") ||
      texto.includes("precios solar") ||
      texto.includes("solar")
    ) {
      return res.json({ reply: buildSolarReply() });
    }

    if (texto.includes("inversor 6.5") || texto.includes("6.5 kw")) {
      const p = PRECIOS.solar.inversores["6.5kw"];
      return res.json({
        reply: `Inversor 6.5 kW → Equipo: $${p.equipo} | Envío: $${p.envio} | Total: $${p.total}`
      });
    }

    if (texto.includes("inversor 10") || texto.includes("10 kw")) {
      const p = PRECIOS.solar.inversores["10kw"];
      return res.json({
        reply: `Inversor 10 kW → Equipo: $${p.equipo} | Envío: $${p.envio} | Total: $${p.total}`
      });
    }

    if (texto.includes("inversor 12") || texto.includes("12 kw")) {
      const p = PRECIOS.solar.inversores["12kw"];
      return res.json({
        reply: `Inversor 12 kW → Equipo: $${p.equipo} | Envío: $${p.envio} | Total: $${p.total}`
      });
    }

    if (texto.includes("bateria 5") || texto.includes("5 kwh") || texto.includes("5 kilos")) {
      const p = PRECIOS.solar.baterias["5kwh"];
      return res.json({
        reply: `Batería 5 kilos (≈5 kWh) → Equipo: $${p.equipo} | Envío: $${p.envio} | Total: $${p.total}`
      });
    }

    if (texto.includes("bateria 10") || texto.includes("10 kwh") || texto.includes("10 kilos")) {
      const p = PRECIOS.solar.baterias["10kwh"];
      return res.json({
        reply: `Batería 10 kilos (≈10 kWh) → Equipo: $${p.equipo} | Envío: $${p.envio} | Total: $${p.total}`
      });
    }

    if (texto.includes("bateria 16") || texto.includes("16 kwh") || texto.includes("16 kilos")) {
      const p = PRECIOS.solar.baterias["16kwh"];
      return res.json({
        reply: `Batería 16 kilos (≈16 kWh) → Equipo: $${p.equipo} | Envío: $${p.envio} | Total: $${p.total}`
      });
    }

    // FALLBACK OPENAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Eres el asistente oficial de Chambatina.

Tu función es ayudar a los clientes con:
- Envíos
- Rastreo de paquetes
- Cálculo de precios
- Equipos eléctricos
- Precios solares
- Información general

Reglas:
- No mencionar países
- No inventar información
- Explicar precios paso a paso
- Responder claro y profesional
- Dar seguridad al cliente

Precios por libra:
$1.99 por libra
$2.30 si recogemos en la puerta de su casa
$1.80 si compra por nuestros links

Cargos adicionales:
Equipos: de $15 a $35 adicionales
Equipos de más de 200 libras: $45 adicionales

Cajas:
12x12x12 = $45 hasta 60 libras
15x15x15 = $65 hasta 100 libras
16x16x16 = $85 hasta 100 libras

Tiempo estimado: 18 a 30 días

Si el cliente pregunta por un CPK y no aparece en el sistema, indícale con respeto que ese número no está disponible en este momento y que revise si lo escribió correctamente.
`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Error con OpenAI"
      });
    }

    const reply = data?.choices?.[0]?.message?.content || "Sin respuesta";

    res.json({ reply });
  } catch (error) {
    console.error("Error en /chat:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
