import { Controller, Get, Post } from '@nestjs/common';
import { InsufficientFundsException } from '../exceptions/insufficient-funds.exception';
import { RateLimitExceededException } from '../exceptions/rate-limit.exception';

@Controller()
export class PaymentsController {
  @Post('payments')
  createPayment() {
    throw new InsufficientFundsException(50, 100);
  }

  @Get('rate-limited')
  rateLimited() {
    throw new RateLimitExceededException(30);
  }
}
