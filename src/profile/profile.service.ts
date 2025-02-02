/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { Course } from '../courses/schemas/course.schema';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Course') private readonly courseModel: Model<Course>,
  ) {}

  async getDashboard(userId: string) {
    try {
      const user = await this.userModel
        .findById(userId)
        .populate('enrolledCourses.courseId')
        .select('-password');

      if (!user) {
        throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
      }

      return {
        totalProgress: this.calculateTotalProgress(user.enrolledCourses),
        activeCourses: user.enrolledCourses,
        totalScore: this.calculateTotalScore(user.enrolledCourses),
        recentActivity: await this.getRecentActivity(userId),
      };
    } catch (error) {
      this.logger.error(`Ошибка при получении дашборда: ${error.message}`);
      throw new HttpException(
        'Ошибка при получении данных дашборда',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCourses(userId: string) {
    try {
      const user = await this.userModel
        .findById(userId)
        .populate('enrolledCourses.courseId');

      if (!user) {
        throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
      }

      const enrolledCourseIds = user.enrolledCourses.map(
        (course) => course.courseId,
      );

      const [availableCourses, enrolledCourses] = await Promise.all([
        this.courseModel.find({
          _id: { $nin: enrolledCourseIds },
          status: 'published',
        }),
        this.courseModel.find({
          _id: { $in: enrolledCourseIds },
          status: 'published',
        }),
      ]);

      return { available: availableCourses, enrolled: enrolledCourses };
    } catch (error) {
      this.logger.error(`Ошибка при получении курсов: ${error.message}`);
      throw new HttpException(
        'Ошибка при получении списка курсов',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLearningHistory(userId: string) {
    try {
      const user = await this.userModel
        .findById(userId)
        .populate('enrolledCourses.courseId')
        .populate('enrolledCourses.completedLessons');

      if (!user) {
        throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
      }

      return user.enrolledCourses.map((course) => ({
        courseName: course.courseId,
        progress: course.progress,
        completedLessons: course.completedLessons,
        lastActivity: this.getLastActivity(course),
      }));
    } catch (error) {
      this.logger.error(
        `Ошибка при получении истории обучения: ${error.message}`,
      );
      throw new HttpException(
        'Ошибка при получении истории обучения',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStatistics(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
      }
      // Реализация статистики
    } catch (error) {
      this.logger.error(`Ошибка при получении статистики: ${error.message}`);
      throw new HttpException(
        'Ошибка при получении статистики',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTransactions(userId: string) {
    try {
      const user = await this.userModel
        .findById(userId)
        .populate('payments.courseId');

      if (!user) {
        throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
      }

      return user.payments;
    } catch (error) {
      this.logger.error(`Ошибка при получении транзакций: ${error.message}`);
      throw new HttpException(
        'Ошибка при получении истории транзакций',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProfile(userId: string, updateProfileDto: any) {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, { $set: updateProfileDto }, { new: true })
        .select('-password');

      if (!updatedUser) {
        throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
      }

      return updatedUser;
    } catch (error) {
      this.logger.error(`Ошибка при обновлении профиля: ${error.message}`);
      throw new HttpException(
        'Ошибка при обновлении профиля',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private calculateTotalProgress(enrolledCourses: any[]): number {
    try {
      if (!enrolledCourses.length) return 0;
      return (
        enrolledCourses.reduce((total, course) => total + course.progress, 0) /
        enrolledCourses.length
      );
    } catch (error) {
      this.logger.error(`Ошибка при расчете прогресса: ${error.message}`);
      return 0;
    }
  }

  private calculateTotalScore(enrolledCourses: any[]): number {
    try {
      return enrolledCourses.reduce(
        (total, course) => total + (course.score || 0),
        0,
      );
    } catch (error) {
      this.logger.error(`Ошибка при расчете баллов: ${error.message}`);
      return 0;
    }
  }

  private getLastActivity(course: any) {
    try {
      return course.lastActivity || null;
    } catch (error) {
      this.logger.error(
        `Ошибка при получении последней активности: ${error.message}`,
      );
      return null;
    }
  }

  private async getRecentActivity(userId: string) {
    try {
      console.log(userId);
      // Реализация получения последней активности
      return [];
    } catch (error) {
      this.logger.error(
        `Ошибка при получении последней активности: ${error.message}`,
      );
      return [];
    }
  }
}
