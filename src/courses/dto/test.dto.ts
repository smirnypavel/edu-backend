/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsNumber,
  ValidateNested,
  Min,
  ArrayMinSize,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TestQuestionDto {
  @ApiProperty({
    description: 'Вопрос теста',
    example: 'Что такое JavaScript?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Варианты ответов',
    example: ['Язык программирования', 'База данных', 'Операционная система'],
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'Минимум 2 варианта ответа' })
  @IsString({ each: true })
  options: string[];

  @ApiProperty({
    description: 'Правильный ответ',
    example: 'Язык программирования',
  })
  @IsString()
  correctAnswer: string;

  @ApiProperty({
    description: 'Количество баллов за вопрос',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  points: number;

  @ApiProperty({
    description: 'Ограничение по времени в секундах',
    example: 300,
    minimum: 30,
  })
  @IsNumber()
  @Min(30)
  timeLimit: number;
}

export class CreateTestDto {
  @ApiProperty({
    description: 'ID урока',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  lessonId: string;

  @ApiProperty({
    description: 'Массив тестовых вопросов',
    type: [TestQuestionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Тест должен содержать минимум 1 вопрос' })
  @Type(() => TestQuestionDto)
  tests: TestQuestionDto[];
}
