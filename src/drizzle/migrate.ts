import { client, db } from './db';
import { resolve } from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
(async () => {
  // This command run all migrations from the migrations folder and apply changes to the database
  await migrate(db, {
    migrationsFolder: resolve(__dirname, './migrations'),
  });

  // ... start your application
  await client.end();
})();
