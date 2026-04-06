import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

@Controller('items')
export class ItemsController {
  @Get(':id')
  getItem(@Param('id') id: string) {
    throw new NotFoundException(`Item with id ${id} was not found`);
  }

  @Get()
  listItems() {
    throw new ForbiddenException();
  }

  @Post()
  createItem() {
    throw new BadRequestException('Invalid item data');
  }
}
