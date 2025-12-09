import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

export function createUserClient(): ClientProxy {
  return ClientProxyFactory.create({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: +process.env.USER_SERVICE_PORT! || 4001,
    },
  });
}
