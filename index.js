const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

let registros = [
  {
    id: 1,
    carnet: "CI-1001",
    estado: "En revisión",
    fecha: "18/04/26",
    descripcion: "Documento recibido en oficina"
  },
  {
    id: 2,
    carnet: "CI-1002",
    estado: "Listo",
    fecha: "18/04/26",
    descripcion: "Carnet disponible para entrega"
  }
];

let nextId = 3;

app.get("/", (req, res) => {
  res.send("Rastreador funcionando");
});

app.get("/orders", (req, res) => {
  res.json(registros);
});

app.post("/orders", (req, res) => {
  const { carnet } = req.body;

  if (!carnet) {
    return res.status(400).json({ mensaje: "Falta el número de carnet" });
  }

  const encontrado = registros.find(
    item => item.carnet.toLowerCase() === String(carnet).toLowerCase()
  );

  if (encontrado) {
    return res.json(encontrado);
  }

  return res.status(404).json({
    mensaje: "No encontramos ese número de carnet"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Servidor corriendo en puerto ${PORT});
});
