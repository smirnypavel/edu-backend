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
import { TestSubmissionDto } from './dto/test.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UserRole } from 'src/auth/decorators/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new course' })
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
  @ApiOperation({ summary: 'Get all courses' })
  getCourses(@Query() filters: any) {
    return this.coursesService.getCourses(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  getCourseById(@Param('id') id: string) {
    return this.coursesService.getCourseById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update course' })
  updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: Partial<CreateCourseDto>,
  ) {
    return this.coursesService.updateCourse(id, updateCourseDto);
  }

  @Post(':courseId/lessons')
  @ApiOperation({ summary: 'Add lesson to course' })
  addLesson(
    @Param('courseId') courseId: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.coursesService.addLesson(courseId, createLessonDto);
  }

  @Put(':courseId/lessons/:lessonId')
  @ApiOperation({ summary: 'Update lesson' })
  updateLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: Partial<CreateLessonDto>,
  ) {
    return this.coursesService.updateLesson(
      courseId,
      lessonId,
      updateLessonDto,
    );
  }

  @Post(':courseId/lessons/:lessonId/code')
  @ApiOperation({ summary: 'Evaluate code submission' })
  evaluateCode(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body() submission: { code: string; language: string },
  ) {
    return this.coursesService.evaluateCode(courseId, lessonId, submission);
  }
  @Post(':courseId/lessons/:lessonId/test')
  @ApiOperation({ summary: 'Оценка теста' })
  @ApiResponse({ status: 200, description: 'Тест успешно оценен' })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Курс или урок не найден' })
  async evaluateTest(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body() submission: TestSubmissionDto,
  ) {
    return await this.coursesService.evaluateTest(
      courseId,
      lessonId,
      submission,
    );
  }
}
