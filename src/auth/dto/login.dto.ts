/* eslint-disable prettier/prettier */
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please enter a valid email' })
  email: string;

  @ApiProperty({
    example: 'StrongP@ss1',
    description: 'User password',
  })
  @IsString()
  password: string;
}
