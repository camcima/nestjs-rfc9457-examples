import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Rfc9457Module } from '@camcima/nestjs-rfc9457';
import { ItemsController } from './controllers/items.controller';
import { PaymentsController } from './controllers/payments.controller';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [DiscoveryModule, Rfc9457Module.forRoot()],
  controllers: [ItemsController, PaymentsController, UsersController],
})
export class AppModule {}
