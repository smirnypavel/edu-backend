/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { MailService } from './../mail/mail.service';
import { LoginDto } from './dto';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<User>;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockUser = {
    email: 'test@test.com',
    password: 'hashedPassword123',
    firstName: 'Test',
    lastName: 'User',
    loginAttempts: 0,
    lockUntil: null,
    save: jest.fn(),
  };

  const mockUserModelFactory = () => {
    const mUserModel = jest.fn().mockImplementation(() => mockUser);
    (mUserModel as any).findOne = jest.fn();
    (mUserModel as any).create = jest.fn();
    (mUserModel as any).updateOne = jest.fn();
    return mUserModel;
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
    sendResetPasswordEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useFactory: mockUserModelFactory,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken('User'));
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('должен хешировать пароль перед сохранением', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const hashedPassword = 'hashedPassword123';

      // Мок для хеширования пароля
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      // Мок для проверки существующего пользователя
      userModel.findOne = jest.fn().mockResolvedValue(null);

      // Мок для создания пользователя
      const savedUser = {
        ...registerDto,
        password: hashedPassword,
        save: jest.fn().mockResolvedValue(true),
      };
      (userModel as jest.MockedFunction<any>).mockImplementation(
        () => savedUser,
      );

      mockJwtService.sign.mockReturnValue('test-token');
      mockMailService.sendVerificationEmail.mockResolvedValue(true);

      try {
        const result = await service.register(registerDto);

        // Проверки
        expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
        expect(userModel).toHaveBeenCalledWith({
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        });
        expect(savedUser.save).toHaveBeenCalled();
        expect(mockJwtService.sign).toHaveBeenCalledWith({
          email: registerDto.email,
        });
        expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
          'test@test.com',
          'test-token',
        );
        expect(result.message).toBe(
          'Регистрация успешна. Пожалуйста, подтвердите email.',
        );
      } catch (error) {
        throw error;
      }
    });

    it('должен выбросить ошибку если пользователь существует', async () => {
      const registerDto = {
        email: 'existing@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      (userModel.findOne as jest.Mock).mockResolvedValue({
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: registerDto.email,
      });
    });

    it('должен выбросить BadRequestException при ошибке сохранения пользователя', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const hashedPassword = 'hashedPassword123';
      const saveMock = jest.fn().mockRejectedValue(new Error('Save failed'));

      // Мокируем bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      // Мокируем проверку существования пользователя
      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      // Мокируем создание пользователя
      (userModel as unknown as jest.Mock).mockImplementation(() => ({
        ...registerDto,
        password: hashedPassword,
        save: saveMock,
      }));

      // Проверяем выброс BadRequestException
      await expect(service.register(registerDto)).rejects.toThrow(
        new BadRequestException('Неверные данные пользователя'),
      );

      // Проверяем вызовы методов
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userModel).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });

      // Проверяем вызов save()
      const mockInstance = (userModel as unknown as jest.Mock).mock.results[0]
        .value;
      expect(mockInstance.save).toHaveBeenCalled();
    });

    // Добавим тест для проверки InternalServerErrorException
    it('должен выбросить InternalServerErrorException при неожиданной ошибке', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      // Мокируем findOne чтобы он выбросил неожиданную ошибку
      (userModel.findOne as jest.Mock).mockRejectedValue(
        new Error('Unexpected error'),
      );

      // Проверяем выброс InternalServerErrorException
      await expect(service.register(registerDto)).rejects.toThrow(
        new InternalServerErrorException('Ошибка при регистрации пользователя'),
      );
    });
  });

  describe('login', () => {
    it('должен успешно авторизовать пользователя', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUserLogin = {
        _id: 'userId',
        email: loginDto.email,
        password: hashedPassword,
        loginAttempts: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(mockUserLogin);
      (jwtService.sign as jest.Mock).mockReturnValue('token');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(loginDto);

      expect(result.access_token).toBeDefined();
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: mockUserLogin._id,
        email: mockUserLogin.email,
      });
      expect(mockUserLogin.save).toHaveBeenCalled();
    });

    it('должен блокировать пользователя после 5 неудачных попыток', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('rightpassword', 10);
      const mockUserLogin = {
        email: loginDto.email,
        password: hashedPassword,
        loginAttempts: 4,
        lockUntil: null,
        save: jest.fn().mockResolvedValue(true),
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(mockUserLogin);
      // Важно: устанавливаем compare в false для имитации неверного пароля
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        hashedPassword,
      );
      expect(mockUserLogin.loginAttempts).toBe(5);
      expect(mockUserLogin.lockUntil).toBeDefined();
      expect(mockUserLogin.save).toHaveBeenCalled();
    });

    // Добавим тест для проверки уже заблокированного аккаунта
    it('должен отклонить вход для заблокированного пользователя', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      const futureDate = new Date(Date.now() + 3600000); // час вперед
      const mockUserLogin = {
        email: loginDto.email,
        password: 'hashedPassword',
        loginAttempts: 5,
        lockUntil: futureDate,
        save: jest.fn().mockResolvedValue(true),
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(mockUserLogin);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Аккаунт временно заблокирован'),
      );

      // Проверяем, что bcrypt.compare даже не вызывался
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    // Добавим тест для несуществующего пользователя
    it('должен отклонить вход для несуществующего пользователя', async () => {
      const loginDto = {
        email: 'nonexistent@test.com',
        password: 'password123',
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Неверные учетные данные'),
      );

      // Проверяем, что bcrypt.compare не вызывался
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('googleLogin', () => {
    it('должен создать нового пользователя при входе через Google', async () => {
      const googleProfile = {
        email: 'google@test.com',
        googleId: 'googleId123',
        firstName: 'Google',
        lastName: 'User',
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (userModel as unknown as jest.Mock).mockImplementation(() => ({
        ...googleProfile,
        save: jest.fn().mockResolvedValue(true),
      }));
      (jwtService.sign as jest.Mock).mockReturnValue('token');

      const result = await service.googleLogin(googleProfile);

      expect(result.access_token).toBeDefined();
      expect(result.user.email).toBe(googleProfile.email);
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: googleProfile.email,
      });
    });
  });

  describe('forgotPassword', () => {
    it('должен создать токен для сброса пароля', async () => {
      const email = 'test@test.com';
      const mockUserForgot = {
        email,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        save: jest.fn().mockResolvedValue(true),
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(mockUserForgot);

      const result = await service.forgotPassword(email);

      expect(result.message).toBe('Письмо для сброса пароля отправлено');
      expect(mockUserForgot.resetPasswordToken).toBeDefined();
      expect(mockUserForgot.resetPasswordExpires).toBeDefined();
      expect(mailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
      expect(mockUserForgot.save).toHaveBeenCalled();
    });
  });
});
