/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Lesson extends Document {
  @ApiProperty({ description: 'Название урока' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Порядковый номер урока' })
  @Prop({ required: true })
  order: number;

  @ApiProperty({ description: 'Контент урока в формате Markdown' })
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
        tests: [String],
      },
    ],
  })
  codeExercises: Array<{
    language: string;
    initialCode: string;
    solution: string;
    tests: string[];
  }>;

  @ApiProperty({ description: 'Тесты' })
  @Prop({
    type: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
        points: Number,
        timeLimit: Number,
      },
    ],
  })
  tests: Array<{
    _id: any;
    question: string;
    options: string[];
    correctAnswer: string;
    points: number;
    timeLimit: number;
  }>;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
