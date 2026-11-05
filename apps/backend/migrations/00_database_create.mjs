import { Client } from 'pg';

const DATABASE_ADMIN = 'postgres';

const parseDatabaseUrl = (databaseUrl) => {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL inválida.');
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('A migração 00_database_create requer uma DATABASE_URL PostgreSQL.');
  }

  let databaseName;
  try {
    databaseName = decodeURIComponent(url.pathname.replace(/^\//, ''));
  } catch {
    throw new Error('O nome da base em DATABASE_URL não é válido.');
  }

  if (!databaseName || Buffer.byteLength(databaseName, 'utf8') > 63 || databaseName.includes('\0')) {
    throw new Error('O nome da base em DATABASE_URL está vazio ou excede o limite de 63 bytes do PostgreSQL.');
  }

  const adminUrl = new URL(url);
  adminUrl.pathname = `/${DATABASE_ADMIN}`;
  adminUrl.searchParams.delete('options');

  return { databaseName, adminUrl: adminUrl.toString() };
};

const quoteIdentifier = (identifier) => `"${identifier.replaceAll('"', '""')}"`;

export const executar = async (databaseUrl = process.env.DATABASE_URL) => {
  if (!databaseUrl) throw new Error('DATABASE_URL não foi configurada.');

  const { databaseName, adminUrl } = parseDatabaseUrl(databaseUrl);
  const client = new Client({ connectionString: adminUrl, connectionTimeoutMillis: 10_000 });

  try {
    await client.connect();
    const existente = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    if (existente.rowCount) return { criada: false, nome: databaseName };

    try {
      // CREATE DATABASE não aceita parâmetros para identificadores; o nome é escapado como identificador PostgreSQL.
      await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
      return { criada: true, nome: databaseName };
    } catch (erro) {
      if (erro?.code === '42P04') {
        const criadaPorOutroProcesso = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
        if (criadaPorOutroProcesso.rowCount) return { criada: false, nome: databaseName };
      }
      if (erro?.code === '42501') {
        throw new Error('O usuário PostgreSQL configurado em DATABASE_URL precisa da permissão CREATEDB.');
      }
      throw new Error('Não foi possível criar a base PostgreSQL configurada em DATABASE_URL. Verifique o acesso ao servidor e a permissão CREATEDB.');
    }
  } catch (erro) {
    if (erro instanceof Error && (erro.message.startsWith('O usuário PostgreSQL') || erro.message.startsWith('Não foi possível'))) {
      throw erro;
    }
    throw new Error('Não foi possível conectar ao banco administrativo PostgreSQL. Confira DATABASE_URL, conectividade e credenciais.');
  } finally {
    await client.end().catch(() => {});
  }
};
