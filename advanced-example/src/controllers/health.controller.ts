import { Controller, Get } from '@nestjs/common';
import { DatabaseConnectionException } from '../exceptions/database-connection.exception';

/**
 * Demonstrates catchAllExceptions with two kinds of non-HttpException errors:
 *
 *  GET /health/db    - throws DatabaseConnectionException (mapped by exceptionMapper → 503)
 *  GET /health/crash - throws a raw Error (not mapped → generic 500, no detail leak)
 */
@Controller('health')
export class HealthController {
  @Get('db')
  checkDatabase() {
    throw new DatabaseConnectionException();
  }

  @Get('crash')
  crash() {
    throw new Error('Unexpected failure');
  }
}
