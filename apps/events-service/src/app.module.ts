import { Module } from '@nestjs/common';
import { EmailController } from './email/email.controller';

@Module({
  controllers: [EmailController],
})
export class AppModule {}
