/* eslint-disable prettier/prettier */
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CodeExerciseDto, TestDto } from './create.lesson.dto';

export class UpdateLessonDto {
  @ApiProperty({
    description: 'Название урока',
    example: 'Введение в JavaScript',
  })
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Порядковый номер урока',
    example: 1,
  })
  @IsNumber()
  order?: number;

  @ApiProperty({
    description: 'Контент урока в формате Markdown',
    example: '# Введение\nВ этом уроке мы изучим основы JavaScript...',
  })
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Ссылки на изображения',
    example: ['https://example.com/image1.jpg'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    description: 'Ссылка на видео',
    example: 'https://youtube.com/watch?v=...',
    required: false,
  })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({
    description: 'Упражнения по программированию',
    type: [CodeExerciseDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CodeExerciseDto)
  codeExercises?: CodeExerciseDto[];

  @ApiProperty({
    description: 'Тесты',
    type: [TestDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TestDto)
  tests?: TestDto[];
}
