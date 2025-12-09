import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

@Controller()
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @MessagePattern({ cmd: 'update_user' })
  async updateUser(
    @Payload() Payload: { userID: string; data: Partial<User> },
  ) {
    const { userID, data } = Payload;
    return this.userService.updateUser(userID, data);
  }

  @MessagePattern({ cmd: 'get_user_by_email' })
  async getUserByEmail(email: string) {
    return this.userService.findByEmail(email);
  }

  @MessagePattern({ cmd: 'find_or_create_oauth_user' })
  async findOrCreateOauthUser(payload: {
    provider: string;
    providerId: string;
  }) {
    return this.userService.findByProviderId(payload);
  }
}
