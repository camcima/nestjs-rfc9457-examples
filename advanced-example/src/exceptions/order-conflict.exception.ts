import { HttpException } from '@nestjs/common';

/**
 * An HttpException (409 Conflict) thrown when a duplicate order is detected.
 * The exceptionMapper enriches this with domain-specific extension members:
 * conflictingOrderId and existingOrderUrl.
 */
export class OrderConflictException extends HttpException {
  constructor(
    public readonly conflictingOrderId: string,
    public readonly existingOrderUrl: string,
  ) {
    super(
      `An order with conflicting constraints already exists (id: ${conflictingOrderId})`,
      409,
    );
  }
}
