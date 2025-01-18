/* eslint-disable prettier/prettier */
import { MongoClient, Db } from 'mongodb';
import { config } from './config';
import { Migration } from './migration.base';
import { AddUserFieldsMigration } from './scripts/user.migration';

export class MigrationService {
  private db: Db;
  private migrations: (new (db: Db) => Migration)[] = [AddUserFieldsMigration];

  async connect() {
    try {
      console.log('Подключение к БД:', config.mongodb.url);
      const client = await MongoClient.connect(config.mongodb.url);
      this.db = client.db(config.mongodb.databaseName);
      console.log('Успешное подключение к БД');
      return true;
    } catch (error) {
      console.error('Ошибка подключения к БД:', error);
      throw error;
    }
  }

  async migrate() {
    await this.connect();
    const changelog = this.db.collection(config.changelogCollectionName);

    console.log('\nНачало процесса миграции...');
    console.log('Доступные миграции:', this.migrations.length);

    const applied = await changelog.find().toArray();
    const appliedVersions = applied.map((m) => m.version);

    console.log('Применённые версии:', appliedVersions);

    for (const MigrationClass of this.migrations) {
      const migration = new MigrationClass(this.db);
      console.log(`\nПроверка миграции версии ${migration.version}...`);

      if (!appliedVersions.includes(migration.version)) {
        console.log(
          `Применение миграции ${migration.version}: ${migration.description}`,
        );
        try {
          await migration.up();
          await changelog.insertOne({
            version: migration.version,
            description: migration.description,
            appliedAt: new Date(),
          });
          console.log(`✓ Миграция ${migration.version} успешно применена`);
        } catch (error) {
          console.error(
            `✗ Ошибка при применении миграции ${migration.version}:`,
            error,
          );
          throw error;
        }
      } else {
        console.log(`Миграция ${migration.version} уже применена`);
      }
    }

    console.log('\nПроцесс миграции завершен');
  }
}
