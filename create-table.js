import pkg from 'pg';
const { Client } = pkg;

async function crearTabla() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Conectado');

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,

        buyer_first_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabla creada');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

crearTabla();
