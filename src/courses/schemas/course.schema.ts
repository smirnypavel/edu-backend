/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from './lesson.schema';

@Schema({ versionKey: false, timestamps: true })
export class Course extends Document {
  @ApiProperty({ description: 'Название курса' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Описание курса' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'Уровень сложности' })
  @Prop({ enum: ['beginner', 'intermediate', 'advanced'], required: true })
  level: string;

  @ApiProperty({ description: 'Цена курса' })
  @Prop({ required: true })
  price: number;

  @ApiProperty({ description: 'Валюта' })
  @Prop({ default: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Категория курса' })
  @Prop({ required: true })
  category: string;

  @ApiProperty({ description: 'Технологии' })
  @Prop({ type: [String], required: true })
  tags: string[];

  @ApiProperty({ description: 'Уроки курса' })
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Lesson' }],
    required: false,
    default: [],
  })
  lessons: Lesson[];

  @ApiProperty({ description: 'Автор курса' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  author: MongooseSchema.Types.ObjectId;

  @ApiProperty({ description: 'Статус публикации' })
  @Prop({ enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ title: 'text', description: 'text' });
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ status: 1 });
