// backend/check-db.ts

import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(async (ds) => {
    const tables = await ds.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public'",
    );
    console.log('Tables:', tables);
    await ds.destroy();
  })
  .catch((e) => console.error(e));
