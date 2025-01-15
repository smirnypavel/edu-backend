/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create.course.dto';
import { UserRole } from './../auth/decorators/roles.enum';
import { CreateLessonDto } from './dto/create.lesson.dto';
import { TestSubmissionDto } from './dto/test.dto';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockCoursesService = {
    createCourse: jest.fn(),
    getCourses: jest.fn(),
    getCourseById: jest.fn(),
    updateCourse: jest.fn(),
    addLesson: jest.fn(),
    updateLesson: jest.fn(),
    evaluateCode: jest.fn(),
    evaluateTest: jest.fn(),
  };
  const mockLesson: CreateLessonDto = {
    title: 'Введение в JavaScript',
    order: 1,
    content: '# Введение\nВ этом уроке мы изучим основы JavaScript...',
    images: ['https://example.com/image1.jpg'],
    videoUrl: 'https://youtube.com/watch?v=123',
    codeExercises: [
      {
        language: 'javascript',
        initialCode: 'function sum(a, b) {\n  // your code here\n}',
        solution: 'function sum(a, b) {\n  return a + b;\n}',
        tests: ['test("sum(2, 2) should return 4", () => {...}'],
      },
    ],
    tests: [
      {
        question: 'Что такое JavaScript?',
        options: [
          'Язык программирования',
          'База данных',
          'Операционная система',
        ],
        correctAnswer: 'Язык программирования',
        points: 10,
        timeLimit: 300,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  describe('createCourse', () => {
    const createCourseDto: CreateCourseDto = {
      title: 'JavaScript',
      description: 'Course Description',
      level: 'beginner',
      price: 99.99,
      category: 'programming',
      tags: ['js', 'web'],
      lessons: [],
    };

    it('должен создать курс и добавить автора', async () => {
      const req = {
        user: { _id: 'userId', role: UserRole.TEACHER },
      };

      const expectedResult = {
        ...createCourseDto,
        author: req.user._id,
      };

      mockCoursesService.createCourse.mockResolvedValue(expectedResult);

      const result = await controller.createCourse(req, createCourseDto);

      expect(result).toEqual(expectedResult);
      expect(service.createCourse).toHaveBeenCalledWith({
        ...createCourseDto,
        author: req.user._id,
      });
    });

    it('должен выбросить ошибку при сбое создания', async () => {
      const req = {
        user: { _id: 'userId', role: UserRole.TEACHER },
      };

      mockCoursesService.createCourse.mockRejectedValue(new Error('DB Error'));

      await expect(
        controller.createCourse(req, createCourseDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getCourses', () => {
    it('должен вернуть отфильтрованный список курсов', async () => {
      const filters = { category: 'programming' };
      const expectedCourses = [
        { id: '1', title: 'Course 1' },
        { id: '2', title: 'Course 2' },
      ];

      mockCoursesService.getCourses.mockResolvedValue(expectedCourses);

      const result = await controller.getCourses(filters);

      expect(result).toEqual(expectedCourses);
      expect(service.getCourses).toHaveBeenCalledWith(filters);
    });
  });

  describe('getCourseById', () => {
    it('должен вернуть курс по id', async () => {
      const courseId = 'courseId';
      const expectedCourse = {
        id: courseId,
        title: 'Test Course',
      };

      mockCoursesService.getCourseById.mockResolvedValue(expectedCourse);

      const result = await controller.getCourseById(courseId);

      expect(result).toEqual(expectedCourse);
      expect(service.getCourseById).toHaveBeenCalledWith(courseId);
    });
  });

  describe('updateCourse', () => {
    it('должен обновить существующий курс', async () => {
      const courseId = 'courseId';
      const updateDto = { title: 'Updated Title' };
      const expectedResult = {
        id: courseId,
        ...updateDto,
      };

      mockCoursesService.updateCourse.mockResolvedValue(expectedResult);

      const result = await controller.updateCourse(courseId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateCourse).toHaveBeenCalledWith(courseId, updateDto);
    });
  });

  describe('addLesson', () => {
    it('должен добавить урок в курс', async () => {
      const courseId = 'courseId';
      const expectedResult = {
        id: 'lessonId',
        ...mockLesson,
      };

      mockCoursesService.addLesson.mockResolvedValue(expectedResult);

      const result = await controller.addLesson(courseId, mockLesson);

      expect(result).toEqual(expectedResult);
      expect(service.addLesson).toHaveBeenCalledWith(courseId, mockLesson);
    });
    it('должен проверить порядок уроков', async () => {
      const courseId = 'courseId';

      const newLesson = { ...mockLesson, order: 1 };

      mockCoursesService.addLesson.mockRejectedValue(
        new BadRequestException(
          'Урок с таким порядковым номером уже существует',
        ),
      );

      await expect(controller.addLesson(courseId, newLesson)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('должен проверить максимальное количество уроков', async () => {
      const courseId = 'courseId';
      mockCoursesService.addLesson.mockRejectedValue(
        new BadRequestException('Превышено максимальное количество уроков'),
      );

      await expect(controller.addLesson(courseId, mockLesson)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateLesson', () => {
    it('должен обновить существующий урок', async () => {
      const courseId = 'courseId';
      const lessonId = 'lessonId';
      const updatedLesson = {
        ...mockLesson,
        title: 'Обновленное введение в JavaScript',
      };

      mockCoursesService.updateLesson.mockResolvedValue({
        id: lessonId,
        ...updatedLesson,
      });

      const result = await controller.updateLesson(
        courseId,
        lessonId,
        updatedLesson,
      );

      expect(result.title).toBe('Обновленное введение в JavaScript');
      expect(service.updateLesson).toHaveBeenCalledWith(
        courseId,
        lessonId,
        updatedLesson,
      );
    });
  });

  describe('evaluateCode', () => {
    it('должен оценить код упражнения', async () => {
      const courseId = 'courseId';
      const lessonId = 'lessonId';
      const submission = {
        code: 'function sum(a, b) { return a + b; }',
        language: 'javascript',
      };

      const expectedResult = {
        success: true,
        output: 'Все тесты пройдены',
      };

      mockCoursesService.evaluateCode.mockResolvedValue(expectedResult);

      const result = await controller.evaluateCode(
        courseId,
        lessonId,
        submission,
      );

      expect(result).toEqual(expectedResult);
    });
    it('должен обработать ошибку компиляции', async () => {
      const courseId = 'courseId';
      const lessonId = 'lessonId';
      const submission = {
        code: 'invalid code',
        language: 'javascript',
      };

      mockCoursesService.evaluateCode.mockResolvedValue({
        passed: false,
        testResults: [],
        score: 0,
      });

      const result = await controller.evaluateCode(
        courseId,
        lessonId,
        submission,
      );
      expect(result.passed).toBeFalsy();
    });

    it('должен обработать превышение времени выполнения', async () => {
      const courseId = 'courseId';
      const lessonId = 'lessonId';
      const submission = {
        code: 'while(true) {}',
        language: 'javascript',
      };

      mockCoursesService.evaluateCode.mockRejectedValue(
        new BadRequestException('Превышено время выполнения'),
      );

      await expect(
        controller.evaluateCode(courseId, lessonId, submission),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('evaluateTest', () => {
    it('должен оценить тест', async () => {
      const courseId = 'courseId';
      const lessonId = 'lessonId';
      const submission: TestSubmissionDto = {
        answers: [
          {
            questionId: '1',
            answer: 'Язык программирования',
          },
        ],
        timeTaken: 300,
      };

      const expectedResult = {
        score: 10,
        correctAnswers: 1,
        totalQuestions: 1,
      };

      mockCoursesService.evaluateTest.mockResolvedValue(expectedResult);

      const result = await controller.evaluateTest(
        courseId,
        lessonId,
        submission,
      );

      expect(result).toEqual(expectedResult);
    });
    it('должен проверить время выполнения теста', async () => {
      const courseId = 'courseId';
      const lessonId = 'lessonId';
      const submission: TestSubmissionDto = {
        answers: [{ questionId: '1', answer: 'A' }],
        timeTaken: 600, // Превышено время
      };

      mockCoursesService.evaluateTest.mockRejectedValue(
        new BadRequestException('Превышено время выполнения теста'),
      );

      await expect(
        controller.evaluateTest(courseId, lessonId, submission),
      ).rejects.toThrow(BadRequestException);
    });

    it('должен проверить все ответы на тест', async () => {
      const courseId = 'courseId';
      const lessonId = 'lessonId';
      const submission: TestSubmissionDto = {
        answers: [], // Пустые ответы
        timeTaken: 300,
      };

      mockCoursesService.evaluateTest.mockRejectedValue(
        new BadRequestException('Необходимо ответить на все вопросы'),
      );

      await expect(
        controller.evaluateTest(courseId, lessonId, submission),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
