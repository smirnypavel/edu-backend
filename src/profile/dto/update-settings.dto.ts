/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {  IsObject, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({ description: 'Настройки уведомлений' })
  @IsOptional()
  @IsObject()
  notifications?: {
    email: boolean;
    browser: boolean;
    telegram?: boolean;
  };

  @ApiProperty({ description: 'Настройки приватности' })
  @IsOptional()
  @IsObject()
  privacy?: {
    showProfile: boolean;
    showProgress: boolean;
    showAchievements: boolean;
  };

  @ApiProperty({ description: 'Настройки интерфейса' })
  @IsOptional()
  @IsObject()
  interface?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}