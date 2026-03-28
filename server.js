import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor Chambatina activo");
});

// =====================================================
// const CPK_DB = {
// AQUÍ SOLO CAMBIAS:
// - fecha
// - estado
// - descripcion
//
// Formato:
// "NUMERO": {
//   fecha: "YYYY-MM-DD",
//   estado: "EN AGENCIA",
//   descripcion: "Texto opcional"
// }
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
      estado: "EN TRÁNSITO",
      detalle: "Tu paquete se encuentra en tránsito dentro de su recorrido logístico estimado."
    };
  }

  if (days <= 24) {
    return {
      estado: "CLASIFICADO PARA ENTREGA",
      detalle: "Tu paquete ya está en una etapa avanzada y se encuentra acercándose a la fase final de distribución."
    };
  }

  if (days <= 30) {
    return {
      estado: "DISTRIBUCIÓN",
      detalle: "Tu paquete se encuentra en una fase final del proceso logístico y próximo a su entrega."
    };
  }

  return {
    estado: "PROCESO AVANZADO",
    detalle: "Tu paquete ha superado el tiempo estimado inicial y continúa dentro del proceso logístico. Si deseas, puedes volver a consultar más adelante para ver una nueva orientación."
  };
}

function normalizeStatus(status) {
  return (status || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getPriority(status) {
  const map = {
    "EN AGENCIA": 1,
    "CLASIFICADO": 2,
    "DESAGRUPE": 3,
    "DESPACHO": 4,
    "EMBARCADO": 5,
    "EN TRANSITO": 6,
    "CLASIFICADO PARA ENTREGA": 7,
    "DISTRIBUCION": 8,
    "ENTREGADO": 9,
    "PROCESO AVANZADO": 10
  };

  return map[normalizeStatus(status)] || 0;
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

  if (normalized === "EN AGENCIA") {
    return customDescription || "Tu paquete fue recibido y está en agencia, listo para continuar su proceso.";
  }

  if (normalized === "CLASIFICADO") {
    return "Tu paquete ya fue organizado según su ruta logística y sigue avanzando.";
  }

  if (normalized === "DESAGRUPE") {
    return "Tu paquete se encuentra en una fase de separación y preparación para continuar el proceso.";
  }

  if (normalized === "DESPACHO") {
    return "Tu paquete continúa avanzando dentro del proceso logístico y ya superó la etapa inicial.";
  }

  if (normalized === "EMBARCADO") {
    return "Tu paquete ya fue embarcado y sigue avanzando en su recorrido logístico.";
  }

  if (normalized === "EN TRANSITO") {
    return "Tu paquete se encuentra en tránsito y continúa moviéndose dentro del proceso estimado.";
  }

  if (normalized === "CLASIFICADO PARA ENTREGA") {
    return "Tu paquete ya está en una etapa avanzada y acercándose a la fase final.";
  }

  if (normalized === "DISTRIBUCION") {
    return "Tu paquete se encuentra en distribución y próximo a completar su recorrido.";
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

// =====================================================
// CHAT
// =====================================================
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Falta el mensaje" });
    }

    const posibleCPK = userMessage.replace(/\D/g, "").replace(/^0+/, "");

    if (CPK_DB[posibleCPK]) {
      const item = CPK_DB[posibleCPK];

      return res.json({
        reply: buildCPKReply(posibleCPK, item)
      });
    }

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
- Cálculo de precios
- Estados de paquetes
- Equipos eléctricos
- Información general

Reglas:
- No mencionar países
- No inventar información
- Explicar precios paso a paso
- Responder claro y profesional
- Dar seguridad al cliente

Precios:
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

Estados:
EN AGENCIA = paquete recibido
CLASIFICADO = organizado por ruta
DESAGRUPE = separado del contenedor
DESPACHO = en tránsito
EMBARCADO = avance dentro del flujo principal
EN TRÁNSITO = recorrido logístico en proceso
CLASIFICADO PARA ENTREGA = fase avanzada
DISTRIBUCIÓN = en camino final
ENTREGADO = finalizado

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
