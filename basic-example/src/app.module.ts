import { Module } from '@nestjs/common';
import { Rfc9457Module } from '@camcima/nestjs-rfc9457';
import { ItemsController } from './controllers/items.controller';
import { PaymentsController } from './controllers/payments.controller';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [Rfc9457Module.forRoot()],
  controllers: [ItemsController, PaymentsController, UsersController],
})
export class AppModule {}
