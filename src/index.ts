import knex from './db';
import server from './server';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    console.log('Testing database connection...');
    const result = await knex.raw('SELECT current_database()');
    console.log('Banco de dados atual:', result.rows[0].current_database);

    await server.listen({ port: Number(PORT) });
    console.log(`Server listening at http://localhost:${PORT}`);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

startServer();
