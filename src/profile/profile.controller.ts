/* eslint-disable prettier/prettier */
import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Получить информацию для дашборда' })
  @ApiResponse({ status: 200, description: 'Данные дашборда получены' })
  async getDashboard(@Req() req) {
    return this.profileService.getDashboard(req.user._id);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Получить список доступных курсов' })
  async getCourses(@Req() req) {
    return this.profileService.getCourses(req.user._id);
  }

  @Get('learning-history')
  @ApiOperation({ summary: 'Получить историю обучения' })
  async getLearningHistory(@Req() req) {
    return this.profileService.getLearningHistory(req.user._id);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Получить статистику обучения' })
  async getStatistics(@Req() req) {
    return this.profileService.getStatistics(req.user._id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Получить историю транзакций' })
  async getTransactions(@Req() req) {
    return this.profileService.getTransactions(req.user._id);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Обновить настройки профиля' })
  async updateSettings(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user._id, updateProfileDto);
  }
}