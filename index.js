const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());
// Servir archivos estáticos (admin.html, admin.css, admin.js)
app.use(express.static(path.join(__dirname, "public")));

// ========== MIDDLEWARE DE AUTENTICACIÓN PARA ADMIN ==========
const adminAuth = (req, res, next) => {
  const token = req.headers["authorization"];
  const expectedToken = `Bearer ${process.env.ADMIN_TOKEN || "admin123"}`;
  if (token === expectedToken) {
    next();
  } else {
    res.status(401).json({ error: "No autorizado" });
  }
};

// ========== ENDPOINTS PÚBLICOS ==========
app.get("/", (req, res) => {
  res.send("Rastreador funcionando");
});

// Consulta de carnet (usado por Chambatina)
app.post("/orders", async (req, res) => {
  const { carnet } = req.body;
  if (!carnet) {
    return res.status(400).json({ mensaje: "Falta el número de carnet" });
  }
  try {
    const encontrado = await prisma.registro.findFirst({
      where: { carnet: { equals: String(carnet), mode: "insensitive" } }
    });
    if (encontrado) {
      res.json(encontrado);
    } else {
      res.status(404).json({ mensaje: "No encontramos ese número de carnet" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno" });
  }
});

// Crear un pedido (desde la vista de compra)
app.post("/api/pedidos", async (req, res) => {
  const {
    link,
    compradorNombre,
    compradorTelefono,
    compradorCorreo,
    recibeNombre,
    recibeTelefono,
    recibeCarnet,
    direccion,
    notas
  } = req.body;

  if (!link || link.trim() === "") {
    return res.status(400).json({ ok: false, mensaje: "El link de TikTok es obligatorio" });
  }

  try {
    const pedido = await prisma.pedido.create({
      data: {
        link: link.trim(),
        compradorNombre: compradorNombre?.trim() || null,
        compradorTelefono: compradorTelefono?.trim() || null,
        compradorCorreo: compradorCorreo?.trim() || null,
        recibeNombre: recibeNombre?.trim() || null,
        recibeTelefono: recibeTelefono?.trim() || null,
        recibeCarnet: recibeCarnet?.trim() || null,
        direccion: direccion?.trim() || null,
        notas: notas?.trim() || null,
        estado: "pendiente"
      }
    });
    res.json({ ok: true, mensaje: "Pedido guardado", pedidoId: pedido.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: "Error guardando pedido" });
  }
});

// ========== ENDPOINTS PARA ADMIN (protegidos) ==========
// --- Registros (rastreo de carnets) ---
app.get("/admin/registros", adminAuth, async (req, res) => {
  const registros = await prisma.registro.findMany({ orderBy: { id: "desc" } });
  res.json(registros);
});

app.post("/admin/registros", adminAuth, async (req, res) => {
  const { carnet, estado, fecha, descripcion } = req.body;
  if (!carnet || !estado) {
    return res.status(400).json({ error: "Carnet y estado son requeridos" });
  }
  try {
    const nuevo = await prisma.registro.create({
      data: { carnet, estado, fecha: fecha || new Date().toLocaleDateString(), descripcion }
    });
    res.json(nuevo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/admin/registros/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { carnet, estado, fecha, descripcion } = req.body;
  try {
    const actualizado = await prisma.registro.update({
      where: { id: parseInt(id) },
      data: { carnet, estado, fecha, descripcion }
    });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/admin/registros/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  await prisma.registro.delete({ where: { id: parseInt(id) } });
  res.json({ success: true });
});

// --- Pedidos ---
app.get("/admin/pedidos", adminAuth, async (req, res) => {
  const pedidos = await prisma.pedido.findMany({ orderBy: { createdAt: "desc" } });
  res.json(pedidos);
});

app.patch("/admin/pedidos/:id/estado", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  if (!["pendiente", "confirmado", "entregado", "cancelado"].includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }
  try {
    const actualizado = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: { estado }
    });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un pedido (opcional)
app.delete("/admin/pedidos/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  await prisma.pedido.delete({ where: { id: parseInt(id) } });
  res.json({ success: true });
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
