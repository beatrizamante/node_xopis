import knex from '../src/db';

beforeAll(async () => {
  await knex.migrate.latest();

  const result = await knex.raw('SELECT current_database()');
  console.log('Banco de dados atual:', result.rows[0].current_database);
});

beforeEach(async () => {
  const tables = await knex.raw(
    'SELECT tablename FROM pg_tables WHERE schemaname = \'public\';'
  );

  for (const { tablename } of tables.rows) {
    await knex.raw(`TRUNCATE TABLE ${tablename} RESTART IDENTITY CASCADE`);
  }
});

afterAll(async () => {
  await knex.migrate.rollback();
  await knex.destroy();
});
