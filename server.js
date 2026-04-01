import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "2mb" }));

// ✅ ESTA LÍNEA ES LA QUE FALTABA (sirve imágenes, html, etc.)
app.use(express.static("public"));

const BUSINESS_CONTEXT = `
Eres el asistente oficial de Chambatina.

Responde siempre en español claro, profesional, útil y directo.
No inventes precios, condiciones, políticas ni disponibilidad.
No hables de backend, claves, configuración interna ni detalles técnicos.
Si no sabes algo con certeza, dilo con honestidad.

INFORMACIÓN GENERAL DEL NEGOCIO
- Precio por libra: 1.99 más un costo adicional de 15 a 45 dolares por manejo, seguro, arancel y transporte.
- Si recogemos en la puerta de su casa: 2.30 por libra.
- Si compran por nuestros links de TikTok: 1.80 por libra.
- Tiempo de entrega: de 18 a 30 días hábiles una vez que toca puerto.
- Aproximadamente a los 7 días de la entrega toca puerto.
`;

// ------------------ RASTREO ------------------

const RAW_TRACKING_SOURCE = `
PEGUE AQUÍ SU INFORMACIÓN DE RASTREO SIN ORGANIZAR
`;

const CPK_DB = {};

function normalizarCPK(raw) {
  return String(raw || "").replace(/\D/g, "");
}

function resolverSeguimiento(cpkRaw) {
  const cpk = normalizarCPK(cpkRaw);

  if (!cpk) {
    return { ok: false, mensaje: "CPK inválido." };
  }

  return {
    ok: true,
    cpk,
    estado: "EN PROCESO",
    descripcion: "Tu paquete se encuentra en proceso logístico."
  };
}

// ------------------ API ------------------

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Servidor activo"
  });
});

app.get("/api/rastreo/:cpk", (req, res) => {
  const resultado = resolverSeguimiento(req.params.cpk);
  res.json(resultado);
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
        mensaje: "Falta API KEY"
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

    const respuesta =
      data?.choices?.[0]?.message?.content?.trim() || "Sin respuesta.";

    res.json({
      ok: true,
      respuesta
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error interno"
    });
  }
});

// ✅ AHORA EL INDEX REAL (tu web)
app.get("/", (req, res) => {
  res.sendFile(new URL("./public/index.html", import.meta.url).pathname);
});

// 404
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
