/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ _id: false })
export class Test {
  @ApiProperty({
    description: 'Вопрос теста',
    example: 'Что такое JavaScript?',
  })
  @Prop({ required: true })
  question: string;

  @ApiProperty({
    description: 'Варианты ответов',
    example: ['Язык программирования', 'База данных', 'Операционная система'],
  })
  @Prop({
    type: [String],
    required: true,
    validate: [(v: string[]) => v.length >= 2, 'Минимум 2 варианта ответа'],
  })
  options: string[];

  @ApiProperty({
    description: 'Правильный ответ',
    example: 'Язык программирования',
  })
  @Prop({
    required: true,
    validate: {
      validator: function (v: string) {
        return this.options.includes(v);
      },
      message: 'Правильный ответ должен быть одним из вариантов',
    },
  })
  correctAnswer: string;

  @ApiProperty({
    description: 'Количество баллов за вопрос',
    example: 10,
    minimum: 1,
  })
  @Prop({
    required: true,
    min: 1,
  })
  points: number;

  @ApiProperty({
    description: 'Ограничение по времени в секундах',
    example: 300,
    minimum: 30,
  })
  @Prop({
    required: true,
    min: 30,
    default: 300,
  })
  timeLimit: number;
}

@Schema({ timestamps: true })
export class Tests extends Document {
  @ApiProperty({ description: 'ID урока' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lesson', required: true })
  lessonId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    description: 'Массив тестовых заданий',
    type: [Test],
  })
  @Prop({ type: [Test], required: true })
  tests: Test[];
}

export const TestSchema = SchemaFactory.createForClass(Test);
export const TestsSchema = SchemaFactory.createForClass(Tests);
