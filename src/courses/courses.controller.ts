/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  InternalServerErrorException,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreateCourseDto } from './dto/create.course.dto';
import { CreateLessonDto } from './dto/create.lesson.dto';
import { CreateTestDto } from './dto/test.dto';
import { Roles } from './../auth/decorators/role.decorator';
import { UserRole } from './../auth/decorators/roles.enum';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../auth/guards/role.guard';
import { UpdateLessonDto } from './dto/update.lesson.dto';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.ADMIN || UserRole.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создание нового курса' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async createCourse(
    @Req() req: any,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    try {
      return await this.coursesService.createCourse({
        ...createCourseDto,
        author: req.user._id,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create course: ${error.message}`,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Получить все опубликованые курсы' })
  getCourses() {
    return this.coursesService.getCourses();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить курс по ID' })
  getCourseById(@Param('id') id: string) {
    return this.coursesService.getCourseById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN || UserRole.TEACHER)
  @ApiOperation({ summary: 'Обновить курс' })
  updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: Partial<CreateCourseDto>,
  ) {
    return this.coursesService.updateCourse(id, updateCourseDto);
  }

  @Post(':courseId/lessons')
  @Roles(UserRole.ADMIN || UserRole.TEACHER)
  @ApiOperation({ summary: 'Создать урок' })
  addLesson(
    @Param('courseId') courseId: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.coursesService.addLesson(courseId, createLessonDto);
  }

  @Get('lessons/:lessonId')
  @ApiOperation({ summary: 'Получить урок по ID' })
  getLessonById(@Param('lessonId') lessonId: string) {
    return this.coursesService.getLessonById(lessonId);
  }

  @Put('lessons/:lessonId')
  @Roles(UserRole.ADMIN || UserRole.TEACHER)
  @ApiOperation({ summary: 'Обновить урок' })
  updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.coursesService.updateLesson(lessonId, updateLessonDto);
  }

  @Post('tests/:lessonId')
  @Roles(UserRole.ADMIN || UserRole.TEACHER)
  @ApiOperation({ summary: 'Создать набор тестов для урока' })
  addTest(@Param('lessonId') lessonId: string, @Body() test: CreateTestDto) {
    return this.coursesService.addTest(lessonId, test);
  }

  // @Post(':courseId/lessons/:lessonId/code')
  // @ApiOperation({ summary: 'Оценка задания' })
  // evaluateCode(
  //   @Param('courseId') courseId: string,
  //   @Param('lessonId') lessonId: string,
  //   @Body() submission: { code: string; language: string },
  // ) {
  //   return this.coursesService.evaluateCode(courseId, lessonId, submission);
  // }
  // @Post(':courseId/lessons/:lessonId/test')
  // @ApiOperation({ summary: 'Оценка теста' })
  // @ApiResponse({ status: 200, description: 'Тест успешно оценен' })
  // @ApiBadRequestResponse({ description: 'Некорректные данные' })
  // @ApiNotFoundResponse({ description: 'Курс или урок не найден' })
  // async evaluateTest(
  //   @Param('courseId') courseId: string,
  //   @Param('lessonId') lessonId: string,
  //   @Body() submission: TestSubmissionDto,
  // ) {
  //   return await this.coursesService.evaluateTest(
  //     courseId,
  //     lessonId,
  //     submission,
  //   );
  // }
}
