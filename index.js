const express = require("express");
const app = express();

app.use(express.json());

let orders = [];
let nextId = 1;

// Ruta base
app.get("/", (req, res) => {
  res.send("Rastreador funcionando");
});

// Crear pedido
app.post("/orders", (req, res) => {
  const { nombre, telefono, direccion, link } = req.body;

  const newOrder = {
    id: nextId++,
    nombre,
    telefono,
    direccion,
    link,
    estado: "pendiente"
  };

  orders.push(newOrder);

  res.json(newOrder);
});

// Ver pedidos
app.get("/orders", (req, res) => {
  res.json(orders);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
