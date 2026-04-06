import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { createRfc9457ValidationPipeExceptionFactory } from '@camcima/nestjs-rfc9457';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: createRfc9457ValidationPipeExceptionFactory(),
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on http://localhost:${port}`);
}

bootstrap();
