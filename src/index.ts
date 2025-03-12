import knex from './db';
import server from './server';

async function startServer() {
  try {
    console.log('Testing database connection...');
    await knex.raw('SELECT 1');

    console.log('Database connected successfully!');

    await server.listen({ port: 8080 });
    console.log('Server listening at http://localhost:8080');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

startServer();
