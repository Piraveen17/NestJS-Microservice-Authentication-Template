import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth-credentials.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { createUserClient } from '../common/clients';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  private userClient = createUserClient();
  constructor(private readonly authService: AuthService) {}

  // Register: delegate to User Service over TCP
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() registerDto: RegisterDto) {
    const createUser = await firstValueFrom(
      this.userClient.send({ cmd: 'create_user' }, registerDto),
    );
    return {
      ok: true,
      user: { id: createUser.userID, email: createUser.email },
    };
  }

  // Login: LocalAuthGuard validates credentials and sets req.user
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // If using stateless JWT, protect this route with JwtAuthGuard and implement token revocation logic.
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any) {
    return {
      message:
        'Logged out (client must delete token). Server-side revoke performed if implemented.',
    };
  }

  // Protected user info
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getUserInfo(@Request() req: any) {
    return req.user; 
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirect handled by Passport
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req: any) {
    const { access_token, user } = await this.authService.loginWithGoogle(
      req.user,
    );
    return {
      access_token: access_token,
      user: { userID: user.userID, email: user.email },
    };
  }
}
