import { ApiProperty } from '@nestjs/swagger';
import { ProblemDetailDto } from '@camcima/nestjs-rfc9457/swagger';

/**
 * Custom Problem Details DTO for order conflict responses.
 * Extends the base ProblemDetailDto with domain-specific extension members
 * that the exceptionMapper adds at runtime.
 */
export class OrderConflictProblemDto extends ProblemDetailDto {
  @ApiProperty({
    description: 'The ID of the conflicting order.',
    example: 'ord-abc-123',
  })
  conflictingOrderId: string;

  @ApiProperty({
    description: 'URL of the existing order that caused the conflict.',
    example: 'https://api.example.com/orders/ord-abc-123',
  })
  existingOrderUrl: string;
}
