import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class EmailController {
  @EventPattern('UserCreated')
  async handleUserCreated(@Payload() data: any) {
    console.log('Received UserCreated event:', data);
    // place email sending logic here (send welcome email)
    // e.g. await this.mailerService.sendWelcome(data.email)
  }
}
