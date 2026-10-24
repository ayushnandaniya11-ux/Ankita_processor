const { Client } = require('./apps/api/node_modules/pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:5432@127.0.0.1:5433/ankita_processors'
  });
  await client.connect();
  const res = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'users\'');
  console.log('COLUMNS:', res.rows.map(r => r.column_name));
  const usersRes = await client.query('SELECT * FROM users LIMIT 10');
  console.log('USERS:', usersRes.rows);
  await client.end();
}

main().catch(console.error);
