import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// BASE MANUAL DE CPK
// PEGA TUS DATOS AQUÍ
// FORMATO:
// "260443": {
//   estado: "EN AGENCIA",
//   descripcion: "Texto aquí"
// },
// =====================================================
const CPK_DB = {
  "260443": {
    estado: "EN AGENCIA",
    descripcion:
      "Tu paquete fue recibido y ya está en agencia, listo para continuar avanzando dentro del proceso logístico."
  },
  "259844": {
    estado: "EN AGENCIA",
    descripcion:
      "Tu paquete fue recibido en agencia y está preparado para continuar con su siguiente fase logística."
  },
  "259847": {
    estado: "EN AGENCIA",
    descripcion:
      "Tu paquete ya está en agencia y debidamente registrado para seguir avanzando en el proceso."
  }
};

// =====================================================
// RESPUESTAS DIRECTAS POR PALABRAS CLAVE
// =====================================================
function responderPreciosLocales(mensaje) {
  const texto = mensaje.toLowerCase();

  // Cajas
  if (
    texto.includes("12x12x12") ||
    (texto.includes("caja") && texto.includes("12"))
  ) {
    return "La caja de 12x12x12 tiene un precio de $45 y admite hasta 60 libras.";
  }

  if (
    texto.includes("15x15x15") ||
    (texto.includes("caja") && texto.includes("15"))
  ) {
    return "La caja de 15x15x15 tiene un precio de $65 y admite hasta 100 libras.";
  }

  if (
    texto.includes("16x16x16") ||
    (texto.includes("caja") && texto.includes("16"))
  ) {
    return "La caja de 16x16x16 tiene un precio de $85 y admite hasta 100 libras.";
  }

  // Libra y tarifas base
  if (texto.includes("libra") || texto.includes("precio por libra")) {
    return "La tarifa base es de $1.99 por libra. Si recogemos en la puerta de su casa, la libra es $2.30. Si la compra se hace por nuestros links, la libra es $1.80.";
  }

  // Puerta de la casa
  if (
    texto.includes("puerta de su casa") ||
    texto.includes("recogemos en la puerta") ||
    texto.includes("pickup")
  ) {
    return "Si recogemos en la puerta de su casa, la tarifa es de $2.30 por libra.";
  }

  // Compras por links
  if (
    texto.includes("links") ||
    texto.includes("link") ||
    texto.includes("tiktok")
  ) {
    return "Si la compra se realiza por nuestros links, la tarifa es de $1.80 por libra.";
  }

  // Manejo general
  if (texto.includes("manejo general")) {
    return "El manejo general tiene un cargo de $25.";
  }

  // Equipos
  if (
    texto.includes("equipo") &&
    !texto.includes("solar") &&
    !texto.includes("inversor") &&
    !texto.includes("batería") &&
    !texto.includes("bateria")
  ) {
    return "Los equipos llevan cargos adicionales que normalmente van de $15 a $35, según el tipo y condición del artículo. Los equipos de más de 200 libras llevan $45 adicionales.";
  }

  if (
    texto.includes("200 libras") ||
    texto.includes("+200 lb") ||
    texto.includes("más de 200")
  ) {
    return "Los equipos de más de 200 libras llevan un cargo adicional de $45.";
  }

  // Bicicletas
  if (texto.includes("bicicleta niño") || texto.includes("bicicleta de niño")) {
    return "Bicicleta de niño: sin empacar $25, empacada $15.";
  }

  if (texto.includes("bicicleta adulto") || texto.includes("bicicleta de adulto")) {
    return "Bicicleta de adulto: sin empacar $45, empacada $25.";
  }

  if (texto.includes("bicicleta eléctrica") || texto.includes("bicicleta electrica")) {
    return "Bicicleta eléctrica: en caja $35, sin caja $50.";
  }

  // Colchones
  if (texto.includes("colchón") || texto.includes("colchon") || texto.includes("colchones")) {
    return "Colchones: hasta 50 lb = $15. Más de 50 lb = $40 total.";
  }

  // Ollas
  if (texto.includes("olla pequeña") || texto.includes("ollas pequeñas")) {
    return "Las ollas pequeñas tienen un cargo de $12.";
  }

  if (
    texto.includes("olla arrocera") ||
    texto.includes("multifuncional") ||
    texto.includes("olla multifuncional")
  ) {
    return "La olla arrocera o multifuncional tiene un cargo de $22.";
  }

  // Retractilado
  if (texto.includes("retractilado")) {
    return "Equipos con retractilado: empacados $35, sin empacar $50. El retractilado externo tiene cargo variable.";
  }

  // Inversores
  if (texto.includes("6.5 kw")) {
    return "Inversor 6.5 kW: costo del equipo $988, costo de envío $145, total $1,133.";
  }

  if (texto.includes("10 kw")) {
    return "Inversor 10 kW: costo del equipo $1,254, costo de envío $178, total $1,432.";
  }

  if (texto.includes("12 kw")) {
    return "Inversor 12 kW: costo del equipo $2,146, costo de envío $257, total $2,403.";
  }

  // Baterías
  if (texto.includes("5 kilos") || texto.includes("5 kwh")) {
    return "Batería 5 kilos, aproximado 5 kWh: costo del equipo $886, costo de envío $352, total $1,238.";
  }

  if (texto.includes("10 kilos") || texto.includes("10 kwh")) {
    return "Batería 10 kilos, aproximado 10 kWh: costo del equipo $1,651, costo de envío $536, total $2,187.";
  }

  if (texto.includes("16 kilos") || texto.includes("16 kwh")) {
    return "Batería 16 kilos, aproximado 16 kWh: costo del equipo $1,825, costo de envío $696, total $2,521.";
  }

  if (
    texto.includes("tabla solar") ||
    texto.includes("precios solar") ||
    texto.includes("precio solar")
  ) {
    return `Tabla solar disponible:

Inversores:
- 6.5 kW: equipo $988, envío $145, total $1,133
- 10 kW: equipo $1,254, envío $178, total $1,432
- 12 kW: equipo $2,146, envío $257, total $2,403

Baterías:
- 5 kilos (≈5 kWh): equipo $886, envío $352, total $1,238
- 10 kilos (≈10 kWh): equipo $1,651, envío $536, total $2,187
- 16 kilos (≈16 kWh): equipo $1,825, envío $696, total $2,521`;
  }

  if (
    texto.includes("tabla general") ||
    texto.includes("precios generales") ||
    texto.includes("general de precios")
  ) {
    return `Tabla general disponible:

- Bicicleta niño sin empacar: $25
- Bicicleta niño empacada: $15
- Bicicleta adulto sin empacar: $45
- Bicicleta adulto empacada: $25
- Bicicleta eléctrica en caja: $35
- Bicicleta eléctrica sin caja: $50
- Colchones hasta 50 lb: $15
- Colchones más de 50 lb: $40 total
- Ollas pequeñas: $12
- Olla arrocera o multifuncional: $22
- Manejo general: $25
- Equipos +200 lb: $45
- Equipos con retractilado empacados: $35
- Equipos con retractilado sin empacar: $50
- Retractilado externo: cargo variable`;
  }

  return null;
}

