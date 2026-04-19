const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());
// Servir archivos estáticos del panel admin (carpeta 'public')
app.use(express.static(path.join(__dirname, "public")));

// ========== ENDPOINTS PÚBLICOS ==========
app.get("/", (req, res) => {
  res.send("Rastreador funcionando");
});

// Buscar por carnet (usado por Chambatina)
app.post("/orders", async (req, res) => {
  const { carnet } = req.body;
  if (!carnet) {
    return res.status(400).json({ mensaje: "Falta el número de carnet" });
  }

  try {
    const encontrado = await prisma.registro.findFirst({
      where: {
        carnet: { equals: String(carnet), mode: "insensitive" } // búsqueda insensible a mayúsculas
      }
    });

    if (encontrado) {
      return res.json(encontrado);
    } else {
      return res.status(404).json({ mensaje: "No encontramos ese número de carnet" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ========== ENDPOINTS PARA ADMIN (protegidos por token simple) ==========
// Middleware de autenticación para el panel
const adminAuth = (req, res, next) => {
  const token = req.headers["authorization"];
  // Cambia 'mi-token-secreto' por una clave fuerte (guárdala en .env)
  if (token === `Bearer ${process.env.ADMIN_TOKEN || "admin123"}`) {
    next();
  } else {
    res.status(401).json({ error: "No autorizado" });
  }
};

// Obtener todos los registros (para el panel)
app.get("/admin/registros", adminAuth, async (req, res) => {
  try {
    const registros = await prisma.registro.findMany({
      orderBy: { id: "desc" }
    });
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo registro
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

// Actualizar un registro
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

// Eliminar un registro
app.delete("/admin/registros/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.registro.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
