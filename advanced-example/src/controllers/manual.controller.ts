import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ProblemDetailsFactory } from '@camcima/nestjs-rfc9457';

/**
 * Demonstrates direct injection and use of ProblemDetailsFactory.
 *
 *  GET /manual/build - builds a Problem Details object manually without
 *                      throwing an exception, giving the caller full control
 *                      over the response before sending.
 */
@ApiTags('Manual')
@Controller('manual')
export class ManualController {
  constructor(private readonly factory: ProblemDetailsFactory) {}

  @Get('build')
  @ApiOperation({ summary: 'Build a Problem Details response manually via ProblemDetailsFactory' })
  buildProblem(@Req() request: Request) {
    const result = this.factory.create(
      new NotFoundException('Manually built problem'),
      request as any,
    );
    // result is { status, body } — the response body is the Problem Details object.
    // In a real scenario you could mutate result.body before returning it.
    return result.body;
  }
}
