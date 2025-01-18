/* eslint-disable prettier/prettier */

import { MigrationService } from './migration.service';

async function runMigrations() {
  const migrationService = new MigrationService();

  try {
    await migrationService.migrate();
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