// =====================================================
// ENDPOINT PRINCIPAL DEL CHAT
// =====================================================
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Falta el mensaje" });
    }

    // Detectar posible CPK
    const posibleCPK = userMessage.replace(/\D/g, "").replace(/^0+/, "");

    if (posibleCPK && CPK_DB[posibleCPK]) {
      const item = CPK_DB[posibleCPK];

      return res.json({
        reply: `Estado: ${item.estado}\n\n${item.descripcion}`
      });
    }

    // Respuestas rápidas locales para precios
    const respuestaLocal = responderPreciosLocales(userMessage);
    if (respuestaLocal) {
      return res.json({ reply: respuestaLocal });
    }

    // Si parece CPK pero no existe
    if (
      /cpk/i.test(userMessage) ||
      (posibleCPK && posibleCPK.length >= 5 && !CPK_DB[posibleCPK])
    ) {
      return res.json({
        reply:
          "En este momento ese número no aparece disponible en el sistema. Revise si lo escribió correctamente y vuelva a intentarlo."
      });
    }

    // Consulta a OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
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
- Responder claro, corto y profesional
- Explicar precios paso a paso cuando lo pidan
- Nunca mostrar información interna ni técnica del sistema

Tarifas base:
- $1.99 por libra
- $2.30 por libra si recogemos en la puerta de su casa
- $1.80 por libra si compra por nuestros links

Cargos adicionales:
- Equipos: de $15 a $35 adicionales
- Equipos de más de 200 libras: $45 adicionales

Cajas:
- 12x12x12 = $45 hasta 60 libras
- 15x15x15 = $65 hasta 100 libras
- 16x16x16 = $85 hasta 100 libras

Tabla general de precios:
- Bicicleta niño sin empacar: $25
- Bicicleta niño empacada: $15
- Bicicleta adulto sin empacar: $45
- Bicicleta adulto empacada: $25
- Bicicleta eléctrica en caja: $35
- Bicicleta eléctrica sin caja: $50
- Colchones hasta 50 lb: $15
- Colchones más de 50 lb: $40 total
- Ollas pequeñas: $12
- Olla arrocera o multifuncional: $22
- Manejo general: $25
- Equipos +200 lb: $45
- Equipos con retractilado empacados: $35
- Equipos con retractilado sin empacar: $50
- Retractilado externo: cargo variable

Tabla solar:
Inversores:
- 6.5 kW: equipo $988, envío $145, total $1,133
- 10 kW: equipo $1,254, envío $178, total $1,432
- 12 kW: equipo $2,146, envío $257, total $2,403

Baterías:
- 5 kilos (≈5 kWh): equipo $886, envío $352, total $1,238
- 10 kilos (≈10 kWh): equipo $1,651, envío $536, total $2,187
- 16 kilos (≈16 kWh): equipo $1,825, envío $696, total $2,521

Estados logísticos:
- EN AGENCIA = paquete recibido
- CLASIFICADO = organizado por ruta
- DESAGRUPE = separado del contenedor
- DESPACHO = en tránsito
- DISTRIBUCIÓN = en camino final
- ENTREGADO = finalizado

Tiempo estimado:
- 18 a 30 días

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

    return res.json({ reply });
  } catch (error) {
    console.error("Error en /chat:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// =====================================================
// ENDPOINT DE PRUEBA
// =====================================================
app.get("/", (req, res) => {
  res.send("Servidor Chambatina activo");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
