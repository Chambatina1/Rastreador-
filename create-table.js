import pkg from 'pg';
const { Client } = pkg;

async function crearTabla() {
  const client = new Client({
    connectionString: 'postgresql://rastreador_db_user:E89uVwg0xGMOLwEGQPRbjWpwHLXXHxE9@dpg-d7hoferbc2fs73dk6q1g-a.oregon-postgres.render.com/rastreador_db',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    await client.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,

        -- Datos del comprador
        nombre_comprador TEXT NOT NULL,
        email_comprador TEXT,
        telefono_comprador TEXT NOT NULL,

        -- Datos de quien recibe
        nombre_destinatario TEXT NOT NULL,
        telefono_destinatario TEXT NOT NULL,
        carnet_destinatario TEXT,
        direccion_destinatario TEXT NOT NULL,

        -- Producto
        producto TEXT NOT NULL,
        notas TEXT,

        -- Estado
        estado TEXT DEFAULT 'pendiente',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Tabla creada correctamente');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
}

crearTabla();
