/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class TestAnswer {
  @ApiProperty({ description: 'ID вопроса' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Ответ пользователя' })
  @IsString()
  answer: string;
}

export class TestSubmissionDto {
  @ApiProperty({ description: 'Массив ответов на вопросы', type: [TestAnswer] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestAnswer)
  answers: TestAnswer[];

  @ApiProperty({ description: 'Время выполнения теста в секундах' })
  @IsNumber()
  timeTaken: number;
}