/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { Lesson } from 'src/courses/schemas/lesson.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(@InjectModel(Lesson.name) private lessonModel: Model<Lesson>) {}

  async checkCode(data: {
    code: string;
    language: string;
    exerciseId: string;
    tests: string[];
  }) {
    try {
      const prompt = `
        Пожалуйста, проанализируйте этот код на языке ${data.language} и предоставьте отзыв:
        ${data.code}
        
        Тесты для проверки:
        ${data.tests.join('\n')}
        
        Предоставьте анализ в следующем формате:
        1. Корректность кода
        2. Эффективность кода
        3. Лучшие практики
        4. Предложения по улучшению
        5. Результаты тестов

        Дополнительно укажите:
        - Возможные проблемы с производительностью
        - Рекомендации по оптимизации
        - Потенциальные ошибки безопасности
        
        Пожалуйста, используйте технические термины на русском языке.
      `;

      const completion = await axios.post(process.env.OLLAMA_SERVER_URL, {
        model: process.env.OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
      });

      return {
        analysis: completion.data.response,
        passed: this.determineTestsPassed(completion.data.response),
      };
    } catch (error) {
      this.logger.error(`Error checking code: ${error.message}`);
      throw error;
    }
  }

  async generateHint(data: {
    exerciseId: string;
    code: string;
    language: string;
    difficulty: string;
  }) {
    try {
      const prompt = `
        Проанализируйте код на языке ${data.language} с учетом уровня сложности ${data.difficulty}:

        ${data.code}

        Составьте подсказку, которая:
        1. Направит в правильную сторону решения
        2. Объяснит основные концепции
        3. Укажет на возможные ошибки
        4. Предложит подходы к решению

        Уровень подсказки должен соответствовать сложности:
        - Начальный: базовые концепции и пошаговое объяснение
        - Средний: общие направления и ключевые моменты
        - Продвинутый: минимальные намеки на архитектурном уровне

        !Важно: не раскрывать готовое решение
`;

      const completion = await axios.post(process.env.OLLAMA_SERVER_URL, {
        model: process.env.OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
      });

      return {
        hint: completion.data.response,
      };
    } catch (error) {
      this.logger.error(`Error generating hint: ${error.message}`);
      throw error;
    }
  }

  async evaluateTest(data: {
    testId: string;
    answers: { questionId: string; answer: string }[];
  }) {
    try {
      const test = await this.lessonModel
        .findOne({ 'tests._id': data.testId })
        .select('tests');

      if (!test) {
        throw new Error('Test not found');
      }

      const results = data.answers.map((answer) => {
        const question = test.tests.find(
          (q) => q._id.toString() === answer.questionId,
        );
        return {
          questionId: answer.questionId,
          correct: question.correctAnswer === answer.answer,
          points:
            question.correctAnswer === answer.answer ? question.points : 0,
        };
      });

      return {
        results,
        totalPoints: results.reduce((sum, result) => sum + result.points, 0),
        totalQuestions: results.length,
        passedQuestions: results.filter((r) => r.correct).length,
      };
    } catch (error) {
      this.logger.error(`Error evaluating test: ${error.message}`);
      throw error;
    }
  }

  async generateTest(data: {
    lessonId: string;
    difficulty: string;
    numberOfQuestions: number;
  }) {
    try {
      // const lesson = await this.lessonModel.findById(data.lessonId);
      // if (!lesson) {
      //   throw new Error('Lesson not found');
      // }

      const prompt = `
        На основе содержания урока:
        ${data.lessonId}
        
        Сгенерируйте ${data.numberOfQuestions} вопросов с множественным выбором 
        уровня сложности "${data.difficulty}".
        
        Требования к вопросам:
        - Четкие формулировки
        - Логичные варианты ответов
        - Один правильный ответ
        - Сложность соответствует уровню
        
        Формат каждого вопроса:
        {
          "question": "текст вопроса",
          "options": ["вариант1", "вариант2", "вариант3", "вариант4"],
          "correctAnswer": "правильный вариант",
          "points": числовое значение баллов,
          "timeLimit": время на ответ в секундах
        }
        
        Дополнительные условия:
        - Вопросы должны охватывать разные аспекты материала
        - Варианты ответов должны быть правдоподобными
        - Сложность должна соответствовать уровню ${data.difficulty}
      `;

      const completion = await axios.post(process.env.OLLAMA_SERVER_URL, {
        model: process.env.OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
      });

      const generatedQuestions = completion.data.response;
      return generatedQuestions;
    } catch (error) {
      this.logger.error(`Error generating test: ${error.message}`);
      throw error;
    }
  }

  private determineTestsPassed(analysisContent: string): boolean {
    const positiveIndicators = [
      'all tests passed',
      'все тесты пройдены',
      'тесты успешно выполнены',
      'все проверки пройдены',
    ];

    const negativeIndicators = [
      'test failed',
      'тест не пройден',
      'ошибка в тесте',
      'тесты не пройдены',
      'failed test',
    ];

    const lowerContent = analysisContent.toLowerCase();
    const hasPositive = positiveIndicators.some((indicator) =>
      lowerContent.includes(indicator),
    );
    const hasNegative = negativeIndicators.some((indicator) =>
      lowerContent.includes(indicator),
    );

    return hasPositive && !hasNegative;
  }
}
