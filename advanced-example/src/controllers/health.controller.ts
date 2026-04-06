import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ServiceUnavailableProblemDto } from '../dto/service-unavailable-problem.dto';
import { DatabaseConnectionException } from '../exceptions/database-connection.exception';

/**
 * Demonstrates catchAllExceptions with two kinds of non-HttpException errors:
 *
 *  GET /health/db    - throws DatabaseConnectionException (mapped by exceptionMapper → 503)
 *  GET /health/crash - throws a raw Error (not mapped → generic 500, no detail leak)
 *
 * Per-route @ApiResponse shows how to document custom extension members
 * (retryAfter) for mapped non-HttpException errors.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('db')
  @ApiOperation({ summary: 'Check database (always throws DatabaseConnectionException)' })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable with retryAfter extension member',
    content: {
      'application/problem+json': {
        schema: { $ref: getSchemaPath(ServiceUnavailableProblemDto) },
      },
    },
  })
  checkDatabase() {
    throw new DatabaseConnectionException();
  }

  @Get('crash')
  @ApiOperation({ summary: 'Simulate crash (unhandled Error → generic 500)' })
  crash() {
    throw new Error('Unexpected failure');
  }
}
