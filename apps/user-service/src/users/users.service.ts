import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class UsersService {
  private eventsClient: ClientProxy;
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    // TCP client for emitting events
    this.eventsClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: +process.env.EVENTS_PORT! || 4002,
      },
    });
  }

  /**
   * Create a new user (normal or Google)
   */
  async createUser(userData: Partial<User>): Promise<UserDocument> {
    const {
      email,
      password,
      firstName,
      lastName,
      provider,
      providerId,
      photo,
      accessToken,
    } = userData;

    try {
      const exists = await this.userModel.findOne({ email });
      if (exists) {
        throw new ConflictException('User already exists');
      }

      let passwordHash: string | undefined;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      const user = new this.userModel({
        userID: uuidv4(),
        email,
        password: passwordHash, // password is optional
        firstName,
        lastName,
        provider,
        providerId,
        photo,
        accessToken,
      });

      const savedUser = await user.save();

      // 🔹 Emit event to other services (fire-and-forget)
      this.eventsClient.emit('UserCreated', {
        userID: savedUser.userID,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
      });

      return savedUser;
    } catch (error) {
      console.error('Error saving user:', error);
      throw new InternalServerErrorException('Registration failed');
    }
  }

  /**
   * Find user by email (normal registration)
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Find user by OAuth provider + providerId
   */
  async findByProviderId(payload: {
    provider: string;
    providerId: string;
  }): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ provider: payload.provider, providerId: payload.providerId })
      .lean()
      .exec();
  }

  /**
   * Find user by ID
   */
  async findById(userID: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ userID }).exec();
  }

  /**
   * Update user
   */
  async updateUser(
    userID: string,
    data: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate({ userID }, data, { new: true })
      .exec();
  }
}
