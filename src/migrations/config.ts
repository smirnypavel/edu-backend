/* eslint-disable prettier/prettier */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

if (!process.env.MONGODB_URI) {
  console.log(path.resolve(process.cwd(), '.env'));
  throw new Error('MONGODB_URL не определен в .env файле');
}
export const config = {
  mongodb: {
    url: process.env.MONGODB_URI,
    databaseName: process.env.MONGODB_NAME,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: 'src/migrations',
  changelogCollectionName: 'changelog',
};
