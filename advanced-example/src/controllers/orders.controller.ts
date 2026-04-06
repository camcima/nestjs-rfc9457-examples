import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ValidationProblemDetailDto } from '@camcima/nestjs-rfc9457/swagger';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderConflictProblemDto } from '../dto/order-conflict-problem.dto';
import { OrderConflictException } from '../exceptions/order-conflict.exception';

/**
 * Demonstrates:
 *  POST /orders          - throws OrderConflictException (409) → exceptionMapper adds extension members
 *  POST /orders/validate - accepts CreateOrderDto; invalid nested data shows Tier 2 structured errors
 *  GET  /orders/:id      - throws NotFoundException → type URI uses typeBaseUri
 *
 * Per-route @ApiResponse decorators show how to document custom extension members
 * and Tier 2 validation error responses in Swagger.
 */
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  @Post()
  @ApiOperation({ summary: 'Create an order (always conflicts in this demo)' })
  @ApiResponse({
    status: 409,
    description: 'Order conflict with extension members',
    content: {
      'application/problem+json': {
        schema: { $ref: getSchemaPath(OrderConflictProblemDto) },
      },
    },
  })
  createOrder() {
    // Simulate a conflict with an already-existing order
    throw new OrderConflictException('ord-abc-123', 'https://api.example.com/orders/ord-abc-123');
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate an order (Tier 2 structured validation errors)' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed with structured errors',
    content: {
      'application/problem+json': {
        schema: { $ref: getSchemaPath(ValidationProblemDetailDto) },
      },
    },
  })
  validateOrder(@Body() dto: CreateOrderDto) {
    // If validation passes, echo the DTO back
    return { message: 'Order is valid', order: dto };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID (always throws NotFoundException)' })
  getOrder(@Param('id') id: string) {
    throw new NotFoundException(`Order with id ${id} was not found`);
  }
}
