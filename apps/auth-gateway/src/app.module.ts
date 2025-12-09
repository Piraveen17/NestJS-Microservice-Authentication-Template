import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { config } from 'process';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
})
export class AppModule {}
