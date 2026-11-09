import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
if (process.env.CONFIRM_RESET_DATABASE !== 'SIM') {
  console.error('Operação bloqueada. Para limpar os dados, defina CONFIRM_RESET_DATABASE=SIM explicitamente.');
  process.exit(1);
}
const connectionString = process.env.DATABASE_URL?.replace('fealq-postgres', '127.0.0.1');
const pool = new Pool({ connectionString });

try {
  const resultado = await pool.query(`
    TRUNCATE TABLE processo_documentos, processos RESTART IDENTITY CASCADE;
  `);
  console.log(`Dados operacionais removidos. Linhas afetadas: ${resultado.rowCount ?? 0}.`);
} finally {
  await pool.end();
}
