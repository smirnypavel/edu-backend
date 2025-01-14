/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT), 
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    this.transporter.verify((error) => {
      if (error) {
        console.error('Ошибка SMTP:', error);
      } else {
        console.log('Сервер готов к отправке писем');
      }
    });
  }

  private async compileTemplate(templateName: string, context: any): Promise<string> {
    const templatePath = path.join(process.cwd(), 'src/templates', `${templateName}.hbs`);
    const template = fs.readFileSync(templatePath, 'utf-8');
    return handlebars.compile(template)(context);
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = await this.compileTemplate('verification-email', {
      verificationUrl,
      firstName: email.split('@')[0], 
      supportEmail: process.env.SMTP_USER,
    });

    await this.transporter.sendMail({
      from: `"${process.env.SMTP_USER}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Подтвердите ваш email адрес',
      html,
    });
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    
    const html = await this.compileTemplate('reset-password-email', {
      resetUrl,
      firstName: email.split('@')[0],
      supportEmail: process.env.SMTP_USER,
      expiryTime: '1 час',
    });

    await this.transporter.sendMail({
      from: `"${process.env.SMTP_USER}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Сброс пароля',
      html,
    });
  }
}