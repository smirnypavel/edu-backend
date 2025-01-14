/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create.course.dto';
import { CreateLessonDto } from './dto/create.lesson.dto';
import { TestSubmissionDto } from './dto/test.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {}

  async createCourse(
    createCourseData: CreateCourseDto & { author: string },
  ): Promise<Course> {
    try {
      const course = new this.courseModel(createCourseData);
      return await course.save();
    } catch (error) {
      this.logger.error(`Ошибка создания курса: ${error.message}`);
      throw new InternalServerErrorException('Ошибка при создании курса');
    }
  }

  async getCourses(filters: any = {}) {
    try {
      return await this.courseModel
        .find(filters)
        .populate('author', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Ошибка получения курсов: ${error.message}`);
      throw new InternalServerErrorException('Ошибка при получении курсов');
    }
  }

  async getCourseById(id: string): Promise<Course> {
    try {
      const course = await this.courseModel
        .findById(id)
        .populate('author', 'name email')
        .exec();

      if (!course) {
        throw new NotFoundException('Курс не найден');
      }
      return course;
    } catch (error) {
      this.logger.error(`Ошибка получения курса: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при получении курса');
    }
  }

  async updateCourse(
    id: string,
    updateData: Partial<CreateCourseDto>,
  ): Promise<Course> {
    try {
      const course = await this.courseModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();

      if (!course) {
        throw new NotFoundException('Курс не найден');
      }
      return course;
    } catch (error) {
      this.logger.error(`Ошибка обновления курса: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при обновлении курса');
    }
  }

  async addLesson(
    courseId: string,
    lessonDto: CreateLessonDto,
  ): Promise<Course> {
    try {
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Курс не найден');
      }

      course.lessons.push(lessonDto as any);
      return await course.save();
    } catch (error) {
      this.logger.error(`Ошибка добавления урока: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при добавлении урока');
    }
  }

  async updateLesson(
    courseId: string,
    lessonId: string,
    lessonDto: Partial<CreateLessonDto>,
  ): Promise<Course> {
    try {
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Курс не найден');
      }

      const lessonIndex = course.lessons.findIndex(
        (lesson) => lesson._id.toString() === lessonId,
      );

      if (lessonIndex === -1) {
        throw new NotFoundException('Урок не найден');
      }

      course.lessons[lessonIndex] = {
        ...(course.lessons[lessonIndex].toObject() as any),
        ...lessonDto,
      };

      return await course.save();
    } catch (error) {
      this.logger.error(`Ошибка обновления урока: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при обновлении урока');
    }
  }

  async evaluateCode(
    courseId: string,
    lessonId: string,
    submission: { code: string; language: string },
  ) {
    try {
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Курс не найден');
      }

      const lesson = course.lessons.find((l) => l._id.toString() === lessonId);
      if (!lesson) {
        throw new NotFoundException('Урок не найден');
      }

      const exercise = lesson.codeExercises.find(
        (ex) => ex.language === submission.language,
      );
      if (!exercise) {
        throw new NotFoundException('Упражнение не найдено для данного языка');
      }

      const testResults = await this.runTests(submission.code, exercise.tests);
      return {
        passed: testResults.every((result) => result.passed),
        testResults,
        score: this.calculateScore(testResults),
      };
    } catch (error) {
      this.logger.error(`Ошибка оценки кода: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при оценке кода');
    }
  }

  private async runTests(code: string, tests: string[]): Promise<any[]> {
    try {
      return tests.map((test) => ({
        test,
        passed: true,
        output: 'Тест пройден',
      }));
    } catch (error) {
      this.logger.error(`Ошибка выполнения тестов: ${error.message}`);
      throw new InternalServerErrorException('Ошибка при выполнении тестов');
    }
  }

  private calculateScore(testResults: any[]): number {
    try {
      return testResults.reduce((score, result) => {
        return score + (result.passed ? 1 : 0);
      }, 0);
    } catch (error) {
      this.logger.error(`Ошибка подсчета очков: ${error.message}`);
      return 0;
    }
  }

  private calculateTimeBonus(timeTaken: number, timeLimit: number): number {
    try {
      if (timeTaken < timeLimit * 0.5) return 10;
      if (timeTaken < timeLimit * 0.75) return 5;
      return 0;
    } catch (error) {
      this.logger.error(`Ошибка расчета временного бонуса: ${error.message}`);
      return 0;
    }
  }

  async evaluateTest(
    courseId: string,
    lessonId: string,
    submission: TestSubmissionDto,
  ) {
    try {
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Курс не найден');
      }

      const lesson = course.lessons.find((l) => l._id.toString() === lessonId);
      if (!lesson) {
        throw new NotFoundException('Урок не найден');
      }

      if (!lesson.tests || lesson.tests.length === 0) {
        throw new NotFoundException('Тесты не найдены для данного урока');
      }

      const testResults = this.checkTestAnswers(
        submission.answers,
        lesson.tests,
      );

      const timeLimit = Math.max(...lesson.tests.map((test) => test.timeLimit));
      const timeBonus = this.calculateTimeBonus(
        submission.timeTaken,
        timeLimit,
      );
      const maxScore = lesson.tests.reduce((sum, test) => sum + test.points, 0);
      const score = this.calculateTestScore(testResults, maxScore);

      await this.saveTestResults(courseId, lessonId, {
        answers: submission.answers,
        score,
        timeBonus,
        timeTaken: submission.timeTaken,
        submittedAt: new Date(),
      });

      return {
        passed: score / maxScore >= 0.7,
        score,
        timeBonus,
        totalScore: score + timeBonus,
        maxScore,
        details: testResults,
      };
    } catch (error) {
      this.logger.error(`Ошибка оценки теста: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при оценке теста');
    }
  }

  private checkTestAnswers(
    submissions: { questionId: string; answer: string }[],
    tests: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
      points: number;
    }>,
  ): any[] {
    return submissions.map((submission) => {
      const test = tests.find((t) => t.question === submission.questionId);
      if (!test) {
        throw new NotFoundException(
          `Вопрос ${submission.questionId} не найден`,
        );
      }

      const isCorrect = test.correctAnswer === submission.answer;
      return {
        question: test.question,
        correct: isCorrect,
        points: isCorrect ? test.points : 0,
        correctAnswer: test.correctAnswer,
        userAnswer: submission.answer,
      };
    });
  }

  private calculateTestScore(results: any[], timeBonus: number): number {
    try {
      const baseScore = results.reduce(
        (total, result) => total + result.points,
        0,
      );
      return baseScore + timeBonus;
    } catch (error) {
      this.logger.error(`Ошибка подсчета баллов теста: ${error.message}`);
      return 0;
    }
  }

  private async saveTestResults(
    courseId: string,
    lessonId: string,
    results: any,
  ): Promise<void> {
    try {
      await this.courseModel.updateOne(
        { _id: courseId, 'lessons._id': lessonId },
        {
          $push: {
            'lessons.$.testSubmissions': results,
          },
        },
      );
    } catch (error) {
      this.logger.error(
        `Ошибка сохранения результатов теста: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Ошибка при сохранении результатов теста',
      );
    }
  }
}
