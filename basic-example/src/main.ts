import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { applyProblemDetailResponses } from '@camcima/nestjs-rfc9457/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // Swagger setup with automatic RFC 9457 error documentation
  const config = new DocumentBuilder()
    .setTitle('Basic Example')
    .setDescription(
      'Demonstrates @camcima/nestjs-rfc9457 with automatic Swagger error documentation. ' +
        'All error responses use application/problem+json and the ProblemDetailDto schema.',
    )
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('api', app, () => {
    applyProblemDetailResponses(app, {
      statuses: [400, 403, 404, 422, 429, 500],
    });
    return SwaggerModule.createDocument(app, config);
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}

bootstrap();
