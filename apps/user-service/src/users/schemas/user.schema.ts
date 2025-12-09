import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
export const USER_MODEL_NAME = 'User';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userID: string;
  // common fields
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  // password only for normal registration
  @Prop()
  password?: string;

  // OAuth fields
  @Prop()
  provider?: string; // 'google', 'facebook', etc.

  @Prop()
  providerId?: string; // e.g., Google ID

  @Prop()
  photo?: string;

  @Prop()
  accessToken?: string; // optional
}

export const UserSchema = SchemaFactory.createForClass(User);
