import { ApiProperty } from '@nestjs/swagger';
import { ProblemDetailDto } from '@camcima/nestjs-rfc9457/swagger';

/**
 * Custom Problem Details DTO for service unavailable responses.
 * Extends the base ProblemDetailDto with the retryAfter extension member
 * that the exceptionMapper adds for database connection failures.
 */
export class ServiceUnavailableProblemDto extends ProblemDetailDto {
  @ApiProperty({
    description: 'Number of seconds to wait before retrying.',
    example: 30,
  })
  retryAfter: number;
}
