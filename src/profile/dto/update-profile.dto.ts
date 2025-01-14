/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Имя пользователя' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Фамилия пользователя' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Email пользователя' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'URL аватара' })
  @IsOptional()
  @IsString()
  avatar?: string;
}