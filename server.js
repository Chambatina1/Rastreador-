import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// CHAMBATINA MIAMI	GEO MIA		CPK-0260443	EN AGENCIA	No	ENVIOS FACTURADOS	ENVIOS FACTURADOS/()/(ENVIOS FACTURADOS)	ENVIO	MISCELANEAS		2026-03-26	DIANARA CORREA SANCHEZ		94092744494	Ave Piti fajardo # Edificio 27 Apto 4 Rpto. Emilio Barcenas e/ 9 y 11, HOLGUIN, HOLGUIN	52065680	YISEL LOPEZ ALVAREZ			2.99	0	1	32	3.375	0.5	0	0				
// "NUMERO": { estado: "ESTADO", descripcion: "TEXTO" },
// =====================================================
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

  // PEGA MÁS CPK DEBAJO SIGUIENDO ESTE MISMO FORMATO
};

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Falta el mensaje" });
    }

    // Detecta números dentro del mensaje, por ejemplo:
    // CPK-0260443 -> 0260443 -> 260443
    const posibleCPK = userMessage.replace(/\D/g, "").replace(/^0+/, "");

    if (CPK_DB[posibleCPK]) {
      const item = CPK_DB[posibleCPK];

      return res.json({
        reply: `Estado: ${item.estado}\n\n${item.descripcion}`
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
DISTRIBUCIÓN = en camino final
ENTREGADO = finalizado

Tiempo estimado: 18 a 30 días

Si el cliente pregunta por un CPK y no aparece en la base de datos, indícale con respeto que en este momento ese número no está disponible en el sistema y que revise si lo escribió correctamente.
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
