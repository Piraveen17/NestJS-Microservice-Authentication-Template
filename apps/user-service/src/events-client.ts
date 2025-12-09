import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

export function createEventsClient(): ClientProxy {
  return ClientProxyFactory.create({
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: +process.env.EVENTS_PORT! || 4002 },
  });
}
