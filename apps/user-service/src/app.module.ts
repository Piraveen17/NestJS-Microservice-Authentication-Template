import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './users/users.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { USER_MODEL_NAME, UserSchema } from './users/schemas/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI! || 'mongodb://localhost:27017/nest_better_auth',
    ),
    MongooseModule.forFeature([{ name: USER_MODEL_NAME, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UsersService],
})
export class AppModule {}
