/* eslint-disable prettier/prettier */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './schemas/user.schema';
import { MailService } from '../mail/mail.service';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto/index';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { email, password, firstName, lastName } = registerDto;

      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new BadRequestException('Пользователь уже существует');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new this.userModel({
        email,
        firstName,
        lastName,
        password: hashedPassword,
      });

      await user.save().catch((error) => {
        this.logger.error(`Ошибка сохранения пользователя: ${error.message}`);
        throw new BadRequestException('Неверные данные пользователя');
      });

      const token = this.jwtService.sign({ email });
      await this.mailService.sendVerificationEmail(email, token);

      return { message: 'Регистрация успешна. Пожалуйста, подтвердите email.' };
    } catch (error) {
      this.logger.error(`Ошибка при регистрации: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при регистрации пользователя',
      );
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new UnauthorizedException('Неверные учетные данные');
      }

      if (user.lockUntil && user.lockUntil > new Date()) {
        throw new UnauthorizedException('Аккаунт временно заблокирован');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        user.loginAttempts += 1;

        if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
          user.lockUntil = new Date(Date.now() + this.LOCK_TIME);
        }

        await user.save();
        throw new UnauthorizedException('Неверные учетные данные');
      }

      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      const token = this.jwtService.sign({
        userId: user._id,
        email: user.email,
      });

      return {
        access_token: token,
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      this.logger.error(`Ошибка при входе: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при входе в систему');
    }
  }

  async googleLogin(profile: any) {
    try {
      const { email, googleId } = profile;

      let user = await this.userModel.findOne({ email });

      if (!user) {
        user = new this.userModel({
          email,
          googleId,
          isEmailVerified: true,
          firstName: profile.firstName,
          lastName: profile.lastName,
        });
        await user.save();
      }
      await this.userModel.updateOne(
        { email },
        {
          googleId,
        },
      );
      const token = this.jwtService.sign({
        userId: user._id,
        email: user.email,
      });

      return {
        access_token: token,
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      this.logger.error(`Ошибка при входе через Google: ${error.message}`);
      throw new InternalServerErrorException('Ошибка при входе через Google');
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new BadRequestException('Пользователь не найден');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordToken = await bcrypt.hash(resetToken, 10);

      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000);
      await user.save();

      await this.mailService.sendResetPasswordEmail(email, resetToken);

      return { message: 'Письмо для сброса пароля отправлено' };
    } catch (error) {
      this.logger.error(`Ошибка при сбросе пароля: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при обработке сброса пароля',
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { token, newPassword } = resetPasswordDto;

      const user = await this.userModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new BadRequestException(
          'Недействительный или просроченный токен',
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return { message: 'Пароль успешно изменен' };
    } catch (error) {
      this.logger.error(`Ошибка при изменении пароля: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при изменении пароля');
    }
  }
}
