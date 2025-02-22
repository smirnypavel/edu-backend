/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Lesson extends Document {
  @ApiProperty({ description: 'Название урока' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Порядковый номер урока' })
  @Prop({ required: true })
  order: number;

  @ApiProperty({ description: 'Контент урока' })
  @Prop({ required: true })
  content: string;

  @ApiProperty({ description: 'Ссылки на изображения' })
  @Prop([String])
  images: string[];

  @ApiProperty({ description: 'Ссылка на видео' })
  @Prop({ type: String })
  videoUrl?: string;

  @ApiProperty({ description: 'Упражнения по программированию' })
  @Prop({
    type: [
      {
        language: String,
        initialCode: String,
        solution: String,
      },
    ],
    default: [],
  })
  codeExercises: Array<{
    language: string;
    initialCode: string;
    solution: string;
  }>;

  @ApiProperty({ description: 'Тесты' })
  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    default: [],
  })
  tests: MongooseSchema.Types.ObjectId[];
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
