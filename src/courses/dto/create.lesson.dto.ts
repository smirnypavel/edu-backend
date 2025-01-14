/* eslint-disable prettier/prettier */
import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CodeExerciseDto {
  @ApiProperty({ 
    description: 'Язык программирования',
    example: 'javascript' 
  })
  @IsString()
  language: string;

  @ApiProperty({ 
    description: 'Начальный код',
    example: 'function sum(a, b) {\n  // your code here\n}' 
  })
  @IsString()
  initialCode: string;

  @ApiProperty({ 
    description: 'Решение задачи',
    example: 'function sum(a, b) {\n  return a + b;\n}' 
  })
  @IsString()
  solution: string;

  @ApiProperty({ 
    description: 'Тесты для проверки',
    example: ['test("sum(2, 2) should return 4", () => {...}']
  })
  @IsArray()
  @IsString({ each: true })
  tests: string[];
}

class TestDto {
  @ApiProperty({ 
    description: 'Вопрос теста',
    example: 'Что такое JavaScript?' 
  })
  @IsString()
  question: string;

  @ApiProperty({ 
    description: 'Варианты ответов',
    example: ['Язык программирования', 'База данных', 'Операционная система']
  })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ 
    description: 'Правильный ответ',
    example: 'Язык программирования' 
  })
  @IsString()
  correctAnswer: string;

  @ApiProperty({ 
    description: 'Количество баллов за вопрос',
    example: 10 
  })
  @IsNumber()
  points: number;

  @ApiProperty({ 
    description: 'Ограничение по времени в секундах',
    example: 300 
  })
  @IsNumber()
  timeLimit: number;
}

export class CreateLessonDto {
  @ApiProperty({ 
    description: 'Название урока',
    example: 'Введение в JavaScript' 
  })
  @IsString()
  title: string;

  @ApiProperty({ 
    description: 'Порядковый номер урока',
    example: 1 
  })
  @IsNumber()
  order: number;

  @ApiProperty({ 
    description: 'Контент урока в формате Markdown',
    example: '# Введение\nВ этом уроке мы изучим основы JavaScript...' 
  })
  @IsString()
  content: string;

  @ApiProperty({ 
    description: 'Ссылки на изображения',
    example: ['https://example.com/image1.jpg'],
    required: false
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ 
    description: 'Ссылка на видео',
    example: 'https://youtube.com/watch?v=...',
    required: false
  })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ 
    description: 'Упражнения по программированию',
    type: [CodeExerciseDto],
    required: false
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CodeExerciseDto)
  codeExercises?: CodeExerciseDto[];

  @ApiProperty({ 
    description: 'Тесты',
    type: [TestDto],
    required: false
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TestDto)
  tests?: TestDto[];
}