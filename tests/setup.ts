import knex from '../src/db';

beforeAll(async () => {
  await knex.migrate.latest();
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
  await knex.destroy();
});
