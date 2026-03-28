import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CPK_DB = {
  "260443": {
    fecha: "2026-03-26",
    estado: "EN AGENCIA",
    descripcion: "Tu paquete fue recibido y ya está en agencia."
  }
};

app.get("/api/rastreo/:cpk", (req, res) => {
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
    estado: data.estado,
    descripcion: data.descripcion
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const mensaje = req.body?.mensaje?.trim();

    if (!mensaje) {
      return res.status(400).json({
        ok: false,
        mensaje: "Falta el mensaje"
      });
    }

    const promptSistema = `
Eres el asistente de Chambatina.
Responde en español, claro y profesional.
Debes ayudar con:
- precios por libra
- cajas
- tiempo estimado
- equipos
- rastreo básico
Precios base:
- Libra general: 1.99
- Recogida en puerta: 2.30
- Compras por links de TikTok: 1.80
- Caja 12x12x12 hasta 60 lb: 45
- Caja 15x15x15 hasta 100 lb: 65
- Caja 16x16x16 hasta 100 lb: 85
- Equipos de 15 a 35 tienen adicional
- Equipos de más de 200 lb: adicional de 45
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: promptSistema },
          { role: "user", content: mensaje }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error OpenAI:", data);
      return res.status(500).json({
        ok: false,
        mensaje: "Error consultando la IA"
      });
    }

    const texto = data.choices?.[0]?.message?.content || "No hubo respuesta.";

    return res.json({
      ok: true,
      respuesta: texto
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
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});
