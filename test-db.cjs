const { Client } = require('./apps/api/node_modules/pg');

async function test() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: '5432',
    database: 'ankita_processors',
    connectionTimeoutMillis: 5000,
  });

  console.log('Connecting to PostgreSQL via tunnel...');
  await client.connect();
  console.log('Connected!');
  const res = await client.query('SELECT count(*) FROM products');
  console.log('Product count:', res.rows[0]);
  await client.end();
}

test().catch(err => {
  console.error('Test error:', err.message);
  process.exit(1);
});
