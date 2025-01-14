/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ _id: false })
export class EnrolledCourse {
  @ApiProperty({ description: 'ID курса' })
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  courseId: MongooseSchema.Types.ObjectId;

  @ApiProperty({ description: 'Процент прохождения курса', minimum: 0, maximum: 100 })
  @Prop({ default: 0, min: 0, max: 100 })
  progress: number;

  @ApiProperty({ description: 'Дата начала курса' })
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty({ description: 'Список пройденных уроков' })
  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  completedLessons: MongooseSchema.Types.ObjectId[];

  @ApiProperty({ description: 'Текущий урок' })
  @Prop({ type: MongooseSchema.Types.ObjectId })
  currentLesson: MongooseSchema.Types.ObjectId;

  @ApiProperty({ description: 'Общий счет за курс' })
  @Prop({ default: 0 })
  totalScore: number;
}

@Schema({ _id: false })
export class Payment {
  @ApiProperty({ description: 'ID транзакции' })
  @Prop({ required: true })
  transactionId: string;

  @ApiProperty({ description: 'ID курса' })
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  courseId: MongooseSchema.Types.ObjectId;

  @ApiProperty({ description: 'Сумма платежа' })
  @Prop({ required: true })
  amount: number;

  @ApiProperty({ description: 'Валюта платежа' })
  @Prop({ required: true })
  currency: string;

  @ApiProperty({ description: 'Статус платежа', enum: ['pending', 'completed', 'failed'] })
  @Prop({ required: true, enum: ['pending', 'completed', 'failed'] })
  status: string;

  @ApiProperty({ description: 'Дата создания платежа' })
  @Prop({ required: true })
  createdAt: Date;
}

@Schema({ versionKey: false, timestamps: true })
export class User extends Document {
  @ApiProperty({ description: 'Email пользователя', uniqueItems: true })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ description: 'Хэш пароля', required: false })
  @Prop()
  password: string;

  @ApiProperty({ description: 'Google ID для OAuth', required: false })
  @Prop()
  googleId?: string;

  @ApiProperty({ description: 'Имя пользователя' })
  @Prop()
  firstName: string;

  @ApiProperty({ description: 'Фамилия пользователя' })
  @Prop()
  lastName: string;

  @ApiProperty({ description: 'URL аватара', required: false })
  @Prop()
  avatar?: string;

  @ApiProperty({ description: 'Роль пользователя', enum: ['user', 'admin'], default: 'user' })
  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @ApiProperty({ description: 'Статус верификации email' })
  @Prop({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Токен для сброса пароля', required: false })
  @Prop()
  resetPasswordToken?: string;

  @ApiProperty({ description: 'Срок действия токена сброса пароля', required: false })
  @Prop()
  resetPasswordExpires?: Date;

  @ApiProperty({ description: 'Количество попыток входа' })
  @Prop({ default: 0 })
  loginAttempts: number;

  @ApiProperty({ description: 'Время блокировки аккаунта', required: false })
  @Prop()
  lockUntil?: Date;

  @ApiProperty({ description: 'Список курсов пользователя', type: [EnrolledCourse] })
  @Prop({ type: [EnrolledCourse], default: [] })
  enrolledCourses: EnrolledCourse[];

  @ApiProperty({ description: 'История платежей', type: [Payment] })
  @Prop({ type: [Payment], default: [] })
  payments: Payment[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1, googleId: 1 });
UserSchema.index({ 'enrolledCourses.courseId': 1 });
UserSchema.index({ 'payments.transactionId': 1 });