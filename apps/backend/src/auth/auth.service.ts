import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Tokens, JwtPayload } from './interfaces/tokens.interface';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Clean up expired tokens periodically
  async onModuleInit() {
    await this.cleanupExpiredTokens();
    // Run cleanup every hour
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000);
  }

  private async cleanupExpiredTokens() {
    await this.refreshTokenRepository.deleteExpiredTokens();
  }

  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(signUpDto);
    const tokens = await this.generateTokens(user.id, user.email);

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    const user = await this.usersService.validatePassword(
      signInDto.email,
      signInDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production',
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verify the refresh token exists in database and is not expired
      const storedToken = await this.refreshTokenRepository.findByTokenAndUserId(
        refreshToken,
        payload.sub
      );

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (storedToken.expiresAt < new Date()) {
        await this.refreshTokenRepository.deleteById(storedToken.id);
        throw new UnauthorizedException('Refresh token expired');
      }

      // Delete old refresh token
      await this.refreshTokenRepository.deleteById(storedToken.id);

      // Get user data
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(payload.sub, payload.email);

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Delete all refresh tokens for this user
    await this.refreshTokenRepository.deleteByUserId(userId);
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

    // Store the refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.refreshTokenRepository.create(refreshToken, userId, expiresAt);

    return {
      accessToken,
      refreshToken,
    };
  }
}
