import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderConflictException } from '../exceptions/order-conflict.exception';

/**
 * Demonstrates:
 *  POST /orders          - throws OrderConflictException (409) → exceptionMapper adds extension members
 *  POST /orders/validate - accepts CreateOrderDto; invalid nested data shows Tier 2 structured errors
 *  GET  /orders/:id      - throws NotFoundException → type URI uses typeBaseUri
 */
@Controller('orders')
export class OrdersController {
  @Post()
  createOrder(@Body() _dto: CreateOrderDto) {
    // Simulate a conflict with an already-existing order
    throw new OrderConflictException('ord-abc-123', 'https://api.example.com/orders/ord-abc-123');
  }

  @Post('validate')
  validateOrder(@Body() dto: CreateOrderDto) {
    // If validation passes, echo the DTO back
    return { message: 'Order is valid', order: dto };
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    throw new NotFoundException(`Order with id ${id} was not found`);
  }
}
