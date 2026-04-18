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

        buyer_first_name TEXT NOT NULL,
        buyer_last_name TEXT NOT NULL,
        buyer_email TEXT,
        buyer_phone TEXT,

        product_name TEXT NOT NULL,
        product_url TEXT,
        commissionable_url TEXT,

        purchase_price NUMERIC(10,2) DEFAULT 0,
        weight_lb NUMERIC(10,2) DEFAULT 0,
        shipping_rate NUMERIC(10,2) DEFAULT 1.80,
        extra_fee NUMERIC(10,2) DEFAULT 25.00,
        service_fee NUMERIC(10,2) DEFAULT 0,

        receiver_name TEXT,
        receiver_phone TEXT,
        receiver_address TEXT,

        status TEXT DEFAULT 'pending',
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
