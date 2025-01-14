/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
async function start() {
  const PORT = process.env.PORT;
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: process.env.GOOGLE_CLIENT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60000,
      },
    }),
  );
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Programming Learning Platform API')
    .setDescription('API documentation for Programming Learning Platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addBearerAuth()
    .addServer(`http://localhost:${PORT}`)
    .addServer(`https://edu-backend-jub0.onrender.com`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT, () =>
    console.log(`Server started on port = http://localhost:${PORT}`),
  );
}
start();
