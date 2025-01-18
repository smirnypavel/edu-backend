/* eslint-disable prettier/prettier */

import { Migration } from '../migration.base';

export class AddUserFieldsMigration extends Migration {
  version = 1;
  description = 'Add availableCourses field to users';

  async up() {
    try {
      const users = this.db.collection('users');

      const count = await users.countDocuments();
      console.log(`Найдено пользователей: ${count}`);

      const result = await users.updateMany(
        { availableCourses: { $exists: false } },
        {
          $set: {
            availableCourses: [],
          },
        },
      );

      console.log(`Обновлено документов: ${result.modifiedCount}`);
    } catch (error) {
      console.error('Ошибка при выполнении миграции:', error);
      throw error;
    }
  }

  async down() {
    // try {
    //   const result = await this.db.collection('users').updateMany(
    //     {},
    //     {
    //       $unset: {
    //         availableCourses: '',
    //       },
    //     },
    //   );
    //   console.log(`Откачено документов: ${result.modifiedCount}`);
    // } catch (error) {
    //   console.error('Ошибка при откате миграции:', error);
    //   throw error;
    // }
  }
}
