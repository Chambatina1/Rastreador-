import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "2mb" }));

// ================= CONTEXTO =================
const BUSINESS_CONTEXT = `
Eres el asistente oficial de Chambatina.

Responde siempre en español claro, profesional, útil y directo.
No inventes precios ni condiciones.

- Precio por libra: 1.99 + 10 dólares manejo.
- Puerta: 2.30/lb.
- TikTok: 1.80/lb.
- Tiempo: 18 a 30 días hábiles desde que toca puerto.
`;

// ================= BASE =================
const RAW_TRACKING_SOURCE = ``;
const CPK_DB = {};

// ================= UTIL =================
function normalizarCPK(cpk){
  return String(cpk || "").replace(/\D/g,"");
}

function diasHabilesEntre(fechaInicio, fechaFin){
  let count = 0;
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);

  while(start <= end){
    const day = start.getDay();
    if(day !== 0 && day !== 6) count++;
    start.setDate(start.getDate()+1);
  }
  return count;
}

function diasNaturalesEntre(fechaInicio, fechaFin){
  const diff = new Date(fechaFin) - new Date(fechaInicio);
  return Math.floor(diff / (1000*60*60*24));
}

// ================= ESTADOS =================
function descripcionPorEstado(estado){
  switch(estado){

    case "EN AGENCIA":
      return "Su carga fue recibida en Chambatina y está en preparación logística.";

    case "EN NAVIERA":
      return "Su mercancía avanzó a naviera y continúa el proceso previo a salida.";

    case "EN CONTENEDOR":
      return "Su carga ya está en contenedor avanzando en ruta marítima.";

    case "ARRIBO A PUERTO":
      return "Su mercancía ya tocó puerto y comienza el proceso en días hábiles.";

    case "EN REVISIÓN LOGÍSTICA":
      return "Su carga está siendo revisada dentro del flujo logístico.";

    case "CHEQUEO ADUANAL":
      return "Su carga está en chequeo aduanal, proceso normal del flujo.";

    case "EN PROCESO DE CLASIFICACIÓN":
      return "Su mercancía está siendo organizada por destino.";

    case "CLASIFICADO":
      return "Su carga fue clasificada y sigue avanzando.";

    case "EN DESPACHO":
      return "Su mercancía está en despacho hacia distribución.";

    case "EN ALMACÉN":
      return "Su carga está en almacén lista para distribución.";

    case "EN DISTRIBUCIÓN":
      return "Su mercancía ya está en distribución final dentro del territorio.";

    case "EN RUTA FINAL":
      return "Su carga está en fase final del proceso logístico.";

    default:
      return "Su carga continúa avanzando.";
  }
}

// ================= LÓGICA =================
function estadoSimulado(fecha){

  const hoy = new Date();

  const diasNaturales = diasNaturalesEntre(fecha, hoy);

  // FASE MIAMI
  if(diasNaturales <= 3) return "EN AGENCIA";
  if(diasNaturales <= 7) return "EN NAVIERA";
  if(diasNaturales <= 9) return "EN CONTENEDOR";

  // DESPUÉS DE PUERTO
  const fechaPuerto = new Date(fecha);
  fechaPuerto.setDate(fechaPuerto.getDate()+9);

  const diasHabiles = diasHabilesEntre(fechaPuerto, hoy);

  if(diasHabiles <= 3) return "ARRIBO A PUERTO";
  if(diasHabiles <= 6) return "EN REVISIÓN LOGÍSTICA";
  if(diasHabiles <= 9) return "CHEQUEO ADUANAL";
  if(diasHabiles <= 12) return "EN PROCESO DE CLASIFICACIÓN";
  if(diasHabiles <= 15) return "CLASIFICADO";
  if(diasHabiles <= 18) return "EN DESPACHO";
  if(diasHabiles <= 21) return "EN ALMACÉN";

  // 🔥 AJUSTE TUYO
  if(diasHabiles <= 28) return "EN DISTRIBUCIÓN";
  if(diasHabiles <= 30) return "EN RUTA FINAL";

  return "EN RUTA FINAL";
}

// ================= API =================
app.get("/api/health",(req,res)=>{
  res.json({
    ok:true,
    mensaje:"Servidor activo"
  });
});

app.get("/api/rastreo/:cpk",(req,res)=>{

  const cpk = normalizarCPK(req.params.cpk);

  if(!cpk){
    return res.json({ ok:false, mensaje:"CPK inválido" });
  }

  // simulación por fecha (ejemplo hoy - 5 días)
  const fechaFake = new Date();
  fechaFake.setDate(fechaFake.getDate() - (parseInt(cpk.slice(-2)) || 5));

  const estado = estadoSimulado(fechaFake);

  res.json({
    ok:true,
    cpk,
    estado,
    descripcion: descripcionPorEstado(estado)
  });
});

app.post("/api/chat", async (req,res)=>{
  try{

    const mensaje = String(req.body?.mensaje || "").trim();

    if(!mensaje){
      return res.status(400).json({ ok:false, mensaje:"Falta mensaje" });
    }

    if(!process.env.OPENAI_API_KEY){
      return res.status(500).json({ ok:false, mensaje:"Falta API KEY" });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`
      },
      body:JSON.stringify({
        model:"gpt-4o-mini",
        messages:[
          { role:"system", content: BUSINESS_CONTEXT },
          { role:"user", content: mensaje }
        ]
      })
    });

    const data = await r.json();

    res.json({
      ok:true,
      respuesta: data?.choices?.[0]?.message?.content || "Sin respuesta"
    });

  }catch(e){
    res.status(500).json({ ok:false, mensaje:"Error interno" });
  }
});

// 404
app.use((req,res)=>{
  res.status(404).json({
    ok:false,
    mensaje:"Ruta no encontrada"
  });
});

// ================= START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
