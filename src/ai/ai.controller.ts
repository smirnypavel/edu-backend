/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('AI')
@Controller('ai')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('check-code')
  @ApiOperation({
    summary: 'Проверка решения задачи',
    description:
      'Проверяет код решения на соответствие тестам и возвращает результаты анализа',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Код решения задачи',
          example: 'function sum(a, b) { return a + b; }',
        },
        language: {
          type: 'string',
          description: 'Язык программирования',
          example: 'javascript',
        },
        exerciseId: {
          type: 'string',
          description: 'ID задачи',
          example: '507f1f77bcf86cd799439011',
        },
        tests: {
          type: 'array',
          description: 'Массив тестов для проверки',
          items: { type: 'string' },
          example: ['test("2 + 2 = 4", () => expect(sum(2, 2)).toBe(4))'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Результаты проверки кода',
    schema: {
      type: 'object',
      properties: {
        passed: { type: 'boolean' },
        results: { type: 'array' },
        feedback: { type: 'string' },
      },
    },
  })
  async checkCode(
    @Body()
    data: {
      code: string;
      language: string;
      exerciseId: string;
      tests: string[];
    },
  ) {
    return this.aiService.checkCode(data);
  }

  @Post('generate-hint')
  @ApiOperation({
    summary: 'Генерация подсказки',
    description:
      'Генерирует подсказку для решения задачи на основе текущего кода',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        exerciseId: {
          type: 'string',
          description: 'ID задачи',
        },
        code: {
          type: 'string',
          description: 'Текущий код решения',
        },
        language: {
          type: 'string',
          description: 'Язык программирования',
        },
        difficulty: {
          type: 'string',
          description: 'Уровень сложности подсказки',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Сгенерированная подсказка',
    schema: {
      type: 'object',
      properties: {
        hint: { type: 'string' },
      },
    },
  })
  async generateHint(
    @Body()
    data: {
      exerciseId: string;
      code: string;
      language: string;
      difficulty: string;
    },
  ) {
    return this.aiService.generateHint(data);
  }

  @Post('evaluate-test')
  @ApiOperation({
    summary: 'Оценка ответов теста',
    description: 'Проверяет ответы на тест и возвращает результаты оценки',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        testId: {
          type: 'string',
          description: 'ID теста',
        },
        answers: {
          type: 'array',
          description: 'Массив ответов на вопросы',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              answer: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Результаты оценки теста',
    schema: {
      type: 'object',
      properties: {
        score: { type: 'number' },
        feedback: { type: 'string' },
      },
    },
  })
  async evaluateTest(
    @Body()
    data: {
      testId: string;
      answers: { questionId: string; answer: string }[];
    },
  ) {
    return this.aiService.evaluateTest(data);
  }

  @Post('generate-test')
  @ApiOperation({
    summary: 'Генерация теста',
    description: 'Создает тест на основе содержания урока',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lessonId: {
          type: 'string',
          description: 'ID урока',
        },
        difficulty: {
          type: 'string',
          description: 'Уровень сложности теста',
          enum: ['easy', 'medium', 'hard'],
        },
        numberOfQuestions: {
          type: 'number',
          description: 'Количество вопросов',
          minimum: 1,
          maximum: 20,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Сгенерированный тест',
    schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
              correctAnswer: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async generateTest(
    @Body()
    data: {
      lessonId: string;
      difficulty: string;
      numberOfQuestions: number;
    },
  ) {
    return this.aiService.generateTest(data);
  }
}
