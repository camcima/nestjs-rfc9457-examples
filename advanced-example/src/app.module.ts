import { Logger, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Rfc9457Module,
  Rfc9457Request,
  ProblemDetail,
} from '@camcima/nestjs-rfc9457';
import { DatabaseConnectionException } from './exceptions/database-connection.exception';
import { OrderConflictException } from './exceptions/order-conflict.exception';
import { HealthController } from './controllers/health.controller';
import { OrdersController } from './controllers/orders.controller';
import { ManualController } from './controllers/manual.controller';

// Dedicated logger context so unhandled exceptions can be filtered or
// redirected to a dedicated sink (Sentry, Datadog, etc.) in a real app.
const unhandledLogger = new Logger('UnhandledExceptionSink');

@Module({
  imports: [
    DiscoveryModule,
    ConfigModule.forRoot(),
    Rfc9457Module.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): object => ({
        typeBaseUri: config.get<string>(
          'PROBLEM_TYPE_BASE_URI',
          'https://api.example.com/problems',
        ),
        instanceStrategy: 'uuid' as const,
        catchAllExceptions: true,
        // When catchAllExceptions is true and no exceptionMapper claims the
        // throwable, the library would normally log it at error level via its
        // built-in Logger (context `Rfc9457ExceptionFilter`). Providing
        // onUnhandled replaces that default with a custom sink. Production
        // apps typically forward to Sentry / Datadog here — in this example we
        // just log with a distinct context so it's easy to spot in stderr.
        // The filter still sends the generic 500 Problem Details response.
        onUnhandled: (exception: unknown, request: Rfc9457Request): void => {
          const summary = exception instanceof Error ? exception.message : String(exception);
          const stack = exception instanceof Error ? exception.stack : undefined;
          unhandledLogger.error(
            `Unhandled exception on ${request.method} ${request.url}: ${summary}`,
            stack,
          );
        },
        exceptionMapper: (
          exception: unknown,
          _request: Rfc9457Request,
        ): ProblemDetail | null => {
          // Map DatabaseConnectionException (a plain Error) to a 503 with retryAfter
          if (exception instanceof DatabaseConnectionException) {
            return {
              type: 'https://api.example.com/problems/service-unavailable',
              title: 'Service Temporarily Unavailable',
              status: 503,
              detail:
                'The database is currently unreachable. Please try again later.',
              retryAfter: 30,
            };
          }

          // Map OrderConflictException (an HttpException) with extension members
          if (exception instanceof OrderConflictException) {
            return {
              type: 'https://api.example.com/problems/order-conflict',
              title: 'Order Conflict',
              status: 409,
              detail: exception.message,
              conflictingOrderId: exception.conflictingOrderId,
              existingOrderUrl: exception.existingOrderUrl,
            };
          }

          // Return null to fall through to default handling
          return null;
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [HealthController, OrdersController, ManualController],
})
export class AppModule {}
