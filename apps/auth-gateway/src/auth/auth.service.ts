import {
  ConflictException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth-credentials.dto';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, last } from 'rxjs';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { validateEmailDomain } from './../../../../utils/email.util';

@Injectable()
export class AuthService {
  private jwtExpiresIn: string;
  private userClient: ClientProxy;
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.userClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: +process.env.USER_SERVICE_PORT! || 4001,
      },
    });
    this.jwtExpiresIn = this.config.get<string>('JWT_EXPIRES_IN', '1h');
  }

  async register(registerDto: RegisterDto) {
    // 1️⃣ Validate domain
    const domainValid = await validateEmailDomain(registerDto.email);
    if (!domainValid)
      throw new BadRequestException('Email domain does not exist');

    // 2️⃣ Check if user exists in User microservice
    const existing = await firstValueFrom(
      this.userClient.send({ cmd: 'get_user_by_email' }, registerDto.email),
    );
    if (existing) throw new ConflictException('Email already registered');

    // 3️⃣ Create user via User microservice
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'create_user' }, registerDto),
    );

    return {
      id: user.userID,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'get_user_by_email' }, email),
    );

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // Remove password before returning
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.userID,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      expiresIn: this.config.get('JWT_EXPIRES_IN', '1h'),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async loginWithGoogle(googleUser: {
    provider: string;
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    photo?: string;
    accessToken?: string;
  }) {
    // Send Google user info to User microservice
    let user = await firstValueFrom(
      this.userClient.send(
        { cmd: 'find_or_create_oauth_user' },
        { ...googleUser },
      ),
    );

    if (!user) {
      user = await firstValueFrom(
        this.userClient.send({ cmd: 'create_user' }, googleUser),
      );
    } else {
      user = await firstValueFrom(
        this.userClient.send(
          { cmd: 'update_user' },
          { userID: user.userID, googleUser },
        ),
      );
    }

    const payload = { sub: user.userID, email: user.email };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '1h'),
    });

    return { access_token, user };
  }
}
