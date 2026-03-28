import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

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

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/rastreo/:cpk", (req, res) => {
  try {
    const cpk = String(req.params.cpk || "").replace(/\D/g, "");
    const data = CPK_DB[cpk];

    if (!data) {
      return res.json({
        ok: false,
        mensaje: "No se encontró el CPK"
      });
    }

    return res.json({
      ok: true,
      cpk,
      fecha: data.fecha,
      estado: data.estado,
      descripcion: data.descripcion
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

    const systemPrompt = `
Eres el asistente oficial de Chambatina.

Responde siempre en español claro, directo y útil.
No inventes precios, condiciones ni políticas.
Debes mantenerte enfocado en la lógica real del negocio.

Información de negocio:
- Precio por libra: 1.99 más 10 dólares por manejo, seguro, arancel y transporte.
- Si recogemos en la puerta de su casa: 2.30 por libra.
- Si compran por nuestros links de TikTok: 1.80 por libra.
- Cajas:
  - 12x12x12 hasta 60 libras = 45 dólares
  - 15x15x15 hasta 100 libras = 65 dólares
  - 16x16x16 hasta 100 libras = 85 dólares
- Equipos: de 15 a 35 dólares adicionales.
- Equipos de más de 200 libras: 45 dólares adicionales.

Comportamiento:
- Responde de forma profesional y breve.
- Si preguntan por rastreo específico, indícales que usen el CPK.
- Si no tienes un dato concreto, dilo con honestidad.
- No hables de configuraciones técnicas, backend, claves ni detalles internos.
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: mensaje }
        ],
        temperature: 0.4
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

    const respuesta = data?.choices?.[0]?.message?.content?.trim() || "No hubo respuesta.";

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
