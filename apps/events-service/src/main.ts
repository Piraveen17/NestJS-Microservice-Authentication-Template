import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: +process.env.PORT! || 4002 },
  });
  await app.listen();
  console.log('Events service listening on port', process.env.PORT || 4002);
}
bootstrap();
