import { HttpException } from '@nestjs/common';
import { ProblemType } from '@camcima/nestjs-rfc9457';

@ProblemType({
  type: 'https://api.example.com/problems/rate-limit-exceeded',
  title: 'Rate Limit Exceeded',
  status: 429,
})
export class RateLimitExceededException extends HttpException {
  constructor(retryAfterSeconds: number) {
    super(`Rate limit exceeded. Retry after ${retryAfterSeconds} seconds`, 429);
  }
}
