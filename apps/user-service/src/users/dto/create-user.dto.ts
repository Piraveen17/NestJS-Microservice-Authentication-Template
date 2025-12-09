import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString({ message: 'Invalid full name' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Invalid full name' })
  lastName?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;
}

export class UpdateUserDto {
  @IsUUID('4', { message: 'Invalid user ID' })
  id!: string; // required to identify which user to update

  @IsOptional()
  @IsString({ message: 'Invalid full name' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Invalid full name' })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  password?: string;
}
