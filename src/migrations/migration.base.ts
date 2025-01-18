/* eslint-disable prettier/prettier */
import { Db } from 'mongodb';

export abstract class Migration {
  version: number;
  description: string;

  constructor(protected readonly db: Db) {}

  abstract up(): Promise<void>;
  abstract down(): Promise<void>;
}
