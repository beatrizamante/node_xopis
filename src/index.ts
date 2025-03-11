import knex from './db'; 
import server from './server';

async function startServer() {
  try {
    console.log('Testing database connection...');
    await knex.raw('SELECT 1');

    console.log('Database connected successfully!');
    
    console.log('Running migrations...');
    await knex.migrate.latest(); 
    
    console.log('Running seeds...');
    await knex.seed.run(); 
    
    server.listen({ port: 8080 }, (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

startServer();
