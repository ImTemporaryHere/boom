import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Tokens, JwtPayload } from './interfaces/tokens.interface';

@Injectable()
export class AuthService {
  private refreshTokenStore: Map<string, string> = new Map(); // userId -> refreshToken

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<Tokens> {
    const user = await this.usersService.create(signUpDto);
    return this.generateTokens(user.id, user.email);
  }

  async signIn(signInDto: SignInDto): Promise<Tokens> {
    const user = await this.usersService.validatePassword(
      signInDto.email,
      signInDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production',
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verify the refresh token is still valid in our store
      const storedToken = this.refreshTokenStore.get(payload.sub);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      return this.generateTokens(payload.sub, payload.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    this.refreshTokenStore.delete(userId);
  }

  private async generateTokens(userId: string, email: string): Promise<Tokens> {
    const accessPayload: JwtPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: userId,
      email,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: process.env.JWT_SECRET || 'secret-key-change-in-production',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production',
        expiresIn: '7d',
      }),
    ]);

    // Store the refresh token
    this.refreshTokenStore.set(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
