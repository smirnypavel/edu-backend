/* eslint-disable prettier/prettier */
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateLessonDto } from './create.lesson.dto';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Название курса',
    example: 'JavaScript для начинающих',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Описание курса',
    example: 'Полный курс по JavaScript с нуля',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Уровень сложности',
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'beginner',
  })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level: string;

  @ApiProperty({
    description: 'Цена курса',
    example: 99.99,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Валюта',
    example: 'USD',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Категория курса',
    example: 'programming',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Теги курса',
    example: ['javascript', 'frontend', 'web'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    description: 'Список уроков',
    type: [CreateLessonDto],
    isArray: true,
  })
  @IsArray()
  lessons: CreateLessonDto[];
}
