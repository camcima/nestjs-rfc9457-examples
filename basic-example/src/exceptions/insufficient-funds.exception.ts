import { HttpException } from '@nestjs/common';
import { ProblemType } from '@camcima/nestjs-rfc9457';

@ProblemType({
  type: 'https://api.example.com/problems/insufficient-funds',
  title: 'Insufficient Funds',
  status: 422,
})
export class InsufficientFundsException extends HttpException {
  constructor(balance: number, required: number) {
    super(`Account balance ${balance} is less than required amount ${required}`, 422);
  }
}
