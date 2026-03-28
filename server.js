<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chambatina Inteligencia</title>
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background:
        radial-gradient(circle at top, #2b2b2b 0%, #111 35%, #090909 100%);
      color: #fff;
    }

    .wrap {
      max-width: 1180px;
      margin: 0 auto;
      padding: 22px;
    }

    .hero {
      background: linear-gradient(135deg, #ff8a00, #ff5e00);
      color: #111;
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 18px 50px rgba(0,0,0,.35);
      margin-bottom: 20px;
    }

    .hero h1 {
      margin: 0 0 10px;
      font-size: 38px;
      line-height: 1.1;
    }

    .hero p {
      margin: 0;
      font-size: 17px;
      max-width: 900px;
      font-weight: bold;
    }

    .grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
    }

    .panel {
      background: #171717;
      border: 1px solid #2b2b2b;
      border-radius: 24px;
      box-shadow: 0 14px 40px rgba(0,0,0,.28);
      overflow: hidden;
    }

    .chat-top {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 20px;
      background: #111;
      border-bottom: 1px solid #2c2c2c;
    }

    .dot {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: #2cd46b;
      box-shadow: 0 0 12px rgba(44,212,107,.7);
      flex: 0 0 auto;
    }

    .chat-top strong {
      display: block;
      font-size: 18px;
      color: #fff;
    }

    .chat-top span {
      display: block;
      margin-top: 3px;
      color: #bcbcbc;
      font-size: 13px;
    }

    .messages {
      height: 520px;
      overflow-y: auto;
      padding: 18px;
      background: linear-gradient(180deg, #171717 0%, #101010 100%);
    }

    .msg {
      max-width: 84%;
      margin-bottom: 14px;
      padding: 14px 16px;
      border-radius: 18px;
      white-space: pre-wrap;
      line-height: 1.5;
      font-size: 15px;
      word-wrap: break-word;
    }

    .msg.bot {
      background: #232323;
      border: 1px solid #313131;
      color: #fff;
      border-top-left-radius: 8px;
    }

    .msg.user {
      background: #ff8a00;
      color: #111;
      margin-left: auto;
      font-weight: bold;
      border-top-right-radius: 8px;
    }

    .chat-input {
      display: flex;
      gap: 10px;
      padding: 16px;
      background: #111;
      border-top: 1px solid #2b2b2b;
    }

    .chat-input input {
      flex: 1;
      height: 56px;
      border: 1px solid #343434;
      border-radius: 16px;
      background: #1b1b1b;
      color: white;
      padding: 0 16px;
      font-size: 16px;
      outline: none;
    }

    .chat-input input::placeholder {
      color: #9d9d9d;
    }

    .chat-input button {
      border: none;
      min-width: 140px;
      border-radius: 16px;
      background: linear-gradient(135deg, #ff9b21, #ff6b00);
      color: #111;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      padding: 0 18px;
    }

    .chat-input button:hover {
      opacity: .95;
      transform: translateY(-1px);
    }

    .side {
      padding: 20px;
    }

    .card {
      background: #1e1e1e;
      border: 1px solid #303030;
      border-radius: 20px;
      padding: 18px;
      margin-bottom: 16px;
    }

    .card h3 {
      margin: 0 0 10px;
      color: #ff9c2f;
      font-size: 20px;
    }

    .card p {
      margin: 7px 0;
      color: #efefef;
      line-height: 1.5;
      font-size: 15px;
    }

    .mini-title {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #b9b9b9;
      margin-bottom: 10px;
    }

    .quick {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }

    .quick button {
      border: 1px solid #3a3a3a;
      background: #202020;
      color: #fff;
      border-radius: 999px;
      padding: 10px 14px;
      cursor: pointer;
      font-size: 14px;
    }

    .quick button:hover {
      border-color: #ff8a00;
      color: #ff8a00;
    }

    .price {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #2c2c2c;
      font-size: 15px;
    }

    .price:last-child {
      border-bottom: none;
    }

    .price strong {
      color: #fff;
    }

    .price span {
      color: #ffb257;
      font-weight: bold;
      text-align: right;
    }

    .footer-note {
      text-align: center;
      color: #9e9e9e;
      font-size: 12px;
      margin-top: 16px;
      padding-bottom: 8px;
    }

    @media (max-width: 960px) {
      .grid {
        grid-template-columns: 1fr;
      }

      .messages {
        height: 460px;
      }
    }

    @media (max-width: 640px) {
      .hero h1 {
        font-size: 30px;
      }

      .chat-input {
        flex-direction: column;
      }

      .chat-input button {
        height: 54px;
      }

      .msg {
        max-width: 92%;
      }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>Chambatina Inteligencia</h1>
      <p>
        Atención automatizada para precios, cajas, equipos, compras por links, recogidas y consultas generales del servicio.
      </p>
    </section>

    <div class="grid">
      <section class="panel">
        <div class="chat-top">
          <div class="dot"></div>
          <div>
            <strong>Asistente Chambatina</strong>
            <span>Conectado a la inteligencia artificial del servicio</span>
          </div>
        </div>

        <div class="messages" id="messages">
          <div class="msg bot">
Hola. Soy el asistente de Chambatina.

Puedo orientarte sobre:
• precio por libra
• recogida en puerta
• cargos adicionales de equipos
• compras por links de TikTok
• precios de cajas
• dudas generales del servicio

Escríbeme tu pregunta.
          </div>
        </div>

        <div class="chat-input">
          <input
            id="userInput"
            type="text"
            placeholder="Ejemplo: ¿Cuánto cuesta una caja de 16x16x16?"
          />
          <button onclick="sendMessage()">Enviar</button>
        </div>
      </section>

      <aside class="panel side">
        <div class="card">
          <div class="mini-title">Tarifas visibles</div>
          <h3>Precios Chambatina</h3>

          <div class="price">
            <strong>Libra general</strong>
            <span>$1.99</span>
          </div>

          <div class="price">
            <strong>Manejo, seguro, arancel y transporte</strong>
            <span>$10</span>
          </div>

          <div class="price">
            <strong>Recogida en puerta</strong>
            <span>$2.30 por libra</span>
          </div>

          <div class="price">
            <strong>Equipos</strong>
            <span>$15 a $35 adicional</span>
          </div>

          <div class="price">
            <strong>Equipos mayores de 200 lb</strong>
            <span>$45 adicional</span>
          </div>

          <div class="price">
            <strong>Compras por links de TikTok</strong>
            <span>$1.80 por libra</span>
          </div>
        </div>

        <div class="card">
          <div class="mini-title">Cajas disponibles</div>
          <h3>Medidas y capacidad</h3>

          <div class="price">
            <strong>Caja 12 x 12 x 12</strong>
            <span>$45 · hasta 60 lb</span>
          </div>

          <div class="price">
            <strong>Caja 15 x 15 x 15</strong>
            <span>$65 · hasta 100 lb</span>
          </div>

          <div class="price">
            <strong>Caja 16 x 16 x 16</strong>
            <span>$85 · hasta 100 lb</span>
          </div>
        </div>

        <div class="card">
          <div class="mini-title">Preguntas rápidas</div>
          <h3>Consultas frecuentes</h3>

          <div class="quick">
            <button onclick="quickAsk('¿Cuánto cuesta la libra general?')">Libra general</button>
            <button onclick="quickAsk('¿Cuánto cuesta si compran por los links de TikTok?')">TikTok</button>
            <button onclick="quickAsk('¿Cuánto cuesta una caja de 12x12x12?')">Caja 12x12x12</button>
            <button onclick="quickAsk('¿Cuánto cuesta una caja de 15x15x15?')">Caja 15x15x15</button>
            <button onclick="quickAsk('¿Cuánto cuesta una caja de 16x16x16?')">Caja 16x16x16</button>
            <button onclick="quickAsk('¿Cuánto cobran adicional por equipos?')">Equipos</button>
            <button onclick="quickAsk('¿Qué incluye el cargo de 10 dólares?')">Cargo de $10</button>
            <button onclick="quickAsk('Explícame todos los precios de Chambatina')">Todos los precios</button>
          </div>
        </div>

        <div class="card">
          <div class="mini-title">Nota</div>
          <h3>Atención automatizada</h3>
          <p>
            Este asistente responde consultas del servicio y orienta según la información configurada para Chambatina.
          </p>
        </div>
      </aside>
    </div>

    <div class="footer-note">
      Chambatina · sistema inteligente de atención
    </div>
  </div>

  <script>
    const API_URL = "https://TU-SERVIDOR.onrender.com/chat";

    const messages = document.getElementById("messages");
    const input = document.getElementById("userInput");

    function addMessage(text, role) {
      const div = document.createElement("div");
      div.className = "msg " + role;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
      const typing = document.getElementById("typingMessage");
      if (typing) typing.remove();
    }

    function showTyping() {
      removeTyping();
      const div = document.createElement("div");
      div.className = "msg bot";
      div.id = "typingMessage";
      div.textContent = "Escribiendo...";
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function quickAsk(text) {
      input.value = text;
      sendMessage();
    }

    function localFallback(question) {
      const q = question.toLowerCase();

      if (q.includes("tiktok")) {
        return "Si compras por nuestros links de TikTok, la libra se trabaja a $1.80.";
      }

      if (q.includes("12x12")) {
        return "La caja de 12x12x12 cuesta $45 y admite hasta 60 libras.";
      }

      if (q.includes("15x15")) {
        return "La caja de 15x15x15 cuesta $65 y admite hasta 100 libras.";
      }

      if (q.includes("16x16")) {
        return "La caja de 16x16x16 cuesta $85 y admite hasta 100 libras.";
      }

      if (q.includes("equipo") || q.includes("equipos")) {
        return "Los equipos tienen un cargo adicional de $15 a $35. Si el equipo pasa de 200 libras, lleva $45 adicionales.";
      }

      if (q.includes("puerta") || q.includes("recogida")) {
        return "Si recogemos en la puerta de su casa, la tarifa es de $2.30 por libra.";
      }

      if (q.includes("1.99") || q.includes("libra") || q.includes("precio")) {
        return "La libra general es a $1.99, más $10 por manejo, seguro, arancel y transporte.";
      }

      return "Ahora mismo no pude conectar con el asistente, pero puedes preguntar por libra, cajas, recogida, compras por links o cargos de equipos.";
    }

    async function sendMessage() {
      const question = input.value.trim();
      if (!question) return;

      addMessage(question, "user");
      input.value = "";
      showTyping();

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: question })
        });

        let data = null;
        try {
          data = await response.json();
        } catch (e) {
          data = null;
        }

        removeTyping();

        if (!response.ok) {
          addMessage(localFallback(question), "bot");
          return;
        }

        const reply = data && data.reply
          ? data.reply
          : localFallback(question);

        addMessage(reply, "bot");
      } catch (error) {
        removeTyping();
        addMessage(localFallback(question), "bot");
      }
    }

    input.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        sendMessage();
      }
    });
  </script>
</body>
</html>
