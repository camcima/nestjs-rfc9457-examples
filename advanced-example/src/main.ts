import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createRfc9457ValidationPipeExceptionFactory } from '@camcima/nestjs-rfc9457';
import { applyProblemDetailResponses } from '@camcima/nestjs-rfc9457/swagger';
import { AppModule } from './app.module';
import { OrderConflictProblemDto } from './dto/order-conflict-problem.dto';
import { ServiceUnavailableProblemDto } from './dto/service-unavailable-problem.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: createRfc9457ValidationPipeExceptionFactory(),
    }),
  );

  // Swagger setup with:
  // - Auto-applied ProblemDetailDto for common error statuses
  // - validationStatuses: [400] to use ValidationProblemDetailDto for Tier 2 validation
  // - Custom extension DTOs registered via extraModels for per-route docs
  const config = new DocumentBuilder()
    .setTitle('Advanced Example')
    .setDescription(
      'Demonstrates @camcima/nestjs-rfc9457 with Swagger integration including:\n' +
        '- Auto-applied error schemas via applyProblemDetailResponses()\n' +
        '- Tier 2 structured validation errors (ValidationProblemDetailDto)\n' +
        '- Custom extension DTOs for domain-specific error fields\n' +
        '- Per-route @ApiResponse overrides with application/problem+json',
    )
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('api', app, () => {
    applyProblemDetailResponses(app, {
      statuses: [400, 404, 500],
      validationStatuses: [400],
    });
    return SwaggerModule.createDocument(app, config, {
      extraModels: [OrderConflictProblemDto, ServiceUnavailableProblemDto],
    });
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}

bootstrap();
